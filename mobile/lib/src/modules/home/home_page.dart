import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/sse.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/home/message.dart';
import 'package:turi_mail/src/modules/home/navbar.dart';

class HomePage extends StatefulWidget {
  static const String routeName = '/home';

  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  StreamSubscription? _streamSubscription;
  ValueNotifier<List<Message>> messagesNotifier = ValueNotifier<List<Message>>(
    [],
  );

  ValueNotifier<bool> thinkingNotifier = ValueNotifier<bool>(false);
  ValueNotifier<bool> connectedNotifier = ValueNotifier<bool>(false);
  ValueNotifier<bool> errorNotifier = ValueNotifier<bool>(false);
  ValueNotifier<bool> newConversationNotifier = ValueNotifier<bool>(true);

  final TextEditingController controller = TextEditingController();
  final ScrollController scrollController = ScrollController();

  @override
  void dispose() {
    _streamSubscription?.cancel();
    messagesNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: Navbar(),
      body: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Consumer<AuthProvider>(
              builder: (context, ap, _) {
                if (ap.user == null) return SizedBox.shrink();

                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Welcome,\n${ap.user!.name}',
                      style: context.textTheme.titleSmall,
                    ),
                    ValueListenableBuilder(
                      valueListenable: thinkingNotifier,
                      builder: (context, thinking, child) {
                        return ValueListenableBuilder(
                          valueListenable: errorNotifier,
                          builder: (context, error, child) {
                            return ValueListenableBuilder(
                              valueListenable: connectedNotifier,
                              builder: (context, connected, _) {
                                if (thinking) {
                                  return FilledButton(
                                    style: ButtonStyle(
                                      backgroundColor: WidgetStateProperty.all(
                                        context.colorScheme.primary,
                                      ),
                                    ),
                                    onPressed: null,
                                    child: Text(
                                      "Thinking...",
                                      style: context.textTheme.labelLarge
                                          .copyWith(
                                            color:
                                                context.colorScheme.onPrimary,
                                          ),
                                    ),
                                  );
                                }

                                if (error) {
                                  return FilledButton(
                                    style: ButtonStyle(
                                      backgroundColor: WidgetStateProperty.all(
                                        context.colorScheme.error,
                                      ),
                                    ),
                                    onPressed: null,
                                    child: Text(
                                      "Oops! An error occurred",
                                      style: context.textTheme.labelLarge
                                          .copyWith(
                                            color: context.colorScheme.onError,
                                          ),
                                    ),
                                  );
                                }
                                return FilledButton(
                                  style: ButtonStyle(
                                    backgroundColor: WidgetStateProperty.all(
                                      connected
                                          ? context.colorScheme.primary
                                          : context.colorScheme.secondary,
                                    ),
                                  ),
                                  onPressed: null,
                                  child: Text(
                                    connected ? "Connected" : "Disconnected",
                                    style: context.textTheme.labelLarge
                                        .copyWith(
                                          color:
                                              context.colorScheme.onSecondary,
                                        ),
                                  ),
                                );
                              },
                            );
                          },
                        );
                      },
                    ),
                  ],
                );
              },
            ),

            SizedBox(height: 20),

            ValueListenableBuilder(
              valueListenable: messagesNotifier,
              builder: (context, messages, _) {
                return Expanded(
                  child: ListView.builder(
                    controller: scrollController,
                    padding: EdgeInsets.zero,
                    itemCount: messages.length,
                    shrinkWrap: true,
                    itemBuilder: (context, index) {
                      return Align(
                        alignment: messages[index].isUser
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Container(
                          margin: EdgeInsets.only(bottom: 16),
                          constraints: BoxConstraints(
                            maxWidth: context.w * 0.75,
                          ),
                          padding: EdgeInsets.symmetric(
                            vertical: 6,
                            horizontal: 12,
                          ),
                          decoration: BoxDecoration(
                            color: messages[index].isUser
                                ? context.colorScheme.tertiaryContainer
                                : context.colorScheme.surfaceContainerHighest,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            messages[index].content,
                            style: context.textTheme.bodyMedium.copyWith(
                              color: messages[index].isUser
                                  ? context.colorScheme.onTertiaryContainer
                                  : context.colorScheme.onSurface,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),

            ValueListenableBuilder(
              valueListenable: controller,
              builder: (context, textEditingValue, _) {
                return SafeArea(
                  child: Row(
                    spacing: 8,
                    children: [
                      Expanded(
                        child: TextField(
                          controller: controller,
                          decoration: InputDecoration(
                            hintText: "Type a message...",
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            contentPadding: EdgeInsets.symmetric(
                              vertical: 16,
                              horizontal: 16,
                            ),
                          ),
                          style: context.textTheme.bodyMedium,
                        ),
                      ),
                      if (controller.text.isNotEmpty)
                        IconButton.filled(
                          onPressed: () async {
                            if (controller.text.trim().isEmpty) return;

                            _streamSubscription = await Sse.sendRequest(
                              "/agent",
                              queryParameters: {
                                "audio": "false",
                                "clear": newConversationNotifier.value
                                    .toString(),
                                "message": controller.text.trim(),
                              },
                              method: MethodType.get,
                              onError: (error) {
                                connectedNotifier.value = false;
                                errorNotifier.value = true;
                              },
                              onChunk: (content) async {
                                messagesNotifier.value = [
                                  ...messagesNotifier.value,
                                  Message(content: content, isUser: false),
                                ];
                                await Future.delayed(
                                  Duration(milliseconds: 100),
                                );
                                thinkingNotifier.value = false;
                                scrollController.animateTo(
                                  scrollController.position.maxScrollExtent,
                                  duration: Duration(milliseconds: 300),
                                  curve: Curves.easeOut,
                                );
                              },
                              onThinking: (content) {
                                thinkingNotifier.value = true;
                              },
                              onAudio: (base64Audio) {},
                              onConnected: () {
                                messagesNotifier.value = [
                                  ...messagesNotifier.value,
                                  Message(
                                    content: controller.text.trim(),
                                    isUser: true,
                                  ),
                                ];
                                thinkingNotifier.value = true;
                                scrollController.animateTo(
                                  scrollController.position.maxScrollExtent,
                                  duration: Duration(milliseconds: 300),
                                  curve: Curves.easeOut,
                                );
                                errorNotifier.value = false;
                                controller.clear();
                                connectedNotifier.value = true;
                                newConversationNotifier.value = false;
                              },
                            );
                          },
                          icon: Icon(Icons.send, size: 24),
                          style: ButtonStyle(
                            padding:
                                WidgetStateProperty.all<EdgeInsetsGeometry>(
                                  EdgeInsets.all(16),
                                ),
                            shape:
                                WidgetStateProperty.all<RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
