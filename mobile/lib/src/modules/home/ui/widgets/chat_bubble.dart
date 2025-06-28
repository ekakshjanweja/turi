import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/message.dart';

class ChatBubble extends StatelessWidget {
  const ChatBubble({super.key, required this.message});

  final Message message;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(bottom: 16),
        constraints: BoxConstraints(maxWidth: context.w * 0.75),
        padding: EdgeInsets.symmetric(vertical: 6, horizontal: 12),
        decoration: BoxDecoration(
          color: message.isUser
              ? context.colorScheme.tertiaryContainer
              : context.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          message.content,
          style: context.textTheme.bodyMedium.copyWith(
            color: message.isUser
                ? context.colorScheme.onTertiaryContainer
                : context.colorScheme.onSurface,
          ),
        ),
      ),
    );
  }
}
