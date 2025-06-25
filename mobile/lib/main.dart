import 'package:flutter/widgets.dart';
import 'package:turi_mobile/src/app.dart';
import 'package:turi_mobile/src/core/services/local_stoage/kv_store.dart';

void main(List<String> args) async {
  WidgetsFlutterBinding.ensureInitialized();
  await bootstrap();
  runApp(const TuriApp());
}

Future<void> bootstrap() async {
  await KVStore.init();
}
