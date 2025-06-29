import 'package:flutter/material.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/logout_button.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/navbar.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/theme_switcher_button.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/delete_account_button.dart';

class ProfilePage extends StatelessWidget {
  static const routeName = "/profile";
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: Navbar(),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ThemeSwitcherButton(),
            LogoutButton(),
            DeleteAccountButton(),
          ],
        ),
      ),
    );
  }
}
