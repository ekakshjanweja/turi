import "dart:async";
import "dart:convert";
import "dart:developer";
import "dart:io";
import "dart:ui";
import "package:cookie_jar/cookie_jar.dart";
import "package:http/http.dart" as http;
import "package:path_provider/path_provider.dart";
import "package:turi_mail/src/core/config/config.dart";
import "package:turi_mail/src/core/services/api/enums/message_type.dart";
import "package:turi_mail/src/core/services/api/models/method_type.dart";
import "package:turi_mail/src/modules/auth/data/repo/auth_repo.dart";

class Sse {
  static final hc = http.Client();

  static late PersistCookieJar _cookieJar;

  static Future<void> init() async {
    final cacheDir = await getApplicationCacheDirectory();
    _cookieJar = PersistCookieJar(
      storage: FileStorage("${cacheDir.path}/.cookies/"),
    );
  }

  static Future<StreamSubscription?> sendRequest(
    String path, {
    required MethodType method,
    String? host,
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    Map<String, dynamic>? queryParameters,
    required void Function(String error) onError,
    required void Function(String content) onChunk,
    required void Function(String content) onThinking,
    required void Function(String base64Audio) onAudio,
    required VoidCallback onConnected,
    int retry = 0,
  }) async {
    headers ??= {};
    queryParameters ??= {};
    host = host ?? AppConfig.host;

    headers.addAll({
      "Accept": "application/json",
      "Content-Type": "application/json",
    });

    final Uri uri = Uri(
      scheme: AppConfig.scheme,
      host: host,
      path: path,
      port: AppConfig.port,
      queryParameters: queryParameters,
    );

    final cookies = await _cookieJar.loadForRequest(
      Uri(scheme: uri.scheme, host: uri.host),
    );
    if (cookies.isNotEmpty) {
      headers["Cookie"] = cookies.map((c) => "${c.name}=${c.value}").join("; ");
    }

    late final http.StreamedResponse response;
    final http.Request request = http.Request(method.value, uri);
    request.headers.addAll(headers);

    try {
      response = await hc.send(request);
    } on SocketException catch (error) {
      onError("Network error: ${error.message}");
      return null;
    } catch (error) {
      onError("Unexpected error: ${error.toString()}");
      return null;
    }

    switch (response.statusCode) {
      case 200 || 201:
        return response.stream
            .transform(const Utf8Decoder())
            .transform(const LineSplitter())
            .listen((event) async {
              if (event.trim().isEmpty) return;

              if (event.startsWith("data:")) {
                final rawJson = event.substring(6);
                final parsedJson = jsonDecode(rawJson) as Map<String, dynamic>;

                final messageType = MessageType.values.firstWhere(
                  (e) => e.id == parsedJson["type"] as String,
                );

                switch (messageType) {
                  case MessageType.connected:
                    final content = parsedJson["content"] as String;
                    log("Connected: $content");
                    onConnected();
                    break;
                  case MessageType.thinking:
                    onThinking(parsedJson["content"] as String);
                    break;
                  case MessageType.aiResponse:
                    onChunk(parsedJson["content"] as String);
                  case MessageType.audio:
                    final content =
                        parsedJson["content"] as Map<String, dynamic>;

                    final audioData = content["audioData"] as String;
                    final format = content["format"] as String;
                    final mimeType = content["mimeType"] as String;

                    log(
                      name: "SSE AUDIO",
                      "Received audio: $audioData\nformat: $format\nmimeType: $mimeType",
                    );

                    break;
                  case MessageType.user:
                    break;
                  case MessageType.error:
                    final content = parsedJson["content"] as String;

                    if (content.toLowerCase().contains(
                      "No refresh token".toLowerCase(),
                    )) {
                      log("No refresh token");
                    }

                    onError(content);
                    break;
                }
              }
            });
      case 401:
        if (retry < 3) {
          await Future.delayed(const Duration(seconds: 1));
          return Sse.sendRequest(
            path,
            method: method,
            host: host,
            body: body,
            headers: headers,
            queryParameters: queryParameters,
            onError: onError,
            onChunk: onChunk,
            onThinking: onThinking,
            onAudio: onAudio,
            onConnected: onConnected,
            retry: retry + 1,
          );
        } else {
          onError("Unauthorized");
          await AuthRepo.signOut();
          return null;
        }

      default:
        onError("Error: ${response.statusCode} - ${response.reasonPhrase}");
        return null;
    }
  }
}
