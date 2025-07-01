import 'dart:async';
import 'dart:developer';
import 'package:flutter/foundation.dart';
import 'package:turi_mail/src/modules/audio/voice_activity_detection/audio_time_state.dart';

/// Voice Activity Detection class that monitors amplitude changes
/// and detects speech start/stop events with silence timeout handling
class VoiceActivityDetection {
  // Voice Activity Detection thresholds
  final double _speechThreshold;
  final double _silenceThreshold;
  final int _initialPauseToleranceSeconds;
  final int _pauseToleranceSeconds;

  Timer? _silenceCheckTimer;
  bool _isStoppingSilence = false;
  bool _isActive = false;

  AudioTimeState _audioTimeState = AudioTimeState();
  AudioTimeState get audioTimeState => _audioTimeState;

  // Callbacks
  final VoidCallback? onSpeechStart;
  final VoidCallback? onSilenceTimeout;
  final Function(DateTime trimStartTime)? onTrimStartDetected;

  VoiceActivityDetection({
    this.onSpeechStart,
    this.onSilenceTimeout,
    this.onTrimStartDetected,
    double speechThreshold = -40.0,
    double silenceThreshold = -50.0,
    int initialPauseToleranceSeconds = 10,
    int pauseToleranceSeconds = 5,
  }) : _speechThreshold = speechThreshold,
       _silenceThreshold = silenceThreshold,
       _pauseToleranceSeconds = pauseToleranceSeconds,
       _initialPauseToleranceSeconds = initialPauseToleranceSeconds;

  /// Start voice activity detection
  void start({DateTime? recordingStartTime}) {
    _isActive = true;
    _isStoppingSilence = false;

    // Reset audio time state for fresh detection
    _audioTimeState = AudioTimeState(
      recordingStartTime: recordingStartTime ?? DateTime.now(),
    );

    // Start silence check timer
    _silenceCheckTimer = Timer.periodic(Duration(milliseconds: 500), (_) {
      _checkSilenceTimeout();
    });
  }

  /// Stop voice activity detection
  void stop() {
    _isActive = false;
    _isStoppingSilence = false;

    _silenceCheckTimer?.cancel();
    _silenceCheckTimer = null;
  }

  /// Process amplitude change from audio input
  void processAmplitude(double amplitude) {
    if (!_isActive) return;

    final now = DateTime.now();

    // Check for invalid amplitude values
    if (amplitude.isInfinite || amplitude.isNaN) {
      return;
    }

    // Check if amplitude indicates speech (above threshold)
    if (amplitude > _speechThreshold) {
      // Speech detected
      _audioTimeState = _audioTimeState.copyWith(
        lastSpeechTime: now,
        isSpeechDetected: true,
      );

      // If this is the first speech detected, mark trim start time
      if (_audioTimeState.shouldStartTrim) {
        _audioTimeState = _audioTimeState.copyWith(trimStartTime: now);
        log(
          'VAD: First speech detected - trim start time set to: $now',
          name: "VOICE_ACTIVITY_DETECTION",
        );

        // Notify callback about trim start
        onTrimStartDetected?.call(now);
        onSpeechStart?.call();
      }
    } else if (amplitude < _silenceThreshold) {
      // True silence detected
    } else {
      // Moderate amplitude - treat as potential speech to avoid stopping too early
      _audioTimeState = _audioTimeState.copyWith(
        lastSpeechTime: now,
        isSpeechDetected: true,
      );

      // If this is the first sound detected, mark trim start time
      if (_audioTimeState.shouldStartTrim) {
        _audioTimeState = _audioTimeState.copyWith(trimStartTime: now);
        log(
          'VAD: First sound (moderate) detected - trim start time set to: $now',
          name: "VOICE_ACTIVITY_DETECTION",
        );

        // Notify callback about trim start
        onTrimStartDetected?.call(now);
        onSpeechStart?.call();
      }
    }
  }

  void _checkSilenceTimeout() {
    // Guard against multiple calls and check if VAD is active
    if (_isStoppingSilence || !_isActive) {
      return;
    }

    final shouldStop = _audioTimeState.shouldStopDueToSilence(
      _audioTimeState.isSpeechDetected
          ? _pauseToleranceSeconds
          : _initialPauseToleranceSeconds,
    );

    if (shouldStop) {
      // Set flag to prevent multiple calls
      _isStoppingSilence = true;

      // Set trim end time
      _audioTimeState = _audioTimeState.copyWith(trimEndTime: DateTime.now());

      // Notify callback about silence timeout
      onSilenceTimeout?.call();
    }
  }

  /// Get the current trim start time
  DateTime? get trimStartTime => _audioTimeState.trimStartTime;

  /// Get the current trim end time
  DateTime? get trimEndTime => _audioTimeState.trimEndTime;

  /// Get the recording start time
  DateTime? get recordingStartTime => _audioTimeState.recordingStartTime;

  /// Check if speech has been detected
  bool get isSpeechDetected => _audioTimeState.isSpeechDetected;

  /// Check if VAD is currently active
  bool get isActive => _isActive;

  /// Get the current speech threshold
  double get speechThreshold => _speechThreshold;

  /// Get the current silence threshold
  double get silenceThreshold => _silenceThreshold;

  /// Get the current pause tolerance in seconds
  int get pauseToleranceSeconds => _pauseToleranceSeconds;

  /// Dispose of resources
  void dispose() {
    stop();
  }
}
