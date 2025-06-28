import type { Agent } from "../../services/agent";
import type { GmailService } from "../../services/gmail";
import type { SSEStreamingApi } from "hono/streaming";

export type AgentSession = {
  id: string;
  agent: Agent;
  gmailService: GmailService;
  sseConnection: SSEStreamingApi;
  audio: boolean;
};

export type MessageType =
  | "AUDIO"
  | "AI_RESPONSE"
  | "THINKING"
  | "CONNECTED"
  | "USER"
  | "ERROR";

export type Message = {
  type: MessageType;
  content: string | object;
  toolName?: string;
  timestamp?: string;
};

export type AUDIO_MESSAGE = Message & {
  type: "AUDIO";
  content: {
    audioData: string; // Base64 encoded audio data
    format: string; // Audio format (e.g., "mp3", "wav")
    mimeType: string; // MIME type (e.g., "audio/mpeg", "audio/wav")
  };
};

export type USER_INPUT_MESSAGE = Message & {
  type: "USER_INPUT";
  content: string;
};

export type AI_RESPONSE_MESSAGE = Message & {
  type: "AI_RESPONSE";
  content: string;
};

export type THINKING_MESSAGE = Message & {
  type: "THINKING";
  content: string;
};

export type CONNECTED_MESSAGE = Message & {
  type: "CONNECTED";
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
