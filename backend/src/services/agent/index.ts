import { generateText, type CoreMessage } from "ai";
import type { GmailService } from "../gmail";
import {
  EMAIL_AGENT_SYSTEM_PROMPT,
  HUMANIZE_AGENT_SYSTEM_PROMPT,
} from "./prompts";
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
import { detectEndChatIntent, resolveOrdinalEmailReferenceAI } from "./helpers";
import { tts } from "../audio/tts";

export class Agent {
  private stream: SSEStreamingApi;
  private messages: CoreMessage[];
  private messageCount: number;
  private gmailService: GmailService;
  private audioEnabled: boolean;
  private lastEmailList: EmailSummary[] = [];

  constructor(
    stream: SSEStreamingApi,
    gmailService: GmailService,
    audioEnabled: boolean
  ) {
    this.stream = stream;
    this.messages = [];
    this.messageCount = 0;
    this.gmailService = gmailService;
    this.audioEnabled = audioEnabled;
    this.messages.push({
      role: "system",
      content: EMAIL_AGENT_SYSTEM_PROMPT,
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
    this.messages.push({
      role: "system",
      content: EMAIL_AGENT_SYSTEM_PROMPT,
    });
  }

  private async sendMessage(message: Message) {
    try {
      await this.stream.writeSSE({
        data: JSON.stringify(message),
        event: "message",
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  public async handleUserInput(input: string) {
    try {
      await this.sendMessage({
        type: "THINKING",
        content: "Thinking about your request...",
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
        });

        await this.sendMessage({
          type: "END",
          content: "Chat session ended",
        });

        // Add farewell to conversation history
        this.messages.push({
          role: "assistant",
          content:
            "Goodbye! Thanks for using turi. Have a great day! You can always continue chatting by pressing the mic button.",
        });

        return; // Exit early, don't process further
      }

      const result = await generateText({
        model: google("gemini-2.0-flash"),
        // model: openai("gpt-4.1-mini"),
        messages: this.messages,
        tools: {
          send_email: {
            description: "Send an email to a recipient. Or draft an email.",
            parameters: SendEmailSchema,
            execute: async (args) => {
              const sendArgs = SendEmailSchema.parse(args);

              const response = await this.gmailService.sendEmail(sendArgs);

              if (!response)
                throw new Error("Tool execution failed: send_email");

              return response.content.text;
            },
          },
          read_email: {
            description:
              "Read an email by ID or reference. If you don't have a specific messageId, you can use emailReference to describe the email (e.g., 'email from John', 'latest email', 'email about project'). The system will find the email and read its content. Supports 'first', 'second', 'third' to refer to the last shown list.",
            parameters: ReadEmailSchema,
            execute: async (args) => {
              const readArgs = ReadEmailSchema.parse(args);
              if (readArgs.emailReference) {
                const resolvedId = await resolveOrdinalEmailReferenceAI(
                  readArgs.emailReference,
                  this.lastEmailList
                );
                if (resolvedId) {
                  readArgs.messageId = resolvedId;
                  delete readArgs.emailReference;
                }
              }
              const response = await this.gmailService.readEmails(readArgs);
              if (!response)
                throw new Error("Tool execution failed: read_email");
              return response.content.text;
            },
          },
          search_email: {
            description: "Searches for emails using Gmail search syntax",
            parameters: SearchEmailsSchema,
            execute: async (args) => {
              const searchArgs = SearchEmailsSchema.parse(args);
              const response = await this.gmailService.searchEmails(searchArgs);
              if (!response)
                throw new Error("Tool execution failed: search_email");
              // Track the last list of emails for ordinal reference
              if (
                response.content &&
                response.content.text &&
                response.content.text.emails
              ) {
                this.lastEmailList = response.content.text.emails;
              } else {
                this.lastEmailList = [];
              }
              return response.content.text;
            },
          },
          list_email_labels: {
            description: "Retrieves all available Gmail labels",
            parameters: ListEmailLabelsSchema,
            execute: async () => {
              const response = await this.gmailService.listEmailLabels();

              if (!response) {
                throw new Error("Tool execution failed: list_email_labels");
              }

              return response.content.text;
            },
          },
          create_email_label: {
            description: "Creates a new Gmail label",
            parameters: CreateLabelSchema,
            execute: async (args: any) => {
              const createArgs = CreateLabelSchema.parse(args);

              const response =
                await this.gmailService.createEmailLabel(createArgs);

              if (!response) {
                throw new Error("Tool execution failed: create_email_label");
              }

              return response.content.text;
            },
          },
          update_email_label: {
            description: "Updates an existing Gmail label",
            parameters: UpdateLabelSchema,
            execute: async (args: any) => {
              const updateArgs = UpdateLabelSchema.parse(args);

              const response =
                await this.gmailService.updateEmailLabel(updateArgs);

              if (!response) {
                throw new Error(
                  "Failed to update label or Gmail service not initialized."
                );
              }

              return response.content.text;
            },
          },
          delete_email_label: {
            description: "Deletes a Gmail label",
            parameters: DeleteLabelSchema,
            execute: async (args: any) => {
              const deleteArgs = DeleteLabelSchema.parse(args);

              const response =
                await this.gmailService.deleteEmailLabel(deleteArgs);

              if (!response) {
                throw new Error("Tool execution failed: delete_email_label");
              }

              return response.content.text;
            },
          },
          get_or_create_email_label: {
            description:
              "Gets an existing Gmail label by name or creates it if it doesn't exist",
            parameters: GetOrCreateLabelSchema,
            execute: async (args: any) => {
              const getOrCreateArgs = GetOrCreateLabelSchema.parse(args);

              const response =
                await this.gmailService.getOrCreateEmailLabel(getOrCreateArgs);

              if (!response) {
                throw new Error(
                  "Tool execution failed: get_or_create_email_label"
                );
              }

              return response.content.text;
            },
          },
        },
      });

      // Handle the response properly according to AI SDK patterns
      if (result.toolCalls && result.toolCalls.length > 0) {
        // Add assistant message with tool calls
        this.messages.push({
          role: "assistant",
          content: result.toolCalls,
        });

        // Add tool results
        if (result.toolResults && result.toolResults.length > 0) {
          this.messages.push({
            role: "tool",
            content: result.toolResults,
          });
        }

        // Generate a follow-up response to explain the tool results
        const followUp = await generateText({
          model: google("gemini-2.0-flash"),
          messages: [
            ...this.messages,
            {
              role: "user" as const,
              content: HUMANIZE_AGENT_SYSTEM_PROMPT,
            },
          ],
        });

        this.messages.push({
          role: "assistant",
          content: followUp.text,
        });

        if (this.audioEnabled) {
          console.log("audioEnabled", this.audioEnabled);

          //TODO: Uncomment this when tts is working

          // const audio = await tts({ text: followUp.text });

          const audio = await elevenLabsTts(followUp.text);

          if ((audio === undefined || !audio) && this.audioEnabled) {
            await this.sendMessage({
              type: "ERROR",
              content:
                "Error: Failed to generate audio. Please try again later.",
            });
          } else {
            console.log("audio", audio);

            await this.sendMessage({
              type: "AUDIO",
              content: { audio: audio! },
            });
          }
        }

        await this.sendMessage({
          type: "AI_RESPONSE",
          content: followUp.text,
        });

        await this.sendMessage({
          type: "DONE",
          content: "",
        });
      } else {
        // No tools called, just add the regular response
        this.messages.push({
          role: "assistant",
          content: result.text,
        });

        if (this.audioEnabled) {
          const audio = await elevenLabsTts(result.text);

          await this.sendMessage({
            type: "AUDIO",
            content: { audio },
          });
        }

        await this.sendMessage({
          type: "AI_RESPONSE",
          content: result.text,
        });

        await this.sendMessage({
          type: "DONE",
          content: "",
        });
      }
    } catch (error) {
      this.sendMessage({
        type: "ERROR",
        content:
          "Error: " + (error instanceof Error ? error.message : String(error)),
      });
    }
  }
}
