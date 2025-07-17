import { generateText, streamText, tool, type CoreMessage } from "ai";
import type { GmailService } from "../gmail";
import { EMAIL_ASSISTANT_SYSTEM_PROMPT } from "./prompts";
import { google } from "@ai-sdk/google";
import {
  CreateLabelSchema,
  DeleteLabelSchema,
  GetOrCreateLabelSchema,
  ListEmailLabelsSchema,
  ReadEmailSchema,
  SearchEmailsSchema,
  SendEmailSchema,
  UpdateLabelSchema,
} from "../gmail/schema";
import type { Message, EmailSummary } from "../../lib/types/types";
import { elevenLabsTts } from "./eleven-labs";
import type { SSEStreamingApi } from "hono/streaming";
import {
  detectEndChatIntent,
  resolveOrdinalEmailReferenceAI,
  splitTextIntoChunks,
} from "./helpers/helpers";
import { googleTtsStream } from "../audio/google-tts";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export class Agent {
  private stream: SSEStreamingApi;
  private messages: CoreMessage[];
  private messageCount: number;
  private gmailService: GmailService;
  private audioEnabled: boolean;
  private onSendMessage: (message: Message) => Promise<void>;
  private lastEmailList: EmailSummary[] = [];

  constructor(
    stream: SSEStreamingApi,
    gmailService: GmailService,
    audioEnabled: boolean,
    onSendMessage: (message: Message) => Promise<void>
  ) {
    this.stream = stream;
    this.messages = [];
    this.messageCount = 0;
    this.gmailService = gmailService;
    this.audioEnabled = audioEnabled;
    this.onSendMessage = onSendMessage;
    this.messages.push({
      role: "system",
      content: EMAIL_ASSISTANT_SYSTEM_PROMPT,
    });
  }

  public close() {
    try {
      this.stream.close();
    } catch (error) {
      console.error("Error closing stream:", error);
    }
  }

  public updateStream(newStream: SSEStreamingApi) {
    this.stream = newStream;
  }

  public updateAudioEnabled(audioEnabled: boolean) {
    this.audioEnabled = audioEnabled;
  }

  public clearMessages() {
    this.messages = [];
    this.messageCount = 0;
    this.lastEmailList = [];
    this.messages.push({
      role: "system",
      content: EMAIL_ASSISTANT_SYSTEM_PROMPT,
    });
  }

  public async updateOnSendMessage(
    onSendMessage: (message: Message) => Promise<void>
  ) {
    this.onSendMessage = onSendMessage;
  }

  private async sendMessage(message: Message) {
    try {
      await this.onSendMessage(message);

      await this.stream.writeSSE({
        data: JSON.stringify(message),
        event: "message",
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Helper method to get email context for tools
  private getEmailContext(): string {
    if (this.lastEmailList.length === 0) {
      return "No emails currently loaded in context.";
    }

    const emailList = this.lastEmailList
      .map(
        (email, index) =>
          `${index + 1}. ${email.subject} (from: ${email.from}, date: ${email.date}, id: ${email.id})`
      )
      .join("\n");

    return `Recent emails in context (${this.lastEmailList.length} total):\n${emailList}`;
  }

  // Helper method to update email context from tool results
  private updateEmailContext(result: any) {
    // Check if result contains email list (from search)
    if (result && result.emails && Array.isArray(result.emails)) {
      this.lastEmailList = result.emails;
      console.log(`Updated email context with ${result.emails.length} emails`);
    }
    // Check if result contains a single email (from read)
    else if (result && result.email && result.email.id) {
      // Add or update single email in context
      const emailSummary: EmailSummary = {
        id: result.email.id,
        subject: result.email.subject || "",
        from: result.email.from || "",
        date: result.email.date || "",
      };

      // Update existing or add new
      const existingIndex = this.lastEmailList.findIndex(
        (e) => e.id === emailSummary.id
      );
      if (existingIndex >= 0) {
        this.lastEmailList[existingIndex] = emailSummary;
      } else {
        this.lastEmailList.unshift(emailSummary); // Add to beginning
      }
      console.log(
        `Updated email context with single email: ${emailSummary.subject}`
      );
    }
  }

  public async handleUserInput(input: string) {
    const messageId = uuidv4();
    try {
      await this.sendMessage({
        type: "THINKING",
        content: "Thinking about your request...",
        messageId: uuidv4(), // Separate ID for thinking messages
      });

      this.messages.push({
        role: "user",
        content: input,
      });
      this.messageCount++;

      // Check if user wants to end the chat
      if (detectEndChatIntent(input)) {
        await this.sendMessage({
          type: "AI_RESPONSE",
          content:
            "Goodbye! Thanks for using turi. Have a great day! You can always continue chatting by pressing the mic button.",
          messageId,
        });

        await this.sendMessage({
          type: "END",
          content: "Chat session ended",
          messageId: uuidv4(), // Separate ID for end messages
        });

        // Add farewell to conversation history
        this.messages.push({
          role: "assistant",
          content:
            "Goodbye! Thanks for using turi. Have a great day! You can always continue chatting by pressing the mic button.",
        });

        this.clearMessages();
        this.close();

        return; // Exit early, don't process further
      }

      const stream = streamText({
        model: google("gemini-2.0-flash"),
        messages: this.messages,
        tools: this.tools,
        maxSteps: 5,
      });

      let assistantMessage = "";
      let toolCalls: any[] = [];
      let toolResults: any[] = [];

      for await (const chunk of stream.fullStream) {
        switch (chunk.type) {
          case "text-delta":
            // Accumulate the text response
            assistantMessage += chunk.textDelta;
            // Stream the text delta to the client in real-time
            await this.sendMessage({
              type: "AI_RESPONSE",
              content: chunk.textDelta,
              messageId,
            });

            // Generate audio for the text delta
            // if (this.audioEnabled) {
            //   try {
            //     for await (const audioChunk of googleTtsStream(
            //       chunk.textDelta
            //     )) {
            //       await this.sendMessage({
            //         type: "AUDIO",
            //         content: {
            //           audio: audioChunk,
            //         },
            //         messageId,
            //       });
            //     }
            //   } catch (error) {
            //     console.error(
            //       "Failed to generate audio for text delta:",
            //       error
            //     );
            //   }
            // }

            break;

          case "tool-call-streaming-start":
            // Tool call is starting
            console.log(`Tool call starting: ${chunk.toolName}`);
            await this.sendMessage({
              type: "THINKING",
              content: `Using ${chunk.toolName}...`,
              messageId: uuidv4(), // Separate ID for tool thinking messages
            });
            break;

          case "tool-call-delta":
            // Tool call arguments are being streamed
            break;

          case "tool-call":
            // Complete tool call received
            toolCalls.push(chunk);
            console.log(`Tool call: ${chunk.toolName}`, chunk.args);
            break;

          case "tool-result":
            // Tool execution result
            toolResults.push(chunk);
            console.log(`Tool result for ${chunk.toolName}:`, chunk.result);

            // Update email context when tools return email data
            this.updateEmailContext(chunk.result);
            break;

          case "finish":
            // Stream finished
            console.log("Stream finished:", chunk.finishReason);
            break;

          case "error":
            // Handle errors
            console.error("Stream error:", chunk.error);
            throw new Error(`Stream error: ${chunk.error}`);
        }
      }

      // Add messages to conversation history based on what happened
      if (toolCalls.length > 0) {
        // Add assistant message with tool calls
        this.messages.push({
          role: "assistant",
          content: toolCalls,
        });

        // Add tool results if any
        if (toolResults.length > 0) {
          this.messages.push({
            role: "tool",
            content: toolResults,
          });
        }
      } else {
        // No tools called, just add the regular response
        this.messages.push({
          role: "assistant",
          content: assistantMessage,
        });
      }

      // Generate audio for the complete message after text streaming is finished
      if (this.audioEnabled && assistantMessage.trim()) {
        try {
          // Split the assistant message into smaller text chunks for progressive audio generation
          const textChunks = splitTextIntoChunks(assistantMessage.trim());

          for (let i = 0; i < textChunks.length; i++) {
            const textChunk = textChunks[i];
            if (!textChunk) continue;

            for await (const audioChunk of googleTtsStream(textChunk)) {
              await this.sendMessage({
                type: "AUDIO",
                content: {
                  audio: audioChunk, // Keep as number array for mobile compatibility
                },
                messageId,
              });
            }
          }
        } catch (error) {
          console.error(
            "Failed to generate audio for complete message:",
            error
          );
        }
      }

      await this.sendMessage({
        type: "DONE",
        content: "",
        messageId: uuidv4(), // Separate ID for done messages
      });

      this.close();
    } catch (error) {
      await this.sendMessage({
        type: "ERROR",
        content: error instanceof Error ? error.message : JSON.stringify(error),
        messageId,
      });
    }
  }

  tools = {
    get_email_context: tool({
      description:
        "Get information about currently loaded emails in context. Use this when user asks about 'what emails do I have', 'show me my emails', or when you need to understand what emails are available for reference.",
      parameters: z.object({}),
      execute: async () => {
        const emailContext = this.getEmailContext();

        if (this.lastEmailList.length === 0) {
          return "No emails currently loaded in context. Use search_email to find emails first.";
        }

        const detailedContext = this.lastEmailList.map((email, index) => ({
          position: index + 1,
          ordinal:
            index === 0
              ? "first"
              : index === 1
                ? "second"
                : index === 2
                  ? "third"
                  : `${index + 1}th`,
          id: email.id,
          subject: email.subject || "No subject",
          from: email.from || "Unknown sender",
          date: email.date || "Unknown date",
        }));

        return {
          totalEmails: this.lastEmailList.length,
          emails: detailedContext,
          message: `Currently have ${this.lastEmailList.length} email(s) loaded in context. You can reference them by position (first, second, etc.) or by content (email from sender, email about subject).`,
        };
      },
    }),
    send_email: tool({
      description: "Send or draft an email to a recipient.",
      parameters: SendEmailSchema,
      execute: async (args: any) => {
        const sendArgs = SendEmailSchema.parse(args);

        // Add email context to help with thread continuity
        const emailContext = this.getEmailContext();
        console.log("Send email context:", emailContext);

        const response = await this.gmailService.sendEmail(sendArgs);

        if (!response) throw new Error("Tool execution failed: send_email");

        return response.content.text;
      },
    }),
    read_email: tool({
      description:
        "Read an email by ID or reference. Use this tool with emailReference for ANY reference to emails from previous search results, including ordinal references like 'first', 'second', 'third', 'the second one', 'that one', 'read it', etc. Also supports descriptive references like 'email from John', 'latest email'. Current email context will be used to resolve references.",
      parameters: ReadEmailSchema,
      execute: async (args: any) => {
        const readArgs = ReadEmailSchema.parse(args);

        // Add current email context to help with reference resolution
        const emailContext = this.getEmailContext();
        console.log("Read email context:", emailContext);

        if (readArgs.emailReference) {
          const resolvedId = await resolveOrdinalEmailReferenceAI(
            readArgs.emailReference,
            this.lastEmailList,
            this.messages
          );
          if (resolvedId) {
            readArgs.messageId = resolvedId;
            delete readArgs.emailReference;
          } else if (this.lastEmailList.length > 0) {
            // Fallback to first email if resolution fails but we have emails
            const firstEmail = this.lastEmailList[0];
            if (firstEmail) {
              readArgs.messageId = firstEmail.id;
              delete readArgs.emailReference;
            }
          }
        }

        const response = await this.gmailService.readEmails(readArgs);
        if (!response) throw new Error("Tool execution failed: read_email");

        // Update context will happen in tool-result handler
        return response.content.text;
      },
    }),
    search_email: tool({
      description:
        "Search emails using Gmail search syntax. Results will be added to the current email context for future reference.",
      parameters: SearchEmailsSchema,
      execute: async (args: any) => {
        const searchArgs = SearchEmailsSchema.parse(args);
        const response = await this.gmailService.searchEmails(searchArgs);
        if (!response) throw new Error("Tool execution failed: search_email");

        // Update context will happen in tool-result handler
        return response.content.text;
      },
    }),
    list_email_labels: tool({
      description: "Get all available Gmail labels",
      parameters: ListEmailLabelsSchema,
      execute: async () => {
        const emailContext = this.getEmailContext();
        console.log("List labels email context:", emailContext);

        const response = await this.gmailService.listEmailLabels();

        if (!response) {
          throw new Error("Tool execution failed: list_email_labels");
        }

        return response.content.text;
      },
    }),
    create_email_label: tool({
      description: "Create a new Gmail label",
      parameters: CreateLabelSchema,
      execute: async (args: any) => {
        const createArgs = CreateLabelSchema.parse(args);

        const emailContext = this.getEmailContext();
        console.log("Create label email context:", emailContext);

        const response = await this.gmailService.createEmailLabel(createArgs);

        if (!response) {
          throw new Error("Tool execution failed: create_email_label");
        }

        return response.content.text;
      },
    }),
    update_email_label: tool({
      description: "Update an existing Gmail label",
      parameters: UpdateLabelSchema,
      execute: async (args: any) => {
        const updateArgs = UpdateLabelSchema.parse(args);

        const emailContext = this.getEmailContext();
        console.log("Update label email context:", emailContext);

        const response = await this.gmailService.updateEmailLabel(updateArgs);

        if (!response) {
          throw new Error(
            "Failed to update label or Gmail service not initialized."
          );
        }

        return response.content.text;
      },
    }),
    delete_email_label: tool({
      description: "Delete a Gmail label",
      parameters: DeleteLabelSchema,
      execute: async (args: any) => {
        const deleteArgs = DeleteLabelSchema.parse(args);

        const emailContext = this.getEmailContext();
        console.log("Delete label email context:", emailContext);

        const response = await this.gmailService.deleteEmailLabel(deleteArgs);

        if (!response) {
          throw new Error("Tool execution failed: delete_email_label");
        }

        return response.content.text;
      },
    }),
    get_or_create_email_label: tool({
      description: "Get existing Gmail label by name or create if missing",
      parameters: GetOrCreateLabelSchema,
      execute: async (args: any) => {
        const getOrCreateArgs = GetOrCreateLabelSchema.parse(args);

        const emailContext = this.getEmailContext();
        console.log("Get/create label email context:", emailContext);

        const response =
          await this.gmailService.getOrCreateEmailLabel(getOrCreateArgs);

        if (!response) {
          throw new Error("Tool execution failed: get_or_create_email_label");
        }

        return response.content.text;
      },
    }),
  };
}
