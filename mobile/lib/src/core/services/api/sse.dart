import "dart:async";
import "dart:convert";
import "dart:developer";
import "dart:io";
import "dart:typed_data";
import "dart:ui";
import "package:better_auth_flutter/better_auth_flutter.dart";
import "package:http/http.dart" as http;
import "package:path_provider/path_provider.dart";
import "package:turi_mail/src/core/config/config.dart";
import "package:turi_mail/src/core/services/api/enums/message_type.dart";
import "package:turi_mail/src/core/services/api/models/method_type.dart";
import "package:turi_mail/src/modules/auth/data/repo/auth_repo.dart";

class Sse {
  static final hc = http.Client();

  static Future<StreamSubscription?> sendRequest(
    String path, {
    required MethodType method,
    String? host,
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    Map<String, dynamic>? queryParameters,
    required void Function(String error) onError,
    required void Function(String content, String messageId) onChunk,
    required void Function(String content) onThinking,
    required void Function(File audioFile, String messageId) onAudio,
    required VoidCallback onConnected,
    required VoidCallback onUnauthorized,
    required VoidCallback onDone,
    required VoidCallback onEnd,
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

    final cookies = await BetterAuthFlutter.storage.getCookies(
      Uri(scheme: AppConfig.scheme, host: AppConfig.host).toString(),
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
                    final content = parsedJson["content"] as String;
                    final messageId = parsedJson["messageId"] as String;

                    onChunk(content, messageId);
                  case MessageType.audio:
                    final content =
                        parsedJson["content"]["audio"] as List<dynamic>;
                    final messageId = parsedJson["messageId"] as String;
                    final audioBytes = Uint8List.fromList(content.cast<int>());

                    final dir = await getApplicationCacheDirectory();
                    final recordingDir = Directory("${dir.path}/recordings");

                    await recordingDir.create(recursive: true);

                    // Generate unique filename for each audio chunk to prevent overwrites
                    final timestamp = DateTime.now().millisecondsSinceEpoch;
                    final chunkId = "${messageId}_$timestamp";
                    final file = File(
                      "${recordingDir.path}/audio_chunk_$chunkId.wav",
                    );

                    await file.writeAsBytes(audioBytes);

                    onAudio(file, messageId);
                    break;
                  case MessageType.user:
                    break;
                  case MessageType.done:
                    onDone();
                    break;
                  case MessageType.error:
                    final content = parsedJson["content"] as String;

                    if (content.toLowerCase().contains(
                      "No refresh token".toLowerCase(),
                    )) {
                      onUnauthorized();
                      break;
                    }

                    if (content.toLowerCase().contains(
                      "Request had invalid authentication credentials"
                          .toLowerCase(),
                    )) {
                      onUnauthorized();
                      break;
                    }

                    onError(content);
                    break;
                  case MessageType.end:
                    onEnd();
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
            onUnauthorized: onUnauthorized,
            onDone: onDone,
            onEnd: onEnd,
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
