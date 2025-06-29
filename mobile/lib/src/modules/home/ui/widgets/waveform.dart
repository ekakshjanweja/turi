import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class Waveform extends StatefulWidget {
  final ValueNotifier<double> soundLevel;
  final int barCount;
  final double barWidth;
  final double spacing;
  final double minHeight;
  final double maxHeight;
  final double containerHeight;
  final Color? color;
  final BorderRadius? borderRadius;
  final Duration animationDuration;

  const Waveform({
    super.key,
    required this.soundLevel,
    this.barCount = 5,
    this.barWidth = 4,
    this.spacing = 3,
    this.minHeight = 8,
    this.maxHeight = 28,
    this.containerHeight = 80,
    this.color,
    this.borderRadius,
    this.animationDuration = const Duration(milliseconds: 100),
  });

  @override
  State<Waveform> createState() => _WaveformState();
}

class _WaveformState extends State<Waveform> with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  double _currentLevel = 0.0;
  double _targetLevel = 0.0;

  @override
  void initState() {
    super.initState();

    // Create continuous animation controller
    _controller = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    );

    // Create smooth interpolation animation
    _animation = Tween<double>(
      begin: 0.0,
      end: 1.15,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.linear));

    // Start the continuous animation
    _controller.repeat();

    // Listen to sound level changes
    widget.soundLevel.addListener(_onSoundLevelChanged);
    _targetLevel = widget.soundLevel.value;
  }

  void _onSoundLevelChanged() {
    _targetLevel = widget.soundLevel.value;
  }

  @override
  void dispose() {
    widget.soundLevel.removeListener(_onSoundLevelChanged);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        // Smooth interpolation between current and target levels
        _currentLevel = _currentLevel + (_targetLevel - _currentLevel) * 0.1;

        // Continuous time component for smooth animation
        final time = _animation.value * 10; // Scale for desired speed

        return SizedBox(
          height: widget.containerHeight,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(widget.barCount, (index) {
              // Create a more natural wave pattern using multiple sine waves
              final normalizedIndex = index / (widget.barCount - 1); // 0 to 1
              final centerOffset = (normalizedIndex - 0.5) * 2; // -1 to 1

              // Multiple frequency components with time-based animation
              final wave1 = math.sin(
                time * 2 + index * 0.8 + _currentLevel * 4,
              );
              final wave2 =
                  math.sin(time * 3.2 + index * 0.5 + _currentLevel * 6) * 0.6;
              final wave3 =
                  math.sin(time * 5.1 + index * 0.3 + _currentLevel * 8) * 0.3;
              final wave4 =
                  math.sin(time * 1.5 + index * 1.2 + _currentLevel * 3) * 0.4;

              // Combine waves and add center bias (middle bars tend to be taller)
              final centerBias = 1 - math.pow(centerOffset.abs(), 1.2) * 0.3;
              final combinedWave = (wave1 + wave2 + wave3 + wave4) * centerBias;

              // Add intensity based on sound level
              final intensity =
                  0.3 + (_currentLevel * 0.7); // Base level + sound influence
              final modulatedWave = combinedWave * intensity;

              // Convert to height with smooth easing
              final normalizedWave = (modulatedWave + 1) / 2; // 0 to 1
              final easedWave = _easeInOutSine(normalizedWave.clamp(0.0, 1.0));
              final height = widget.minHeight + (widget.maxHeight * easedWave);

              return AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOut,
                margin: EdgeInsets.symmetric(horizontal: widget.spacing / 2),
                width: widget.barWidth,
                height: height.clamp(
                  widget.minHeight,
                  widget.minHeight + widget.maxHeight,
                ),
                decoration: BoxDecoration(
                  color: widget.color ?? context.colorScheme.primary,
                  borderRadius: widget.borderRadius ?? BorderRadius.circular(2),
                ),
              );
            }),
          ),
        );
      },
    );
  }

  // Smoother easing function
  double _easeInOutSine(double t) {
    return -(math.cos(math.pi * t) - 1) / 2;
  }
}
