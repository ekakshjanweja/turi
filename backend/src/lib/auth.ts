import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema/auth";
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from "./config";
import { openAPI } from "better-auth/plugins";

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  baseURL: BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://turimail.vercel.app",
  ],
  plugins: [openAPI()],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://mail.google.com/",
      ],
    },
  },
});
