import "package:flutter/material.dart";
import "package:turi_mail/src/core/services/local_storage/kv_store.dart";
import "package:turi_mail/src/core/services/local_storage/kv_store_keys.dart";

class ThemeNotifier {
  static final ThemeNotifier _instance = ThemeNotifier._internal();
  factory ThemeNotifier() => _instance;
  ThemeNotifier._internal();

  final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier<ThemeMode>(
    ThemeMode.system,
  );

  Future<void> loadThemeMode() async {
    final savedTheme = KVStore.get<String>(KVStoreKeys.themeMode);
    if (savedTheme == ThemeMode.light.name) {
      themeModeNotifier.value = ThemeMode.light;
    } else if (savedTheme == ThemeMode.dark.name) {
      themeModeNotifier.value = ThemeMode.dark;
    } else {
      themeModeNotifier.value = ThemeMode.system;
    }
  }

  void toggleTheme() {
    if (themeModeNotifier.value == ThemeMode.light) {
      themeModeNotifier.value = ThemeMode.dark;
    } else {
      themeModeNotifier.value = ThemeMode.light;
    }
    saveThemePreference(themeModeNotifier.value);
  }

  void setThemeMode(ThemeMode mode) {
    themeModeNotifier.value = mode;
    saveThemePreference(mode);
  }

  Future<void> saveThemePreference(ThemeMode mode) async {
    await KVStore.set(KVStoreKeys.themeMode, mode.name);
  }
}
