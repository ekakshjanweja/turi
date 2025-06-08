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
export interface GmailMessagePart {
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
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailContent {
  text: string;
  html: string;
}

// Email operation types
export type SendEmail = z.infer<typeof SendEmailSchema>;
export type ReadEmail = z.infer<typeof ReadEmailSchema>;
export type SearchEmails = z.infer<typeof SearchEmailsSchema>;
export type ModifyEmail = z.infer<typeof ModifyEmailSchema>;
export type DeleteEmail = z.infer<typeof DeleteEmailSchema>;

// Label operation types
export type ListEmailLabels = z.infer<typeof ListEmailLabelsSchema>;
export type CreateLabel = z.infer<typeof CreateLabelSchema>;
export type UpdateLabel = z.infer<typeof UpdateLabelSchema>;
export type DeleteLabel = z.infer<typeof DeleteLabelSchema>;
export type GetOrCreateLabel = z.infer<typeof GetOrCreateLabelSchema>;

// Batch operation types
export type BatchModifyEmails = z.infer<typeof BatchModifyEmailsSchema>;
export type BatchDeleteEmails = z.infer<typeof BatchDeleteEmailsSchema>;
