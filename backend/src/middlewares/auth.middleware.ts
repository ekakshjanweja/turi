import type { MiddlewareHandler } from "hono";
import type { AppBindings } from "../lib/types/types";
import { initDb } from "../lib/db";
import { initAuth } from "../lib/auth";
import { subscription as subscriptionTable } from "../lib/db/schema/subscription";
import { eq } from "drizzle-orm";

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
    c.set("subscription", null);
    return next();
  }

  const subscription = (
    await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.userId, session.user.id))
      .limit(1)
  )[0];

  if (!subscription) {
    const newSubscription = (
      await db
        .insert(subscriptionTable)
        .values({
          userId: session.user.id,
        })
        .returning()
    )[0];

    c.set("subscription", newSubscription ?? null);
  } else {
    c.set("subscription", subscription);
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
};

export default authMiddleware;
