import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class ValueListenableBuilder3<A, B, C> extends StatelessWidget {
  const ValueListenableBuilder3({
    required this.first,
    required this.second,
    required this.third,
    super.key,
    required this.builder,
    this.child,
  });

  final ValueListenable<A> first;
  final ValueListenable<B> second;
  final ValueListenable<C> third;
  final Widget? child;
  final Widget Function(BuildContext context, A a, B b, C c, Widget? child)
  builder;

  @override
  Widget build(BuildContext context) => ValueListenableBuilder<A>(
    valueListenable: first,
    builder: (context, a, _) {
      return ValueListenableBuilder<B>(
        valueListenable: second,
        builder: (context, b, _) {
          return ValueListenableBuilder<C>(
            valueListenable: third,
            builder: (context, c, _) {
              return builder(context, a, b, c, child);
            },
          );
        },
      );
    },
  );
}
