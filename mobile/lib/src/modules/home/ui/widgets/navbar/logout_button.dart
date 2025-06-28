import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';

class LogoutButton extends StatelessWidget {
  const LogoutButton({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      padding: EdgeInsets.zero,
      icon: const Icon(SolarBoldIcons.logout, size: 20),
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
    );
  }
}
