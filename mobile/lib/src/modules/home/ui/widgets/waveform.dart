import 'dart:math';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/audio/providers/audio_service_provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class Waveform extends StatefulWidget {
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
  ValueNotifier<double> soundLevel = ValueNotifier(0);
  StreamSubscription<double>? _amplitudeSubscription;

  List<double> _amplitudeHistory = [];
  double _currentLevel = 0.0;
  final Random _random = Random();

  @override
  void initState() {
    super.initState();

    // Initialize amplitude history with baseline values
    _amplitudeHistory = List.filled(widget.barCount, 0.0);

    // Listen to amplitude stream from AudioServiceProvider
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (mounted) {
        final asp = context.read<AudioServiceProvider>();
        _amplitudeSubscription = asp.amplitudeStream.listen((amplitude) {
          if (mounted) {
            _updateAmplitudeHistory(amplitude);
          }
        });
      }
    });
  }

  void _updateAmplitudeHistory(double amplitude) {
    if (!mounted) return;

    // Normalize amplitude data to 0-1 range
    final normalizedLevel = ((amplitude + 60) / 60).clamp(0.0, 1.0);

    // Only update amplitude history if there's actual sound
    if (normalizedLevel > 0.05) {
      // Shift existing values to the left
      for (int i = 0; i < _amplitudeHistory.length - 1; i++) {
        _amplitudeHistory[i] = _amplitudeHistory[i + 1];
      }

      // Add new amplitude value with some randomness for realism
      final randomVariation = (_random.nextDouble() - 0.5) * 0.15;
      final newAmplitude = (normalizedLevel + randomVariation).clamp(0.0, 1.0);

      _amplitudeHistory[_amplitudeHistory.length - 1] = newAmplitude;
      _currentLevel = newAmplitude;
    } else {
      // If no sound, gradually decay to minimum
      for (int i = 0; i < _amplitudeHistory.length; i++) {
        _amplitudeHistory[i] = (_amplitudeHistory[i] * 0.85).clamp(0.0, 1.0);
      }
      _currentLevel = normalizedLevel;
    }

    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _amplitudeSubscription?.cancel();
    soundLevel.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Check if we're in silent state
    final isSilent =
        _currentLevel <= 0.05 && _amplitudeHistory.every((amp) => amp <= 0.05);

    return SizedBox(
      height: widget.containerHeight,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(widget.barCount, (index) {
          double amplitude;
          Duration animationDuration;

          if (isSilent) {
            // Silent state: all bars at minimum with no animation
            amplitude = 0.0;
            animationDuration = const Duration(milliseconds: 300);
          } else {
            // Active state: normal amplitude with animation
            amplitude = _amplitudeHistory[index];

            // Add slight center bias (middle bars tend to be slightly taller)
            final centerDistance = (index - (widget.barCount - 1) / 2).abs();
            final centerBias =
                1.0 - (centerDistance / (widget.barCount / 2)) * 0.2;
            amplitude *= centerBias;

            // Add subtle random variation for more natural look
            final variation = (_random.nextDouble() - 0.5) * 0.08;
            amplitude = (amplitude + variation).clamp(0.0, 1.0);

            // Add slight delay between bars for wave effect
            final delay = index * 15;
            animationDuration = Duration(milliseconds: 150 + delay);
          }

          // Calculate height based on amplitude
          final height = widget.minHeight + (amplitude * widget.maxHeight);

          return AnimatedContainer(
            duration: animationDuration,
            curve: isSilent ? Curves.easeOut : Curves.easeOutCubic,
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
  }
}
