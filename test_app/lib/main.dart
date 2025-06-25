import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:test_app/home.dart';

void main(List<String> args) {
  WidgetsFlutterBinding.ensureInitialized();
  BetterAuth.init(baseUrl: Uri.parse("https://turi.jekaksh.workers.dev"));
  runApp(const App());
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(title: "Turi", home: Home());
  }
}
