import { gmail_v1 } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import {
  buildSearchQueryFromReference,
  configureOAuth2Client,
  createEmailMessage,
  createGmailClient,
  createLabel,
  deleteLabel,
  extractEmailContent,
  getOrCreateLabel,
  listLabels,
  updateLabel,
  validateEmail,
} from "./helper";
import type {
  CreateLabel,
  DeleteLabel,
  EmailAttachment,
  EmailSendResult,
  GetOrCreateLabel,
  GmailMessagePart,
  LabelManagerResult,
  ListEmailLabels,
  ReadEmail,
  SearchEmails,
  SendEmail,
  UpdateLabel,
} from "./types";
import type {
  EmailReadResult,
  EmailSearchResult,
  EmailSummary,
} from "../../lib/types/types";
import type { DbInstance } from "../../lib/db";

export class GmailService {
  private oauth2Client: OAuth2Client | null = null;
  private gmail: gmail_v1.Gmail | null = null;

  public async init(userId: string, db: DbInstance) {
    const configureOAuth2ClientResponse = await configureOAuth2Client(
      userId,
      db
    );

    if (configureOAuth2ClientResponse.error) {
      console.log(
        "Error configuring OAuth2 client:",
        configureOAuth2ClientResponse.error.message
      );
      return;
    }

    if (!configureOAuth2ClientResponse.oauth2Client) {
      console.error(
        "OAuth2Client is undefined. Cannot initialize Gmail service."
      );
      return;
    }

    this.oauth2Client = configureOAuth2ClientResponse.oauth2Client!;

    const createGmailClientResponse = await createGmailClient(
      this.oauth2Client
    );

    if (createGmailClientResponse.error) {
      console.log(
        "Error creating Gmail client:",
        createGmailClientResponse.error.message
      );
      return;
    }

    if (!createGmailClientResponse.gmail) {
      console.error(
        "Gmail client is undefined. Cannot initialize Gmail service."
      );
      return;
    }

    this.gmail = createGmailClientResponse.gmail!;
  }

