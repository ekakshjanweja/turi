import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat/message.dart';

class ChatBubble extends StatelessWidget {
  const ChatBubble({super.key, required this.message});

  final Message message;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(
          bottom: 4,
          left: message.isUser ? 48 : 0,
          right: message.isUser ? 0 : 48,
        ),
        constraints: BoxConstraints(maxWidth: context.w * 0.6),
        child: Material(
          elevation: 2,
          shadowColor: context.colorScheme.shadow.withAlpha(50),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(message.isUser ? 20 : 4),
            bottomRight: Radius.circular(message.isUser ? 4 : 20),
          ),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              gradient: message.isUser
                  ? LinearGradient(
                      colors: [
                        context.colorScheme.primary,
                        context.colorScheme.primary.withAlpha(230),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
              color: message.isUser
                  ? null
                  : context.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(20),
                topRight: const Radius.circular(20),
                bottomLeft: Radius.circular(message.isUser ? 20 : 4),
                bottomRight: Radius.circular(message.isUser ? 4 : 20),
              ),
              border: message.isUser
                  ? null
                  : Border.all(
                      color: context.colorScheme.outline.withAlpha(50),
                      width: 1,
                    ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  message.content.trim(),
                  style: context.textTheme.bodyMedium.copyWith(
                    color: message.isUser
                        ? context.colorScheme.onPrimary
                        : context.colorScheme.onSurface,
                    height: 1.4,
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color:
                            (message.isUser
                                    ? context.colorScheme.onPrimary
                                    : context.colorScheme.onSurfaceVariant)
                                .withAlpha(100),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _getTimestamp(),
                      style: context.textTheme.labelSmall.copyWith(
                        color:
                            (message.isUser
                                    ? context.colorScheme.onPrimary
                                    : context.colorScheme.onSurfaceVariant)
                                .withAlpha(150),
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _getTimestamp() {
    final now = DateTime.now();
    final hour = now.hour > 12 ? now.hour - 12 : now.hour;
    final hourStr = hour == 0 ? '12' : hour.toString();
    final minute = now.minute.toString().padLeft(2, '0');
    final period = now.hour >= 12 ? 'PM' : 'AM';
    return '$hourStr:$minute $period';
  }
}
