import { google } from "@ai-sdk/google";
import { generateText, type CoreMessage } from "ai";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import { GmailService } from "../gmail";
import type {
  WebSocketMessage,
  EmailSearchResult,
  EmailSummary,
} from "../../types/websocket";
import { ReadEmailSchema, SearchEmailsSchema } from "../gmail/schema";
import type { SearchEmails, ReadEmail } from "../gmail/types";

export class Agent {
  private messages: CoreMessage[];
  private messageCount: number;
  private ws: WSContext<ServerWebSocket>;
  private gmailService: GmailService;
  private lastSearchResults: EmailSummary[] = [];

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

  private resolveEmailReference(emailReference: string): string | undefined {
    if (this.lastSearchResults.length === 0) {
      return undefined;
    }

    const lowerRef = emailReference.toLowerCase().trim();

    // Handle positional references
    if (
      lowerRef.includes("first") ||
      lowerRef.includes("1st") ||
      lowerRef === "1"
    ) {
      return this.lastSearchResults[0]?.id;
    }
    if (
      lowerRef.includes("second") ||
      lowerRef.includes("2nd") ||
      lowerRef === "2"
    ) {
      return this.lastSearchResults[1]?.id;
    }
    if (
      lowerRef.includes("third") ||
      lowerRef.includes("3rd") ||
      lowerRef === "3"
    ) {
      return this.lastSearchResults[2]?.id;
    }
    if (lowerRef.includes("last") || lowerRef.includes("latest")) {
      return this.lastSearchResults[this.lastSearchResults.length - 1]?.id;
    }

    // Handle "that email" or "this email" - assume it's the first one
    if (lowerRef.includes("that") || lowerRef.includes("this")) {
      return this.lastSearchResults[0]?.id;
    }

    // Handle sender-based references - simplified
    for (const email of this.lastSearchResults) {
      if (email.from.toLowerCase().includes(lowerRef)) {
        return email.id;
      }
    }

    // Handle subject-based references - simplified
    for (const email of this.lastSearchResults) {
      if (email.subject.toLowerCase().includes(lowerRef)) {
        return email.id;
      }
    }

    return undefined;
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
        read_email: {
          description:
            "Retrieves the content of a specific email. You can provide either a messageId or describe which email from the search results (e.g., 'first email', 'email from John', 'latest email')",
          parameters: ReadEmailSchema,
          execute: async (args: any) => {
            const readArgs: ReadEmail = ReadEmailSchema.parse(args);

            let messageId = readArgs.messageId;

            // If no messageId provided, try to resolve from emailReference
            if (!messageId && readArgs.emailReference) {
              messageId = this.resolveEmailReference(readArgs.emailReference);
              if (!messageId) {
                const availableEmails =
                  this.lastSearchResults.length > 0
                    ? this.lastSearchResults
                        .map(
                          (e, i) => `${i + 1}. ${e.subject.substring(0, 50)}...`
                        )
                        .join(", ")
                    : "No emails in search results";
                throw new Error(
                  `Could not resolve email reference: "${readArgs.emailReference}". Please search for emails first or provide a specific messageId. Available emails: ${availableEmails}`
                );
              }
            }

            if (!messageId) {
              throw new Error(
                "Either messageId or emailReference must be provided."
              );
            }

            const response = await this.gmailService.readEmails({ messageId });

            if (!response) {
              throw new Error(
                "Email not found or Gmail service not initialized."
              );
            }
            return response.content.text;
          },
        },
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

            // Store the search results for later reference by read_email tool
            const searchResult = response.content.text as EmailSearchResult;
            this.lastSearchResults = searchResult.emails;

            return response.content.text;
          },
        },
      },
      messages: this.messages,
    });

    // Handle tool results
    if (result.toolResults && result.toolResults.length > 0) {
      // Add tool calls and results to conversation history
      this.messages.push({
        role: "assistant",
        content: result.toolCalls,
      });

      this.messages.push({
        role: "tool",
        content: result.toolResults,
      });

      // Send tool results to frontend
      for (const toolResult of result.toolResults) {
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
    }
  }
}
