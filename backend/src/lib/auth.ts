"use client";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import {
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  RESEND_API_KEY,
  BACKEND_URL,
  FRONTEND_URL,
} from "./config";
import { openAPI } from "better-auth/plugins";
import { Resend } from "resend";

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
  session: {
    // Keep freshAge at 0 since we're using email verification for deletion
    freshAge: 0,
    // Extend session duration to prevent issues with delete flows
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
  account: {
    accountLinking: {
      enabled: true,
      // Allow deletion even if user has multiple linked accounts
      allowUnlinkingAll: true,
    },
  },
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
  user: {
    deleteUser: {
      enabled: true,
      // Use custom verification to avoid session issues with email callbacks
      sendDeleteAccountVerification: async ({ user, url, token }, request) => {
        const resend = new Resend(RESEND_API_KEY);

        // Create custom delete URL that doesn't require active session
        const deleteURL = `${BACKEND_URL}api/delete?token=${token}`;

        await resend.emails.send({
          from: "Turi Mail <no-reply@turi.stormej.me>",
          to: [user.email],
          subject: "Delete your Turi Mail account",
          html: `
                <h1>Delete your Turi Mail account</h1>
                <p>Hello ${user.name},</p>
                <p>We received a request to delete your Turi Mail account. Click the link below to confirm:</p>
                <a href="${deleteURL}" style="color: #dc2626; text-decoration: underline;">
                  Delete Account
                </a>
                <p>${url}</p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>The Turi Mail Team</p>
              `,
        });
      },
    },
  },
});
