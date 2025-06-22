import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { account, session, user, verification } from "./schema/auth";
import { DATABASE_URL } from "../config";

const client = postgres(DATABASE_URL!);

export const db = drizzle(client, {
  schema: {
    user,
    account,
    session,
    verification,
  },
});
