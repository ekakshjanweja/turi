import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:turi_mail/src/core/router/app_routes.dart';
import 'package:turi_mail/src/modules/auth/provider/auth_provider.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mail/src/modules/home/ui/pages/home_page.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: AppRoutes.initialRoute,
    routes: AppRoutes.routes,
    redirect: (context, state) async {
      final ap = context.read<AuthProvider>();

      final isLoggedIn = ap.user != null;
      final isPublicRoute = AppRoutes.publicRoutes.contains(
        state.matchedLocation,
      );

      if (!isLoggedIn && !isPublicRoute) {
        return AuthPage.routeName;
      }

      if (isLoggedIn && isPublicRoute) {
        return HomePage.routeName;
      }

      return null;
    },
  );
}
