import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/audio/providers/audio_service_provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/transcription_row/accept_button.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/transcription_row/cancel_button.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/waveform.dart';
import 'dart:async';

class TranscriptionRow extends StatefulWidget {
  const TranscriptionRow({super.key});

  @override
  State<TranscriptionRow> createState() => _TranscriptionRowState();
}

class _TranscriptionRowState extends State<TranscriptionRow> {
  ValueNotifier<double> soundLevelNotifier = ValueNotifier(0);
  StreamSubscription<double>? _amplitudeSubscription;
  Timer? _updateTimer;
  double _currentAmplitude = 0.0;
  bool _hasNewAmplitudeData = false;

  @override
  void initState() {
    super.initState();

    // Set up throttled updates for sound level
    _updateTimer = Timer.periodic(
      const Duration(milliseconds: 50), // 20fps updates
      (_) {
        if (_hasNewAmplitudeData && mounted) {
          soundLevelNotifier.value = _currentAmplitude;
          _hasNewAmplitudeData = false;
        }
      },
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      setupAmplitudeListener();
    });
  }

  Future<void> setupAmplitudeListener() async {
    if (!mounted) return;

    try {
      final asp = context.read<AudioServiceProvider>();

      // Listen to the amplitude stream with throttling
      _amplitudeSubscription = asp.amplitudeStream.listen(
        (amplitude) {
          if (mounted) {
            // Normalize amplitude data to 0-1 range for better waveform representation
            final normalizedLevel = ((amplitude + 60) / 60).clamp(0.0, 1.0);
            _currentAmplitude = normalizedLevel;
            _hasNewAmplitudeData = true;
          }
        },
        onError: (error) {
          debugPrint('TranscriptionRow amplitude stream error: $error');
        },
      );
    } catch (e) {
      debugPrint('Error setting up amplitude listener in TranscriptionRow: $e');
    }
  }

  @override
  void dispose() {
    _amplitudeSubscription?.cancel();
    _updateTimer?.cancel();
    soundLevelNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AudioServiceProvider>(
      builder: (context, asp, _) {
        final shouldShow = asp.isRecording || asp.audioFile != null;

        if (!shouldShow) return const SizedBox.shrink();

        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: context.colorScheme.surfaceContainerLowest.withValues(
              alpha: 0.8,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: context.colorScheme.outlineVariant.withValues(alpha: 0.3),
              width: 0.5,
            ),
          ),
          child: Row(
            children: [
              // Cancel/Clear button (left)
              CancelButton(),

              // Waveform (middle)
              Expanded(
                child: Waveform(
                  animationDuration: const Duration(milliseconds: 200),

                  barCount: 12,
                  barWidth: 3,
                  spacing: 4,
                  minHeight: 4,
                  maxHeight: 24,
                  containerHeight: 28,
                  color: context.colorScheme.primary.withValues(alpha: 0.8),
                ),
              ),

              // Accept/Transcribe button (right)
              AcceptButton(),
            ],
          ),
        );
      },
    );
  }
}
