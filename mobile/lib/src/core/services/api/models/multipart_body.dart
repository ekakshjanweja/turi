import 'dart:io';

class MultipartBody {
  final Map<String, dynamic> fields;
  final List<MultipartFile> files;

  MultipartBody({this.fields = const {}, this.files = const []});
}

class MultipartFile {
  final String field;
  final File file;
  final String? filename;

  MultipartFile({required this.field, required this.file, this.filename});
}
