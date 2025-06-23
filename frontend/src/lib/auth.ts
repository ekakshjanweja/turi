import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
        "https://turi.jekaksh.workers.dev"
      : "http://localhost:8000",
  fetchOptions: {
    credentials: "include",
    headers: {
      get Cookie() {
        return getSessionToken();
      },
    },
  },
});

// Helper function to get the session token from cookies
const getSessionToken = () => {
  if (typeof document === "undefined") return "";

  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${cookieName}=`)
  );

  return sessionCookie ? sessionCookie.trim() : "";
};
