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
      foreground: const Color(0xFF0A0A0A),
      card: const Color(0xFFFFFFFF),
      cardForeground: const Color(0xFF0A0A0A),
      popover: const Color(0xFFFFFFFF),
      popoverForeground: const Color(0xFF0A0A0A),
      primary: const Color(0xFF171717),
      primaryForeground: const Color(0xFFFAFAFA),
      secondary: const Color(0xFFF5F5F5),
      secondaryForeground: const Color(0xFF171717),
      muted: const Color(0xFFF5F5F5),
      mutedForeground: const Color(0xFF737373),
      accent: const Color(0xFFF5F5F5),
      accentForeground: const Color(0xFF171717),
      destructive: const Color(0xFFE7000B),
      destructiveForeground: const Color(0xFFFFFFFF),
      border: const Color(0xFFE5E5E5),
      input: const Color(0xFFE5E5E5),
      ring: const Color(0xFFA1A1A1),
      chart1: const Color(0xFF91C5FF),
      chart2: const Color(0xFF3A81F6),
      chart3: const Color(0xFF2563EF),
      chart4: const Color(0xFF1A4EDA),
      chart5: const Color(0xFF1F3FAD),
      sidebar: const Color(0xFFFAFAFA),
      sidebarForeground: const Color(0xFF0A0A0A),
      sidebarPrimary: const Color(0xFF171717),
      sidebarPrimaryForeground: const Color(0xFFFAFAFA),
      sidebarAccent: const Color(0xFFF5F5F5),
      sidebarAccentForeground: const Color(0xFF171717),
      sidebarBorder: const Color(0xFFE5E5E5),
      sidebarRing: const Color(0xFFA1A1A1),
    );
  }

  factory C.dark() {
    return C(
      background: const Color(0xFF0A0A0A),
      foreground: const Color(0xFFFAFAFA),
      card: const Color(0xFF171717),
      cardForeground: const Color(0xFFFAFAFA),
      popover: const Color(0xFF262626),
      popoverForeground: const Color(0xFFFAFAFA),
      primary: const Color(0xFFE5E5E5),
      primaryForeground: const Color(0xFF171717),
      secondary: const Color(0xFF262626),
      secondaryForeground: const Color(0xFFFAFAFA),
      muted: const Color(0xFF262626),
      mutedForeground: const Color(0xFFA1A1A1),
      accent: const Color(0xFF404040),
      accentForeground: const Color(0xFFFAFAFA),
      destructive: const Color(0xFFFF6467),
      destructiveForeground: const Color(0xFFFAFAFA),
      border: const Color(0xFF282828),
      input: const Color(0xFF343434),
      ring: const Color(0xFF737373),
      chart1: const Color(0xFF91C5FF),
      chart2: const Color(0xFF3A81F6),
      chart3: const Color(0xFF2563EF),
      chart4: const Color(0xFF1A4EDA),
      chart5: const Color(0xFF1F3FAD),
      sidebar: const Color(0xFF171717),
      sidebarForeground: const Color(0xFFFAFAFA),
      sidebarPrimary: const Color(0xFF1447E6),
      sidebarPrimaryForeground: const Color(0xFFFAFAFA),
      sidebarAccent: const Color(0xFF262626),
      sidebarAccentForeground: const Color(0xFFFAFAFA),
      sidebarBorder: const Color(0xFF282828),
      sidebarRing: const Color(0xFF525252),
    );
  }
}
