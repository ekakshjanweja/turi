import { Hono } from "hono";
import { auth } from "../lib/auth";
import { streamSSE } from "hono/streaming";
import {
  AgentSessionManager,
  AGENT_SESSION_CONFIG,
} from "../services/agent/agent-session-manager";
import {
  sendErrorMessage,
  validateChatQuery,
} from "../services/agent/helpers/agent-router-helpers";
import { handleChatSession } from "../services/agent/helpers/handle-chat-session";

export const agentRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    Bindings: CloudflareBindings;
  };
}>();

// Lazy-loaded session manager to avoid global scope timer issues
let sessionManagerInstance: AgentSessionManager | null = null;

export function getSessionManager(): AgentSessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new AgentSessionManager();
    // Start cleanup timer only when first accessed (not in global scope)
    sessionManagerInstance.startCleanup();
  }
  return sessionManagerInstance;
}

// Main chat handler
agentRouter.get("/chat", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Set proper SSE headers
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Headers", "Cache-Control");

  const sessionId = user.id;
  const sessionManager = getSessionManager(); // Get lazy-loaded instance

  try {
    const query = validateChatQuery(c);

    return streamSSE(c, async (stream) => {
      let connectionTimeout: NodeJS.Timeout | null = null;

      try {
        // Set connection timeout
        connectionTimeout = setTimeout(() => {
          console.log(`Connection timeout for session: ${sessionId}`);
          stream.close();
        }, AGENT_SESSION_CONFIG.CONNECTION_TIMEOUT_MS);

        await handleChatSession(stream, sessionId, query, connectionTimeout);
      } catch (error) {
        console.error(`Chat session error for ${sessionId}:`, error);
        await sendErrorMessage(
          stream,
          "An unexpected error occurred",
          error instanceof Error ? error.message : String(error)
        );
      } finally {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
      }

      // Setup cleanup on connection abort
      stream.onAbort(() => {
        console.log(`Connection aborted for session: ${sessionId}`);
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
        sessionManager.removeSession(sessionId);
      });
    });
  } catch (error) {
    console.error(`Chat setup error for ${sessionId}:`, error);
    return c.json(
      {
        error: "Failed to setup chat session",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
});

// // Health check endpoint for monitoring
// agentRouter.get("/health", (c) => {
//   const healthInfo = getSessionManager().getHealthInfo();

//   return c.json({
//     status: "healthy",
//     ...healthInfo,
//   });
// });

// // Session management endpoint (for debugging/admin)
// agentRouter.get("/sessions", (c) => {
//   const user = c.get("user");

//   if (!user) {
//     return c.json({ error: "Unauthorized" }, 401);
//   }

//   // Only return session count for security
//   const sessionInfo = getSessionManager().getUserSessionInfo(user.id);

//   return c.json(sessionInfo);
// });

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, cleaning up sessions...");
  if (sessionManagerInstance) {
    sessionManagerInstance.destroy();
  }
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, cleaning up sessions...");
  if (sessionManagerInstance) {
    sessionManagerInstance.destroy();
  }
});
