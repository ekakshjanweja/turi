import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.BACKEND_BASE_URL
      : "http://localhost:8000",
});
