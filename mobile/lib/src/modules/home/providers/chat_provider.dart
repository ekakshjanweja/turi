import 'dart:async';
import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/sse.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/message.dart';

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

  bool _thinking = false;
  bool get thinking => _thinking;
  set thinking(bool value) {
    _thinking = value;
    notifyListeners();
  }

  bool _connected = false;
  bool get connected => _connected;
  set connected(bool value) {
    _connected = value;
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

  void sendMessage({required VoidCallback onDone}) async {
    if (inputController.text.isEmpty) return;

    messages.add(Message(content: inputController.text.trim(), isUser: true));
    inputController.clear();

    streamSubscription = await Sse.sendRequest(
      "/agent",
      queryParameters: {
        "audio": "false",
        "clear": newConversation.toString(),
        "message": messages.last.content,
      },
      method: MethodType.get,
      onError: (error) {
        connected = false;
        error = error;
      },
      onChunk: (content) async {
        addMessage(Message(content: content, isUser: false));
        thinking = false;
        onDone();
      },
      onThinking: (content) {
        thinking = true;
      },
      onAudio: (base64Audio) {},
      onConnected: () {
        error = null;
        connected = true;
        newConversation = false;
      },
      onUnauthorized: () {},
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
    _thinking = false;
    _connected = false;
    _newConversation = true;
    _streamSubscription?.cancel();
    focusNode.unfocus();
    notifyListeners();
  }
}
