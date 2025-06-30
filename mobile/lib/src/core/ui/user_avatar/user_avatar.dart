import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/ui/user_avatar/user_avatar_fallback.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/profile/ui/pages/profile_page.dart';

class UserAvatar extends StatelessWidget {
  final bool isNavbar;

  const UserAvatar({super.key, this.isNavbar = false});

  // Size configurations based on context
  double get avatarSize => isNavbar ? 32 : 96;
  double get iconSize => isNavbar ? 18 : 32;

  @override
  Widget build(BuildContext context) {
    final state = GoRouter.of(context).state;
    final isProfile = state.matchedLocation == ProfilePage.routeName;
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final user = authProvider.user;

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 8),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(avatarSize / 2),
              onTap: () {
                if (!isNavbar || isProfile) return;

                context.push(ProfilePage.routeName);
              },
              child: Container(
                width: avatarSize,
                height: avatarSize,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: context.colorScheme.outline.withAlpha(100),
                    width: 1.5,
                  ),
                ),
                child: ClipOval(
                  child: user?.image != null && user!.image!.isNotEmpty
                      ? Image.network(
                          user.image!,
                          width: avatarSize,
                          height: avatarSize,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return UserAvatarFallback(
                              name: user.name,
                              isNavbar: isNavbar,
                              avatarSize: avatarSize,
                              iconSize: iconSize,
                            );
                          },
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Container(
                              width: avatarSize,
                              height: avatarSize,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color:
                                    context.colorScheme.surfaceContainerHighest,
                              ),
                              child: Center(
                                child: SizedBox(
                                  width: avatarSize * 0.2,
                                  height: avatarSize * 0.2,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      context.colorScheme.primary,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        )
                      : UserAvatarFallback(
                          name: user?.name,
                          isNavbar: isNavbar,
                          avatarSize: avatarSize,
                          iconSize: iconSize,
                        ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
