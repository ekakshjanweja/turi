import { gmail_v1 } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import { configureOAuth2Client, createGmailClient } from "./helpers";
import type { SearchEmails } from "./types";
import type { EmailSearchResult, EmailSummary } from "../../types/websocket";

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
      messages.map(
        async (
          msg
        ): Promise<EmailSummary | null> => {
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
        }
      )
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
}
