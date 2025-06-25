import 'package:flutter/material.dart';
import 'package:turi_mobile/src/core/theme/app_text_theme.dart';
import 'package:turi_mobile/src/core/theme/colors/colors.dart';

extension ThemeX on BuildContext {
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;

  C get colors => isDarkMode ? C.dark() : C.light();
  C get lightColors => C.light();
  C get darkColors => C.dark();
  C get invertedColors => isDarkMode ? C.light() : C.dark();

  AppTextTheme get textTheme => AppTextTheme.fromColors(colors);
}

extension SizeX on BuildContext {
  double get h => MediaQuery.of(this).size.height;
  double get w => MediaQuery.of(this).size.width;
  bool get isSmallSized => MediaQuery.of(this).size.height < 700;
}

extension NavigationX on BuildContext {
  void popUntil({String? routeName}) => Navigator.of(this).popUntil(
    (route) => routeName != null
        ? route.currentResult == routeName || route.isFirst
        : route.isFirst,
  );
}
