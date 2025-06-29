import * as dotenv from "dotenv";

export function loadEnv() {
  dotenv.config();

  if (!process.env.NODE_ENV) {
    throw new Error(
      "NODE_ENV is not set. Please set it to 'development' or 'production'."
    );
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.PORT) {
    throw new Error(
      "PORT is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.BETTER_AUTH_URL) {
    throw new Error(
      "BETTER_AUTH_URL is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.BACKEND_URL) {
    throw new Error(
      "BACKEND_URL is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "GOOGLE_CLIENT_SECRET is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error(
      "ELEVENLABS_API_KEY is not set. Please set it in your environment variables."
    );
  }

  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Please set it in your environment variables."
    );
  }
}

// Server Configuration

export const PORT = process.env.PORT || "8000";
export const NODE_ENV = process.env.NODE_ENV || "development";

// Authentication

export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL!;

// Backend

export const BACKEND_URL = process.env.BACKEND_URL!;

// Database

export const DATABASE_URL = process.env.DATABASE_URL!;

//Google OAuth

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// Google Generative AI

export const GOOGLE_GENERATIVE_AI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

// ElevenLabs

export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!;

// Resend

export const RESEND_API_KEY = process.env.RESEND_API_KEY!;
