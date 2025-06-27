import 'dart:ui';

import 'package:flutter/material.dart';

class C {
  final Color background;
  final Color foreground;
  final Color card;
  final Color cardForeground;
  final Color popover;
  final Color popoverForeground;
  final Color primary;
  final Color primaryForeground;
  final Color secondary;
  final Color secondaryForeground;
  final Color muted;
  final Color mutedForeground;
  final Color accent;
  final Color accentForeground;
  final Color destructive;
  final Color destructiveForeground;
  final Color border;
  final Color input;
  final Color ring;
  final Color chart1;
  final Color chart2;
  final Color chart3;
  final Color chart4;
  final Color chart5;
  final Color sidebar;
  final Color sidebarForeground;
  final Color sidebarPrimary;
  final Color sidebarPrimaryForeground;
  final Color sidebarAccent;
  final Color sidebarAccentForeground;
  final Color sidebarBorder;
  final Color sidebarRing;

  C({
    required this.background,
    required this.foreground,
    required this.card,
    required this.cardForeground,
    required this.popover,
    required this.popoverForeground,
    required this.primary,
    required this.primaryForeground,
    required this.secondary,
    required this.secondaryForeground,
    required this.muted,
    required this.mutedForeground,
    required this.accent,
    required this.accentForeground,
    required this.destructive,
    required this.destructiveForeground,
    required this.border,
    required this.input,
    required this.ring,
    required this.chart1,
    required this.chart2,
    required this.chart3,
    required this.chart4,
    required this.chart5,
    required this.sidebar,
    required this.sidebarForeground,
    required this.sidebarPrimary,
    required this.sidebarPrimaryForeground,
    required this.sidebarAccent,
    required this.sidebarAccentForeground,
    required this.sidebarBorder,
    required this.sidebarRing,
  });

  factory C.light() {
    return C(
      background: const Color(0xFFFFFFFF),
      foreground: const Color(0xFF333333),
      card: const Color(0xFFF9F9F9),
      cardForeground: const Color(0xFF333333),
      popover: const Color(0xFFF9F9F9),
      popoverForeground: const Color(0xFF333333),
      primary: const Color(0xFF649B9B),
      primaryForeground: const Color(0xFFFFFFFF),
      secondary: const Color(0xFF4A8080),
      secondaryForeground: const Color(0xFFFFFFFF),
      muted: const Color(0xFFF0F0F0),
      mutedForeground: const Color(0xFF616161),
      accent: const Color(0xFF78A8A8),
      accentForeground: const Color(0xFFFFFFFF),
      destructive: const Color(0xFFE57373),
      destructiveForeground: const Color(0xFFFFFFFF),
      border: const Color(0xFFE0E0E0),
      input: const Color(0xFFE0E0E0),
      ring: const Color(0xFF78A8A8),
      chart1: const Color(0xFF78A8A8),
      chart2: const Color(0xFF609595),
      chart3: const Color(0xFF488282),
      chart4: const Color(0xFF306F6F),
      chart5: const Color(0xFF185C5C),
      sidebar: const Color(0xFFF8F8F8),
      sidebarForeground: const Color(0xFF333333),
      sidebarPrimary: const Color(0xFF649B9B),
      sidebarPrimaryForeground: const Color(0xFFFFFFFF),
      sidebarAccent: const Color(0xFFF0F0F0),
      sidebarAccentForeground: const Color(0xFF616161),
      sidebarBorder: const Color(0xFFE0E0E0),
      sidebarRing: const Color(0xFF78A8A8),
    );
  }

  factory C.dark() {
    return C(
      background: const Color(0xFF121212),
      foreground: const Color(0xFFE0E0E0),
      card: const Color(0xFF1A1A1A),
      cardForeground: const Color(0xFFE0E0E0),
      popover: const Color(0xFF1A1A1A),
      popoverForeground: const Color(0xFFE0E0E0),
      primary: const Color(0xFF649B9B),
      primaryForeground: const Color(0xFFFFFFFF),
      secondary: const Color(0xFF4A8080),
      secondaryForeground: const Color(0xFFFFFFFF),
      muted: const Color(0xFF242424),
      mutedForeground: const Color(0xFF9E9E9E),
      accent: const Color(0xFF78A8A8),
      accentForeground: const Color(0xFFFFFFFF),
      destructive: const Color(0xFFE57373),
      destructiveForeground: const Color(0xFFFFFFFF),
      border: const Color(0xFF333333),
      input: const Color(0xFF333333),
      ring: const Color(0xFF78A8A8),
      chart1: const Color(0xFF78A8A8),
      chart2: const Color(0xFF609595),
      chart3: const Color(0xFF488282),
      chart4: const Color(0xFF306F6F),
      chart5: const Color(0xFF185C5C),
      sidebar: const Color(0xFF1A1A1A),
      sidebarForeground: const Color(0xFFE0E0E0),
      sidebarPrimary: const Color(0xFF649B9B),
      sidebarPrimaryForeground: const Color(0xFFFFFFFF),
      sidebarAccent: const Color(0xFF242424),
      sidebarAccentForeground: const Color(0xFF9E9E9E),
      sidebarBorder: const Color(0xFF333333),
      sidebarRing: const Color(0xFF78A8A8),
    );
  }
}
