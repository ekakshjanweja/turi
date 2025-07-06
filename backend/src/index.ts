import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { loadEnv, PORT } from "./lib/config";
import { deleteUser, signOut } from "./lib/delete-user";
import { audioRouter } from "./routes/audio";
import { agentRouter } from "./routes/agent";

loadEnv();

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    Bindings: CloudflareBindings;
  };
}>();

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
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  } catch (error) {
    console.error("❌ Session middleware error:", error);
    c.set("user", null);
    c.set("session", null);
    return next();
  }
});

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.route("/audio", audioRouter);
app.route("/agent", agentRouter);

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

app.get("/sign-out", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await signOut({ user, session });

    return c.json({ message: "Signed out successfully" }, 200);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error) },
      500
    );
  }
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
