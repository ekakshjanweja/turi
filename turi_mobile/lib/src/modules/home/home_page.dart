import 'package:flutter/material.dart';
import 'package:turi_mobile/src/core/utils/extensions.dart';
import 'package:turi_mobile/src/modules/home/theme_mode_bottomsheet.dart';

class HomePage extends StatelessWidget {
  static const String routeName = '/home';

  const HomePage({super.key});

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
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  builder: (context) => const ThemeModeBottomSheet(),
                );
              },
              child: const Text('Switch Theme'),
            ),
          ],
        ),
      ),
    );
  }
}
