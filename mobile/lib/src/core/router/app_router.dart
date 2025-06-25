import 'package:go_router/go_router.dart';
import 'package:turi_mobile/src/core/router/app_routes.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.initialRoute,
    routes: AppRoutes.routes,
    redirect: (context, state) async {
      return null;
    },
  );
}
