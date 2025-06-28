import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:turi_mail/src/core/services/api/enums/error_type.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/modules/auth/data/repo/auth_repo.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider() {
    user = betterAuthClient.user;
    session = betterAuthClient.session;
  }

  static final BetterAuthClient betterAuthClient = BetterAuth.instance.client;

  User? _user;
  User? get user => _user;
  set user(User? value) {
    _user = value;
    notifyListeners();
  }

  Session? _session;
  Session? get session => _session;
  set session(Session? value) {
    _session = value;
    notifyListeners();
  }

  Future<Failure?> onAuth() async {
    final (result, error) = await AuthRepo.signInWithGoogle();

    if (error != null) {
      signOut();
      return error;
    }

    user = result;
    return null;
  }

  Future<Failure?> getSession() async {
    final (result, error) = await AuthRepo.getSession();

    if (error != null) return error;

    final (s, u) = result!;
    session = s;
    user = u;
    return null;
  }

  Future<Failure?> signOut() async {
    final error = await AuthRepo.signOut();

    if (error != null) {
      return Failure(
        errorType: ErrorType.betterAuthError,
        message: error.message,
      );
    }

    user = null;
    return null;
  }
}
