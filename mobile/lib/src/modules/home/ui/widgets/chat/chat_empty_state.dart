import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/core/services/voice/stt_provider.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class ChatEmptyState extends StatefulWidget {
  const ChatEmptyState({super.key});

  @override
  State<ChatEmptyState> createState() => _ChatEmptyStateState();
}

class _ChatEmptyStateState extends State<ChatEmptyState>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _scaleController;
  late AnimationController _bounceController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _bounceAnimation;

  Timer? _suggestionTimer;
  String _currentSuggestion = '';

  // List of voice prompt suggestions
  static const List<String> voiceSuggestions = [
    "Help me with my emails",
    "Read my latest messages",
    "What emails do I have from work?",
    "Show me important emails",
    "Check for unread messages",
    "Find emails from yesterday",
    "Schedule a meeting",
    "Draft an email to my team",
    "Search for emails about the project",
    "What's in my inbox?",
    "Show me emails from this week",
    "Find my recent conversations",
    "Help me organize my emails",
    "What meetings do I have today?",
    "Send a quick reply",
  ];

  void _updateSuggestion() {
    setState(() {
      final random = Random();
      String newSuggestion;
      do {
        newSuggestion =
            voiceSuggestions[random.nextInt(voiceSuggestions.length)];
      } while (newSuggestion == _currentSuggestion &&
          voiceSuggestions.length > 1);
      _currentSuggestion = newSuggestion;
    });
  }

  @override
  void initState() {
    super.initState();

    // Initialize suggestion
    _updateSuggestion();

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );

    _bounceController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeInOut),
    );

    _bounceAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
    );

    // Start animations
    _pulseController.repeat(reverse: true);
    _bounceController.forward();

    // Start suggestion rotation timer
    _suggestionTimer = Timer.periodic(
      const Duration(seconds: 4),
      (_) => _updateSuggestion(),
    );
  }

  @override
  void dispose() {
    _suggestionTimer?.cancel();
    _pulseController.dispose();
    _scaleController.dispose();
    _bounceController.dispose();
    super.dispose();
  }

  Future<void> startSTT() async {
    final cp = context.read<ChatProvider>();
    final stt = context.read<STTProvider>();

    stt.isListening = true;

    await stt.startListening(
      onResult: (result) {
        cp.inputController.text = result.recognizedWords;
        stt.isListening = false;

        if (result.finalResult) {
          cp.sendMessage(
            onDone: () {
              startSTT();
            },
            onEnd: () {
              stt.stopListening();
            },
          );
        }
      },
      onError: (error) {},
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<STTProvider>(
      builder: (context, stt, child) {
        return GestureDetector(
          onTapDown: (_) => _scaleController.forward(),
          onTapUp: (_) => _scaleController.reverse(),
          onTapCancel: () => _scaleController.reverse(),
          onTap: () {
            if (stt.isListening) {
              stt.stopListening();
            } else {
              startSTT();
            }
          },
          child: AnimatedBuilder(
            animation: _scaleAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _scaleAnimation.value,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Voice interaction circle
                      AnimatedBuilder(
                        animation: _bounceAnimation,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: _bounceAnimation.value,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                // Outer pulse ring
                                AnimatedBuilder(
                                  animation: _pulseAnimation,
                                  builder: (context, child) {
                                    return Transform.scale(
                                      scale: _pulseAnimation.value,
                                      child: Container(
                                        width: 140,
                                        height: 140,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          border: Border.all(
                                            color: context.colorScheme.primary
                                                .withValues(alpha: 0.3),
                                            width: 2,
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),

                                // Main voice button
                                Container(
                                  width: 120,
                                  height: 120,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: LinearGradient(
                                      colors: [
                                        context.colorScheme.primary,
                                        context.colorScheme.primary.withValues(
                                          alpha: 0.8,
                                        ),
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: context.colorScheme.primary
                                            .withValues(alpha: 0.4),
                                        blurRadius: 20,
                                        spreadRadius: 0,
                                        offset: const Offset(0, 8),
                                      ),
                                    ],
                                  ),
                                  child: Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      Icon(
                                        SolarBoldIcons.microphone,
                                        size: 48,
                                        color: context.colorScheme.onPrimary,
                                      ),
                                      // Recording indicator
                                      if (stt.isListening)
                                        Positioned(
                                          top: 20,
                                          right: 20,
                                          child: Container(
                                            width: 12,
                                            height: 12,
                                            decoration: const BoxDecoration(
                                              color: Colors.red,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 32),

                      // Main heading
                      AnimatedBuilder(
                        animation: _bounceAnimation,
                        builder: (context, child) {
                          return Transform.translate(
                            offset: Offset(
                              0,
                              20 * (1 - _bounceAnimation.value),
                            ),
                            child: Opacity(
                              opacity: _bounceAnimation.value.clamp(0.0, 1.0),
                              child: Text(
                                stt.isListening
                                    ? 'Listening...'
                                    : 'Hey there! 👋',
                                style: context.textTheme.headlineMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: context.colorScheme.onSurface,
                                    ),
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
                            offset: Offset(
                              0,
                              30 * (1 - _bounceAnimation.value),
                            ),
                            child: Opacity(
                              opacity: (_bounceAnimation.value * 0.8).clamp(
                                0.0,
                                1.0,
                              ),
                              child: Text(
                                stt.isListening
                                    ? 'I\'m all ears! Say something or tap to stop.'
                                    : 'Tap the microphone to start\na voice conversation',
                                style: context.textTheme.bodyLarge?.copyWith(
                                  color: context.colorScheme.onSurfaceVariant,
                                  height: 1.4,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 24),

                      // Voice waves when listening
                      if (stt.isListening)
                        AnimatedBuilder(
                          animation: _pulseController,
                          builder: (context, child) {
                            return Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(5, (index) {
                                final delay = index * 0.1;
                                final animationValue =
                                    (_pulseController.value + delay) % 1.0;
                                final height = 8 + (24 * animationValue);

                                return Container(
                                  margin: const EdgeInsets.symmetric(
                                    horizontal: 3,
                                  ),
                                  width: 4,
                                  height: height,
                                  decoration: BoxDecoration(
                                    color: context.colorScheme.primary,
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                );
                              }),
                            );
                          },
                        ),

                      const SizedBox(height: 40),

                      // Helpful hints
                      if (!stt.isListening)
                        AnimatedBuilder(
                          animation: _bounceAnimation,
                          builder: (context, child) {
                            return Transform.translate(
                              offset: Offset(
                                0,
                                40 * (1 - _bounceAnimation.value),
                              ),
                              child: Opacity(
                                opacity: (_bounceAnimation.value * 0.6).clamp(
                                  0.0,
                                  1.0,
                                ),
                                child: GestureDetector(
                                  onTap: _updateSuggestion,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 24,
                                      vertical: 16,
                                    ),
                                    decoration: BoxDecoration(
                                      color:
                                          context.colorScheme.surfaceContainer,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: context.colorScheme.outline
                                            .withValues(alpha: 0.1),
                                      ),
                                    ),
                                    child: Column(
                                      children: [
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              SolarBoldIcons.soundwave,
                                              size: 20,
                                              color:
                                                  context.colorScheme.primary,
                                            ),
                                            const SizedBox(width: 8),
                                            Icon(
                                              Icons.refresh,
                                              size: 16,
                                              color: context
                                                  .colorScheme
                                                  .onSurfaceVariant,
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          'Try saying: "$_currentSuggestion"',
                                          style: context.textTheme.bodySmall,
                                          textAlign: TextAlign.center,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Tap for more ideas',
                                          style: context.textTheme.bodySmall
                                              ?.copyWith(
                                                color: context
                                                    .colorScheme
                                                    .onSurfaceVariant,
                                                fontSize: 11,
                                              ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}
