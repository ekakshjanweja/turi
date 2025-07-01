import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/audio/providers/audio_service_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/navbar.dart';

class AudioPage extends StatefulWidget {
  static const String routeName = '/audio';
  const AudioPage({super.key});

  @override
  State<AudioPage> createState() => _AudioPageState();
}

class _AudioPageState extends State<AudioPage> {
  final ValueNotifier<String?> _transcription = ValueNotifier<String?>(null);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final asp = context.read<AudioServiceProvider>();

      await asp.startRecording();

      asp.transcription.listen((data) {
        _transcription.value = data;
      });
    });
  }

  @override
  void dispose() {
    _transcription.dispose();
    super.dispose();
  }

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
                ValueListenableBuilder(
                  valueListenable: _transcription,
                  builder: (context, value, _) {
                    if (value == null) return const SizedBox.shrink();

                    return Text(value);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
