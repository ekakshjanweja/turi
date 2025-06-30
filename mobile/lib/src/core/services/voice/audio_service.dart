import 'dart:io';
import 'package:turi_mail/src/core/services/api/api.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/core/services/api/enums/error_type.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';
import 'package:turi_mail/src/core/services/api/enums/request_type.dart';
import 'package:turi_mail/src/core/services/api/models/multipart_body.dart';
import 'package:turi_mail/src/core/services/voice/audio_transcription_result.dart';

class AudioService {
  /// Upload an audio file to the speech-to-text endpoint
  /// Returns transcription and file metadata on success
  static Future<(AudioTranscriptionResult?, Failure?)> uploadAudioFile(
    File audioFile, {
    Function(int sent, int total)? onProgress,
  }) async {
    try {
      // Validate file exists
      if (!await audioFile.exists()) {
        return (
          null,
          Failure(
            message: "Audio file does not exist",
            errorType: ErrorType.invalidInput,
          ),
        );
      }

      // Validate file size (10MB limit to match backend)
      final fileSize = await audioFile.length();
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileSize > maxSize) {
        return (
          null,
          Failure(
            message: "File too large. Maximum size is 10MB",
            errorType: ErrorType.invalidInput,
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
        Failure(
          message: "Failed to upload audio: ${e.toString()}",
          errorType: ErrorType.unKnownError,
        ),
      );
    }
  }

  static Future<(Map<String, dynamic>?, Failure?)>
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

  /// Validate audio file format
  static bool isValidAudioFile(File file) {
    final validExtensions = ['.wav', '.mp3', '.webm', '.ogg', '.m4a', '.aac'];
    final fileName = file.path.toLowerCase();

    return validExtensions.any((ext) => fileName.endsWith(ext));
  }

  /// Get human readable file size
  static String getFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    } else {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
  }
}
