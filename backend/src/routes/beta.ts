import { Hono } from "hono";
import type { AppBindings } from "../lib/types/types";
import { beta } from "../lib/db/schema/beta";
import { eq } from "drizzle-orm";

export const betaRouter = new Hono<AppBindings>();

betaRouter.post("", async (c) => {
  const { email } = await c.req.json();

  const db = c.get("db");

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: "Invalid email format" }, 400);
  }

  try {
    const [existingUser] = await db
      .select()
      .from(beta)
      .where(eq(beta.email, email))
      .limit(1);

    if (existingUser) {
      return c.json({ error: "Email already registered" }, 400);
    }

    await db.insert(beta).values({ email });

    //TODO: Send email to user

    const isGmail = email.toLowerCase().endsWith("@gmail.com");
    if (!isGmail) {
      return c.json(
        { error: "Currently we only support Gmail addresses" },
        400
      );
    }

    return c.json({ message: "Successfully joined early access" }, 200);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error) },
      500
    );
  }
});
