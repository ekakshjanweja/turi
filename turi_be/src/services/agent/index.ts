import { google } from "@ai-sdk/google";
import { generateText, type CoreMessage } from "ai";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import { SearchEmailsSchema, type SearchEmails } from "../gmail/types";
import { GmailService } from "../gmail";
import type {
  WebSocketMessage,
  ToolResultMessage,
  AIResponseMessage,
  UserInputMessage,
} from "../../types/websocket";

export class Agent {
  private messages: CoreMessage[];
  private messageCount: number;
  private ws: WSContext<ServerWebSocket>;
  private gmailService: GmailService;

  constructor(ws: WSContext<ServerWebSocket>, gmailService: GmailService) {
    this.messages = [];
    this.messageCount = 0;
    this.ws = ws;
    this.gmailService = gmailService;
  }

  private sendWebSocketMessage(message: WebSocketMessage) {
    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending websocket message:", error);
    }
  }

  public async handleUserInput(input?: string) {
    if (input) {
      this.messages.push({
        role: "user",
        content: input,
      });
      this.messageCount++;
      this.sendWebSocketMessage({
        type: "USER_INPUT",
        content: input,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await generateText({
      model: google("gemini-2.0-flash"),
      tools: {
        search_emails: {
          description: "Searches for emails using Gmail search syntax",
          parameters: SearchEmailsSchema,
          execute: async (args: any) => {
            const searchArgs: SearchEmails = SearchEmailsSchema.parse(args);

            const response = await this.gmailService.searchEmails(searchArgs);

            if (!response) {
              throw new Error(
                "No emails found or Gmail service not initialized."
              );
            }
            return response.content.text;
          },
        },
      },
      messages: this.messages,
    });

    // Handle tool results
    if (result.toolResults && result.toolResults.length > 0) {
      for (const toolResult of result.toolResults) {
        // Send tool result to frontend
        this.sendWebSocketMessage({
          type: "TOOL_RESULT",
          content:
            typeof toolResult.result === "string"
              ? toolResult.result
              : JSON.stringify(toolResult.result, null, 2),
          toolName: toolResult.toolName,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // If no tool results, send AI response
      this.sendWebSocketMessage({
        type: "AI_RESPONSE",
        content: result.text,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
