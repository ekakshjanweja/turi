import 'dart:developer';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:native_audio_trimmer/native_audio_trimmer.dart';

class AudioUtils {
  static Future<void> clearRecordingsFolder() async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final recordingsDir = Directory("${dir.path}/recordings");

      if (await recordingsDir.exists()) {
        // Delete all files in the recordings directory
        await for (final entity in recordingsDir.list()) {
          if (entity is File) {
            await entity.delete();
          }
        }
      } else {
        await recordingsDir.create(recursive: true);
      }
    } catch (e) {
      log('Error clearing recordings folder: $e');
    }
  }

  static Future<File?> trimAudio({
    required File file,
    required DateTime startTime,
    required DateTime trimStartTime,
    required DateTime trimEndTime,
  }) async {
    try {
      final dir = await getApplicationDocumentsDirectory();
      final recordingsDir = Directory("${dir.path}/recordings");

      // Ensure the recordings directory exists
      if (!await recordingsDir.exists()) {
        await recordingsDir.create(recursive: true);
      }

      final outputPath =
          "${dir.path}/trimmed_${DateTime.now().millisecondsSinceEpoch}.m4a";

      final startTimeSeconds = trimStartTime
          .difference(startTime)
          .inSeconds
          .toDouble();
      final endTimeSeconds = trimEndTime
          .difference(startTime)
          .inSeconds
          .toDouble();

      log("Trimming audio: start=${startTimeSeconds}s, end=${endTimeSeconds}s");

      // Validate timing
      if (startTimeSeconds < 0 || endTimeSeconds <= startTimeSeconds) {
        log("Invalid timing for trimming, skipping trim");
        return file; // Return original file if timing is invalid
      }

      final trimmedFilePath = await NativeAudioTrimmer.trimAudio(
        inputPath: file.path,
        outputPath: outputPath,
        startTimeInSeconds: startTimeSeconds,
        endTimeInSeconds: endTimeSeconds,
      );

      final trimmedFile = File(trimmedFilePath);
      if (await trimmedFile.exists()) {
        log("Audio trimmed successfully: ${trimmedFile.path}");
        return trimmedFile;
      } else {
        log("Trimmed file does not exist, returning original");
        return file;
      }
    } catch (e) {
      log("Error trimming audio: $e");
      return file; // Return original file on error instead of null
    }
  }
}
