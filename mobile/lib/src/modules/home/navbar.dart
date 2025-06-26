import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mobile/src/core/utils/extensions.dart';
import 'package:turi_mobile/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mobile/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mobile/src/modules/home/theme_mode_bottomsheet.dart';

class Navbar extends StatelessWidget implements PreferredSizeWidget {
  const Navbar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Padding(
        padding: const EdgeInsets.only(left: 12),
        child: Text('Turi', style: context.textTheme.titleSmall),
      ),
      actions: [
        IconButton(
          padding: EdgeInsets.zero,
          icon: Icon(
            context.isDarkMode ? Icons.brightness_5 : Icons.brightness_3,
            size: 16,
          ),
          onPressed: () {
            showModalBottomSheet(
              context: context,
              builder: (context) => const ThemeModeBottomSheet(),
            );
          },
        ),
        IconButton(
          padding: EdgeInsets.zero,
          icon: const Icon(Icons.logout, size: 16),
          onPressed: () async {
            final ap = context.read<AuthProvider>();

            final error = await ap.signOut();

            if (error != null) {
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(SnackBar(content: Text(error.message)));
              return;
            }

            context.go(AuthPage.routeName);
          },
        ),
      ],
    );
  }
}
