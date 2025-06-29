import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class ProfileSectionHeader extends StatelessWidget {
  final String title;
  const ProfileSectionHeader({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(title, style: context.textTheme.titleSmall);
  }
}
