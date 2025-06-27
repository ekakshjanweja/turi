import 'package:flutter/material.dart';
import 'package:turi_mobile/src/core/theme/colors/colors.dart';

class AppColorScheme {
  final ColorScheme colorScheme;

  AppColorScheme({required this.colorScheme});

  factory AppColorScheme.light() {
    final colors = C.light();
    return AppColorScheme(
      colorScheme: ColorScheme.light(
        brightness: Brightness.light,
        primary: colors.primary,
        onPrimary: colors.primaryForeground,
        secondary: colors.secondary,
        onSecondary: colors.secondaryForeground,
        tertiary: colors.accent,
        onTertiary: colors.accentForeground,
        error: colors.destructive,
        onError: colors.destructiveForeground,
        surface: colors.background,
        onSurface: colors.foreground,
        surfaceContainerHighest: colors.card,
        onSurfaceVariant: colors.cardForeground,
        outline: colors.border,
        outlineVariant: colors.ring,
        inverseSurface: colors.muted,
        onInverseSurface: colors.mutedForeground,
        surfaceContainer: colors.popover,
        surfaceTint: colors.primary,
        inversePrimary: colors.accent,
        shadow: colors.ring,
        scrim: colors.muted,
      ),
    );
  }

  factory AppColorScheme.dark() {
    final colors = C.dark();
    return AppColorScheme(
      colorScheme: ColorScheme.dark(
        brightness: Brightness.dark,
        primary: colors.primary,
        onPrimary: colors.primaryForeground,
        secondary: colors.secondary,
        onSecondary: colors.secondaryForeground,
        tertiary: colors.accent,
        onTertiary: colors.accentForeground,
        error: colors.destructive,
        onError: colors.destructiveForeground,
        surface: colors.background,
        onSurface: colors.foreground,
        surfaceContainerHighest: colors.card,
        onSurfaceVariant: colors.cardForeground,
        outline: colors.border,
        outlineVariant: colors.ring,
        inverseSurface: colors.muted,
        onInverseSurface: colors.mutedForeground,
        surfaceContainer: colors.popover,
        surfaceTint: colors.primary,
        inversePrimary: colors.accent,
        shadow: colors.ring,
        scrim: colors.muted,
      ),
    );
  }
}
