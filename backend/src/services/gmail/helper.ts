import { account as accountSchema } from "../../lib/db/schema/auth";
import { db } from "../../lib/db";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";
import type { EmailContent, GmailMessagePart, GmailLabel } from "./types";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../../lib/config";

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
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
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

export function extractEmailContent(
  messagePart: GmailMessagePart
): EmailContent {
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
  return `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=`;
}

export function createEmailMessage(validatedArgs: any): string {
  const encodedSubject = encodeEmailHeader(validatedArgs.subject);
  // Determine content type based on available content and explicit mimeType
  let mimeType = validatedArgs.mimeType || "text/plain";

  // If htmlBody is provided and mimeType isn't explicitly set to text/plain,
  // use multipart/alternative to include both versions
  if (validatedArgs.htmlBody && mimeType !== "text/plain") {
    mimeType = "multipart/alternative";
  }

  // Generate a random boundary string for multipart messages
  const boundary = `----=_NextPart_${Math.random().toString(36).substring(2)}`;

  // Validate email addresses
  (validatedArgs.to as string[]).forEach((email) => {
    if (!validateEmail(email)) {
      throw new Error(`Recipient email address is invalid: ${email}`);
    }
  });

  // Common email headers
  const emailParts = [
    "From: me",
    `To: ${validatedArgs.to.join(", ")}`,
    validatedArgs.cc ? `Cc: ${validatedArgs.cc.join(", ")}` : "",
    validatedArgs.bcc ? `Bcc: ${validatedArgs.bcc.join(", ")}` : "",
    `Subject: ${encodedSubject}`,
    // Add thread-related headers if specified
    validatedArgs.inReplyTo ? `In-Reply-To: ${validatedArgs.inReplyTo}` : "",
    validatedArgs.inReplyTo ? `References: ${validatedArgs.inReplyTo}` : "",
    "MIME-Version: 1.0",
  ].filter(Boolean);

  // Construct the email based on the content type
  if (mimeType === "multipart/alternative") {
    // Multipart email with both plain text and HTML
    emailParts.push(
      `Content-Type: multipart/alternative; boundary="${boundary}"`
    );
    emailParts.push("");

    // Plain text part
    emailParts.push(`--${boundary}`);
    emailParts.push("Content-Type: text/plain; charset=UTF-8");
    emailParts.push("Content-Transfer-Encoding: 7bit");
    emailParts.push("");
    emailParts.push(validatedArgs.body);
    emailParts.push("");

    // HTML part
    emailParts.push(`--${boundary}`);
    emailParts.push("Content-Type: text/html; charset=UTF-8");
    emailParts.push("Content-Transfer-Encoding: 7bit");
    emailParts.push("");
    emailParts.push(validatedArgs.htmlBody || validatedArgs.body); // Use body as fallback
    emailParts.push("");

    // Close the boundary
    emailParts.push(`--${boundary}--`);
  } else if (mimeType === "text/html") {
    // HTML-only email
    emailParts.push("Content-Type: text/html; charset=UTF-8");
    emailParts.push("Content-Transfer-Encoding: 7bit");
    emailParts.push("");
    emailParts.push(validatedArgs.htmlBody || validatedArgs.body);
  } else {
    // Plain text email (default)
    emailParts.push("Content-Type: text/plain; charset=UTF-8");
    emailParts.push("Content-Transfer-Encoding: 7bit");
    emailParts.push("");
    emailParts.push(validatedArgs.body);
  }

  return emailParts.join("\r\n");
}

/**
 * Creates a new Gmail label
 * @param gmail - Gmail API instance
 * @param labelName - Name of the label to create
 * @param options - Optional settings for the label
 * @returns The newly created label
 */
export async function createLabel(
  gmail: any,
  labelName: string,
  options: {
    messageListVisibility?: string;
    labelListVisibility?: string;
  } = {}
): Promise<GmailLabel> {
  try {
    // Default visibility settings if not provided
    const messageListVisibility = options.messageListVisibility || "show";
    const labelListVisibility = options.labelListVisibility || "labelShow";

    const response = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: labelName,
        messageListVisibility,
        labelListVisibility,
      },
    });

    return response.data;
  } catch (error: any) {
    // Handle duplicate labels more gracefully
    if (error.message && error.message.includes("already exists")) {
      throw new Error(
        `Label "${labelName}" already exists. Please use a different name.`
      );
    }

    throw new Error(`Failed to create label: ${error.message}`);
  }
}

/**
 * Updates an existing Gmail label
 * @param gmail - Gmail API instance
 * @param labelId - ID of the label to update
 * @param updates - Properties to update
 * @returns The updated label
 */
