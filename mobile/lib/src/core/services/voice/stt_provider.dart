import 'dart:developer';

import 'package:flutter/widgets.dart';
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

  Future<void> init() async {
    if (initialized) return;

    _initialized = await stt.initialize(
      debugLogging: true,
      onError: (error) {
        log("Error in STT: $error", name: "STT LOGS");
      },
      onStatus: (status) {},
      options: [],
    );
  }

  Future<void> startListening({
    required Function(SpeechRecognitionResult result) onResult,
    int? listenForMinutes,
  }) async {
    if (!initialized) return;

    final locales = await stt.locales();

    final selectedLocales = [locales[4], locales[7], locales[8], locales[17]];

    for (var element in selectedLocales) {
      log("Locale: ${element.name}", name: "STT LOGS");
    }

    await stt.listen(
      onResult: onResult,
      listenFor: Duration(minutes: listenForMinutes ?? 1),
      onSoundLevelChange: (level) {
        log("Sound level: $level", name: "STT LOGS");
      },
      listenOptions: SpeechListenOptions(),
    );
  }

  Future<void> stopListening() async {
    if (!initialized) return;

    await stt.stop();
  }
}
