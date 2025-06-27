import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/theme/colors/colors.dart';

class AppTextTheme {
  final TextStyle displayLarge;
  final TextStyle displayMedium;
  final TextStyle displaySmall;
  final TextStyle headlineLarge;
  final TextStyle headlineMedium;
  final TextStyle headlineSmall;
  final TextStyle titleLarge;
  final TextStyle titleMedium;
  final TextStyle titleSmall;
  final TextStyle bodyLarge;
  final TextStyle bodyMedium;
  final TextStyle bodySmall;
  final TextStyle labelLarge;
  final TextStyle labelMedium;
  final TextStyle labelSmall;

  AppTextTheme({
    required this.displayLarge,
    required this.displayMedium,
    required this.displaySmall,
    required this.headlineLarge,
    required this.headlineMedium,
    required this.headlineSmall,
    required this.titleLarge,
    required this.titleMedium,
    required this.titleSmall,
    required this.bodyLarge,
    required this.bodyMedium,
    required this.bodySmall,
    required this.labelLarge,
    required this.labelMedium,
    required this.labelSmall,
  });

  factory AppTextTheme.fromColors(C colors) {
    const String fontFamily = 'Geist';

    return AppTextTheme(
      displayLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 72,
        fontWeight: FontWeight.w800,
        height: 1.0,
        letterSpacing: -0.025,
        color: colors.foreground,
      ),
      displayMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 64,
        fontWeight: FontWeight.w800,
        height: 1.0,
        letterSpacing: -0.025,
        color: colors.foreground,
      ),
      displaySmall: TextStyle(
        fontFamily: fontFamily,
        fontSize: 56,
        fontWeight: FontWeight.w800,
        height: 1.0,
        letterSpacing: -0.025,
        color: colors.foreground,
      ),
      headlineLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 48,
        fontWeight: FontWeight.w700,
        height: 1.1,
        letterSpacing: -0.02,
        color: colors.foreground,
      ),
      headlineMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 40,
        fontWeight: FontWeight.w700,
        height: 1.2,
        letterSpacing: -0.02,
        color: colors.foreground,
      ),
      headlineSmall: TextStyle(
        fontFamily: fontFamily,
        fontSize: 36,
        fontWeight: FontWeight.w600,
        height: 1.25,
        letterSpacing: -0.015,
        color: colors.foreground,
      ),
      titleLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 28,
        fontWeight: FontWeight.w600,
        height: 1.3,
        letterSpacing: -0.01,
        color: colors.foreground,
      ),
      titleMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 24,
        fontWeight: FontWeight.w500,
        height: 1.3,
        letterSpacing: -0.01,
        color: colors.foreground,
      ),
      titleSmall: TextStyle(
        fontFamily: fontFamily,
        fontSize: 20,
        fontWeight: FontWeight.w500,
        height: 1.4,
        letterSpacing: -0.005,
        color: colors.foreground,
      ),
      bodyLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 18,
        fontWeight: FontWeight.w400,
        height: 1.5,
        letterSpacing: 0,
        color: colors.foreground,
      ),
      bodyMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.5,
        letterSpacing: 0,
        color: colors.foreground,
      ),
      bodySmall: TextStyle(
        fontFamily: fontFamily,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.5,
        letterSpacing: 0.025,
        color: colors.foreground,
      ),
      labelLarge: TextStyle(
        fontFamily: fontFamily,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.4,
        letterSpacing: 0.01,
        color: colors.foreground,
      ),
      labelMedium: TextStyle(
        fontFamily: fontFamily,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        height: 1.4,
        letterSpacing: 0.025,
        color: colors.foreground,
      ),
      labelSmall: TextStyle(
        fontFamily: fontFamily,
        fontSize: 10,
        fontWeight: FontWeight.w500,
        height: 1.4,
        letterSpacing: 0.05,
        color: colors.foreground,
      ),
    );
  }
}
