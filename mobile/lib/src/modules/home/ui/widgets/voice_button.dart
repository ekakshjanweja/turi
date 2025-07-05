import 'package:flutter/material.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class VoiceButton extends StatefulWidget {
  final VoidCallback onTap;
  final bool isListening;
  final double size;
  final bool enablePulse;

  const VoiceButton({
    super.key,
    required this.onTap,
    this.isListening = false,
    this.size = 120,
    this.enablePulse = true,
  });

  @override
  State<VoiceButton> createState() => _VoiceButtonState();
}

class _VoiceButtonState extends State<VoiceButton>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _scaleController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeInOut),
    );

    if (widget.enablePulse) {
      _pulseController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(VoiceButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.enablePulse && !oldWidget.enablePulse) {
      _pulseController.repeat(reverse: true);
    } else if (!widget.enablePulse && oldWidget.enablePulse) {
      _pulseController.stop();
      _pulseController.reset();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _scaleController.forward(),
      onTapUp: (_) => _scaleController.reverse(),
      onTapCancel: () => _scaleController.reverse(),
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Outer pulse ring
                if (widget.enablePulse)
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _pulseAnimation.value,
                        child: Container(
                          width: widget.size + 20,
                          height: widget.size + 20,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: context.colorScheme.primary.withValues(
                                alpha: 0.3,
                              ),
                              width: 2,
                            ),
                          ),
                        ),
                      );
                    },
                  ),

                // Main voice button
                Container(
                  width: widget.size,
                  height: widget.size,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        context.colorScheme.primary,
                        context.colorScheme.primary.withValues(alpha: 0.8),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: context.colorScheme.primary.withValues(
                          alpha: 0.4,
                        ),
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
                        size: widget.size * 0.4,
                        color: context.colorScheme.onPrimary,
                      ),
                      // Recording indicator
                      if (widget.isListening)
                        Positioned(
                          top: widget.size * 0.15,
                          right: widget.size * 0.15,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: context.colorScheme.error,
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
    );
  }
}
