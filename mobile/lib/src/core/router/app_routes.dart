import 'package:go_router/go_router.dart';
import 'package:turi_mail/src/modules/auth/ui/pages/auth_page.dart';
import 'package:turi_mail/src/modules/home/ui/pages/home_page.dart';

class AppRoutes {
  static const String initialRoute = AuthPage.routeName;
  static const List<String> publicRoutes = [AuthPage.routeName];

  static final List<RouteBase> routes = [
    GoRoute(
      path: HomePage.routeName,
      name: HomePage.routeName,
      builder: (context, state) => HomePage(),
    ),
    GoRoute(
      path: AuthPage.routeName,
      name: AuthPage.routeName,
      builder: (context, state) => AuthPage(),
    ),
  ];
}
