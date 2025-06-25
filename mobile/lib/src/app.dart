import 'package:flutter/material.dart';
import 'package:turi_mobile/src/core/router/app_router.dart';
import 'package:turi_mobile/src/core/theme/app_theme.dart';
import 'package:turi_mobile/src/core/theme/theme_notifier.dart';

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
