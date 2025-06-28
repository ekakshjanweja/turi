import 'dart:async';

import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/sse.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/message.dart';

class MessageInput extends StatefulWidget {
  final TextEditingController controller;
  final ScrollController scrollController;
  final ValueNotifier<List<Message>> messagesNotifier;
  final ValueNotifier<bool> thinkingNotifier;
  final ValueNotifier<bool> connectedNotifier;
  final ValueNotifier<bool> errorNotifier;
  final ValueNotifier<bool> newConversationNotifier;

  const MessageInput({
    super.key,
    required this.controller,
    required this.scrollController,
    required this.messagesNotifier,
    required this.thinkingNotifier,
    required this.connectedNotifier,
    required this.errorNotifier,
    required this.newConversationNotifier,
  });

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  StreamSubscription? _streamSubscription;

  @override
  void dispose() {
    _streamSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: widget.controller,
      builder: (context, textEditingValue, _) {
        return SafeArea(
          child: Container(
            margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: widget.controller,
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
                if (widget.controller.text.isNotEmpty)
                  IconButton.filled(
                    onPressed: () async {
                      if (widget.controller.text.trim().isEmpty) return;

                      _streamSubscription = await Sse.sendRequest(
                        "/agent",
                        queryParameters: {
                          "audio": "false",
                          "clear": widget.newConversationNotifier.value
                              .toString(),
                          "message": widget.controller.text.trim(),
                        },
                        method: MethodType.get,
                        onError: (error) {
                          widget.connectedNotifier.value = false;
                          widget.errorNotifier.value = true;
                        },
                        onChunk: (content) async {
                          widget.messagesNotifier.value = [
                            ...widget.messagesNotifier.value,
                            Message(content: content, isUser: false),
                          ];
                          await Future.delayed(Duration(milliseconds: 100));
                          widget.thinkingNotifier.value = false;
                          widget.scrollController.animateTo(
                            widget.scrollController.position.maxScrollExtent,
                            duration: Duration(milliseconds: 300),
                            curve: Curves.easeOut,
                          );
                        },
                        onThinking: (content) {
                          widget.thinkingNotifier.value = true;
                        },
                        onAudio: (base64Audio) {},
                        onConnected: () {
                          widget.messagesNotifier.value = [
                            ...widget.messagesNotifier.value,
                            Message(
                              content: widget.controller.text.trim(),
                              isUser: true,
                            ),
                          ];
                          widget.thinkingNotifier.value = true;
                          widget.scrollController.animateTo(
                            widget.scrollController.position.maxScrollExtent,
                            duration: Duration(milliseconds: 300),
                            curve: Curves.easeOut,
                          );
                          widget.errorNotifier.value = false;
                          widget.controller.clear();
                          widget.connectedNotifier.value = true;
                          widget.newConversationNotifier.value = false;
                        },
                      );
                    },
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
