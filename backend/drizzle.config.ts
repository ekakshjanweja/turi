import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/lib/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema",
  out: "./src/lib/db/generated",
  dbCredentials: {
    url: DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
