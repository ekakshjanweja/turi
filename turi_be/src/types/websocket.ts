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

// Email-specific types
export interface EmailSummary {
  id: string;
  subject: string;
  from: string;
  date: string;
}

export interface EmailSearchResult {
  emails: EmailSummary[];
  query: string;
  totalCount: number;
}
