import "dart:convert";
import "dart:io";
import "package:cookie_jar/cookie_jar.dart";
import "package:http/http.dart" as http;
import "package:path_provider/path_provider.dart";
import "package:turi_mail/src/core/config/config.dart";
import "package:turi_mail/src/core/services/api/enums/error_type.dart";
import "package:turi_mail/src/core/services/api/models/api_failure.dart";
import "package:turi_mail/src/core/services/api/models/method_type.dart";

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
    String? host,
    Map<String, dynamic>? body,
    Map<String, String>? headers,
    Map<String, dynamic>? queryParameters,
    int retry = 0,
  }) async {
    final isDelete = method == MethodType.delete;

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
          response = await hc.post(
            uri,
            headers: headers,
            body: jsonEncode(body),
          );
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
}
