import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/modules/home/ui/widgets/navbar/navbar.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/profile_header/profile_header.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/profile_header/profile_section_header.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/profile_header/profile_tile.dart';
import 'package:turi_mail/src/modules/profile/ui/widgets/otp_input_dialog.dart';
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

            Consumer<AuthProvider>(
              builder: (context, ap, _) {
                return ProfileTile(
                  isLoading: ap.isDeleting,
                  isRed: true,
                  title: "Delete Account",
                  icon: SolarBoldIcons.trashBin,
                  onTap: () async {
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text("Delete Account"),
                        content: const Text(
                          "Are you sure you want to delete your account? This action cannot be undone."
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text("Cancel"),
                          ),
                          FilledButton(
                            style: FilledButton.styleFrom(
                              backgroundColor: context.colorScheme.error,
                              foregroundColor: context.colorScheme.onError,
                            ),
                            onPressed: () => Navigator.of(context).pop(true),
                            child: const Text("Delete"),
                          ),
                        ],
                      ),
                    );

                    if (confirmed != true) return;

                    // Request deletion (sends OTP)
                    final ap = context.read<AuthProvider>();
                    final (message, error) = await ap.requestDeleteUser();

                    if (error != null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(error.message))
                      );
                      return;
                    }

                    if (message != null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(message))
                      );
                    }

                    // Show OTP input dialog
                    if (context.mounted) {
                      _showOtpDialog(context);
                    }
                  },
                  trailing: Icon(
                    Icons.chevron_right,
                    color: context.colorScheme.error,
                  ),
                );
              },
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  void _showOtpDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Consumer<AuthProvider>(
        builder: (context, ap, _) {
          return OtpInputDialog(
            title: "Verify Account Deletion",
            description: "Enter the 6-digit verification code sent to your email to confirm account deletion.",
            isLoading: ap.isDeleting,
            onVerify: (otp) async {
              final (message, error) = await ap.verifyDeleteUser(otp);
              
              if (error != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(error.message))
                );
                return;
              }

              // Close dialog and navigate to auth page
              Navigator.of(context).pop();
              
              if (message != null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(message))
                );
              }

              context.go(AuthPage.routeName);
            },
            onCancel: () {
              Navigator.of(context).pop();
            },
          );
        },
      ),
    );
  }
}
