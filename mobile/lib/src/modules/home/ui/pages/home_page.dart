import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mail/src/modules/home/data/enum/chat_status.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat/chat_bubble.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat/chat_empty_state.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/fade.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/chat/message_input.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/navbar.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/thinking_indicator.dart';

class HomePage extends StatefulWidget {
  static const String routeName = '/home';

  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  late AnimationController _listAnimationController;
  late Animation<double> _listAnimation;

  @override
  void initState() {
    super.initState();
    _listAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _listAnimation = CurvedAnimation(
      parent: _listAnimationController,
      curve: Curves.easeOutCubic,
    );
    _listAnimationController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final ap = context.read<AuthProvider>();
      final cp = context.read<ChatProvider>();

      final error = await ap.getSession();

      if (error != null) {
        await ap.signOut();
        cp.reset();
        context.go(AuthPage.routeName);
      }
    });
  }

  @override
  void dispose() {
    _listAnimationController.dispose();
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
                  child: Consumer<ChatProvider>(
                    builder: (context, cp, _) {
                      return AnimatedBuilder(
                        animation: _listAnimation,
                        builder: (context, child) {
                          return Transform.translate(
                            offset: Offset(0, 20 * (1 - _listAnimation.value)),
                            child: Opacity(
                              opacity: _listAnimation.value,
                              child: Column(
                                mainAxisAlignment: cp.messages.isNotEmpty
                                    ? MainAxisAlignment.start
                                    : MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Offstage(
                                    offstage: cp.messages.isNotEmpty,
                                    child: ChatEmptyState(),
                                  ),
                                  if (cp.messages.isNotEmpty)
                                    Expanded(
                                      child: Fade(
                                        fadeTop: true,
                                        fadeBottom: true,
                                        fadeHeight: 0.05,
                                        fadeStrength: 0.98,
                                        fadeCurve: Curves.easeOutQuart,
                                        fadeSteps: 8,
                                        child: ListView.builder(
                                          controller: cp.scrollController,
                                          padding: const EdgeInsets.only(
                                            top: 24,
                                            bottom: 16,
                                          ),
                                          itemCount: cp.messages.length,
                                          physics:
                                              const BouncingScrollPhysics(),
                                          itemBuilder: (context, index) {
                                            final message = cp.messages[index];
                                            return Padding(
                                              padding: EdgeInsets.only(
                                                bottom:
                                                    index ==
                                                        cp.messages.length - 1
                                                    ? 8
                                                    : 16,
                                                top: index == 0 ? 0 : 8,
                                              ),
                                              child: ChatBubble(
                                                message: message,
                                              ),
                                            );
                                          },
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),

                Positioned(
                  bottom: 0,
                  left: 16,
                  right: 16,
                  child: Consumer<ChatProvider>(
                    builder: (context, cp, _) {
                      return cp.status == ChatStatus.thinking
                          ? ThinkingIndicator()
                          : const SizedBox.shrink();
                    },
                  ),
                ),
              ],
            ),
          ),

          MessageInput(),
        ],
      ),
    );
  }
}
