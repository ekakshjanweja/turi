import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/audio/providers/audio_service_provider.dart';
import 'package:turi_mail/src/modules/home/data/enum/chat_status.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/voice_button.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/voice_hints.dart';
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

  @override
  void initState() {
    super.initState();

    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _bounceAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
    );

    // Start entrance animation
    _bounceController.forward();

    // Defer loadSuggestions to avoid setState during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      loadSuggestions();
    });
  }

  void loadSuggestions() {
    final cp = context.read<ChatProvider>();
    cp.updateVoiceSuggestion();
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  Future<void> startSTT() async {
    final cp = context.read<ChatProvider>();
    final asp = context.read<AudioServiceProvider>();

    cp.status = ChatStatus.connected;

    await asp.startRecording();
  }

  Future<void> stopSTT() async {
    final asp = context.read<AudioServiceProvider>();
    await asp.stopRecording();

    final error = await asp.transcribe();

    if (error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AudioServiceProvider>(
      builder: (context, asp, _) {
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
                      onTap: asp.isRecording ? stopSTT : startSTT,
                      isListening: asp.isRecording,
                      size: 120,
                      enablePulse: true,
                    ),
                  );
                },
              ),

              const SizedBox(height: 32),

              // Main heading
              if (!asp.isRecording)
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
                        asp.isRecording
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

              // Helpful hints
              if (!asp.isRecording)
                VoiceHints(animation: _bounceAnimation, opacity: 0.6),
            ],
          ),
        );
      },
    );
  }
}
