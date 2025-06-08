import { gmail_v1 } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import {
  configureOAuth2Client,
  createGmailClient,
  extractEmailContent,
  validateEmail,
  encodeEmailHeader,
  createEmailMessage,
} from "./helpers";
import type {
  EmailSearchResult,
  EmailSummary,
  EmailReadResult,
} from "../../types/websocket";
import type {
  EmailAttachment,
  GmailMessagePart,
  ReadEmail,
  SearchEmails,
  SendEmail,
  EmailSendResult,
} from "./types";

export class GmailService {
  private oauth2Client: OAuth2Client | null = null;
  private gmail: gmail_v1.Gmail | null = null;

  public async init(userId: string) {
    const configureOAuth2ClientResponse = await configureOAuth2Client(userId);

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

    const response = await this.gmail.users.messages.get({
      userId: "me",
      id: args.messageId,
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
      messageId: args.messageId || response.data.id || "",
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
      args.to.forEach((email) => {
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
      interface GmailMessageRequest {
        raw: string;
        threadId?: string;
      }

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
}
