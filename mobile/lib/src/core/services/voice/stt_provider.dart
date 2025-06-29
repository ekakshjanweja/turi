import 'dart:developer';

import 'package:flutter/widgets.dart';
import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:speech_to_text/speech_recognition_result.dart';
import 'package:speech_to_text/speech_to_text.dart';

class STTProvider extends ChangeNotifier {
  final SpeechToText stt = SpeechToText();

  bool _initialized = false;
  bool get initialized => _initialized;
  set initialized(bool value) {
    _initialized = value;
    notifyListeners();
  }

  bool _isListening = false;
  bool get isListening => _isListening;
  set isListening(bool value) {
    _isListening = value;
    notifyListeners();
  }

  Future<void> init({
    required void Function(SpeechRecognitionError error) onError,
  }) async {
    if (initialized) return;

    _initialized = await stt.initialize(
      debugLogging: true,
      onError: (error) {
        isListening = false;
        initialized = false;
        onError(error);
      },
      onStatus: (status) {},
      options: [],
    );
  }

  Future<void> startListening({
    required Function(SpeechRecognitionResult result) onResult,
    required void Function(SpeechRecognitionError error) onError,
    int? listenForMinutes,
  }) async {
    if (!initialized) {
      await init(onError: onError);
    }

    final locales = await stt.locales();

    final selectedLocales = [locales[4], locales[7], locales[8], locales[17]];

    for (var element in selectedLocales) {
      log("Locale: ${element.name}", name: "STT LOGS");
    }

    await stt.listen(
      onResult: onResult,
      listenFor: Duration(minutes: listenForMinutes ?? 1),
      onSoundLevelChange: (level) {},
      listenOptions: SpeechListenOptions(),
    );
  }

  Future<void> stopListening() async {
    if (!initialized) return;

    await stt.stop();
  }

  void reset() {
    _isListening = false;
    _initialized = false;
    notifyListeners();
  }
}
