import { createAuthClient } from "better-auth/react";
import { getSessionToken } from "./utils";

export const auth = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
        "https://turi.jekaksh.workers.dev"
      : "http://localhost:8000",
  fetchOptions: {
    onRequest: (request) => {
      request.headers.set("Cookie", document.cookie);
    },
    credentials: "include",
    headers: {
      Cookie: getSessionToken(),
    },
  },
});
