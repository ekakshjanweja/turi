import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
        "https://turi.jekaksh.workers.dev"
      : "http://localhost:8000",
  fetchOptions: {
    credentials: "include",
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");

      if (authToken) {
        console.log("Auth token received:", authToken);

        localStorage.setItem("bearer_token", authToken);
      }
    },
  },
});
