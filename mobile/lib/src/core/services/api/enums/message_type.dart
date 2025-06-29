enum MessageType {
  audio,
  aiResponse,
  thinking,
  connected,
  user,
  error,
  done,
  end,
}

extension MessageTypeId on MessageType {
  String get id {
    switch (this) {
      case MessageType.audio:
        return "AUDIO";
      case MessageType.aiResponse:
        return "AI_RESPONSE";
      case MessageType.thinking:
        return "THINKING";
      case MessageType.connected:
        return "CONNECTED";
      case MessageType.user:
        return "USER";
      case MessageType.error:
        return "ERROR";
      case MessageType.done:
        return "DONE";
      case MessageType.end:
        return "END";
    }
  }
}
