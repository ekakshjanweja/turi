import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static ConfigModel get config => ConfigModel.fromMap(dotenv.env);

  static int? get port => config.port;
  static String get scheme => config.scheme;
  static String get host => config.host;
  static String get googleAndroidClientId => config.googleAndroidClientId;
  static String get googleServerClientId => config.googleServerClientId;
}

class ConfigModel {
  final String scheme;
  final String host;
  final String googleAndroidClientId;
  final String googleServerClientId;
  final int? port;

  ConfigModel({
    required this.scheme,
    required this.host,
    required this.googleAndroidClientId,
    required this.googleServerClientId,
    this.port,
  });

  factory ConfigModel.fromMap(Map<String, dynamic> map) {
    return ConfigModel(
      port: map['PORT'] != null ? int.tryParse(map['PORT'].toString()) : null,
      scheme: map['SCHEME'],
      host: map['HOST'],
      googleAndroidClientId: map['GOOGLE_ANDROID_CLIENT_ID'],
      googleServerClientId: map['GOOGLE_SERVER_CLIENT_ID'],
    );
  }
}
