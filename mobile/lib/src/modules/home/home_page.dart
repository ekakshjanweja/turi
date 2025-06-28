import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/home/fade.dart';
import 'package:turi_mail/src/modules/home/message.dart';
import 'package:turi_mail/src/modules/home/message_input.dart';
import 'package:turi_mail/src/modules/home/navbar.dart';
import 'package:turi_mail/src/modules/home/status_button.dart';

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
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
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
                                return Padding(
                                  padding: EdgeInsets.only(
                                    top: index == 0 ? 24 : 0,
                                  ),
                                  child: Align(
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
                                            ? context
                                                  .colorScheme
                                                  .tertiaryContainer
                                            : context
                                                  .colorScheme
                                                  .surfaceContainerHighest,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        messages[index].content,
                                        style: context.textTheme.bodyMedium
                                            .copyWith(
                                              color: messages[index].isUser
                                                  ? context
                                                        .colorScheme
                                                        .onTertiaryContainer
                                                  : context
                                                        .colorScheme
                                                        .onSurface,
                                            ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                Fade(),

                Fade(isTop: false),
              ],
            ),
          ),

          MessageInput(
            controller: controller,
            scrollController: scrollController,
            messagesNotifier: messagesNotifier,
            thinkingNotifier: thinkingNotifier,
            connectedNotifier: connectedNotifier,
            errorNotifier: errorNotifier,
            newConversationNotifier: newConversationNotifier,
          ),
        ],
      ),
    );
  }
}
