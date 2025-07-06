import "dotenv/config";
import { drizzle as localDrizzle } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/neon-http";

import postgres from "postgres";
import { account, session, user, verification } from "./schema/auth";
import { DATABASE_URL, NODE_ENV } from "../config";
import { neon } from "@neondatabase/serverless";
import { beta } from "./schema/beta";

export const db =
  NODE_ENV === "production"
    ? drizzle(neon(DATABASE_URL!), {
        schema: {
          user,
          account,
          session,
          verification,
          beta,
        },
      })
    : localDrizzle(postgres(DATABASE_URL!), {
        schema: {
          user,
          account,
          session,
          verification,
          beta,
        },
      });
