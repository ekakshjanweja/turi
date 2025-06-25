import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:test_app/auth_repo.dart';

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  ValueNotifier<User?> userNotifier = ValueNotifier<User?>(null);

  @override
  void dispose() {
    userNotifier.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          spacing: 16,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            FilledButton(
              onPressed: () async {
                final (result, error) = await AuthRepo.signInWithGoogle();

                if (error != null) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(error.message)));
                  return;
                }

                if (result == null) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text("No user signed in")));
                  return;
                }

                userNotifier.value = result;
              },
              child: Text("sign in with google"),
            ),
            ValueListenableBuilder(
              valueListenable: userNotifier,
              builder: (context, user, _) {
                if (user == null) {
                  return Text("No user signed in");
                }

                return Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(user.toJson()),
                );
              },
            ),

            FilledButton(
              onPressed: () async {
                final error = await AuthRepo.signOut();

                if (error != null) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(error.message)));
                  return;
                }

                userNotifier.value = null;
              },
              child: Text("sign out"),
            ),

            FilledButton(
              onPressed: () async {
                final (result, error) = await AuthRepo.getSession();

                if (error != null) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text(error.message)));
                  return;
                }

                if (result == null) {
                  ScaffoldMessenger.of(
                    context,
                  ).showSnackBar(SnackBar(content: Text("No session found")));
                  return;
                }

                ScaffoldMessenger.of(
                  context,
                ).showSnackBar(SnackBar(content: Text(result.toJson())));
              },
              child: Text("get session"),
            ),
          ],
        ),
      ),
    );
  }
}
