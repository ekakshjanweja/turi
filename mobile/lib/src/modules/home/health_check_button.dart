import 'package:flutter/material.dart';
import 'package:turi_mobile/src/core/services/api/api.dart';
import '../../core/services/api/models/method_type.dart';

class HealthCheckButton extends StatelessWidget {
  const HealthCheckButton({super.key});

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: () async {
        final (res, err) = await Api.sendRequest(
          "/health",
          method: MethodType.get,
        );

        if (err != null) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(SnackBar(content: Text(err.message)));
          return;
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Health Check: ${res.toString()}")),
        );
      },
      child: Text("Health Check"),
    );
  }
}
