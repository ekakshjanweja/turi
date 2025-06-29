import 'package:flutter/material.dart';

class ThinkingIndicator extends StatefulWidget {
  const ThinkingIndicator({super.key});

  @override
  State<ThinkingIndicator> createState() => _ThinkingIndicatorState();
}

class _ThinkingIndicatorState extends State<ThinkingIndicator>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(_animationController);
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.primary.withAlpha(30),
                  Theme.of(context).colorScheme.tertiary.withAlpha(30),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Theme.of(context).colorScheme.outline.withAlpha(40),
                width: 1,
              ),
            ),
            child: AnimatedBuilder(
              animation: _animation,
              builder: (context, child) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildAnimatedDot(0),
                    const SizedBox(width: 4),
                    _buildAnimatedDot(1),
                    const SizedBox(width: 4),
                    _buildAnimatedDot(2),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimatedDot(int index) {
    final delay = index * 0.3;
    final animationValue = (_animation.value + delay) % 1.0;
    final opacity = (0.3 + (0.7 * (1 - (animationValue - 0.5).abs() * 2)))
        .clamp(0.0, 1.0);

    return Container(
      width: 6,
      height: 6,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(
              context,
            ).colorScheme.primary.withAlpha((255 * opacity).round()),
            Theme.of(
              context,
            ).colorScheme.tertiary.withAlpha((255 * opacity).round()),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
      ),
    );
  }
}
