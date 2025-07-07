import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../lib/types/types";
import { initDb } from "../lib/db";
import { initAuth } from "../lib/auth";

const authMiddleware: MiddlewareHandler<AppBindings> = async (c, next) => {
  const connectionString =
    c.env.NODE_ENV === "production"
      ? c.env.HYPERDRIVE.connectionString
      : process.env.DATABASE_URL;
  const db = initDb(connectionString);
  const authInstance = initAuth(db);
  c.set("db", db);
  c.set("auth", authInstance);

  const session = await authInstance.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
};

export default authMiddleware;
