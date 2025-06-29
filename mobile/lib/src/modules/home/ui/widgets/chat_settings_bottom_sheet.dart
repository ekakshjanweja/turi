import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';

class ChatSettingsBottomSheet extends StatelessWidget {
  const ChatSettingsBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: context.w,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: context.colors.card,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
              child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Text(
              'Chat Settings',
              style: context.textTheme.titleMedium.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          const SizedBox(height: 24),

          // New Chat Option
          Consumer<ChatProvider>(
            builder: (context, cp, _) {
              return ListTile(
                leading: Icon(
                  Icons.add_circle_outline,
                  color: context.colors.primary,
                ),
                title: Text('New Chat', style: context.textTheme.bodyLarge),
                subtitle: Text(
                  'Start a fresh conversation',
                  style: context.textTheme.bodySmall.copyWith(
                    color: context.colors.mutedForeground,
                  ),
                ),
                onTap: () {
                  cp.reset();
                  context.pop();
                },
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                            );
            },
          ),
          
          const SizedBox(height: 16),

          // Bottom padding for safe area
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}
