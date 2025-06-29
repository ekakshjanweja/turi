import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class ProfileTile extends StatelessWidget {
  const ProfileTile({
    super.key,
    this.isRed = false,
    required this.title,
    this.subtitle,
    required this.icon,
    required this.onTap,
    this.trailing,
    this.isLoading = false,
  });

  final bool isRed;
  final String title;
  final String? subtitle;
  final IconData icon;
  final VoidCallback onTap;
  final Widget? trailing;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Container(
        decoration: BoxDecoration(
          color: context.colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isRed
                ? context.colorScheme.error.withValues(alpha: 0.3)
                : context.colorScheme.outline.withValues(alpha: 0.1),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                height: 32,
                width: 32,
                decoration: BoxDecoration(
                  color: isRed
                      ? context.colorScheme.error.withValues(alpha: 0.1)
                      : context.colorScheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(
                  icon,
                  size: 16,
                  color: isRed
                      ? context.colorScheme.error
                      : context.colorScheme.primary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 2,
                  children: [
                    Text(
                      title,
                      style: context.textTheme.bodyMedium.copyWith(
                        color: isRed ? context.colorScheme.error : null,
                      ),
                    ),
                    if (subtitle != null)
                      Text(subtitle!, style: context.textTheme.bodySmall),
                  ],
                ),
              ),
              if (trailing != null && !isLoading) trailing!,
              if (isLoading)
                SizedBox(
                  height: 20,
                  width: 20,
                  child: const CircularProgressIndicator(),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
