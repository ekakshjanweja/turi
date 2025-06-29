import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/utils/extensions.dart';

class Fade extends StatelessWidget {
  final Widget child;
  final bool fadeTop;
  final bool fadeBottom;
  final double fadeHeight;
  final double fadeStrength; // 0.0 (no fade) to 1.0 (strong fade)
  final Curve fadeCurve; // Easing curve for fade transition
  final int fadeSteps; // Number of gradient steps for smoother fade

  const Fade({
    super.key,
    required this.child,
    this.fadeTop = true,
    this.fadeBottom = false,
    this.fadeHeight = 0.2, // 20% of the content height
    this.fadeStrength = 1.0,
    this.fadeCurve = Curves.easeOutCubic,
    this.fadeSteps = 5,
  });

  @override
  Widget build(BuildContext context) {
    List<double> stops;
    List<Color> colors;

    final fadeColor = context.colorScheme.primary;

    // Create smooth easing curve for more natural fade transition
    final fadeStart = fadeHeight * 0.3; // Start fade earlier
    final fadeEnd = fadeHeight;

    if (fadeTop && fadeBottom) {
      // Both top and bottom fade with smooth curves
      stops = [0.0, fadeStart, fadeEnd, 1.0 - fadeEnd, 1.0 - fadeStart, 1.0];
      colors = [
        Colors.transparent,
        fadeColor.withAlpha((fadeStrength * 0.1 * 255).round()),
        fadeColor.withAlpha((fadeStrength * 0.8 * 255).round()),
        fadeColor.withAlpha((fadeStrength * 0.8 * 255).round()),
        fadeColor.withAlpha((fadeStrength * 0.1 * 255).round()),
        Colors.transparent,
      ];
    } else if (fadeTop) {
      // Only top fade with smooth curve
      stops = [0.0, fadeStart, fadeEnd, 1.0];
      colors = [
        Colors.transparent,
        fadeColor.withAlpha((fadeStrength * 0.1 * 255).round()),
        fadeColor.withAlpha((fadeStrength * 0.9 * 255).round()),
        fadeColor,
      ];
    } else if (fadeBottom) {
      // Only bottom fade with smooth curve
      stops = [0.0, 1.0 - fadeEnd, 1.0 - fadeStart, 1.0];
      colors = [
        fadeColor,
        fadeColor.withAlpha((fadeStrength * 0.9 * 255).round()),
        fadeColor.withAlpha((fadeStrength * 0.1 * 255).round()),
        Colors.transparent,
      ];
    } else {
      // No fade, return child as is
      return child;
    }

    return ShaderMask(
      shaderCallback: (bounds) {
        return LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: colors,
          stops: stops,
          tileMode: TileMode.clamp,
        ).createShader(bounds);
      },
      blendMode: BlendMode.dstIn,
      child: child,
    );
  }
}
