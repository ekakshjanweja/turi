class AudioTimeState {
  DateTime? recordingStartTime;
  DateTime? trimStartTime;
  DateTime? trimEndTime;
  DateTime? lastSpeechTime;
  bool isSpeechDetected;

  AudioTimeState({
    this.recordingStartTime,
    this.trimStartTime,
    this.trimEndTime,
    this.lastSpeechTime,
    this.isSpeechDetected = false,
  });

  AudioTimeState copyWith({
    DateTime? recordingStartTime,
    DateTime? trimStartTime,
    DateTime? trimEndTime,
    DateTime? lastSpeechTime,
    bool? isSpeechDetected,
  }) {
    return AudioTimeState(
      recordingStartTime: recordingStartTime ?? this.recordingStartTime,
      trimStartTime: trimStartTime ?? this.trimStartTime,
      trimEndTime: trimEndTime ?? this.trimEndTime,
      lastSpeechTime: lastSpeechTime ?? this.lastSpeechTime,
      isSpeechDetected: isSpeechDetected ?? this.isSpeechDetected,
    );
  }

  bool get shouldStartTrim =>
      recordingStartTime != null && trimStartTime == null;

  bool get shouldStopTrim =>
      recordingStartTime != null &&
      trimStartTime != null &&
      trimEndTime == null;

  /// Check if we should stop recording due to silence lasting more than specified seconds
  bool shouldStopDueToSilence(int pauseToleranceSeconds) {
    if (recordingStartTime == null) return false;

    // If speech was detected, check silence from last speech time
    if (isSpeechDetected && lastSpeechTime != null) {
      final silenceDuration = DateTime.now().difference(lastSpeechTime!);
      return silenceDuration.inSeconds >= pauseToleranceSeconds;
    } else {
      // No speech detected yet, check silence from recording start
      final silenceFromStart = DateTime.now().difference(recordingStartTime!);
      return silenceFromStart.inSeconds >= pauseToleranceSeconds;
    }
  }
}
