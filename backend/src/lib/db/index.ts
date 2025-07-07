import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { account, session, user, verification } from "./schema/auth";
import { beta } from "./schema/beta";

export function initDb(connectionString: string) {
  const client = postgres(connectionString);

  return drizzle(client, {
    schema: {
      user,
      account,
      session,
      verification,
      beta,
    },
  });
}

export type DbInstance = ReturnType<typeof initDb>;
