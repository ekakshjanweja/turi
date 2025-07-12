import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type DbInstance } from "./db";
import * as schema from "./db/schema/auth";
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from "./config";
import { openAPI } from "better-auth/plugins";

export function initAuth(db: DbInstance) {
  return betterAuth({
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
      "https://www.turi.email",
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
          "https://www.googleapis.com/auth/gmail.compose",
          "https://www.googleapis.com/auth/gmail.labels",
          "https://www.googleapis.com/auth/gmail.modify",
        ],
      },
    },
  });
}

export type AuthInstance = ReturnType<typeof initAuth>;

// export const auth = betterAuth({
//   secret: BETTER_AUTH_SECRET,
//   database: drizzleAdapter(db, {
//     provider: "pg",
//     schema: {
//       user: schema.user,
//       session: schema.session,
//       account: schema.account,
//       verification: schema.verification,
//     },
//   }),
//   baseURL: BETTER_AUTH_URL,
//   trustedOrigins: [
//     "http://localhost:3000",
//     "http://localhost:8000",
//     "https://turimail.vercel.app",
//   ],
//   plugins: [openAPI()],
//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       scope: [
//         "openid",
//         "email",
//         "profile",
//         "https://www.googleapis.com/auth/gmail.readonly",
//         "https://www.googleapis.com/auth/gmail.compose",
//         "https://www.googleapis.com/auth/gmail.labels",
//         "https://www.googleapis.com/auth/gmail.modify",
//       ],
//     },
//   },
// });
