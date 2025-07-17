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
} from "./helpers/helpers";
import { googleTtsStream } from "../audio/google-tts";
import { v4 as uuidv4 } from "uuid";

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
      let audioBuffer = ""; // Buffer text for audio generation (only used when audioEnabled)

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

            // TTS audio generation - only when audioEnabled is true
            if (this.audioEnabled) {
              audioBuffer += chunk.textDelta;

              // Generate audio when we have enough text or hit sentence boundaries
              const shouldGenerateAudio =
                audioBuffer.length > 50 || // Buffer has enough characters
                /[.!?]\s*$/.test(audioBuffer.trim()) || // Ends with sentence punctuation
                /[,;:]\s*$/.test(audioBuffer.trim()); // Ends with pause punctuation

              if (shouldGenerateAudio && audioBuffer.trim()) {
                try {
                  const textToSpeak = audioBuffer.trim();
                  audioBuffer = ""; // Clear buffer

                  for await (const audioChunk of googleTtsStream(textToSpeak)) {
                    await this.sendMessage({
                      type: "AUDIO",
                      content: { audio: audioChunk },
                      messageId,
                    });
                  }
                } catch (error) {
                  console.error(
                    "Failed to generate audio for text buffer:",
                    error
                  );
                  // Don't send error message for individual chunks to avoid spam
                }
              }
            }
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
            break;

          case "finish":
            // Stream finished
            console.log("Stream finished:", chunk.finishReason);

            // Generate TTS audio for any remaining buffered text - only when audioEnabled is true
            if (this.audioEnabled && audioBuffer.trim()) {
              try {
                const textToSpeak = audioBuffer.trim();
                audioBuffer = "";

                for await (const audioChunk of googleTtsStream(textToSpeak)) {
                  await this.sendMessage({
                    type: "AUDIO",
                    content: { audio: audioChunk },
                    messageId,
                  });
                }
              } catch (error) {
                console.error(
                  "Failed to generate audio for remaining buffer:",
                  error
                );
              }
            }
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

      // Audio was already streamed with each text delta chunk
      // No need to generate audio again for the complete message

      // Text response was already streamed via text-delta chunks
      // No need to send the complete response again

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
