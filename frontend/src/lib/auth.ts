import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "https://turi.jekaksh.workers.dev"
      : "http://localhost:8000",
});