  public async searchEmails(args: SearchEmails): Promise<
    | {
        content: {
          type: "text";
          text: EmailSearchResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    let query = args.query;

    if (!query.includes("category:")) {
      query += " category:primary";
    }

    const response = await this.gmail.users.messages.list({
      userId: "me",
      q: args.query,
      maxResults: args.maxResults || 20,
    });

    const messages = response.data.messages || [];
    const results = await Promise.all(
      messages.map(async (msg): Promise<EmailSummary | null> => {
        if (!this.gmail) {
          return null;
        }
        const detail = await this.gmail.users.messages.get({
          userId: "me",
          id: msg.id!,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });
        const headers = detail.data.payload?.headers || [];
        return {
          id: msg.id!,
          subject: headers.find((h) => h.name === "Subject")?.value || "",
          from: headers.find((h) => h.name === "From")?.value || "",
          date: headers.find((h) => h.name === "Date")?.value || "",
        };
      })
    );

    const emails = results.filter((msg): msg is EmailSummary => msg !== null);

    const searchResult: EmailSearchResult = {
      emails,
      query: args.query,
      totalCount: emails.length,
    };

    return {
      content: {
        type: "text",
        text: searchResult,
      },
    };
  }

  public async readEmails(args: ReadEmail): Promise<
    | {
        content: {
          type: "text";
          text: EmailReadResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    let messageId = args.messageId;

    // If no messageId provided but emailReference is provided, try to resolve it
    if (!messageId && args.emailReference) {
      // Create a search query from the email reference
      const searchQuery = buildSearchQueryFromReference(args.emailReference);

      try {
        const searchResponse = await this.gmail.users.messages.list({
          userId: "me",
          q: searchQuery,
          maxResults: 5, // Get a few results to find the best match
        });

        const messages = searchResponse.data.messages || [];
        if (messages.length === 0) {
          throw new Error(
            `No emails found matching reference: "${args.emailReference}"`
          );
        }

        // For now, take the first (most recent) match
        // In the future, we could implement better matching logic
        const firstMessage = messages[0];
        if (!firstMessage?.id) {
          throw new Error(
            `Invalid message found for reference: "${args.emailReference}"`
          );
        }
        messageId = firstMessage.id;
      } catch (error) {
        throw new Error(
          `Failed to resolve email reference "${args.emailReference}": ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    if (!messageId) {
      throw new Error("Either messageId or emailReference must be provided");
    }

    const response = await this.gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const headers = response.data.payload?.headers || [];
    const subject =
      headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "";
    const from =
      headers.find((h) => h.name?.toLowerCase() === "from")?.value || "";
    const to = headers.find((h) => h.name?.toLowerCase() === "to")?.value || "";
    const date =
      headers.find((h) => h.name?.toLowerCase() === "date")?.value || "";
    const threadId = response.data.threadId || "";

    // Extract email content using the recursive function
    const { text, html } = extractEmailContent(
      (response.data.payload as GmailMessagePart) || {}
    );

    // Get attachment information
    const attachments: EmailAttachment[] = [];
    const processAttachmentParts = (
      part: GmailMessagePart,
      path: string = ""
    ) => {
      if (part.body && part.body.attachmentId) {
        const filename =
          part.filename || `attachment-${part.body.attachmentId}`;
        attachments.push({
          id: part.body.attachmentId,
          filename: filename,
          mimeType: part.mimeType || "application/octet-stream",
          size: part.body.size || 0,
        });
      }

      if (part.parts) {
        part.parts.forEach((subpart: GmailMessagePart) =>
          processAttachmentParts(subpart, `${path}/parts`)
        );
      }
    };

    if (response.data.payload) {
      processAttachmentParts(response.data.payload as GmailMessagePart);
    }

    const emailReadResult: EmailReadResult = {
      email: {
        id: response.data.id || "",
        threadId,
        subject,
        from,
        to,
        date,
        textContent: text || undefined,
        htmlContent: html || undefined,
        attachments: attachments.map((a) => ({
          id: a.id,
          filename: a.filename,
          mimeType: a.mimeType,
          size: a.size,
        })),
      },
      messageId: args.messageId || messageId || response.data.id || "",
    };

    return {
      content: {
        type: "text",
        text: emailReadResult,
      },
    };
  }

  public async sendEmail(args: SendEmail): Promise<
    | {
        content: {
          type: "text";
          text: EmailSendResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    try {
      // Validate email addresses in to, cc, and bcc fields
      args.to.forEach((email: string) => {
        if (!validateEmail(email)) {
          throw new Error(`Recipient email address is invalid: ${email}`);
        }
      });

      if (args.cc) {
        args.cc.forEach((email) => {
          if (!validateEmail(email)) {
            throw new Error(`CC email address is invalid: ${email}`);
          }
        });
      }

      if (args.bcc) {
        args.bcc.forEach((email) => {
          if (!validateEmail(email)) {
            throw new Error(`BCC email address is invalid: ${email}`);
          }
        });
      }

      // Create the email message
      const message = createEmailMessage(args);

      // Encode the message for Gmail API
      const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Define the type for messageRequest
      type GmailMessageRequest = {
        raw: string;
        threadId?: string;
      };

      const messageRequest: GmailMessageRequest = {
        raw: encodedMessage,
      };

      // Add threadId if specified
      if (args.threadId) {
        messageRequest.threadId = args.threadId;
      }

      const action = args.action || "send";

      if (action === "send") {
        const response = await this.gmail.users.messages.send({
          userId: "me",
          requestBody: messageRequest,
        });

        const result: EmailSendResult = {
          success: true,
          messageId: response.data.id || "",
          action: "sent",
          message: `Email sent successfully with ID: ${response.data.id}`,
        };

        return {
          content: {
            type: "text",
            text: result,
          },
        };
      } else {
        const response = await this.gmail.users.drafts.create({
          userId: "me",
          requestBody: {
            message: messageRequest,
          },
        });

        const result: EmailSendResult = {
          success: true,
          messageId: response.data.id || "",
          action: "draft",
          message: `Email draft created successfully with ID: ${response.data.id}`,
        };

        return {
          content: {
            type: "text",
            text: result,
          },
        };
      }
    } catch (error) {
      console.error("Error in sendEmail:", error);

      const errorResult: EmailSendResult = {
        success: false,
        messageId: "",
        action: (args.action || "send") === "send" ? "sent" : "draft",
        message: `Failed to ${args.action || "send"} email: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };

      return {
        content: {
          type: "text",
          text: errorResult,
        },
      };
    }
  }

  // Label Management Methods

  public async listEmailLabels(args?: ListEmailLabels): Promise<
    | {
        content: {
          type: "text";
          text: LabelManagerResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    try {
      const labelResults = await listLabels(this.gmail);

      const result: LabelManagerResult = {
        success: true,
        message: `Found ${labelResults.count.total} labels (${labelResults.count.system} system, ${labelResults.count.user} user)`,
        labels: labelResults,
      };

      return {
        content: {
          type: "text",
          text: result,
        },
      };
    } catch (error) {
      console.error("Error in listEmailLabels:", error);

      const errorResult: LabelManagerResult = {
        success: false,
        message: `Failed to list labels: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };

      return {
        content: {
          type: "text",
          text: errorResult,
        },
      };
    }
  }

  public async createEmailLabel(args: CreateLabel): Promise<
    | {
        content: {
          type: "text";
          text: LabelManagerResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    try {
      const label = await createLabel(this.gmail, args.name, {
        messageListVisibility: args.messageListVisibility,
        labelListVisibility: args.labelListVisibility,
      });

      const result: LabelManagerResult = {
        success: true,
        message: `Label "${args.name}" created successfully`,
        label,
      };

      return {
        content: {
          type: "text",
          text: result,
        },
      };
    } catch (error) {
      console.error("Error in createEmailLabel:", error);

      const errorResult: LabelManagerResult = {
        success: false,
        message: `Failed to create label: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };

      return {
        content: {
          type: "text",
          text: errorResult,
        },
      };
    }
  }

  public async updateEmailLabel(args: UpdateLabel): Promise<
    | {
        content: {
          type: "text";
          text: LabelManagerResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    try {
      const updates: any = {};
      if (args.name) updates.name = args.name;
      if (args.messageListVisibility)
        updates.messageListVisibility = args.messageListVisibility;
      if (args.labelListVisibility)
        updates.labelListVisibility = args.labelListVisibility;

      const label = await updateLabel(this.gmail, args.id, updates);

      const result: LabelManagerResult = {
        success: true,
        message: `Label updated successfully`,
        label,
      };

      return {
        content: {
          type: "text",
          text: result,
        },
      };
    } catch (error) {
      console.error("Error in updateEmailLabel:", error);

      const errorResult: LabelManagerResult = {
        success: false,
        message: `Failed to update label: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };

      return {
        content: {
          type: "text",
          text: errorResult,
        },
      };
    }
  }

  public async deleteEmailLabel(args: DeleteLabel): Promise<
    | {
        content: {
          type: "text";
          text: LabelManagerResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    try {
      const deleteResult = await deleteLabel(this.gmail, args.id);

      const result: LabelManagerResult = {
        success: true,
        message: deleteResult.message,
      };

      return {
        content: {
          type: "text",
          text: result,
        },
      };
    } catch (error) {
      console.error("Error in deleteEmailLabel:", error);

      const errorResult: LabelManagerResult = {
        success: false,
        message: `Failed to delete label: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };

      return {
        content: {
          type: "text",
          text: errorResult,
        },
      };
    }
  }

  public async getOrCreateEmailLabel(args: GetOrCreateLabel): Promise<
    | {
        content: {
          type: "text";
          text: LabelManagerResult;
        };
      }
    | undefined
  > {
    if (!this.gmail) {
      console.error("Gmail client is not initialized.");
      return;
    }

    try {
      const label = await getOrCreateLabel(this.gmail, args.name, {
        messageListVisibility: args.messageListVisibility,
        labelListVisibility: args.labelListVisibility,
      });

      const result: LabelManagerResult = {
        success: true,
        message: `Label "${args.name}" retrieved or created successfully`,
        label,
      };

      return {
        content: {
          type: "text",
          text: result,
        },
      };
    } catch (error) {
      console.error("Error in getOrCreateEmailLabel:", error);

      const errorResult: LabelManagerResult = {
        success: false,
        message: `Failed to get or create label: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };

      return {
        content: {
          type: "text",
          text: errorResult,
        },
      };
    }
  }
}
