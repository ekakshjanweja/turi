import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/modules/audio/audio_service_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/navbar.dart';

class AudioPage extends StatelessWidget {
  static const String routeName = '/audio';
  const AudioPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AudioServiceProvider>(
      builder: (context, asp, _) {
        return Scaffold(
          appBar: Navbar(),
          body: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                TextButton(
                  onPressed: () => asp.isRecording
                      ? asp.stopRecording()
                      : asp.startRecording(),
                  child: Text(
                    asp.isRecording ? 'Stop Recording' : 'Start Recording',
                  ),
                ),
                TextButton(
                  onPressed: () => asp.playAudio(),
                  child: Text(asp.isPlaying ? 'Stop Playing' : 'Play'),
                ),
                Text(asp.transcription ?? ''),
              ],
            ),
          ),
        );
      },
    );
  }
}
