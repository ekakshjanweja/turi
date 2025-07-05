import type { SSEStreamingApi } from "hono/streaming";
import type { Message, ValidatedChatQuery } from "../../../lib/types/types";

export function validateChatQuery(c: any): ValidatedChatQuery {
  const message = c.req.query("message");
  const audio = c.req.query("audio");
  const clearParam = c.req.query("clear");

  return {
    message,
    audio,
    clearParam,
    audioEnabled: audio === "true",
    clear: clearParam === "true",
  };
}

// Enhanced error handling
export async function sendErrorMessage(
  stream: SSEStreamingApi,
  error: string,
  details?: any
) {
  try {
    await stream.writeSSE({
      data: JSON.stringify({
        type: "ERROR",
        content: error,
        details: details ? String(details) : undefined,
        timestamp: new Date().toISOString(),
      }),
      event: "system",
    });
  } catch (streamError) {
    console.error("Failed to send error message:", streamError);
  }
}

// Enhanced system message sending
export async function sendSystemMessage(
  stream: SSEStreamingApi,
  content: string,
  messageType: "CONNECTED" | "INFO" = "CONNECTED"
) {
  try {
    const message: Message = {
      type: messageType,
      content,
      timestamp: new Date().toISOString(),
    };

    await stream.writeSSE({
      data: JSON.stringify(message),
      event: "system",
    });
  } catch (error) {
    console.error("Failed to send system message:", error);
  }
}
