import 'dart:async';
import 'dart:io';
import 'dart:developer';
import 'package:flutter/widgets.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:path/path.dart' as path;
import 'package:turi_mail/src/core/services/api/enums/error_type.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/core/services/audio/audio_repo.dart';
import 'package:turi_mail/src/core/services/audio/voice_activity_detection/audio_time_state.dart';
import 'package:turi_mail/src/core/services/audio/helpers/audio_utils.dart';
import 'package:turi_mail/src/core/services/audio/voice_activity_detection/voice_activity_detection.dart';

class AudioServiceProvider extends ChangeNotifier {
  // Voice Activity Detection instance
  late final VoiceActivityDetection _voiceActivityDetection;

  /// Getter for accessing audio time state from VAD
  AudioTimeState get audioTimeState => _voiceActivityDetection.audioTimeState;

  /// Getter for accessing VAD configuration
  VoiceActivityDetection get voiceActivityDetection => _voiceActivityDetection;

  AudioServiceProvider() {
    AudioUtils.clearRecordingsFolder();
    _initializeVoiceActivityDetection();
  }

  void _initializeVoiceActivityDetection() {
    _voiceActivityDetection = VoiceActivityDetection(
      onSpeechStart: () {
        log('Speech started');
      },
      onSilenceTimeout: () {
        log('Silence timeout');
        stopRecording();
      },
      onTrimStartDetected: (trimStartTime) {
        log('Trim start detected');
        notifyListeners();
      },
      speechThreshold: -40.0,
      silenceThreshold: -50.0,
      initialPauseToleranceSeconds: 10,
      pauseToleranceSeconds: 5,
    );
  }

  final StreamController<String> _transcriptionController =
      StreamController<String>.broadcast();
  Stream<String> get transcription => _transcriptionController.stream;

  // Amplitude stream for sharing amplitude data
  final StreamController<double> _amplitudeController =
      StreamController<double>.broadcast();
  Stream<double> get amplitudeStream => _amplitudeController.stream;

  final AudioRecorder _audioRecorder = AudioRecorder();

  StreamSubscription<Amplitude>? _amplitudeSubscription;
  StreamSubscription<Amplitude>? get amplitudeSubscription =>
      _amplitudeSubscription;
  set amplitudeSubscription(StreamSubscription<Amplitude>? value) {
    _amplitudeSubscription = value;
    notifyListeners();
  }

  bool _isRecording = false;
  bool get isRecording => _isRecording;
  set isRecording(bool value) {
    _isRecording = value;
    notifyListeners();
  }

  File? _audioFile;
  File? get audioFile => _audioFile;
  set audioFile(File? value) {
    _audioFile = value;
    notifyListeners();
  }

  bool _isTranscribing = false;
  bool get isTranscribing => _isTranscribing;
  set isTranscribing(bool value) {
    _isTranscribing = value;
    notifyListeners();
  }

  Future<void> startRecording() async {
    final hasPermission = await _audioRecorder.hasPermission();

    if (!hasPermission) return;

    final dir = await getApplicationDocumentsDirectory();
    final recordingsDir = Directory("${dir.path}/recordings");

    // Ensure the recordings directory exists
    if (!await recordingsDir.exists()) {
      await recordingsDir.create(recursive: true);
    }

    final filePath = path.join(
      "${dir.path}/recordings",
      'audio_recording_${DateTime.now().millisecondsSinceEpoch}.m4a',
    );

    await _audioRecorder.start(
      RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
        numChannels: 1,
      ),
      path: filePath,
    );

    // Set recording state to true
    isRecording = true;

    // Start voice activity detection
    final recordingStartTime = DateTime.now();
    _voiceActivityDetection.start(recordingStartTime: recordingStartTime);

    amplitudeSubscription = _audioRecorder
        .onAmplitudeChanged(Duration(milliseconds: 100))
        .listen((amp) async {
          // Send amplitude to voice activity detection
          _voiceActivityDetection.processAmplitude(amp.current);

          // Also broadcast amplitude to any listeners (like waveform)
          _amplitudeController.add(amp.current);
        });
  }

  Future<void> stopRecording() async {
    if (!_isRecording) {
      return;
    }

    amplitudeSubscription?.cancel();
    amplitudeSubscription = null;

    _voiceActivityDetection.stop();

    final filePath = await _audioRecorder.stop();

    if (filePath != null) {
      audioFile = File(filePath);
    }

    isRecording = false;

    // Only trim if we have all required timestamps
    if (_voiceActivityDetection.recordingStartTime != null &&
        _voiceActivityDetection.trimStartTime != null &&
        _voiceActivityDetection.trimEndTime != null) {
      final trimmed = await AudioUtils.trimAudio(
        file: audioFile!,
        startTime: _voiceActivityDetection.recordingStartTime!,
        trimStartTime: _voiceActivityDetection.trimStartTime!,
        trimEndTime: _voiceActivityDetection.trimEndTime!,
      );

      if (trimmed != null) {
        audioFile = trimmed;
        log("Audio trimmed successfully: ${audioFile!.path}");
      }
    }
  }

  Future<Failure?> transcribe() async {
    if (isTranscribing) {
      return Failure(
        errorType: ErrorType.unKnownError,
        message: "Already transcribing",
      );
    }

    isTranscribing = true;

    if (audioFile != null) {
      final (result, error) = await AudioRepo.uploadAudioFile(audioFile!);

      if (error != null) {
        isTranscribing = false;
        return error;
      }

      if (result == null) {
        isTranscribing = false;
        return Failure(
          errorType: ErrorType.unKnownError,
          message: "No transcription result",
        );
      }

      _transcriptionController.add(result.transcription);
      isTranscribing = false;

      reset();

      return null;
    }

    return Failure(
      errorType: ErrorType.unKnownError,
      message: "No audio file found",
    );
  }

  void reset() {
    _audioFile = null;
    amplitudeSubscription?.cancel();
    notifyListeners();
  }

  @override
  void dispose() {
    _voiceActivityDetection.dispose();
    amplitudeSubscription?.cancel();
    _audioRecorder.dispose();
    _audioFile = null;
    _transcriptionController.close();
    _amplitudeController.close();
    super.dispose();
  }
}
