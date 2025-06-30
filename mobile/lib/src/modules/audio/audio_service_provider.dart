import 'dart:async';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:path/path.dart' as path;

class AudioServiceProvider extends ChangeNotifier {
  final AudioRecorder _audioRecorder = AudioRecorder();
  final AudioPlayer _audioPlayer = AudioPlayer();

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

  Timer? _recordingTimer;
  final int _maxRecordingDuration = 60 * 3;

  AudioServiceProvider() {
    _clearRecordingsFolder();
  }

  Future<void> _clearRecordingsFolder() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final recordingsDir = Directory("${dir.path}/recordings");

      if (await recordingsDir.exists()) {
        // Delete all files in the recordings directory
        await for (final entity in recordingsDir.list()) {
          if (entity is File) {
            await entity.delete();
            log('Deleted recording: ${entity.path}');
          }
        }
        log('Cleared all recordings from folder');
      } else {
        await recordingsDir.create(recursive: true);
        log('Created recordings directory');
      }
    } catch (e) {
      log('Error clearing recordings folder: $e');
    }
  }

  void _startRecordingTimer() {
    _recordingTimer = Timer(Duration(seconds: _maxRecordingDuration), () {
      stopRecording();
    });
  }

  Future<void> startRecording() async {
    final hasPermission = await managePermissions();

    if (!hasPermission) return;

    final dir = await getApplicationDocumentsDirectory();
    final recordingsDir = Directory("${dir.path}/recordings");

    // Ensure the recordings directory exists
    if (!await recordingsDir.exists()) {
      await recordingsDir.create(recursive: true);
    }

    final filePath = path.join(
      "${dir.path}/recordings",
      'audio_recording_${DateTime.now().millisecondsSinceEpoch}.wav',
    );

    _startRecordingTimer();

    await _audioRecorder.start(RecordConfig(), path: filePath);

    isRecording = true;
  }

  Future<void> stopRecording() async {
    if (!_isRecording) return;

    _recordingTimer?.cancel();
    _recordingTimer = null;

    final filePath = await _audioRecorder.stop();

    if (filePath != null) {
      audioFile = File(filePath);
      log('Audio file saved at: $filePath');
    }
    isRecording = false;
  }

  Future<bool> managePermissions() async {
    final hasPermission = await _audioRecorder.hasPermission();

    if (!hasPermission) return false;

    return true;
  }

  Future<void> playAudio() async {
    if (_audioPlayer.playing) {
      await _audioPlayer.stop();
      isPlaying = false;
      return;
    }

    if (audioFile == null || !audioFile!.existsSync()) {
      log('Audio file does not exist or is null');
      return;
    }

    try {
      log('Playing audio from: ${audioFile!.path}');

      await _audioPlayer.setVolume(1.0);

      await _audioPlayer.setFilePath(audioFile!.path);
      await _audioPlayer.play();
      isPlaying = true;

      log('Audio playback started successfully');

      _checkAudioCompletion();
    } catch (e) {
      log('Error playing audio: $e');
      isPlaying = false;
    }
  }

  Future<void> _checkAudioCompletion() async {
    await _audioPlayer.processingStateStream.firstWhere(
      (state) => state == ProcessingState.completed,
    );
    isPlaying = false;
  }

  Future<void> stopAudio() async {
    await _audioPlayer.stop();
    isPlaying = false;
  }

  @override
  void dispose() {
    _recordingTimer?.cancel();
    _audioRecorder.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }
}
