import 'dart:async';
import 'dart:io';
import 'dart:developer';
import 'package:flutter/widgets.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:path/path.dart' as path;
import 'package:turi_mail/src/core/services/api/enums/error_type.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/core/services/voice/audio_service.dart';
import 'package:turi_mail/src/modules/audio/voice_activity_detection/audio_time_state.dart';
import 'package:turi_mail/src/modules/audio/utils.dart';
import 'package:turi_mail/src/modules/audio/voice_activity_detection/voice_activity_detection.dart';

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

  final AudioRecorder _audioRecorder = AudioRecorder();
  final AudioPlayer _audioPlayer = AudioPlayer();

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

  bool _isPlaying = false;
  bool get isPlaying => _isPlaying;
  set isPlaying(bool value) {
    _isPlaying = value;
    notifyListeners();
  }

  File? _audioFile;
  File? get audioFile => _audioFile;
  set audioFile(File? value) {
    _audioFile = value;
    notifyListeners();
  }

  String? _transcription;
  String? get transcription => _transcription;
  set transcription(String? value) {
    _transcription = value;
    notifyListeners();
  }

  Timer? _recordingTimer;
  final int _maxRecordingDuration = 60 * 3;

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

    _recordingTimer = Timer(Duration(seconds: _maxRecordingDuration), () {
      stopRecording();
    });

    await _audioRecorder.start(
      RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
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
          _voiceActivityDetection.processAmplitude(amp.current);
        });
  }

  Future<void> stopRecording() async {
    if (!_isRecording) {
      return;
    }

    amplitudeSubscription?.cancel();
    amplitudeSubscription = null;

    _recordingTimer?.cancel();
    _recordingTimer = null;

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

    await transcribe();
  }

  Future<Failure?> transcribe() async {
    if (audioFile != null) {
      final (result, error) = await AudioService.uploadAudioFile(audioFile!);

      if (error != null) return error;

      transcription = result?.transcription;
      return null;
    }

    return Failure(
      errorType: ErrorType.unKnownError,
      message: "No audio file found",
    );
  }

  //Play Audio

  Future<void> playAudio() async {
    if (_audioPlayer.playing) {
      await _audioPlayer.stop();
      isPlaying = false;
      return;
    }

    if (audioFile == null || !audioFile!.existsSync()) {
      return;
    }

    try {
      await _audioPlayer.setVolume(1.0);

      await _audioPlayer.setFilePath(audioFile!.path);
      await _audioPlayer.play();
      isPlaying = true;

      await _audioPlayer.processingStateStream.firstWhere(
        (state) => state == ProcessingState.completed,
      );
      isPlaying = false;
    } catch (e) {
      isPlaying = false;
    }
  }

  Future<void> stopAudio() async {
    await _audioPlayer.stop();
    isPlaying = false;
  }

  @override
  void dispose() {
    _recordingTimer?.cancel();
    _voiceActivityDetection.dispose();
    amplitudeSubscription?.cancel();
    _audioRecorder.dispose();
    _audioPlayer.dispose();
    _audioFile = null;
    _transcription = null;
    super.dispose();
  }
}
