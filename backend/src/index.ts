import { Hono } from "hono";
import { auth } from "./lib/auth";
import type { AgentSession, Message } from "./lib/types/types";
import { streamSSE } from "hono/streaming";
import { cors } from "hono/cors";
import { DATABASE_URL, PORT } from "./lib/config";

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

app.options("/api/auth/*", (c) => {
  return c.text("", 200);
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Custom delete user confirmation endpoint that doesn't require active session
app.get("/api/auth/delete-user-confirm", async (c) => {
  try {
    const token = c.req.query("token");
    const callbackURL = c.req.query("callbackURL") || "https://turimail.vercel.app/auth/delete-result";

    if (!token) {
      return c.redirect(`${callbackURL}?error=missing_token`);
    }

    // Import required modules
    const { db } = await import("./lib/db");
    const { verification, user: userSchema, account, session } = await import("./lib/db/schema/auth");
    const { eq, and, gt } = await import("drizzle-orm");

    // Find valid token - Better Auth uses the token directly as the value
    const [verificationRecord] = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.value, token),
          gt(verification.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!verificationRecord) {
      return c.redirect(`${callbackURL}?error=invalid_or_expired_token`);
    }

    // Better Auth stores delete user identifier as "delete-user" 
    // and the user id is embedded in the identifier
    if (!verificationRecord.identifier.startsWith("delete-user")) {
      return c.redirect(`${callbackURL}?error=invalid_token_type`);
    }

    // Extract user ID from identifier pattern (could be "delete-user" or "delete-user:{userId}")
    let userId: string | undefined;
    
    if (verificationRecord.identifier === "delete-user") {
      // If no user ID in identifier, we need to look up the user another way
      // For Better Auth, this shouldn't happen, but let's handle it gracefully
      return c.redirect(`${callbackURL}?error=cannot_identify_user`);
    } else if (verificationRecord.identifier.includes(":")) {
      // Pattern: "delete-user:{userId}"
      const parts = verificationRecord.identifier.split(":");
      userId = parts[1];
    } else {
      // Fallback - treat everything after "delete-user" as user id
      const extracted = verificationRecord.identifier.replace("delete-user", "").replace(/^[-_]/, "");
      userId = extracted || undefined;
    }

    if (!userId) {
      return c.redirect(`${callbackURL}?error=invalid_user_id`);
    }

    // Get user info for logging
    const [userToDelete] = await db
      .select({ email: userSchema.email })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (!userToDelete) {
      return c.redirect(`${callbackURL}?error=user_not_found`);
    }

    // Delete verification record first
    await db.delete(verification).where(eq(verification.id, verificationRecord.id));

    // Delete user sessions
    await db.delete(session).where(eq(session.userId, userId));

    // Delete user accounts
    await db.delete(account).where(eq(account.userId, userId));

    // Delete user (this should be last)
    await db.delete(userSchema).where(eq(userSchema.id, userId));

    console.log(`User deleted successfully via email confirmation: ${userToDelete.email}`);

    return c.redirect(`${callbackURL}?success=account_deleted`);
  } catch (error) {
    console.error("Delete user confirmation error:", error);
    const callbackURL = c.req.query("callbackURL") || "https://turimail.vercel.app/auth/delete-result";
    return c.redirect(`${callbackURL}?error=server_error`);
  }
});

app.post("/api/auth/verify-delete-otp", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const { otp } = body;

    if (!otp || typeof otp !== "string") {
      return c.json({ error: "OTP is required" }, 400);
    }

    // Import required modules at the top level would be better, but adding here for clarity
    const { db } = await import("./lib/db");
    const { verification } = await import("./lib/db/schema/auth");
    const { eq, and, gt } = await import("drizzle-orm");

    // Find valid OTP for this user
    const [verificationRecord] = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, `delete_account_${user.id}`),
          eq(verification.value, otp),
          gt(verification.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!verificationRecord) {
      return c.json({ error: "Invalid or expired OTP" }, 400);
    }

    // Delete the verification record
    await db.delete(verification).where(eq(verification.id, verificationRecord.id));

    // Delete user from database (this will cascade delete sessions and accounts)
    const { user: userSchema } = await import("./lib/db/schema/auth");
    await db.delete(userSchema).where(eq(userSchema.id, user.id));

    return c.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete OTP verification error:", error);
    return c.json(
      {
        error: "Failed to verify OTP",
        message: error instanceof Error ? error.message : JSON.stringify(error),
      },
      500
    );
  }
});

app.get("/health", (c) => {
  try {
    return c.json({ status: "ok" });
  } catch (error) {
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

app.post("/agent", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sessionId = user.id;

  const body = await c.req.json();
  const { message } = body;

  if (!message || typeof message !== "string") {
    return c.json({ error: "Message Required" }, 400);
  }

  const agentSession = agentSessions.find((s) => s.id === sessionId);

  if (!agentSession) {
    return c.json({ error: "Agent session not found" }, 404);
  }

  try {
    await agentSession.agent.handleUserInput(message);

    return c.json({ status: "success" });
  } catch (error) {
    return c.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : JSON.stringify(error),
      },
      500
    );
  }
});

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
