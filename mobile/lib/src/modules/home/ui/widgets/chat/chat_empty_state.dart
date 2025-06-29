import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/voice/stt_provider.dart';
import 'package:turi_mail/src/modules/home/data/enum/chat_status.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/voice_button.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/voice_hints.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/waveform.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class ChatEmptyState extends StatefulWidget {
  const ChatEmptyState({super.key});

  @override
  State<ChatEmptyState> createState() => _ChatEmptyStateState();
}

class _ChatEmptyStateState extends State<ChatEmptyState>
    with TickerProviderStateMixin {
  late AnimationController _bounceController;
  late Animation<double> _bounceAnimation;
  ValueNotifier<double> soundLevel = ValueNotifier(0.0);

  @override
  void initState() {
    super.initState();

    // Defer loadSuggestions to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      loadSuggestions();
    });

    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _bounceAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
    );

    // Start entrance animation
    _bounceController.forward();
  }

  void loadSuggestions() {
    final cp = context.read<ChatProvider>();
    cp.updateVoiceSuggestion();
  }

  @override
  void dispose() {
    _bounceController.dispose();
    soundLevel.dispose();
    super.dispose();
  }

  Future<void> startSTT() async {
    final cp = context.read<ChatProvider>();
    final stt = context.read<STTProvider>();

    stt.isListening = true;
    cp.status = ChatStatus.connected;

    await stt.startListening(
      onSoundLevelChange: (level) {
        soundLevel.value = level;
      },
      onResult: (result) {
        cp.inputController.text = result.recognizedWords;

        if (result.finalResult) {
          cp.sendMessage(
            onDone: () {
              startSTT();
            },
            onEnd: () {
              stt.stopListening();
            },
          );

          stt.isListening = false;
        }
      },
      onError: (error) {},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<STTProvider>(
      builder: (context, stt, _) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Voice Button
              AnimatedBuilder(
                animation: _bounceAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _bounceAnimation.value,
                    child: VoiceButton(
                      onTap: () {
                        if (stt.isListening) {
                          stt.stopListening();
                        } else {
                          startSTT();
                        }
                      },
                      isListening: stt.isListening,
                      soundLevel: soundLevel,
                      size: 120,
                      enablePulse: true,
                    ),
                  );
                },
              ),

              const SizedBox(height: 32),

              // Main heading
              if (!stt.isListening)
                AnimatedBuilder(
                  animation: _bounceAnimation,
                  builder: (context, child) {
                    return Transform.translate(
                      offset: Offset(0, 20 * (1 - _bounceAnimation.value)),
                      child: Opacity(
                        opacity: _bounceAnimation.value.clamp(0.0, 1.0),
                        child: Text(
                          'Hey there! 👋',
                          style: context.textTheme.headlineMedium,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    );
                  },
                ),

              const SizedBox(height: 16),

              // Subtitle
              AnimatedBuilder(
                animation: _bounceAnimation,
                builder: (context, child) {
                  return Transform.translate(
                    offset: Offset(0, 30 * (1 - _bounceAnimation.value)),
                    child: Opacity(
                      opacity: (_bounceAnimation.value * 0.8).clamp(0.0, 1.0),
                      child: Text(
                        stt.isListening
                            ? 'I\'m all ears! Say something or tap to stop.'
                            : 'Tap the microphone to start\na voice conversation',
                        style: context.textTheme.bodyLarge,
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 24),

              // Voice waves when listening
              if (stt.isListening)
                Waveform(
                  soundLevel: soundLevel,
                  barCount: 5,
                  barWidth: 4,
                  spacing: 6,
                  minHeight: 8,
                  maxHeight: 20,
                  containerHeight: 64,
                ),

              const SizedBox(height: 40),

              // Helpful hints
              if (!stt.isListening)
                VoiceHints(animation: _bounceAnimation, opacity: 0.6),
            ],
          ),
        );
      },
    );
  }
}
