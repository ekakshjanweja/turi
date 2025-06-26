import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mobile/src/core/utils/extensions.dart';
import 'package:turi_mobile/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mobile/src/modules/home/home_page.dart';

class AuthPage extends StatefulWidget {
  static const String routeName = '/auth';
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            Text(
              'Welcome\nto Turi',
              style: context.textTheme.displaySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () async {
                final ap = context.read<AuthProvider>();

                final error = await ap.onAuth();

                if (error != null) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(error.message)));
                  log("Auth error: ${error.message}", error: error);
                  return;
                }

                context.go(HomePage.routeName);
              },
              child: const Text('Sign In With Google'),
            ),
          ],
        ),
      ),
    );
  }
}
