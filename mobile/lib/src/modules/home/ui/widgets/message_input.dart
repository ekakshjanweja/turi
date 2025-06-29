import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/core/services/voice/stt_provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';

class MessageInput extends StatefulWidget {
  const MessageInput({super.key});

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      //TODO: Add through on click for the first time

      // await startSTT();
    });
  }

  Future<void> startSTT() async {
    final cp = context.read<ChatProvider>();
    final stt = context.read<STTProvider>();

    stt.isListening = true;

    await stt.startListening(
      onResult: (result) {
        cp.inputController.text = result.recognizedWords;
        stt.isListening = false;

        if (result.finalResult) {
          cp.sendMessage(
            onDone: () {
              startSTT();
            },
            onEnd: () {
              stt.stopListening();
            },
          );
        }
      },
      onError: (error) {},
    );
  }

  void stopSTT() async {
    final stt = context.read<STTProvider>();
    await stt.stopListening();
    stt.isListening = false;
  }

  void sendMessage() async {
    final cp = context.read<ChatProvider>();
    final stt = context.read<STTProvider>();

    cp.sendMessage(
      onDone: () {
        startSTT();
      },
      onEnd: () {
        stt.stopListening();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<ChatProvider, STTProvider>(
      builder: (context, cp, stt, _) {
        final hasText = cp.inputController.text.isNotEmpty;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: context.colors.card,
            border: Border(
              top: BorderSide(color: context.colors.border, width: 0.5),
            ),
          ),
          child: SafeArea(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Text Input Field
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: context.colors.muted,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: context.colors.border,
                        width: 1,
                      ),
                    ),
                    child: TextField(
                      focusNode: cp.focusNode,
                      controller: cp.inputController,
                      maxLines: 5,
                      minLines: 1,
                      textCapitalization: TextCapitalization.sentences,
                      decoration: InputDecoration(
                        hintText: "Type a message...",
                        hintStyle: context.textTheme.bodyMedium.copyWith(
                          color: context.colors.mutedForeground,
                        ),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 12,
                        ),
                      ),
                      style: context.textTheme.bodyMedium.copyWith(
                        color: context.colors.foreground,
                      ),
                      onChanged: (value) {},
                    ),
                  ),
                ),

                const SizedBox(width: 12),

                AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeOut,
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: hasText || stt.isListening
                        ? context.colors.primary
                        : context.colors.muted,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.circular(24),
                      onTap: hasText
                          ? sendMessage
                          : stt.isListening
                          ? stopSTT
                          : startSTT,
                      child: Container(
                        width: 48,
                        height: 48,
                        alignment: Alignment.center,
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 150),
                          child: Icon(
                            hasText
                                ? SolarBoldIcons.mapArrowRight
                                : stt.isListening
                                ? SolarBoldIcons.record
                                : SolarBoldIcons.microphone,
                            key: ValueKey(
                              hasText
                                  ? 'send'
                                  : stt.isListening
                                  ? 'listening'
                                  : 'mic',
                            ),
                            size: 20,
                            color: hasText || stt.isListening
                                ? context.colors.primaryForeground
                                : context.colors.mutedForeground,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
