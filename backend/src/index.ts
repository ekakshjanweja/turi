import { Hono } from "hono";
import { auth } from "./lib/auth";
import type { AgentSession, Message } from "./lib/types/types";
import { streamSSE } from "hono/streaming";
import { cors } from "hono/cors";
import { DATABASE_URL, PORT } from "./lib/config";
import { deleteUser } from "./lib/delete-user";
import { audioRouter } from "./audio-router";

// Lazy imports to reduce startup time
const lazyGmailService = async () => {
  const { GmailService } = await import("./services/gmail");
  return GmailService;
};

const lazyAgent = async () => {
  const { Agent } = await import("./services/agent");
  return Agent;
};

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    Bindings: CloudflareBindings;
  };
}>();

const agentSessions: AgentSession[] = [];

app.use(
  "*", // or replace with "*" to enable cors for a routes
  cors({
    origin: ["http://localhost:3000", "https://turimail.vercel.app"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE", "PATCH"],
    exposeHeaders: [
      "Content-Length",
      "Content-Type",
      "Cache-Control",
      "Connection",
    ],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/delete", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await deleteUser({ user, session });

    return c.json({ message: "User deleted successfully" }, 200);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error) },
      500
    );
  }
});

app.get("/health", (c) => {
  console.log("[HEALTH] Health check request received");

  try {
    console.log("[HEALTH] Health check successful - service is running");
    return c.json({ status: "ok" });
  } catch (error) {
    console.error("[HEALTH] Health check failed:", error);
    return c.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : JSON.stringify(error),
      },
      500
    );
  }
});

app.get("/agent", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  const sessionId = user.id;
  const message = c.req.query("message");

  return streamSSE(c, async (stream) => {
    let agentSession = agentSessions.find((s) => s.id === sessionId);

    const audio = c.req.query("audio");
    const audioEnabled = audio === "true";

    let clear = c.req.query("clear") === "true";

    const GmailService = await lazyGmailService();
    const gmailService = new GmailService();
    try {
      await gmailService.init(user.id);
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
      const agent = new Agent(stream, gmailService, audioEnabled);

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
    }

    if (agentSession.audio !== audioEnabled) {
      const Agent = await lazyAgent();
      const newAgent = new Agent(
        stream,
        agentSession.gmailService,
        audioEnabled
      );

      agentSession.agent = newAgent;
      agentSession.audio = audioEnabled;

      const message: Message = {
        type: "CONNECTED",
        content: `Audio mode changed to ${
          audioEnabled ? "enabled" : "disabled"
        }`,
      };

      stream.writeSSE({ data: JSON.stringify(message), event: "system" });
    }

    if (clear) {
      agentSession.agent.clearMessages();
    }

    const msg: Message = {
      type: "CONNECTED",
      content: "Agent session started",
    };

    stream.writeSSE({ data: JSON.stringify(msg), event: "system" });

    if (message) {
      await agentSession.agent.handleUserInput(message);
    }

    await stream.sleep(1000);

    stream.onAbort(() => {
      const index = agentSessions.findIndex((s) => s.id === sessionId);

      if (index !== -1) {
        agentSessions.splice(index, 1);
        agentSession?.agent?.close();
      }
    });
  });
});

app.route("/audio", audioRouter);

const server =
  process.env.NODE_ENV === "production"
    ? {
        fetch(
          request: Request,
          env: CloudflareBindings,
          ctx: ExecutionContext
        ) {
          return app.fetch(request, env, ctx);
        },
      }
    : {
        port: PORT,
        fetch: app.fetch,
        idleTimeout: 0,
      };

export default server;
