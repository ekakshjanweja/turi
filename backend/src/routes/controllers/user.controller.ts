import { eq } from "drizzle-orm";
import { session, user } from "../../lib/db/schema/auth";
import { db } from "../../lib/db";
import type { Session, User } from "better-auth";

export async function getSession(headers: Headers) {
  const cookies = headers.get("Cookie");
  const authHeader = headers.get("Authorization");

  let sessionToken: string | null = null;

  // Try to get token from cookie
  if (cookies) {
    const cookiePairs = cookies.split(";").map((cookie) => cookie.trim());

    // Look for various Better Auth cookie patterns
    const sessionCookie = cookiePairs.find(
      (cookie) =>
        cookie.startsWith("better-auth.session_token=") ||
        cookie.startsWith("better-auth.session_token.secure=") ||
        cookie.startsWith("better-auth.session.token=") ||
        cookie.startsWith("session_token=") ||
        cookie.startsWith("authjs.session-token=") ||
        cookie.startsWith("__Secure-better-auth.session_token=") ||
        cookie.startsWith("__Host-better-auth.session_token=")
    );

    if (sessionCookie) {
      sessionToken = sessionCookie.split("=")[1] || null;
    }
  }

  // Try to get token from Authorization header
  if (!sessionToken && authHeader) {
    sessionToken = authHeader.replace("Bearer ", "") || null;
  }

  if (!sessionToken) {
    throw new Error("No session token provided");
  }

  // Query session from database
  const sessionResult: Session[] = await db
    .select()
    .from(session)
    .where(eq(session.token, sessionToken))
    .limit(1);

  if (sessionResult.length === 0) {
    throw new Error("Invalid session token");
  }

  if (!sessionResult[0]) {
    throw new Error("Session not found");
  }

  const sessionData: Session = sessionResult[0];
  if (!sessionData) {
    throw new Error("Session not found");
  }

  // Check if session is expired
  if (new Date() > sessionData.expiresAt) {
    throw new Error("Session expired");
  }

  // Query user from database
  const userResult: User[] = await db
    .select()
    .from(user)
    .where(eq(user.id, sessionData.userId))
    .limit(1);

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  if (!userResult[0]) {
    throw new Error("User not found");
  }

  const userData: User = userResult[0]!;

  return {
    session: sessionData,
    user: userData,
  };
}
