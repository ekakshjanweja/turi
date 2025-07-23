class AppConfig {
  static ConfigModel get config => ConfigModel._();

  static int? get port => ConfigModel.port;
  static String get scheme => ConfigModel.scheme;
  static String get host => ConfigModel.host;
  static String get googleServerClientId => ConfigModel.googleServerClientId;
}

class ConfigModel {
  static const String scheme = String.fromEnvironment("SCHEME");
  static const String host = String.fromEnvironment("HOST");
  static const String googleServerClientId = String.fromEnvironment(
    "GOOGLE_SERVER_CLIENT_ID",
  );
  static const String _portString = String.fromEnvironment("PORT");
  static int? get port => int.tryParse(_portString);

  const ConfigModel._();
}
