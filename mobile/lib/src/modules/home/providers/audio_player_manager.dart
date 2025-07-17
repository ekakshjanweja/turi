import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:uuid/uuid.dart';

class AudioPlayerManager extends ChangeNotifier {
  final AudioPlayer _audioPlayer = AudioPlayer();

  bool _isPlaying = false;
  bool get isPlaying => _isPlaying;
  set isPlaying(bool value) {
    _isPlaying = value;
    notifyListeners();
  }

  String? _currentMessageId;
  String? get currentMessageId => _currentMessageId;
  set currentMessageId(String? value) {
    _currentMessageId = value;
    notifyListeners();
  }

  final Map<String, List<AudioChunk>> _audioChunksMap = {};
  Map<String, List<AudioChunk>> get audioChunksMap => _audioChunksMap;

  // Track which chunks have been played for each message
  final Map<String, int> _playedChunkIndexMap = {};

  // Track if we're currently processing a message's audio queue
  final Map<String, bool> _isProcessingMap = {};

  Future<void> addAudioChunk(File audioChunk, String messageId) async {
    log("Adding audio chunk for message: $messageId");
    currentMessageId ??= messageId;

    if (!audioChunksMap.containsKey(messageId)) {
      audioChunksMap[messageId] = [];
      _playedChunkIndexMap[messageId] = 0;
      _isProcessingMap[messageId] = false;
    }

    audioChunksMap[messageId]!.add(
      AudioChunk(
        file: audioChunk,
        messageId: messageId,
        audioChunkId: Uuid().v4(),
      ),
    );

    notifyListeners();

    // Start playing this message's queue if not already processing
    await _processAudioQueue(messageId);
  }

  Future<void> _processAudioQueue(String messageId) async {
    // Prevent multiple queue processors for the same message
    if (_isProcessingMap[messageId] == true) {
      return;
    }

    _isProcessingMap[messageId] = true;

    try {
      final chunks = audioChunksMap[messageId];
      if (chunks == null || chunks.isEmpty) {
        return;
      }

      int playedIndex = _playedChunkIndexMap[messageId] ?? 0;

      // Play all unplayed chunks sequentially
      while (playedIndex < chunks.length) {
        final chunk = chunks[playedIndex];

        await _playChunk(chunk);

        playedIndex++;
        _playedChunkIndexMap[messageId] = playedIndex;

        // Update the chunk as played
        audioChunksMap[messageId]![playedIndex - 1] = chunk.copyWith(
          hasPlayed: true,
        );
        notifyListeners();
      }
    } finally {
      _isProcessingMap[messageId] = false;

      // If this was the current message and we finished playing all chunks
      if (messageId == currentMessageId) {
        isPlaying = false;
      }
    }
  }

  Future<void> _playChunk(AudioChunk chunk) async {
    try {
      await _audioPlayer.setAudioSource(AudioSource.file(chunk.file.path));
      await _audioPlayer.play();
      isPlaying = true;

      // Wait for the chunk to finish playing
      await _audioPlayer.processingStateStream.firstWhere(
        (state) => state == ProcessingState.completed,
      );
    } catch (e) {
      print("Error playing audio chunk: $e");
    }
  }

  Future<void> playAudio() async {
    if (currentMessageId == null) {
      return;
    }

    // Reset played index and start processing the queue
    _playedChunkIndexMap[currentMessageId!] = 0;
    await _processAudioQueue(currentMessageId!);
  }

  Future<void> stopAudio() async {
    await _audioPlayer.stop();
    isPlaying = false;
    notifyListeners();
  }

  void clearAudioForMessage(String messageId) {
    audioChunksMap.remove(messageId);
    _playedChunkIndexMap.remove(messageId);
    _isProcessingMap.remove(messageId);
    notifyListeners();
  }

  void clearAllAudio() {
    audioChunksMap.clear();
    _playedChunkIndexMap.clear();
    _isProcessingMap.clear();
    currentMessageId = null;
    isPlaying = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _audioPlayer.dispose();
    super.dispose();
  }
}

class AudioChunk {
  final File file;
  final String messageId;
  final bool hasPlayed;
  final String audioChunkId;

  AudioChunk({
    required this.file,
    required this.messageId,
    this.hasPlayed = false,
    required this.audioChunkId,
  });

  AudioChunk copyWith({
    File? file,
    String? messageId,
    bool? hasPlayed,
    String? audioChunkId,
  }) {
    return AudioChunk(
      file: file ?? this.file,
      messageId: messageId ?? this.messageId,
      hasPlayed: hasPlayed ?? this.hasPlayed,
      audioChunkId: audioChunkId ?? this.audioChunkId,
    );
  }
}
