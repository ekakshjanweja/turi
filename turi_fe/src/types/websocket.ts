// Shared types for WebSocket communication between frontend and backend

export type MessageType =
  | "USER_INPUT"
  | "AI_RESPONSE"
  | "TOOL_RESULT"
  | "SYSTEM";

export interface WebSocketMessage {
  type: MessageType;
  content: string | object;
  toolName?: string; // For tool results, specify which tool was used
  timestamp?: string; // ISO string timestamp
}

export interface ToolResult {
  toolName: string;
  result: any;
  success: boolean;
  error?: string;
}

// Specific message types for better type safety
export interface UserInputMessage extends WebSocketMessage {
  type: "USER_INPUT";
  content: string;
}

export interface AIResponseMessage extends WebSocketMessage {
  type: "AI_RESPONSE";
  content: string;
}

export interface ToolResultMessage extends WebSocketMessage {
  type: "TOOL_RESULT";
  content: string | object;
  toolName: string;
}

export interface SystemMessage extends WebSocketMessage {
  type: "SYSTEM";
  content: string;
}

// Frontend-specific message interface (extends WebSocketMessage with frontend-only properties)
export interface Message extends Omit<WebSocketMessage, "timestamp"> {
  id: string;
  timestamp: Date;
}

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

// Gmail Label types
export interface GmailLabel {
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
}

export interface LabelManagerResult {
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
}
