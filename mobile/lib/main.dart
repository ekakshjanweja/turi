import 'package:better_auth_flutter/better_auth_flutter.dart' as better_auth;
import 'package:flutter/widgets.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:turi_mobile/src/app.dart';
import 'package:turi_mobile/src/core/config/config.dart';
import 'package:turi_mobile/src/core/services/api/api.dart';
import 'package:turi_mobile/src/core/services/api/sse.dart';
import 'package:turi_mobile/src/core/services/local_stoage/kv_store.dart';
import 'package:turi_mobile/src/modules/auth/data/repo/auth_repo.dart';
import 'package:turi_mobile/src/modules/auth/provider/auth_provider.dart';

void main(List<String> args) async {
  WidgetsFlutterBinding.ensureInitialized();
  await bootstrap();
  runApp(
    MultiProvider(
      providers: [ChangeNotifierProvider(create: (_) => AuthProvider())],
      child: const TuriApp(),
    ),
  );
}

Future<void> bootstrap() async {
  await dotenv.load(fileName: ".env");
  await better_auth.BetterAuth.init(
    baseUrl: Uri(
      scheme: AppConfig.scheme,
      host: AppConfig.host,
      port: AppConfig.port,
    ),
  );
  await Api.init();
  await Sse.init();
  await KVStore.init();
  await AuthRepo.initialize();
}
