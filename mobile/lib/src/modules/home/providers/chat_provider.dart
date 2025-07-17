import 'dart:async';
import 'dart:developer' as dev;
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/sse.dart';
import 'package:turi_mail/src/core/services/local_storage/kv_store.dart';
import 'package:turi_mail/src/core/services/local_storage/kv_store_keys.dart';
import 'package:turi_mail/src/modules/home/data/enum/chat_status.dart';
import 'package:turi_mail/src/modules/home/providers/audio_player_manager.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat/message.dart';
import 'package:uuid/uuid.dart';

const List<String> voiceSuggestions = [
  "What are the updates on my emails?",
  "Read my latest messages",
  "What emails do I have from work?",
  "Show me important emails",
  "Find emails from yesterday",
  "What's in my inbox?",
  "Find my recent conversations",
  "What meetings do I have today?",
];

class ChatProvider extends ChangeNotifier {
  ChatProvider() {
    inputController.addListener(() {
      notifyListeners();
    });

    scrollController.addListener(() {
      notifyListeners();
    });

    audioPlayerManager.addListener(() {
      notifyListeners();
    });

    final audioEnabledCache =
        KVStore.get<bool>(KVStoreKeys.audioEnabled) ?? true;

    audioEnabled = audioEnabledCache;
  }

  final AudioPlayerManager _audioPlayerManager = AudioPlayerManager();
  AudioPlayerManager get audioPlayerManager => _audioPlayerManager;

  // Convenience getters for audio state
  bool get isPlayingAudio => _audioPlayerManager.isPlaying;
  String? get currentAudioMessageId => _audioPlayerManager.currentMessageId;

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

  bool _isProcessing = false;
  bool get isProcessing => _isProcessing;
  set isProcessing(bool value) {
    _isProcessing = value;
    notifyListeners();
  }

  String? _currentMessageId;
  String? get currentMessageId => _currentMessageId;
  set currentMessageId(String? value) {
    _currentMessageId = value;
    notifyListeners();
  }

  void sendMessage({
    String? message,
    required VoidCallback onDone,
    required VoidCallback onEnd,
    required VoidCallback onUnauthorized,
  }) async {
    if (inputController.text.isEmpty && message == null) return;

    addMessage(
      Message(
        content: message ?? inputController.text.trim(),
        isUser: true,
        messageId: Uuid().v4(),
      ),
    );
    inputController.clear();

    streamSubscription = await Sse.sendRequest(
      "/agent/chat",
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
      onChunk: (content, messageId) async {
        addMessage(
          Message(content: content, isUser: false, messageId: messageId),
        );
        status = ChatStatus.connected;
      },
      onThinking: (content) {
        status = ChatStatus.thinking;
      },
      onAudio: (file, messageId) async {
        await audioPlayerManager.addAudioChunk(file, messageId);
      },
      onConnected: () {
        status = ChatStatus.connected;
        newConversation = false;
      },
      onDone: () {
        isProcessing = false;
        currentMessageId = null;
        onDone();
      },
      onEnd: () {
        onEnd();
      },
      onUnauthorized: onUnauthorized,
    );
  }

  void addMessage(Message message) async {
    // Check if a message with this messageId already exists
    final existingIndex = _messages.indexWhere(
      (m) => m.messageId == message.messageId,
    );

    if (existingIndex != -1) {
      // Update existing message by appending content
      final existingMessage = _messages[existingIndex];
      _messages[existingIndex] = Message(
        content: existingMessage.content + message.content,
        isUser: existingMessage.isUser,
        messageId: existingMessage.messageId,
      );
    } else {
      // Add new message

      isProcessing = true;
      currentMessageId = message.messageId;
      _messages.add(message);
    }

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

  @override
  void dispose() {
    _streamSubscription?.cancel();
    inputController.dispose();
    scrollController.dispose();
    focusNode.dispose();
    _audioPlayerManager.dispose();
    super.dispose();
  }

  void reset() {
    _messages.clear();
    _error = null;
    _status = ChatStatus.disconnected;
    _newConversation = true;
    _streamSubscription?.cancel();
    focusNode.unfocus();

    // Clear all audio when resetting the conversation
    _audioPlayerManager.clearAllAudio();

    notifyListeners();
  }
}
