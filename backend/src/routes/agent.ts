import { Hono } from "hono";
import type { AgentSession, AppBindings, Message } from "../lib/types/types";
import { streamSSE } from "hono/streaming";
import { subscription as subscriptionTable } from "../lib/db/schema/subscription";
import { eq } from "drizzle-orm";
import { uuid } from "drizzle-orm/gel-core";
import { v4 as uuidv4 } from "uuid";

const agentSessions: AgentSession[] = [];

export const agentRouter = new Hono<AppBindings>();

// Lazy imports to reduce startup time
const lazyGmailService = async () => {
  const { GmailService } = await import("../services/gmail");
  return GmailService;
};

const lazyAgent = async () => {
  const { Agent } = await import("../services/agent");
  return Agent;
};

agentRouter.get("/chat", (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const auth = c.get("auth");
  const db = c.get("db");
  const subscription = c.get("subscription");

  if (!db) {
    return c.json({ error: "Database instance not found" }, 500);
  }

  if (!auth) {
    return c.json({ error: "Auth instance not found" }, 500);
  }

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!subscription) {
    return c.json({ error: "Subscription not found" }, 401);
  }

  if (subscription.usage >= subscription.usageLimit) {
    return c.json({ error: "Usage limit reached" }, 403);
  }

  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  const sessionId = user.id;
  const message = c.req.query("message");

  const onSendMessage = async (message: Message) => {
    if (message.type === "AI_RESPONSE") {
      const updatedSubscription = await db
        .update(subscriptionTable)
        .set({
          usage: subscription.usage + 1,
        })
        .where(eq(subscriptionTable.userId, user.id))
        .returning();

      if (updatedSubscription[0]) {
        c.set("subscription", updatedSubscription[0]);
      }
    }
  };

  return streamSSE(c, async (stream) => {
    let agentSession = agentSessions.find((s) => s.id === sessionId);

    const audio = c.req.query("audio");
    const audioEnabled = audio === "true";

    let clear = c.req.query("clear") === "true";

    const GmailService = await lazyGmailService();
    const gmailService = new GmailService();
    try {
      await gmailService.init(user.id, db);
    } catch (error) {
      const accounts = await auth.api.listUserAccounts({
        query: {
          userId: user.id,
        },
      });

      if (accounts[0]) {
        console.log("Refreshing token");

        await auth.api.refreshToken({
          body: {
            providerId: "google",
            userId: user.id,
            accountId: accounts[0].id,
          },
        });
      }

      stream.writeSSE({
        data: JSON.stringify({
          type: "ERROR",
          content: "Failed to initialize Gmail service",
        }),
        event: "system",
      });
    }

    if (!agentSession) {
      const Agent = await lazyAgent();
      const agent = new Agent(
        stream,
        gmailService,
        audioEnabled,
        onSendMessage
      );

      agentSession = {
        id: sessionId,
        agent,
        gmailService,
        sseConnection: stream,
        audio: audioEnabled,
      } as AgentSession;

      agentSessions.push(agentSession);
      clear = false;
    } else {
      agentSession.sseConnection = stream;
      agentSession.agent.updateStream(stream);
      agentSession.gmailService = gmailService;
      agentSession.agent.updateOnSendMessage(onSendMessage);
    }

    if (agentSession.audio !== audioEnabled) {
      agentSession.agent.updateAudioEnabled(audioEnabled);
      agentSession.audio = audioEnabled;

      const message: Message = {
        type: "CONNECTED",
        content: `Audio mode changed to ${
          audioEnabled ? "enabled" : "disabled"
        }`,
        messageId: uuidv4(),
      };

      stream.writeSSE({ data: JSON.stringify(message), event: "system" });
    }

    if (clear) {
      agentSession.agent.clearMessages();
    }

    const msg: Message = {
      type: "CONNECTED",
      content: "Agent session started",
      messageId: uuidv4(),
    };

    stream.writeSSE({ data: JSON.stringify(msg), event: "system" });

    if (message) {
      await agentSession.agent.handleUserInput(message);
    }

    await stream.sleep(1000000);

    stream.onAbort(() => {
      const index = agentSessions.findIndex((s) => s.id === sessionId);

      if (index !== -1) {
        agentSessions.splice(index, 1);
        agentSession?.agent?.close();
      }
    });
  });
});
