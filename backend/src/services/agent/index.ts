import { generateText, tool, type CoreMessage } from "ai";
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
import {
  detectEndChatIntent,
  resolveOrdinalEmailReferenceAI,
} from "./helpers/helpers";
import { googleTts } from "../audio/google-tts";

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
    console.log(this.messages.length);

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

        this.clearMessages();
        this.close();

        return; // Exit early, don't process further
      }

      const result = await generateText({
        model: google("gemini-2.0-flash"),
        // model: openai("gpt-4.1-mini"),
        messages: this.messages,
        tools: this.tools,
        maxSteps: 5,
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
          try {
            // const audio = await elevenLabsTts(followUp.text);

            const audio = await googleTts(followUp.text);
            if (audio) {
              await this.sendMessage({
                type: "AUDIO",
                content: { audio },
              });
            }
          } catch (error) {
            await this.sendMessage({
              type: "ERROR",
              content: "Failed to generate audio. Please try again later.",
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

        this.close();
      } else {
        // No tools called, just add the regular response
        this.messages.push({
          role: "assistant",
          content: result.text,
        });

        if (this.audioEnabled) {
          try {
            // const audio = await elevenLabsTts(result.text);

            const audio = await googleTts(result.text);
            if (audio) {
              await this.sendMessage({
                type: "AUDIO",
                content: { audio },
              });
            }
          } catch (error) {
            await this.sendMessage({
              type: "ERROR",
              content: "Failed to generate audio. Please try again later.",
            });
          }
        }

        await this.sendMessage({
          type: "AI_RESPONSE",
          content: result.text,
        });

        await this.sendMessage({
          type: "DONE",
          content: "",
        });

        this.close();
      }
    } catch (error) {
      await this.sendMessage({
        type: "ERROR",
        content: error instanceof Error ? error.message : JSON.stringify(error),
      });
    }
  }

  tools = {
    send_email: tool({
      description: "Send or draft an email to a recipient.",
      parameters: SendEmailSchema,
      execute: async (args: any) => {
        const sendArgs = SendEmailSchema.parse(args);

        const response = await this.gmailService.sendEmail(sendArgs);

        if (!response) throw new Error("Tool execution failed: send_email");

        return response.content.text;
      },
    }),
    read_email: tool({
      description:
        "Read an email by ID or reference (e.g., 'email from John', 'latest email'). Supports ordinal references like 'first', 'second', 'third' from recent lists.",
      parameters: ReadEmailSchema,
      execute: async (args: any) => {
        const readArgs = ReadEmailSchema.parse(args);
        if (readArgs.emailReference) {
          const resolvedId = await resolveOrdinalEmailReferenceAI(
            readArgs.emailReference,
            this.lastEmailList,
            this.messages
          );
          if (resolvedId) {
            readArgs.messageId = resolvedId;
            delete readArgs.emailReference;
          }
        }
        const response = await this.gmailService.readEmails(readArgs);
        if (!response) throw new Error("Tool execution failed: read_email");
        return response.content.text;
      },
    }),
    search_email: tool({
      description: "Search emails using Gmail search syntax",
      parameters: SearchEmailsSchema,
      execute: async (args: any) => {
        const searchArgs = SearchEmailsSchema.parse(args);
        const response = await this.gmailService.searchEmails(searchArgs);
        if (!response) throw new Error("Tool execution failed: search_email");
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
    }),
    list_email_labels: tool({
      description: "Get all available Gmail labels",
      parameters: ListEmailLabelsSchema,
      execute: async () => {
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
