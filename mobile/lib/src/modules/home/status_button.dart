import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/core/utils/value_listenable_builder_3.dart';

class StatusButton extends StatelessWidget {
  final ValueNotifier<bool> thinkingNotifier;
  final ValueNotifier<bool> connectedNotifier;
  final ValueNotifier<bool> errorNotifier;

  const StatusButton({
    super.key,
    required this.thinkingNotifier,
    required this.connectedNotifier,
    required this.errorNotifier,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder3(
      first: connectedNotifier,
      second: errorNotifier,
      third: thinkingNotifier,
      builder: (context, connected, error, thinking, _) {
        String buttonText;
        Color backgroundColor;
        Color textColor;

        if (thinking) {
          buttonText = "Thinking...";
          backgroundColor = Colors.transparent;
          textColor = context.colorScheme.onSurface;
        } else if (error) {
          buttonText = "Oops! An error occurred";
          backgroundColor = context.colorScheme.error;
          textColor = context.colorScheme.onError;
        } else if (connected) {
          buttonText = "Connected";
          backgroundColor = context.colorScheme.primary;
          textColor = context.colorScheme.onSurface;
        } else {
          buttonText = "Disconnected";
          backgroundColor = context.colorScheme.secondary;
          textColor = context.colorScheme.onSurface;
        }

        return FilledButton(
          style: ButtonStyle(
            backgroundColor: WidgetStateProperty.all(Colors.transparent),
            shape: WidgetStateProperty.all(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(color: backgroundColor, width: 1.5),
              ),
            ),
            padding: WidgetStateProperty.all(
              EdgeInsets.symmetric(vertical: 0, horizontal: 4),
            ),
          ),

          onPressed: null,
          child: Text(
            buttonText,
            style: context.textTheme.labelSmall.copyWith(color: textColor),
          ),
        );
      },
    );
  }
}
