import "package:shared_preferences/shared_preferences.dart";

class KVStore {
  static SharedPreferences? _sharedPreferences;

  static SharedPreferences get _prefs => _sharedPreferences!;

  static Future<void> init() async {
    _sharedPreferences = await SharedPreferences.getInstance();
  }

  static Future<void> set(String key, dynamic value) async {
    if (value is int) {
      await _prefs.setInt(key, value);
    } else if (value is double) {
      await _prefs.setDouble(key, value);
    } else if (value is bool) {
      await _prefs.setBool(key, value);
    } else if (value is String) {
      await _prefs.setString(key, value);
    } else if (value is List<String>) {
      await _prefs.setStringList(key, value);
    } else {
      throw Exception("Type not supported");
    }
  }

  static Future<bool> setList(String key, List<String> values) =>
      _prefs.setStringList(key, values);

  static T? get<T>(String key, {T? defaultValue}) {
    if (T == int) {
      return _prefs.getInt(key) as T? ?? defaultValue;
    } else if (T == double) {
      return _prefs.getDouble(key) as T? ?? defaultValue;
    } else if (T == bool) {
      return _prefs.getBool(key) as T? ?? defaultValue;
    } else if (T == String) {
      return _prefs.getString(key) as T? ?? defaultValue;
    } else if (T == List<String>) {
      return _prefs.getStringList(key) as T? ?? defaultValue;
    } else {
      throw Exception("Type not supported");
    }
  }

  static List<String>? getList(String key) => _prefs.getStringList(key);

  static Future<bool> remove(String key) => _prefs.remove(key);

  static Future<bool> clear() => _prefs.clear();
}
