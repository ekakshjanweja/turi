"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getSessionToken } from "@/lib/utils";
import { Session } from "better-auth";

export default function Test() {
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetSession = async () => {
    setLoading(true);
    setError(null);

    try {
      const sessionToken = getSessionToken();
      console.log("Session token:", sessionToken);

      const response = await fetch(
        "http://localhost:8000/api/auth/get-session",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(sessionToken && { Cookie: sessionToken }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSessionData(data);
      console.log("Session data:", data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error fetching session:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Session Test</h1>

      <Button onClick={handleGetSession} disabled={loading} className="mb-6">
        {loading ? "Loading..." : "Get Session"}
      </Button>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {sessionData && (
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Session Data:</h2>
          <pre className="bg-background p-4 rounded border overflow-auto text-sm">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted/50 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>
          <strong>Current cookie:</strong>{" "}
          {typeof document !== "undefined" ? document.cookie : "N/A"}
        </p>
        <p>
          <strong>Session token:</strong> {getSessionToken() || "None found"}
        </p>
      </div>
    </div>
  );
}
