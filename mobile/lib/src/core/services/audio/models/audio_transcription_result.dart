import 'dart:convert';

class AudioTranscriptionResult {
  final String transcription;
  final String message;
  final String fileName;
  final int fileSize;
  final String fileType;

  AudioTranscriptionResult({
    required this.transcription,
    required this.message,
    required this.fileName,
    required this.fileSize,
    required this.fileType,
  });

  factory AudioTranscriptionResult.fromMap(Map<String, dynamic> map) {
    return AudioTranscriptionResult(
      transcription: map['transcription'] as String,
      message: map['message'] as String,
      fileName: map['fileName'] as String,
      fileSize: map['fileSize'] as int,
      fileType: map['fileType'] as String,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'transcription': transcription,
      'message': message,
      'fileName': fileName,
      'fileSize': fileSize,
      'fileType': fileType,
    };
  }

  factory AudioTranscriptionResult.fromJson(String source) {
    return AudioTranscriptionResult.fromMap(jsonDecode(source));
  }

  String toJson() {
    return jsonEncode(toMap());
  }
}
