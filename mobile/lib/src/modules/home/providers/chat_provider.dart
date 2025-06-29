import 'dart:async';
import 'dart:developer' as dev;
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/sse.dart';
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
        "audio": "false",
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
      onAudio: (base64Audio) {},
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
