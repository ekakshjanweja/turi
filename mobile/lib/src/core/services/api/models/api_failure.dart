import 'package:turi_mail/src/core/services/api/enums/error_code.dart';

class ApiFailure {
  final String code;
  final String message;
  final String? stack;
  final int? statusCode;
  final Map<String, dynamic>? data;

  const ApiFailure({
    this.code = "API_ERROR",
    required this.message,
    this.stack,
    this.statusCode,
    this.data,
  });

  // Constructor that accepts ErrorCode for easier usage
  ApiFailure.fromErrorCode({
    required ErrorCode errorType,
    String? message,
    this.stack,
    this.statusCode,
    this.data,
  }) : code = errorType.id,
       message = message ?? errorType.message;

  // Legacy constructor for backward compatibility
  factory ApiFailure.legacy({
    required ErrorCode errorType,
    String? message,
    String? stack,
    int? statusCode,
    Map<String, dynamic>? data,
  }) {
    return ApiFailure(
      code: errorType.id,
      message: message ?? errorType.message,
      stack: stack,
      statusCode: statusCode,
      data: data,
    );
  }

  // Named constructors for common API failures
  const ApiFailure.networkError({
    this.code = "NETWORK_ERROR",
    this.message = "Network connection failed",
    this.stack,
    this.statusCode,
    this.data,
  });

  const ApiFailure.serverError({
    this.code = "SERVER_ERROR",
    required this.message,
    this.statusCode = 500,
    this.stack,
    this.data,
  });

  const ApiFailure.unauthorized({
    this.code = "UNAUTHORIZED",
    this.message = "Unauthorized access",
    this.statusCode = 401,
    this.stack,
    this.data,
  });

  const ApiFailure.forbidden({
    this.code = "FORBIDDEN",
    this.message = "Access forbidden",
    this.statusCode = 403,
    this.stack,
    this.data,
  });

  const ApiFailure.notFound({
    this.code = "NOT_FOUND",
    this.message = "Resource not found",
    this.statusCode = 404,
    this.stack,
    this.data,
  });

  // JSON serialization
  factory ApiFailure.fromJson(Map<String, dynamic> json) {
    return ApiFailure(
      code: json['code'] as String? ?? "API_ERROR",
      message: json['message'] as String,
      stack: json['stack'] as String?,
      statusCode: json['statusCode'] as int?,
      data: json['data'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'message': message,
      if (stack != null) 'stack': stack,
      if (statusCode != null) 'statusCode': statusCode,
      if (data != null) 'data': data,
    };
  }

  // copyWith method
  ApiFailure copyWith({
    String? code,
    String? message,
    String? stack,
    int? statusCode,
    Map<String, dynamic>? data,
  }) {
    return ApiFailure(
      code: code ?? this.code,
      message: message ?? this.message,
      stack: stack ?? this.stack,
      statusCode: statusCode ?? this.statusCode,
      data: data ?? this.data,
    );
  }

  // Equality and hashCode
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ApiFailure &&
        other.code == code &&
        other.message == message &&
        other.stack == stack &&
        other.statusCode == statusCode &&
        _mapEquals(other.data, data);
  }

  @override
  int get hashCode {
    return Object.hash(code, message, stack, statusCode, data);
  }

  @override
  String toString() {
    return 'ApiFailure(code: $code, message: $message, stack: $stack, statusCode: $statusCode, data: $data)';
  }

  // Helper method for deep map comparison
  bool _mapEquals(Map<String, dynamic>? a, Map<String, dynamic>? b) {
    if (a == null) return b == null;
    if (b == null || a.length != b.length) return false;

    for (final key in a.keys) {
      if (!b.containsKey(key) || a[key] != b[key]) {
        return false;
      }
    }
    return true;
  }
}

// Legacy typedef for backward compatibility
typedef Failure = ApiFailure;
