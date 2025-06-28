import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';

class ErrorBottomSheet extends StatelessWidget {
  final String error;

  const ErrorBottomSheet({super.key, required this.error});

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
          // Header with icon and title
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: context.colors.destructive.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.error_outline_rounded,
                  color: context.colors.destructive,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Connection Error",
                      style: context.textTheme.titleMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      "Something went wrong",
                      style: context.textTheme.bodySmall.copyWith(
                        color: context.colors.mutedForeground,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Error message container
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: context.colors.muted,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: context.colors.border, width: 1),
            ),
            child: Text(
              error,
              style: context.textTheme.bodySmall.copyWith(
                fontFamily: 'monospace',
                color: context.colors.foreground,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.pop(),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: context.colors.border),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    "Dismiss",
                    style: context.textTheme.labelLarge.copyWith(
                      color: context.colors.foreground,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton(
                  onPressed: () {
                    final cp = context.read<ChatProvider>();

                    cp.reset();
                    context.pop();
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: context.colors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    "Retry",
                    style: context.textTheme.labelLarge.copyWith(
                      color: context.colors.primaryForeground,
                    ),
                  ),
                ),
              ),
            ],
          ),

          // Bottom padding for safe area
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}
