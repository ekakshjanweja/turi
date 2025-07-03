import "dart:convert";
import "dart:io";
import "package:cookie_jar/cookie_jar.dart";
import "package:http/http.dart" as http;
import "package:http_parser/http_parser.dart";
import "package:path_provider/path_provider.dart";
import "package:turi_mail/src/core/config/config.dart";
import "package:turi_mail/src/core/services/api/enums/error_type.dart";
import "package:turi_mail/src/core/services/api/enums/request_type.dart";
import "package:turi_mail/src/core/services/api/models/api_failure.dart";
import "package:turi_mail/src/core/services/api/models/method_type.dart";
import "package:turi_mail/src/core/services/api/models/multipart_body.dart";

class Api {
  static final hc = http.Client();

  static late PersistCookieJar _cookieJar;

  static Future<void> init() async {
    final cacheDir = await getApplicationCacheDirectory();
    _cookieJar = PersistCookieJar(
      storage: FileStorage("${cacheDir.path}/.cookies/"),
    );
  }

  static Future<(dynamic, Failure?)> sendRequest(
    String path, {
    required MethodType method,
    RequestType requestType = RequestType.json,
    String? host,
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    Map<String, dynamic>? queryParameters,
    MultipartBody? multipartBody,
    int retry = 0,
  }) async {
    final isDelete = method == MethodType.delete;

    headers ??= {};
    queryParameters ??= {};
    host = host ?? AppConfig.host;

    switch (requestType) {
      case RequestType.json:
        headers.addAll({
          "Accept": "application/json",
          "Content-Type": "application/json",
        });
        break;
      case RequestType.multipart:
        headers.addAll({"Accept": "application/json"});
        break;
    }

    final Uri uri = Uri(
      scheme: AppConfig.scheme,
      host: host,
      path: path,
      queryParameters: queryParameters,
      port: AppConfig.port,
    );

    final cookies = await _cookieJar.loadForRequest(
      Uri(scheme: uri.scheme, host: uri.host),
    );
    if (cookies.isNotEmpty) {
      headers["Cookie"] = cookies.map((c) => "${c.name}=${c.value}").join("; ");
    }

    final http.Response response;

    try {
      switch (method) {
        case MethodType.get:
          response = await hc.get(uri, headers: headers);
          break;
        case MethodType.post:
          if (requestType == RequestType.multipart && multipartBody != null) {
            final multipartRequest = http.MultipartRequest("POST", uri);

            if (cookies.isNotEmpty) {
              multipartRequest.headers["Cookie"] = cookies
                  .map((c) => "${c.name}=${c.value}")
                  .join("; ");
            }

            headers.forEach((key, value) {
              if (key.toLowerCase() != 'content-type') {
                multipartRequest.headers[key] = value;
              }
            });

            multipartBody.fields.forEach(
              (key, value) => multipartRequest.fields[key] = value.toString(),
            );

            for (var fileField in multipartBody.files) {
              final MediaType? contentType = _getContentType(
                fileField.file.path,
              );

              final file = await http.MultipartFile.fromPath(
                fileField.field,
                fileField.file.path,
                filename:
                    fileField.filename ?? fileField.file.path.split('/').last,
                contentType: contentType,
              );

              multipartRequest.files.add(file);
            }

            final streamedResponse = await multipartRequest.send();
            response = await http.Response.fromStream(streamedResponse);
          } else {
            response = await hc.post(
              uri,
              headers: headers,
              body: jsonEncode(body),
            );
          }
          break;
        case MethodType.patch:
          if (body != null) {
            response = await hc.patch(
              uri,
              headers: headers,
              body: jsonEncode(body),
            );
          } else {
            response = await hc.patch(uri, headers: headers);
          }
          break;
        case MethodType.delete:
          response = await hc.delete(uri, headers: headers);
          break;
      }
    } on SocketException catch (error) {
      return (
        null,
        Failure(message: error.message, errorType: ErrorType.unKnownError),
      );
    } catch (error) {
      return (null, Failure(errorType: ErrorType.unKnownError));
    }

    switch (response.statusCode) {
      case 200 || 201:
        try {
          final data = jsonDecode(response.body);
          return (data, null);
        } catch (e) {
          return (
            null,
            Failure(errorType: ErrorType.unKnownError, message: e.toString()),
          );
        }
      case 400:
        final data = jsonDecode(response.body);
        final message = data["message"] as String;

        return (
          null,
          Failure(message: message, errorType: ErrorType.invalidInput),
        );
      case 401:
        if (isDelete) {
          return (null, null);
        }

        return (null, Failure(errorType: ErrorType.unAuthorized));
      case 404:
        final data = jsonDecode(response.body);
        final message = data["message"];

        return (
          null,
          Failure(
            message: message ?? "Not found.",
            errorType: ErrorType.unKnownError,
          ),
        );

      case 500:
        final data = jsonDecode(response.body);
        final message = data["message"];

        return (
          null,
          Failure(message: message, errorType: ErrorType.serverError),
        );
      default:
        final data = jsonDecode(response.body);
        final message = data["message"];

        return (
          null,
          Failure(
            message: message ?? "Unknown error",
            errorType: ErrorType.unKnownError,
          ),
        );
    }
  }

  /// Helper method to get the correct MediaType for audio files
  static MediaType? _getContentType(String filePath) {
    final extension = filePath.toLowerCase().split('.').last;

    switch (extension) {
      case 'wav':
        return MediaType('audio', 'wav');
      case 'mp3':
        return MediaType('audio', 'mpeg');
      case 'webm':
        return MediaType('audio', 'webm');
      case 'ogg':
        return MediaType('audio', 'ogg');
      case 'm4a':
        return MediaType('audio', 'm4a');
      case 'aac':
        return MediaType('audio', 'aac');
      default:
        return MediaType('audio', 'wav'); // Default fallback
    }
  }
}
