import 'package:flutter/material.dart';
import 'package:solar_icon_pack/solar_bold_icons.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class UserAvatarFallback extends StatelessWidget {
  const UserAvatarFallback({
    super.key,
    this.name,
    this.isNavbar = false,
    required this.avatarSize,
    required this.iconSize,
  });

  final String? name;
  final bool isNavbar;
  final double avatarSize;
  final double iconSize;

  String getInitials(String? name) {
    if (name == null || name.isEmpty) return '';

    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    } else if (parts.isNotEmpty) {
      return parts[0][0].toUpperCase();
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final initials = getInitials(name);

    return Container(
      width: avatarSize,
      height: avatarSize,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [
            context.colorScheme.primary,
            context.colorScheme.primary.withAlpha(200),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: initials.isNotEmpty
            ? Text(
                initials,
                style: isNavbar
                    ? context.textTheme.labelLarge
                    : context.textTheme.titleSmall,
              )
            : Icon(
                SolarBoldIcons.user,
                size: iconSize,
                color: context.colorScheme.onPrimary,
              ),
      ),
    );
  }
}
