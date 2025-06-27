import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/theme/theme_notifier.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class ThemeModeBottomSheet extends StatefulWidget {
  const ThemeModeBottomSheet({super.key});

  @override
  State<ThemeModeBottomSheet> createState() => _ThemeModeBottomSheetState();
}

class _ThemeModeBottomSheetState extends State<ThemeModeBottomSheet> {
  ThemeMode _selectedThemeMode = ThemeMode.system;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      setState(() {
        _selectedThemeMode = ThemeNotifier().themeModeNotifier.value;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: context.w,
      height: 224,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text("Appearance", style: context.textTheme.titleLarge),
          ),
          const SizedBox(height: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: ThemeMode.values.reversed
                .map(
                  (themeMode) => ListTile(
                    onTap: () {
                      ThemeNotifier().setThemeMode(themeMode);

                      setState(() {
                        _selectedThemeMode = themeMode;
                      });
                    },
                    title: Text(
                      "${themeMode.name.toUpperCase()[0]}${themeMode.name.substring(1)} Theme",
                      style: context.textTheme.titleSmall,
                    ),
                    leading: Radio<ThemeMode>(
                      activeColor: context.colors.primary,
                      groupValue: _selectedThemeMode,
                      value: themeMode,
                      onChanged: (value) {
                        if (value == null) {
                          return;
                        }

                        ThemeNotifier().setThemeMode(value);

                        setState(() {
                          _selectedThemeMode = value;
                        });
                      },
                    ),
                  ),
                )
                .toList(),
          ),
        ],
      ),
    );
  }
}
