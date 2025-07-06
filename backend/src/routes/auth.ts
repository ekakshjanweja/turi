import { Hono } from "hono";
import { db } from "../lib/db";
import { session, user } from "../lib/db/schema/auth";
import { eq } from "drizzle-orm";

export const authRouter = new Hono<{
  Variables: {
    Bindings: CloudflareBindings;
  };
}>();
