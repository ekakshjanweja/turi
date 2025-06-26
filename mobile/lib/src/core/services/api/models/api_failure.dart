import "dart:convert";
import "package:turi_mobile/src/core/services/api/enums/error_type.dart";

class Failure {
  final ErrorType errorType;
  final String message;

  Failure({required this.errorType, String? message})
    : message = message ?? errorType.message;

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      "errorType": errorType.message,
      "message": message,
    };
  }

  factory Failure.fromMap(Map<String, dynamic> map) {
    return Failure(
      errorType: ErrorType.values.firstWhere(
        (element) => element.message == map["errorType"],
      ),
      message: map["message"] as String,
    );
  }

  String toJson() => json.encode(toMap());

  factory Failure.fromJson(String source) =>
      Failure.fromMap(json.decode(source) as Map<String, dynamic>);
}
