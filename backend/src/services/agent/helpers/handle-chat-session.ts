import type { SSEStreamingApi } from "hono/streaming";
import type {
  AgentSession,
  AgentSessionWithActivity,
  ValidatedChatQuery,
} from "../../../lib/types/types";
import { getSessionManager } from "../../../routes/agent";
import { initializeGmailService } from "./gmail-init";
import { sendErrorMessage, sendSystemMessage } from "./agent-router-helpers";

const lazyAgent = async () => {
  const { Agent } = await import("../../agent");
  return Agent;
};

// Extracted chat session handling logic
export async function handleChatSession(
  stream: SSEStreamingApi,
  sessionId: string,
  query: ValidatedChatQuery,
  connectionTimeout: NodeJS.Timeout | null
) {
  let agentSession = getSessionManager().getSession(sessionId);

  // Initialize Gmail service
  let gmailService;
  try {
    gmailService = await initializeGmailService(sessionId);
  } catch (error) {
    console.error(
      `Failed to initialize Gmail service for ${sessionId}:`,
      error
    );
    await sendErrorMessage(
      stream,
      "Failed to initialize Gmail service. Please try again or check your account permissions."
    );
    return;
  }

  // Handle existing session
  if (agentSession) {
    await handleExistingSession(agentSession, stream, gmailService, query);
  } else {
    // Create new session
    await createNewSession(sessionId, stream, gmailService, query.audioEnabled);
    agentSession = getSessionManager().getSession(sessionId);
  }

  if (!agentSession) {
    await sendErrorMessage(stream, "Failed to create agent session");
    return;
  }

  // Handle clear messages request
  if (query.clear) {
    agentSession.agent.clearMessages();
    await sendSystemMessage(stream, "Conversation history cleared");
  }

  // Send initial connection message
  await sendSystemMessage(stream, "Agent session ready");

  // Process user message if provided
  if (query.message) {
    try {
      await agentSession.agent.handleUserInput(query.message);
    } catch (error) {
      console.error(`Error handling user input for ${sessionId}:`, error);
      await sendErrorMessage(stream, "Failed to process your message", error);
    }
  }

  // Clear connection timeout since we've successfully established the session
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
  }

  // Keep connection alive
  await stream.sleep(1000);
}

// Handle existing session updates
async function handleExistingSession(
  agentSession: AgentSessionWithActivity,
  stream: SSEStreamingApi,
  gmailService: any,
  query: ValidatedChatQuery
) {
  // Update session components
  getSessionManager().updateSession(agentSession.id, {
    sseConnection: stream,
    gmailService,
  });

  agentSession.agent.updateStream(stream);

  // Handle audio mode changes
  if (agentSession.audio !== query.audioEnabled) {
    const Agent = await lazyAgent();
    const newAgent = new Agent(stream, gmailService, query.audioEnabled);

    getSessionManager().updateSession(agentSession.id, {
      agent: newAgent,
      audio: query.audioEnabled,
    });

    await sendSystemMessage(
      stream,
      `Audio mode changed to ${query.audioEnabled ? "enabled" : "disabled"}`
    );
  }
}

// Create new agent session
async function createNewSession(
  sessionId: string,
  stream: SSEStreamingApi,
  gmailService: any,
  audioEnabled: boolean
) {
  try {
    const Agent = await lazyAgent();
    const agent = new Agent(stream, gmailService, audioEnabled);

    const newSession: AgentSession = {
      id: sessionId,
      agent,
      gmailService,
      sseConnection: stream,
      audio: audioEnabled,
    };

    const created = getSessionManager().createSession(sessionId, newSession);

    if (!created) {
      throw new Error("Failed to create session - maximum sessions reached");
    }

    await sendSystemMessage(stream, "New agent session created");
  } catch (error) {
    console.error(`Failed to create new session for ${sessionId}:`, error);
    await sendErrorMessage(stream, "Failed to create agent session", error);
    throw error;
  }
}
