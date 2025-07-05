import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/core/services/audio/providers/audio_service_provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mail/src/modules/home/data/enum/chat_status.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/transcription_row/transcription_row.dart';

class MessageInput extends StatefulWidget {
  const MessageInput({super.key});

  @override
  State<MessageInput> createState() => _MessageInputState();
}

class _MessageInputState extends State<MessageInput> {
  @override
  void initState() {
    super.initState();
  }

  Future<void> startSTT() async {
    final cp = context.read<ChatProvider>();
    final asp = context.read<AudioServiceProvider>();

    cp.status = ChatStatus.connected;

    await asp.startRecording();

    asp.transcription.listen((data) {
      cp.inputController.text = data;
    });
  }

  Future<void> stopSTT() async {
    final asp = context.read<AudioServiceProvider>();
    await asp.stopRecording();

    final error = await asp.transcribe();

    if (error != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.message)));
    }
  }

  void sendMessage() async {
    final cp = context.read<ChatProvider>();

    cp.sendMessage(
      onDone: () {
        //TODO: Add later if required

        // startSTT();
      },
      onEnd: () {
        stopSTT();
      },
      onUnauthorized: () async {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              "Oops! Your session has expired. Please sign in again.",
            ),
          ),
        );

        final ap = context.read<AuthProvider>();

        final error = await ap.signOut();

        if (error != null) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(error.message)));
        }

        context.go(AuthPage.routeName);
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<ChatProvider, AudioServiceProvider>(
      builder: (context, cp, asp, _) {
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
            child: Column(
              spacing: 16,
              children: [
                TranscriptionRow(),
                Row(
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
                        color: hasText || asp.isRecording
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
                              : asp.isRecording
                              ? stopSTT
                              : startSTT,
                          child: Container(
                            width: 48,
                            height: 48,
                            alignment: Alignment.center,
                            child: AnimatedSwitcher(
                              duration: const Duration(milliseconds: 300),
                              child: Icon(
                                hasText
                                    ? SolarBoldIcons.mapArrowRight
                                    : asp.isRecording
                                    ? SolarBoldIcons.record
                                    : SolarBoldIcons.microphone,
                                key: ValueKey(
                                  hasText
                                      ? 'send'
                                      : asp.isRecording
                                      ? 'listening'
                                      : 'mic',
                                ),
                                size: 20,
                                color: hasText || asp.isRecording
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
              ],
            ),
          ),
        );
      },
    );
  }
}
