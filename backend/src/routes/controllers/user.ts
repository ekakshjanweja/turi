import { NODE_ENV } from "../../lib/config";

export async function getSession(headers: Headers) {
  try {
    const cookies = headers.get("cookie");

    if (!cookies) throw new Error("No cookies found");

    const parsedCookie = parseCookies(cookies);

    const cookieName =
      NODE_ENV === "production"
        ? "__Secure-better-auth.session_token"
        : "better-auth.session_token";

    const sessionToken = parsedCookie.get(cookieName);

    if (!sessionToken) throw new Error("No session token found");

    console.log("sessionToken", sessionToken);
  } catch (error) {
    console.error("❌ Custom Session Middleware Error:", error);
    return null;
  }
}

export function parseCookies(cookieHeader: string) {
  const cookies = cookieHeader.split("; ");
  const cookieMap = new Map<string, string>();

  cookies.forEach((cookie) => {
    const [name, value] = cookie.split("=");
    if (name && value) {
      cookieMap.set(name, value);
    }
  });
  return cookieMap;
}
