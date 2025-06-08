import type z from "zod";
import type {
  SendEmailSchema,
  ReadEmailSchema,
  SearchEmailsSchema,
  ModifyEmailSchema,
  DeleteEmailSchema,
  ListEmailLabelsSchema,
  CreateLabelSchema,
  UpdateLabelSchema,
  DeleteLabelSchema,
  GetOrCreateLabelSchema,
  BatchModifyEmailsSchema,
  BatchDeleteEmailsSchema,
} from "./schema";

// Gmail API types
export type GmailMessagePart = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: Array<{
    name: string;
    value: string;
  }>;
  body?: {
    attachmentId?: string;
    size?: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
};

export type EmailAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
};

export type EmailContent = {
  text: string;
  html: string;
};

// Email operation types
export type SendEmail = z.infer<typeof SendEmailSchema>;
export type ReadEmail = z.infer<typeof ReadEmailSchema>;
export type SearchEmails = z.infer<typeof SearchEmailsSchema>;
export type ModifyEmail = z.infer<typeof ModifyEmailSchema>;
export type DeleteEmail = z.infer<typeof DeleteEmailSchema>;

// Email send result type
export type EmailSendResult = {
  success: boolean;
  messageId: string;
  action: "sent" | "draft";
  message: string;
};

// Gmail Label types
export type GmailLabel = {
  id: string;
  name: string;
  type?: string;
  messageListVisibility?: string;
  labelListVisibility?: string;
  messagesTotal?: number;
  messagesUnread?: number;
  color?: {
    textColor?: string;
    backgroundColor?: string;
  };
};

export type LabelManagerResult = {
  success: boolean;
  message: string;
  label?: GmailLabel;
  labels?: {
    all: GmailLabel[];
    system: GmailLabel[];
    user: GmailLabel[];
    count: {
      total: number;
      system: number;
      user: number;
    };
  };
};

// Label operation types
export type ListEmailLabels = z.infer<typeof ListEmailLabelsSchema>;
export type CreateLabel = z.infer<typeof CreateLabelSchema>;
export type UpdateLabel = z.infer<typeof UpdateLabelSchema>;
export type DeleteLabel = z.infer<typeof DeleteLabelSchema>;
export type GetOrCreateLabel = z.infer<typeof GetOrCreateLabelSchema>;

// Batch operation types
export type BatchModifyEmails = z.infer<typeof BatchModifyEmailsSchema>;
export type BatchDeleteEmails = z.infer<typeof BatchDeleteEmailsSchema>;
