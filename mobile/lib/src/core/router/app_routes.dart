import 'package:go_router/go_router.dart';
import 'package:turi_mobile/src/modules/home/home_page.dart';

class AppRoutes {
  static const String initialRoute = HomePage.routeName;
  static const List<String> publicRoutes = [];

  static final List<RouteBase> routes = [
    GoRoute(
      path: HomePage.routeName,
      name: HomePage.routeName,
      builder: (context, state) => HomePage(),
    ),
  ];
}
