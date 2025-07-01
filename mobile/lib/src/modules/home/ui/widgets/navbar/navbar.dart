import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/constants/app_assets.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/status_button.dart';
import 'package:turi_mail/src/core/ui/user_avatar/user_avatar.dart';

class Navbar extends StatelessWidget implements PreferredSizeWidget {
  const Navbar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leadingWidth: 36,
      title: Padding(
        padding: const EdgeInsets.only(left: 12),
        child: Image.asset(
          context.isDarkMode ? AppAssets.logodark : AppAssets.logolight,
          height: 20,
        ),
      ),
      // automaticallyImplyLeading: false,
      actions: [StatusButton(), UserAvatar(isNavbar: true)],
    );
  }
}
