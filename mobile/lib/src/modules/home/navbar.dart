import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:solar_icon_pack/solar_icon_pack.dart';
import 'package:turi_mail/src/core/constants/app_assets.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mail/src/modules/home/status_button.dart';
import 'package:turi_mail/src/modules/home/theme_mode_bottomsheet.dart';

class Navbar extends StatelessWidget implements PreferredSizeWidget {
  const Navbar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Padding(
        padding: const EdgeInsets.only(left: 12),
        child: Image.asset(
          context.isDarkMode ? AppAssets.logodark : AppAssets.logolight,
          height: 20,
        ),
      ),
      actions: [
        StatusButton(),
        IconButton(
          padding: EdgeInsets.zero,
          icon: Icon(
            context.isDarkMode ? SolarBoldIcons.sun : SolarBoldIcons.moon,
            size: 20,
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
        ),
      ],
    );
  }
}
