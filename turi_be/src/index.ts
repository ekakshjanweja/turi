import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { Agent } from "./services/agent";
import { GmailService } from "./services/gmail";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  const publicRoutes = ["/", "/health"];
  const isAuthRoute = c.req.path.startsWith("/api/auth");
  const isPublicRoute = publicRoutes.includes(c.req.path);

  if (!session) {
    c.set("user", null);
    c.set("session", null);

    if (!isPublicRoute && !isAuthRoute) {
      return c.json(
        { error: "Unauthorized", message: "Authentication required" },
        401
      );
    }

    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    let agent: Agent;
    let gmailService: GmailService;

    return {
      onOpen: async (_, ws) => {
        const user = c.get("user");
        const session = c.get("session");

        if (!user || !session) {
          ws.close(1008, "Unauthorized");
          return;
        }

        gmailService = new GmailService();
        await gmailService.init(user.id);
        agent = new Agent(ws, gmailService);
      },
      onMessage: async (event, ws) => {
        const message = JSON.parse(event.data as string);

        if (message.type === "USER_INPUT") {
          await agent.handleUserInput(message.content);
        }
      },
      onClose: async () => {},
    };
  })
);

export default {
  port: process.env.PORT || 8000,
  fetch: app.fetch,
  websocket: websocket,
};
