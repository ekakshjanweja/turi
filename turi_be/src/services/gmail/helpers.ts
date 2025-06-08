import { account as accountSchema } from "../../lib/db/schema/auth";
import { db } from "../../lib/db";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import type { EmailContent, GmailMessagePart } from "./types";

export async function configureOAuth2Client(
  userId: string
): Promise<
  | { oauth2Client: OAuth2Client; error?: never }
  | { error: Error; oauth2Client?: never }
>;
export async function configureOAuth2Client(userId: string) {
  try {
    const userAccounts = await db
      .select({
        accessToken: accountSchema.accessToken,
        refreshToken: accountSchema.refreshToken,
        accessTokenExpiresAt: accountSchema.accessTokenExpiresAt,
      })
      .from(accountSchema)
      .where(
        and(
          eq(accountSchema.userId, userId),
          eq(accountSchema.providerId, "google")
        )
      )
      .limit(1);

    if (
      !userAccounts ||
      userAccounts.length === 0 ||
      !userAccounts[0]?.accessToken
    ) {
      const error = new Error(
        "Google account not linked or access token not found for the user."
      );
      return { error };
    }

    const account = userAccounts[0];

    const oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });

    oauth2Client.setCredentials({
      access_token: account.accessToken!,
      refresh_token: account.refreshToken,
      expiry_date: account.accessTokenExpiresAt
        ? account.accessTokenExpiresAt.getTime()
        : undefined,
    });

    if (account.accessTokenExpiresAt && account.refreshToken) {
      const fiveMinutesInMs = 5 * 60 * 1000;
      if (
        account.accessTokenExpiresAt.getTime() - Date.now() <
        fiveMinutesInMs
      ) {
        const error = new Error(
          "Token might be expiring soon. Relying on googleapis client to handle refresh if needed."
        );
        return { error };
      }
    }

    return { oauth2Client };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export async function createGmailClient(
  oauth2Client: OAuth2Client
): Promise<
  | { gmail: ReturnType<typeof google.gmail>; error?: never }
  | { error: Error; gmail?: never }
> {
  try {
    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client as OAuth2Client,
    });

    return { gmail };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function extractEmailContent(messagePart: GmailMessagePart): EmailContent {
  // Initialize containers for different content types
  let textContent = "";
  let htmlContent = "";

  // If the part has a body with data, process it based on MIME type
  if (messagePart.body && messagePart.body.data) {
    const content = Buffer.from(messagePart.body.data, "base64").toString(
      "utf8"
    );

    // Store content based on its MIME type
    if (messagePart.mimeType === "text/plain") {
      textContent = content;
    } else if (messagePart.mimeType === "text/html") {
      htmlContent = content;
    }
  }

  // If the part has nested parts, recursively process them
  if (messagePart.parts && messagePart.parts.length > 0) {
    for (const part of messagePart.parts) {
      const { text, html } = extractEmailContent(part);
      if (text) textContent += text;
      if (html) htmlContent += html;
    }
  }

  // Return both plain text and HTML content
  return { text: textContent, html: htmlContent };
}

// Email utility functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function encodeEmailHeader(text: string): string {
  // For ASCII text, no encoding needed
  if (/^[\x00-\x7F]*$/.test(text)) {
    return text;
  }
  
  // For non-ASCII text, use RFC 2047 encoding
  return `=?UTF-8?B?${Buffer.from(text).toString('base64')}?=`;
}

export function createEmailMessage(validatedArgs: any): string {
  const encodedSubject = encodeEmailHeader(validatedArgs.subject);
  // Determine content type based on available content and explicit mimeType
  let mimeType = validatedArgs.mimeType || 'text/plain';
  
  // If htmlBody is provided and mimeType isn't explicitly set to text/plain,
  // use multipart/alternative to include both versions
  if (validatedArgs.htmlBody && mimeType !== 'text/plain') {
      mimeType = 'multipart/alternative';
  }

  // Generate a random boundary string for multipart messages
  const boundary = `----=_NextPart_${Math.random().toString(36).substring(2)}`;

  // Validate email addresses
  (validatedArgs.to as string[]).forEach(email => {
      if (!validateEmail(email)) {
          throw new Error(`Recipient email address is invalid: ${email}`);
      }
  });

  // Common email headers
  const emailParts = [
      'From: me',
      `To: ${validatedArgs.to.join(', ')}`,
      validatedArgs.cc ? `Cc: ${validatedArgs.cc.join(', ')}` : '',
      validatedArgs.bcc ? `Bcc: ${validatedArgs.bcc.join(', ')}` : '',
      `Subject: ${encodedSubject}`,
      // Add thread-related headers if specified
      validatedArgs.inReplyTo ? `In-Reply-To: ${validatedArgs.inReplyTo}` : '',
      validatedArgs.inReplyTo ? `References: ${validatedArgs.inReplyTo}` : '',
      'MIME-Version: 1.0',
  ].filter(Boolean);

  // Construct the email based on the content type
  if (mimeType === 'multipart/alternative') {
      // Multipart email with both plain text and HTML
      emailParts.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
      emailParts.push('');
      
      // Plain text part
      emailParts.push(`--${boundary}`);
      emailParts.push('Content-Type: text/plain; charset=UTF-8');
      emailParts.push('Content-Transfer-Encoding: 7bit');
      emailParts.push('');
      emailParts.push(validatedArgs.body);
      emailParts.push('');
      
      // HTML part
      emailParts.push(`--${boundary}`);
      emailParts.push('Content-Type: text/html; charset=UTF-8');
      emailParts.push('Content-Transfer-Encoding: 7bit');
      emailParts.push('');
      emailParts.push(validatedArgs.htmlBody || validatedArgs.body); // Use body as fallback
      emailParts.push('');
      
      // Close the boundary
      emailParts.push(`--${boundary}--`);
  } else if (mimeType === 'text/html') {
      // HTML-only email
      emailParts.push('Content-Type: text/html; charset=UTF-8');
      emailParts.push('Content-Transfer-Encoding: 7bit');
      emailParts.push('');
      emailParts.push(validatedArgs.htmlBody || validatedArgs.body);
  } else {
      // Plain text email (default)
      emailParts.push('Content-Type: text/plain; charset=UTF-8');
      emailParts.push('Content-Transfer-Encoding: 7bit');
      emailParts.push('');
      emailParts.push(validatedArgs.body);
  }

  return emailParts.join('\r\n');
}
