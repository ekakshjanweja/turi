import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/router/app_router.dart';
import 'package:turi_mail/src/core/theme/app_theme.dart';
import 'package:turi_mail/src/core/theme/theme_notifier.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';

class TuriApp extends StatefulWidget {
  const TuriApp({super.key});

  @override
  State<TuriApp> createState() => _TuriAppState();
}

class _TuriAppState extends State<TuriApp> {
  @override
  void initState() {
    super.initState();
    ThemeNotifier().loadThemeMode();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final ap = context.read<AuthProvider>();
      await ap.getSession();
    });
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: ThemeNotifier().themeModeNotifier,
      builder: (context, themeMode, _) {
        return MaterialApp.router(
          title: "Turi Mobile",
          debugShowCheckedModeBanner: false,
          routerConfig: AppRouter.router,
          themeMode: themeMode,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
        );
      },
    );
  }
}
