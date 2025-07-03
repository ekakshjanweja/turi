import 'dart:async';
import 'dart:developer' as dev;
import 'dart:io';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/sse.dart';
import 'package:turi_mail/src/core/services/local_stoage/kv_store.dart';
import 'package:turi_mail/src/core/services/local_stoage/kv_store_keys.dart';
import 'package:turi_mail/src/modules/home/data/enum/chat_status.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat/message.dart';

const List<String> voiceSuggestions = [
  "Help me with my emails",
  "Read my latest messages",
  "What emails do I have from work?",
  "Show me important emails",
  "Check for unread messages",
  "Find emails from yesterday",
  "Schedule a meeting",
  "Draft an email to my team",
  "Search for emails about the project",
  "What's in my inbox?",
  "Show me emails from this week",
  "Find my recent conversations",
  "Help me organize my emails",
  "What meetings do I have today?",
  "Send a quick reply",
];

class ChatProvider extends ChangeNotifier {
  ChatProvider() {
    inputController.addListener(() {
      notifyListeners();
    });

    scrollController.addListener(() {
      notifyListeners();
    });

    final audioEnabledCache =
        KVStore.get<bool>(KVStoreKeys.audioEnabled) ?? false;

    audioEnabled = audioEnabledCache;
  }

  bool _audioEnabled = false;
  bool get audioEnabled => _audioEnabled;
  set audioEnabled(bool value) {
    _audioEnabled = value;
    notifyListeners();
  }

  StreamSubscription? _streamSubscription;
  StreamSubscription? get streamSubscription => _streamSubscription;
  set streamSubscription(StreamSubscription? value) {
    _streamSubscription?.cancel(); // Cancel previous subscription if exists
    _streamSubscription = value;
    notifyListeners();
  }

  final TextEditingController inputController = TextEditingController();
  final ScrollController scrollController = ScrollController();
  final FocusNode focusNode = FocusNode();

  List<Message> _messages = [];
  List<Message> get messages => _messages;
  set messages(List<Message> value) {
    _messages = value;
    notifyListeners();
  }

  ChatStatus _status = ChatStatus.disconnected;
  ChatStatus get status => _status;
  set status(ChatStatus value) {
    _status = value;
    notifyListeners();
  }

  String? _error;
  String? get error => _error;
  set error(String? value) {
    _error = value;
    notifyListeners();
  }

  bool _newConversation = true;
  bool get newConversation => _newConversation;
  set newConversation(bool value) {
    _newConversation = value;
    notifyListeners();
  }

  String? _voiceSuggestion;
  String? get voiceSuggestion => _voiceSuggestion;
  set voiceSuggestion(String? value) {
    _voiceSuggestion = value;
    notifyListeners();
  }

  Timer? _voiceSuggestionTimer;
  Timer? get voiceSuggestionTimer => _voiceSuggestionTimer;
  set voiceSuggestionTimer(Timer? value) {
    _voiceSuggestionTimer?.cancel();
    _voiceSuggestionTimer = value;
    notifyListeners();
  }

  final AudioPlayer _audioPlayer = AudioPlayer();

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

  void sendMessage({
    required VoidCallback onDone,
    required VoidCallback onEnd,
  }) async {
    if (inputController.text.isEmpty) return;

    addMessage(Message(content: inputController.text.trim(), isUser: true));
    inputController.clear();

    streamSubscription = await Sse.sendRequest(
      "/agent",
      queryParameters: {
        "audio": audioEnabled.toString(),
        "clear": newConversation.toString(),
        "message": messages.last.content,
      },
      method: MethodType.get,
      onError: (err) {
        error = err;
        status = ChatStatus.error;
        dev.log("Error: $error", error: error);
      },
      onChunk: (content) async {
        addMessage(Message(content: content, isUser: false));
        status = ChatStatus.connected;
      },
      onThinking: (content) {
        status = ChatStatus.thinking;
      },
      onAudio: (file) async {
        audioFile = file;

        await playAudio();
      },
      onConnected: () {
        status = ChatStatus.connected;
        newConversation = false;
      },
      onDone: () {
        onDone();
      },
      onEnd: () {
        onEnd();
      },
      onUnauthorized: () {},
    );
  }

  void addMessage(Message message) async {
    _messages.add(message);
    notifyListeners();

    await Future.delayed(Duration(milliseconds: 100));

    // Delay scroll until after UI rebuild
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (scrollController.hasClients) {
        scrollController.animateTo(
          scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void updateVoiceSuggestion() {
    final random = Random();

    String newSuggestion;
    do {
      newSuggestion = voiceSuggestions[random.nextInt(voiceSuggestions.length)];
    } while (newSuggestion == _voiceSuggestion && voiceSuggestions.length > 1);
    voiceSuggestion = newSuggestion;

    voiceSuggestionTimer = Timer.periodic(
      const Duration(seconds: 4),
      (_) => updateVoiceSuggestion(),
    );
  }

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
    _streamSubscription?.cancel();
    inputController.dispose();
    scrollController.dispose();
    focusNode.dispose();
    super.dispose();
  }

  void reset() {
    _messages.clear();
    _error = null;
    _status = ChatStatus.disconnected;
    _newConversation = true;
    _streamSubscription?.cancel();
    focusNode.unfocus();
    notifyListeners();
  }
}
