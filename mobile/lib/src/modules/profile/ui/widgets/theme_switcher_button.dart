import 'package:flutter/material.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/core/theme/theme_notifier.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class ThemeSwitcherButton extends StatelessWidget {
  const ThemeSwitcherButton({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      padding: EdgeInsets.zero,
      icon: Icon(
        context.isDarkMode ? SolarBoldIcons.sun : SolarBoldIcons.moon,
        size: 20,
      ),
      onPressed: () {
        ThemeNotifier().setThemeMode(
          context.isDarkMode ? ThemeMode.light : ThemeMode.dark,
        );

        //TODO: Add later if required

        // showModalBottomSheet(
        //   context: context,
        //   builder: (context) => const ThemeModeBottomSheet(),
        // );
      },
    );
  }
}
