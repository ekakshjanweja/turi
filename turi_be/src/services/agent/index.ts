import { google } from "@ai-sdk/google";
import { generateText, type CoreMessage } from "ai";
import type { ServerWebSocket } from "bun";
import type { WSContext } from "hono/ws";
import { GmailService } from "../gmail";
import type {
  WebSocketMessage,
  EmailSearchResult,
  EmailSummary,
  EmailReadResult,
} from "../../types/websocket";
import {
  ListEmailLabelsSchema,
  ReadEmailSchema,
  SearchEmailsSchema,
  SendEmailSchema,
  CreateLabelSchema,
  UpdateLabelSchema,
  DeleteLabelSchema,
  GetOrCreateLabelSchema,
} from "../gmail/schema";
import type {
  SearchEmails,
  ReadEmail,
  SendEmail,
  EmailSendResult,
  LabelManagerResult,
  CreateLabel,
  UpdateLabel,
  DeleteLabel,
  GetOrCreateLabel,
} from "../gmail/types";
import {
  EMAIL_AGENT_SYSTEM_PROMPT,
  EMAIL_SEARCH_PROMPT,
  EMAIL_COMPOSITION_PROMPT,
  LABEL_MANAGEMENT_PROMPT,
} from "./prompts";

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
    this.messages.push({
      role: "system",
      content: EMAIL_AGENT_SYSTEM_PROMPT,
    });
  }

  private sendWebSocketMessage(message: WebSocketMessage) {
    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending websocket message:", error);
    }
  }

  private async generateAndSendToolExplanation(toolResult: any) {
    try {
      // Create a context-aware prompt for explaining the tool result
      const explanationPrompt = this.createExplanationPrompt(toolResult);

      const explanationResult = await generateText({
        model: google("gemini-2.0-flash"),
        messages: [
          {
            role: "user",
            content: explanationPrompt,
          },
        ],
      });

      // Send the AI-generated explanation
      this.sendWebSocketMessage({
        type: "AI_RESPONSE",
        content: explanationResult.text,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating tool explanation:", error);
      // Send a fallback explanation if AI generation fails
      this.sendWebSocketMessage({
        type: "AI_RESPONSE",
        content: `Tool "${toolResult.toolName}" completed successfully.`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private createExplanationPrompt(toolResult: any): string {
    const toolName = toolResult.toolName;
    const result = toolResult.result;

    let prompt = `Please provide a clear, concise explanation of the following tool result for the user. Focus on what was accomplished and what the data means. Be helpful and user-friendly.\n\n`;
    prompt += `Tool: ${toolName}\n`;
    prompt += `Result: ${
      typeof result === "string" ? result : JSON.stringify(result, null, 2)
    }\n\n`;

    // Add specific guidance based on tool type
    switch (toolName) {
      case "search_emails":
        prompt = EMAIL_SEARCH_PROMPT;
        break;
      case "read_email":
        prompt += `This was an email reading operation. Summarize the email content including sender, subject, and main points. Highlight any important information or attachments.`;
        break;
      case "send_email":
        prompt = EMAIL_COMPOSITION_PROMPT;
        break;
      case "list_email_labels":
      case "create_email_label":
      case "update_email_label":
      case "delete_email_label":
      case "get_or_create_email_label":
        prompt += `${LABEL_MANAGEMENT_PROMPT}\n\n`;
        switch (toolName) {
          case "list_email_labels":
            prompt += `This was a Gmail labels listing operation. Summarize how many labels were found, break down system vs user labels, and highlight any interesting patterns or useful labels for organization. Mention key system labels and any custom user labels.`;
            break;
          case "create_email_label":
            prompt += `This was a label creation operation. Confirm whether the label was created successfully, mention the label name, and explain what this means for email organization.`;
            break;
          case "update_email_label":
            prompt += `This was a label update operation. Explain what changes were made to the label and confirm the success of the operation.`;
            break;
          case "delete_email_label":
            prompt += `This was a label deletion operation. Confirm whether the label was deleted successfully and explain what this means for emails that had this label.`;
            break;
          case "get_or_create_email_label":
            prompt += `This was a get-or-create label operation. Explain whether an existing label was found or a new one was created, and provide details about the label.`;
            break;
        }
        break;
      default:
        prompt += `This was a ${toolName} operation. Explain what was accomplished and what the user should know about the results.`;
    }

    prompt += `\n\nKeep your response conversational and helpful, as if you're explaining to someone who wants to understand what just happened with their email management system.`;

    return prompt;
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
        send_email: {
          description: "Sends or drafts a new email",
          parameters: SendEmailSchema,
          execute: async (args: any) => {
            const sendArgs: SendEmail = SendEmailSchema.parse(args);

            console.log("Sending email with args:", sendArgs);

            const response = await this.gmailService.sendEmail(sendArgs);

            if (!response) {
              throw new Error(
                "Failed to send email or Gmail service not initialized."
              );
            }

            const emailSendResult: EmailSendResult = response.content.text;

            return emailSendResult;
          },
        },
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

            const emailReadResult: EmailReadResult = response.content.text;
            return emailReadResult;
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

            return searchResult;
          },
        },

        list_email_labels: {
          description: "Retrieves all available Gmail labels",
          parameters: ListEmailLabelsSchema,
          execute: async () => {
            const response = await this.gmailService.listEmailLabels();

            if (!response) {
              throw new Error(
                "Failed to retrieve labels or Gmail service not initialized."
              );
            }

            const labelManagerResult: LabelManagerResult =
              response.content.text;

            return labelManagerResult;
          },
        },

        create_email_label: {
          description: "Creates a new Gmail label",
          parameters: CreateLabelSchema,
          execute: async (args: any) => {
            const createArgs: CreateLabel = CreateLabelSchema.parse(args);

            const response = await this.gmailService.createEmailLabel(
              createArgs
            );

            if (!response) {
              throw new Error(
                "Failed to create label or Gmail service not initialized."
              );
            }

            const labelManagerResult: LabelManagerResult =
              response.content.text;

            return labelManagerResult;
          },
        },

        update_email_label: {
          description: "Updates an existing Gmail label",
          parameters: UpdateLabelSchema,
          execute: async (args: any) => {
            const updateArgs: UpdateLabel = UpdateLabelSchema.parse(args);

            const response = await this.gmailService.updateEmailLabel(
              updateArgs
            );

            if (!response) {
              throw new Error(
                "Failed to update label or Gmail service not initialized."
              );
            }

            const labelManagerResult: LabelManagerResult =
              response.content.text;

            return labelManagerResult;
          },
        },

        delete_email_label: {
          description: "Deletes a Gmail label",
          parameters: DeleteLabelSchema,
          execute: async (args: any) => {
            const deleteArgs: DeleteLabel = DeleteLabelSchema.parse(args);

            const response = await this.gmailService.deleteEmailLabel(
              deleteArgs
            );

            if (!response) {
              throw new Error(
                "Failed to delete label or Gmail service not initialized."
              );
            }

            const labelManagerResult: LabelManagerResult =
              response.content.text;

            return labelManagerResult;
          },
        },

        get_or_create_email_label: {
          description:
            "Gets an existing Gmail label by name or creates it if it doesn't exist",
          parameters: GetOrCreateLabelSchema,
          execute: async (args: any) => {
            const getOrCreateArgs: GetOrCreateLabel =
              GetOrCreateLabelSchema.parse(args);

            const response = await this.gmailService.getOrCreateEmailLabel(
              getOrCreateArgs
            );

            if (!response) {
              throw new Error(
                "Failed to get or create label or Gmail service not initialized."
              );
            }

            const labelManagerResult: LabelManagerResult =
              response.content.text;

            return labelManagerResult;
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

      // Send tool results to frontend with AI-generated explanations
      for (const toolResult of result.toolResults) {
        // First send the tool result
        this.sendWebSocketMessage({
          type: "TOOL_RESULT",
          content:
            typeof toolResult.result === "string"
              ? toolResult.result
              : JSON.stringify(toolResult.result, null, 2),
          toolName: toolResult.toolName,
          timestamp: new Date().toISOString(),
        });

        // Generate and send AI explanation for the tool result
        await this.generateAndSendToolExplanation(toolResult);
      }
    }
  }
}
