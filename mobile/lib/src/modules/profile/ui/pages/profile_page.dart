import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/core/services/local_stoage/kv_store.dart';
import 'package:turi_mail/src/core/services/local_stoage/kv_store_keys.dart';
import 'package:turi_mail/src/modules/home/providers/chat_provider.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/navbar.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/delete_account_dialog.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/profile_header/profile_header.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/profile_header/profile_section_header.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/profile_header/profile_tile.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/core/theme/theme_notifier.dart';

class ProfilePage extends StatelessWidget {
  static const routeName = "/profile";
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: Navbar(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Header Card
            ProfileHeader(),

            const SizedBox(height: 24),

            // Settings Section
            ProfileSectionHeader(title: "Settings"),
            const SizedBox(height: 16),

            // Theme Settings Card
            ProfileTile(
              title: "Theme",
              icon: context.isDarkMode
                  ? SolarBoldIcons.sun
                  : SolarBoldIcons.moon,
              onTap: () {
                ThemeNotifier().setThemeMode(
                  context.isDarkMode ? ThemeMode.light : ThemeMode.dark,
                );
              },
              trailing: Text(context.isDarkMode ? "Dark mode" : "Light mode"),
            ),

            const SizedBox(height: 12),

            Consumer<ChatProvider>(
              builder: (context, cp, _) {
                return ProfileTile(
                  title: "Audio Inputs",
                  icon: cp.audioEnabled
                      ? SolarBoldIcons.volume
                      : SolarBoldIcons.muted,
                  onTap: () async {
                    cp.audioEnabled = !cp.audioEnabled;
                    await KVStore.set(
                      KVStoreKeys.audioEnabled,
                      cp.audioEnabled,
                    );
                  },
                  trailing: Text(cp.audioEnabled ? "Enabled" : "Disabled"),
                );
              },
            ),

            const SizedBox(height: 24),

            // Account Section
            ProfileSectionHeader(title: "Account"),

            const SizedBox(height: 16),

            Consumer<AuthProvider>(
              builder: (context, ap, _) {
                return ProfileTile(
                  isLoading: ap.isSigningOut,
                  title: "Sign Out",
                  icon: SolarBoldIcons.logout,
                  onTap: () async {
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
                  trailing: Icon(
                    Icons.chevron_right,
                    color: context.colorScheme.onSurfaceVariant,
                  ),
                );
              },
            ),

            const SizedBox(height: 12),

            ProfileTile(
              isRed: true,
              title: "Delete Account",
              icon: SolarBoldIcons.trashBin,
              onTap: () {
                showDialog(
                  context: context,
                  builder: (context) => const DeleteAccountDialog(),
                );
              },
              trailing: Icon(
                Icons.chevron_right,
                color: context.colorScheme.error,
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
