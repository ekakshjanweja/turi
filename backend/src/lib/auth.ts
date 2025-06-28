import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
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
      async refreshAccessToken(refreshToken) {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: process.env.GOOGLE_CLIENT_ID as string,
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
          }),
        });

        const data = (await response.json()) as GoogleTokenResponse;

        if (!response.ok) {
          throw new Error(
            `Failed to refresh Google token: ${
              data.error_description || data.error
            }`
          );
        }

        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken, // Google may not always return a new refresh token
          expiresIn: data.expires_in,
        };
      },
    },
  },
});
