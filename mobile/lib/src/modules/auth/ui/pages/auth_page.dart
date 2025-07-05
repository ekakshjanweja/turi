import 'dart:developer';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/constants/app_assets.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/home/ui/pages/home_page.dart';

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
      body: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Center(
          child: Column(
            children: [
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Image.asset(
                      context.isDarkMode
                          ? AppAssets.logodark
                          : AppAssets.logolight,
                      height: 64,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Effortless email, just say it.",
                      style: context.textTheme.titleMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),

              SafeArea(
                child: Consumer<AuthProvider>(
                  builder: (context, ap, _) {
                    if (ap.isLoading) {
                      return SizedBox(
                        height: 20,
                        width: 20,
                        child: const CircularProgressIndicator(),
                      );
                    } else {
                      return FilledButton(
                        onPressed: ap.isLoading
                            ? null
                            : () async {
                                final ap = context.read<AuthProvider>();

                                final error = await ap.onAuth();

                                if (error != null) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(error.message)),
                                  );
                                  log(
                                    "Auth error: ${error.message}",
                                    error: error,
                                  );
                                  return;
                                }

                                context.go(HomePage.routeName);
                              },
                        child: const Text('Sign In With Google'),
                      );
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