export async function updateLabel(
  gmail: any,
  labelId: string,
  updates: {
    name?: string;
    messageListVisibility?: string;
    labelListVisibility?: string;
  }
): Promise<GmailLabel> {
  try {
    // Verify the label exists before updating
    await gmail.users.labels.get({
      userId: "me",
      id: labelId,
    });

    const response = await gmail.users.labels.update({
      userId: "me",
      id: labelId,
      requestBody: updates,
    });

    return response.data;
  } catch (error: any) {
    if (error.code === 404) {
      throw new Error(`Label with ID "${labelId}" not found.`);
    }

    throw new Error(`Failed to update label: ${error.message}`);
  }
}

/**
 * Deletes a Gmail label
 * @param gmail - Gmail API instance
 * @param labelId - ID of the label to delete
 * @returns Success message
 */
export async function deleteLabel(
  gmail: any,
  labelId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure we're not trying to delete system labels
    const label = await gmail.users.labels.get({
      userId: "me",
      id: labelId,
    });

    if (label.data.type === "system") {
      throw new Error(`Cannot delete system label with ID "${labelId}".`);
    }

    await gmail.users.labels.delete({
      userId: "me",
      id: labelId,
    });

    return {
      success: true,
      message: `Label "${label.data.name}" deleted successfully.`,
    };
  } catch (error: any) {
    if (error.code === 404) {
      throw new Error(`Label with ID "${labelId}" not found.`);
    }

    throw new Error(`Failed to delete label: ${error.message}`);
  }
}

/**
 * Gets a detailed list of all Gmail labels
 * @param gmail - Gmail API instance
 * @returns Object containing system and user labels
 */
export async function listLabels(gmail: any) {
  try {
    const response = await gmail.users.labels.list({
      userId: "me",
    });

    const labels = response.data.labels || [];

    // Group labels by type for better organization
    const systemLabels = labels.filter(
      (label: GmailLabel) => label.type === "system"
    );
    const userLabels = labels.filter(
      (label: GmailLabel) => label.type === "user"
    );

    return {
      all: labels,
      system: systemLabels,
      user: userLabels,
      count: {
        total: labels.length,
        system: systemLabels.length,
        user: userLabels.length,
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to list labels: ${error.message}`);
  }
}

/**
 * Finds a label by name
 * @param gmail - Gmail API instance
 * @param labelName - Name of the label to find
 * @returns The found label or null if not found
 */
export async function findLabelByName(
  gmail: any,
  labelName: string
): Promise<GmailLabel | null> {
  try {
    const labelsResponse = await listLabels(gmail);
    const allLabels = labelsResponse.all;

    // Case-insensitive match
    const foundLabel = allLabels.find(
      (label: GmailLabel) =>
        label.name.toLowerCase() === labelName.toLowerCase()
    );

    return foundLabel || null;
  } catch (error: any) {
    throw new Error(`Failed to find label: ${error.message}`);
  }
}

/**
 * Creates label if it doesn't exist or returns existing label
 * @param gmail - Gmail API instance
 * @param labelName - Name of the label to create
 * @param options - Optional settings for the label
 * @returns The new or existing label
 */
export async function getOrCreateLabel(
  gmail: any,
  labelName: string,
  options: {
    messageListVisibility?: string;
    labelListVisibility?: string;
  } = {}
): Promise<GmailLabel> {
  try {
    // First try to find an existing label
    const existingLabel = await findLabelByName(gmail, labelName);

    if (existingLabel) {
      return existingLabel;
    }

    // If not found, create a new one
    return await createLabel(gmail, labelName, options);
  } catch (error: any) {
    throw new Error(`Failed to get or create label: ${error.message}`);
  }
}

export function buildSearchQueryFromReference(emailReference: string): string {
  // Convert natural language references to Gmail search queries
  const ref = emailReference.toLowerCase();

  // Extract sender information
  if (ref.includes("from ") || ref.includes("email from")) {
    const fromMatch = ref.match(/(?:email )?from ([^,\s]+(?:\s+[^,\s]+)*)/);
    if (fromMatch && fromMatch[1]) {
      const sender = fromMatch[1].trim();
      return `from:${sender}`;
    }
  }

  // Extract subject information
  if (ref.includes("subject") || ref.includes("about")) {
    const subjectMatch = ref.match(/(?:subject|about)\s+(.+)/);
    if (subjectMatch && subjectMatch[1]) {
      const subject = subjectMatch[1].trim();
      return `subject:"${subject}"`;
    }
  }

  // Handle positional references with recent context
  if (
    ref.includes("first") ||
    ref.includes("latest") ||
    ref.includes("most recent")
  ) {
    return "in:inbox"; // Most recent emails
  }

  if (ref.includes("last")) {
    return "in:inbox"; // Recent emails
  }

  // Handle company/domain references
  if (ref.includes("via ") || ref.includes("through ")) {
    const viaMatch = ref.match(/via\s+([^,\s]+(?:\s+[^,\s]+)*)/);
    if (viaMatch && viaMatch[1]) {
      const company = viaMatch[1].trim();
      return `"${company}"`;
    }
  }

  // Default: search for the reference text as a general query
  return `"${emailReference}"`;
}
