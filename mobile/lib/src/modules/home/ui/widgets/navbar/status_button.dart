import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/error_bottomsheet.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat_settings_bottom_sheet.dart';

class StatusButton extends StatelessWidget {
  final bool showDotView;

  const StatusButton({super.key, this.showDotView = true});

  @override
  Widget build(BuildContext context) {
    return Consumer<ChatProvider>(
      builder: (context, cp, _) {
        String buttonText;
        Color backgroundColor;
        Color textColor;
        Color iconColor;

        if (cp.thinking) {
          buttonText = "thinking";
          backgroundColor = Colors.transparent;
          textColor = context.colorScheme.secondary;
          iconColor = context.colorScheme.secondary;
        } else if (cp.error != null) {
          buttonText = "error";
          backgroundColor = context.colorScheme.error;
          textColor = context.colorScheme.error;
          iconColor = context.colorScheme.error;
        } else if (cp.connected) {
          buttonText = "connected";
          backgroundColor = context.colorScheme.primary;
          textColor = context.colorScheme.primary;
          iconColor = context.colorScheme.primary;
        } else {
          buttonText = "disconnected";
          backgroundColor = context.colorScheme.secondary;
          textColor = context.colorScheme.onSurface;
          iconColor = context.colorScheme.onSurface;
        }

        if (showDotView) {
          // Show alternate view with a dot and text
          return GestureDetector(
            onTap: () {
              final errorMessage = cp.error;
              if (errorMessage != null) {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  builder: (context) {
                    return ErrorBottomSheet(error: errorMessage);
                  },
                );
              } else if (cp.connected) {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  builder: (context) {
                    return const ChatSettingsBottomSheet();
                  },
                );
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: iconColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    buttonText,
                    style: context.textTheme.bodySmall.copyWith(
                      color: textColor,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        // Default button view
        return FilledButton(
          style: ButtonStyle(
            backgroundColor: WidgetStateProperty.all(Colors.transparent),
            shape: WidgetStateProperty.all(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
                side: BorderSide(color: backgroundColor, width: 1),
              ),
            ),
          ),
          onPressed: null,
          child: Text(
            buttonText,
            style: context.textTheme.labelMedium.copyWith(color: textColor),
          ),
        );
      },
    );
  }
}
