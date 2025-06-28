import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/sse.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/message.dart';

class MessageInput extends StatefulWidget {
  const MessageInput({super.key});

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  void sendMessage() async {
    final cp = context.read<ChatProvider>();

    if (cp.inputController.text.trim().isEmpty) return;

    cp.messages.add(
      Message(content: cp.inputController.text.trim(), isUser: true),
    );
    cp.inputController.clear();

    cp.streamSubscription = await Sse.sendRequest(
      "/agent",
      queryParameters: {
        "audio": "false",
        "clear": cp.newConversation.toString(),
        "message": cp.messages.last.content,
      },
      method: MethodType.get,
      onError: (error) {
        cp.connected = false;
        cp.error = true;
        log("Error in SSE stream: $error", name: "SSE LOGS");
      },
      onChunk: (content) async {
        cp.addMessage(Message(content: content, isUser: false));
        cp.thinking = false;
        log("Received chunk: $content", name: "SSE LOGS");
      },
      onThinking: (content) {
        cp.thinking = true;
        log("Thinking: $content", name: "SSE LOGS");
      },
      onAudio: (base64Audio) {},
      onConnected: () {
        cp.error = false;
        cp.connected = true;
        cp.newConversation = false;
        log("SSE stream connected", name: "SSE LOGS");
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ChatProvider>(
      builder: (context, cp, _) {
        return SafeArea(
          child: Container(
            margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              spacing: 8,
              children: [
                Expanded(
                  child: TextField(
                    controller: cp.inputController,
                    decoration: InputDecoration(
                      hintText: "Type a message...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 16,
                        horizontal: 16,
                      ),
                    ),
                    style: context.textTheme.bodyMedium,
                  ),
                ),
                if (cp.inputController.text.isNotEmpty)
                  IconButton.filled(
                    onPressed: sendMessage,
                    icon: Icon(Icons.send, size: 24),
                    style: ButtonStyle(
                      padding: WidgetStateProperty.all<EdgeInsetsGeometry>(
                        EdgeInsets.all(16),
                      ),
                      shape: WidgetStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
