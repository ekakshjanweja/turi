import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class VoiceHints extends StatelessWidget {
  final Animation<double> animation;
  final double opacity;

  const VoiceHints({super.key, required this.animation, this.opacity = 0.6});

  @override
  Widget build(BuildContext context) {
    return Consumer<ChatProvider>(
      builder: (context, cp, _) {
        return AnimatedBuilder(
          animation: animation,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(0, 40 * (1 - animation.value)),
              child: Opacity(
                opacity: (animation.value * opacity).clamp(0.0, 1.0),
                child: GestureDetector(
                  onTap: cp.updateVoiceSuggestion,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 16,
                    ),
                    decoration: BoxDecoration(
                      color: context.colorScheme.surfaceContainer,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: context.colorScheme.outline.withValues(
                          alpha: 0.1,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          SolarBoldIcons.soundwave,
                          size: 24,
                          color: context.colorScheme.primary,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Try saying: "${cp.voiceSuggestion}"',
                          style: context.textTheme.bodySmall,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tap for more ideas',
                          style: context.textTheme.labelSmall,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
