export type MessageType =
  | "AUDIO"
  | "AI_RESPONSE"
  | "THINKING"
  | "CONNECTED"
  | "USER";

export type Message = {
  type: MessageType;
  content: string | object;
  toolName?: string;
  timestamp?: string;
  id?: string;
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

export type AudioContent = {
  audioData: string; // Base64 encoded audio data
  format: string; // Audio format (e.g., "mp3", "wav")
  mimeType: string; // MIME type (e.g., "audio/mpeg", "audio/wav")
};
