import { Hono } from "hono";
import { cors } from "hono/cors";
import { loadEnv, PORT } from "./lib/config";
import { deleteUser, signOut } from "./lib/delete-user";
import { audioRouter } from "./routes/audio";
import { agentRouter } from "./routes/agent";
import { beta } from "./lib/db/schema/beta";
import type { AppBindings } from "./lib/types/types";
import authMiddleware from "./middlewares/auth.middleware";
import { betaRouter } from "./routes/beta";

loadEnv();

const app = new Hono<AppBindings>();

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

app.use("*", authMiddleware);

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  const auth = c.get("auth");
  if (!auth) {
    return c.json({ error: "Auth instance not found" }, 500);
  }
  return auth.handler(c.req.raw);
});

app.route("/audio", audioRouter);
app.route("/agent", agentRouter);
app.route("/early-access", betaRouter);

app.get("/health", async (c) => {
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
  const db = c.get("db");
  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await signOut({ user, session, db });

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
  const db = c.get("db");

  if (!user || !session || !db) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    await deleteUser({ user, session, db });

    return c.json({ message: "User deleted successfully" }, 200);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error) },
      500
    );
  }
});


export default {
  async fetch(
    request: Request,
    env: CloudflareBindings,
    ctx: ExecutionContext
  ) {
    return app.fetch(request, env, ctx);
  },
};
