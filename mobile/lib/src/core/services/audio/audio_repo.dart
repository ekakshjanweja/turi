import 'dart:io';
import 'package:turi_mail/src/core/services/api/api.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/core/services/api/enums/error_code.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/enums/request_type.dart';
import 'package:turi_mail/src/core/services/api/models/multipart_body.dart';
import 'package:turi_mail/src/core/services/audio/models/audio_transcription_result.dart';

class AudioRepo {
  static Future<(AudioTranscriptionResult?, ApiFailure?)> uploadAudioFile(
    File audioFile, {
    Function(int sent, int total)? onProgress,
  }) async {
    try {
      // Validate file exists
      if (!await audioFile.exists()) {
        return (
          null,
          ApiFailure(
            message: "Audio file does not exist",
            code: ErrorCode.invalidInput.id,
          ),
        );
      }

      // Validate file size (10MB limit to match backend)
      final fileSize = await audioFile.length();
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileSize > maxSize) {
        return (
          null,
          ApiFailure(
            message: "File too large. Maximum size is 10MB",
            code: ErrorCode.invalidInput.id,
          ),
        );
      }

      // Create multipart body for file upload
      final multipartBody = MultipartBody(
        files: [
          MultipartFile(
            field: 'audio',
            file: audioFile,
            filename: audioFile.path.split('/').last,
          ),
        ],
      );

      // Upload the file using the API service
      final (response, error) = await Api.sendRequest(
        '/audio/stt',
        method: MethodType.post,
        requestType: RequestType.multipart,
        multipartBody: multipartBody,
      );

      if (error != null) {
        return (null, error);
      }

      // Parse the response into AudioTranscriptionResult
      final result = AudioTranscriptionResult.fromMap(
        response as Map<String, dynamic>,
      );
      return (result, null);
    } catch (e) {
      return (
        null,
        ApiFailure(
          message: "Failed to upload audio: ${e.toString()}",
          code: ErrorCode.unKnownError.id,
        ),
      );
    }
  }

  static Future<(Map<String, dynamic>?, ApiFailure?)>
  checkAudioServiceStatus() async {
    final (response, error) = await Api.sendRequest(
      '/audio/status',
      method: MethodType.get,
    );

    if (error != null) {
      return (null, error);
    }

    return (response as Map<String, dynamic>, null);
  }
}
