import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class Fade extends StatelessWidget {
  final bool isTop;
  final double height;
  final double fadeStrength; // 0.0 (transparent) to 1.0 (opaque)
  final bool reverse;

  const Fade({
    super.key,
    this.isTop = true,
    this.height = 32,
    this.fadeStrength = 0.9,
    this.reverse = false,
  });

  @override
  Widget build(BuildContext context) {
    final surface = context.colorScheme.surfaceBright;
    final stops = reverse ? [0.0, 0.7, 1.0] : [0.0, 0.3, 1.0];
    final colors = reverse
        ? [
            surface.withAlpha((0.0 * 255).round()),
            surface.withAlpha((fadeStrength * 0.5 * 255).round()),
            surface.withAlpha((fadeStrength * 255).round()),
          ]
        : [
            surface.withAlpha((fadeStrength * 255).round()),
            surface.withAlpha((fadeStrength * 0.5 * 255).round()),
            surface.withAlpha((0.0 * 255).round()),
          ];

    return Positioned(
      top: isTop ? 0 : null,
      left: 0,
      right: 0,
      bottom: isTop ? null : 0,
      child: IgnorePointer(
        child: Container(
          height: height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: isTop ? Alignment.topCenter : Alignment.bottomCenter,
              end: isTop ? Alignment.bottomCenter : Alignment.topCenter,
              colors: colors,
              stops: stops,
              tileMode: TileMode.mirror,
            ),
          ),
        ),
      ),
    );
  }
}
