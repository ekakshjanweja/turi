// Shared types for WebSocket communication between frontend and backend

export type MessageType =
  | "USER_INPUT"
  | "AI_RESPONSE"
  | "TOOL_RESULT"
  | "SYSTEM";

export type WebSocketMessage = {
  type: MessageType;
  content: string | object;
  toolName?: string; // For tool results, specify which tool was used
  timestamp?: string; // ISO string timestamp
};

export type ToolResult = {
  toolName: string;
  result: any;
  success: boolean;
  error?: string;
};

// Specific message types for better type safety
export type UserInputMessage = WebSocketMessage & {
  type: "USER_INPUT";
  content: string;
};

export type AIResponseMessage = WebSocketMessage & {
  type: "AI_RESPONSE";
  content: string;
};

export type ToolResultMessage = WebSocketMessage & {
  type: "TOOL_RESULT";
  content: string | object;
  toolName: string;
};

export type SystemMessage = WebSocketMessage & {
  type: "SYSTEM";
  content: string;
};

// Email-specific types
export interface EmailSummary {
  id: string;
  subject: string;
  from: string;
  date: string;
}

export interface EmailDetail {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  textContent?: string;
  htmlContent?: string;
  attachments: Array<{
    id: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

export interface EmailSearchResult {
  emails: EmailSummary[];
  query: string;
  totalCount: number;
}

export interface EmailReadResult {
  email: EmailDetail;
  messageId: string;
}
