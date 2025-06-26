import "package:flutter/cupertino.dart";
import "package:flutter/material.dart";
import "package:turi_mobile/src/core/theme/app_text_theme.dart";
import "package:turi_mobile/src/core/theme/colors/colors.dart";

class AppTheme {
  AppTheme._();

  static WidgetStateProperty<Color?> trackColor(Color color) =>
      WidgetStateProperty.resolveWith<Color?>((Set<WidgetState> states) {
        if (states.contains(WidgetState.selected)) {
          return color;
        }

        return null;
      });
  static WidgetStateProperty<Color?> overlayColor(
    Color selected,
    Color disabled,
  ) => WidgetStateProperty.resolveWith<Color?>((Set<WidgetState> states) {
    if (states.contains(WidgetState.selected)) {
      return selected;
    }

    if (states.contains(WidgetState.disabled)) {
      return disabled;
    }

    return null;
  });

  static const String fontFamily = "Geist";

  static C get lightColors => C.light();
  static C get darkColors => C.dark();

  static ThemeData get light => ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    // colorScheme: AppColorScheme.light().colorScheme,
    colorSchemeSeed: lightColors.primary,
    fontFamily: fontFamily,
    scaffoldBackgroundColor: lightColors.background,
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.all(lightColors.background),
      trackColor: trackColor(lightColors.primary),
      overlayColor: overlayColor(
        lightColors.primary.withValues(alpha: 0.5),
        lightColors.mutedForeground.withValues(alpha: 0.3),
      ),
    ),
    pageTransitionsTheme: PageTransitionsTheme(
      builders: {
        TargetPlatform.android: const CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: const CupertinoPageTransitionsBuilder(),
      },
    ),
    appBarTheme: appBarTheme(lightColors),
    bottomSheetTheme: bottomSheetTheme(lightColors),
    filledButtonTheme: filledButtonTheme(lightColors),
  );

  static ThemeData get dark => ThemeData(
    brightness: Brightness.dark,
    useMaterial3: true,
    // colorScheme: AppColorScheme.dark().colorScheme,
    colorSchemeSeed: darkColors.primary,
    fontFamily: fontFamily,
    scaffoldBackgroundColor: darkColors.background,
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.all(lightColors.background),
      trackColor: trackColor(lightColors.primary),
      overlayColor: overlayColor(
        darkColors.primary.withValues(alpha: 0.5),
        darkColors.mutedForeground.withValues(alpha: 0.3),
      ),
    ),
    pageTransitionsTheme: PageTransitionsTheme(
      builders: {
        TargetPlatform.android: const CupertinoPageTransitionsBuilder(),
        TargetPlatform.iOS: const CupertinoPageTransitionsBuilder(),
      },
    ),
    appBarTheme: appBarTheme(darkColors),
    bottomSheetTheme: bottomSheetTheme(darkColors),
    filledButtonTheme: filledButtonTheme(darkColors),
  );

  static CupertinoThemeData get lightCupertino => CupertinoThemeData(
    brightness: Brightness.light,
    primaryColor: lightColors.primary,
    scaffoldBackgroundColor: lightColors.background,
    textTheme: CupertinoTextThemeData(
      textStyle: TextStyle(
        fontFamily: fontFamily,
        color: lightColors.foreground,
      ),
    ),
  );

  static CupertinoThemeData get darkCupertino => CupertinoThemeData(
    brightness: Brightness.dark,
    primaryColor: darkColors.primary,
    scaffoldBackgroundColor: darkColors.background,
    textTheme: CupertinoTextThemeData(
      textStyle: TextStyle(
        fontFamily: fontFamily,
        color: darkColors.foreground,
      ),
    ),
  );

  static AppBarTheme appBarTheme(C colors) => AppBarTheme(
    elevation: 0,
    backgroundColor: colors.background,
    titleTextStyle: AppTextTheme.fromColors(colors).titleMedium,
    scrolledUnderElevation: 0,
    centerTitle: false,
    titleSpacing: 0,
  );

  static BottomSheetThemeData bottomSheetTheme(C colors) =>
      BottomSheetThemeData(
        modalBarrierColor: colors.background.withValues(alpha: 0.5),
        backgroundColor: colors.card,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
          ),
        ),
      );

  static ProgressIndicatorThemeData progressIndicatorTheme(
    C colors,
    AppTextTheme textTheme,
  ) => ProgressIndicatorThemeData(color: colors.primary);

  static FilledButtonThemeData filledButtonTheme(C colors) =>
      FilledButtonThemeData(
        style: ButtonStyle(
          foregroundColor: WidgetStateProperty.all(colors.foreground),
          backgroundColor: WidgetStateProperty.all(colors.primary),
          overlayColor: WidgetStateProperty.all(
            colors.primary.withValues(alpha: 0.5),
          ),
          padding: WidgetStateProperty.all<EdgeInsetsGeometry>(
            const EdgeInsets.symmetric(horizontal: 12),
          ),
          textStyle: WidgetStateProperty.all<TextStyle>(
            AppTextTheme.fromColors(colors).labelLarge,
          ),
          shape: WidgetStateProperty.all<RoundedRectangleBorder>(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
      );

  static IconButtonThemeData iconButtonTheme(C colors) => IconButtonThemeData(
    style: ButtonStyle(
      foregroundColor: WidgetStateProperty.all(colors.foreground),
      backgroundColor: WidgetStateProperty.all(colors.primary),
      overlayColor: WidgetStateProperty.all(
        colors.primary.withValues(alpha: 0.5),
      ),
      padding: WidgetStateProperty.all<EdgeInsetsGeometry>(
        const EdgeInsets.all(8),
      ),
      shape: WidgetStateProperty.all<RoundedRectangleBorder>(
        RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
  );
}
