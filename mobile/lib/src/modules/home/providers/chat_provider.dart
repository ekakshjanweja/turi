import 'dart:async';

import 'package:flutter/material.dart';
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

  bool _error = false;
  bool get error => _error;
  set error(bool value) {
    _error = value;
    notifyListeners();
  }

  bool _newConversation = true;
  bool get newConversation => _newConversation;
  set newConversation(bool value) {
    _newConversation = value;
    notifyListeners();
  }

  void addMessage(Message message)async {
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

  void clearMessages() {
    _messages.clear();
    notifyListeners();
  }

  @override
  void dispose() {
    _streamSubscription?.cancel();
    inputController.dispose();
    scrollController.dispose();
    super.dispose();
  }
}
