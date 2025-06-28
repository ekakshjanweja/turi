import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat_bubble.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/fade.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/message_input.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/navbar.dart';

class HomePage extends StatefulWidget {
  static const String routeName = '/home';

  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
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
                  child: Consumer<ChatProvider>(
                    builder: (context, cp, _) {
                      return Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: ListView.builder(
                              controller: cp.scrollController,
                              padding: EdgeInsets.zero,
                              itemCount: cp.messages.length,
                              shrinkWrap: true,
                              itemBuilder: (context, index) {
                                final message = cp.messages[index];
                                return Padding(
                                  padding: EdgeInsets.only(
                                    top: index == 0 ? 24 : 0,
                                  ),
                                  child: ChatBubble(message: message),
                                );
                              },
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),

                Fade(),

                Fade(isTop: false),
              ],
            ),
          ),

          MessageInput(),
        ],
      ),
    );
  }
}
