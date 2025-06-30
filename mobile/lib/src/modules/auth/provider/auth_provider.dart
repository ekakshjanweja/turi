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

  bool _isLoading = false;
  bool get isLoading => _isLoading;
  set isLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  bool _isDeleting = false;
  bool get isDeleting => _isDeleting;
  set isDeleting(bool value) {
    _isDeleting = value;
    notifyListeners();
  }

  bool _isSigningOut = false;
  bool get isSigningOut => _isSigningOut;
  set isSigningOut(bool value) {
    _isSigningOut = value;
    notifyListeners();
  }

  Future<Failure?> onAuth() async {
    isLoading = true;
    final (result, error) = await AuthRepo.signInWithGoogle();

    if (error != null) {
      await signOut();
      isLoading = false;
      return error;
    }

    user = result;
    isLoading = false;
    return null;
  }

  Future<Failure?> getSession() async {
    isLoading = true;
    final (result, error) = await AuthRepo.getSession();

    if (error != null) {
      isLoading = false;
      return error;
    }

    final (s, u) = result!;
    session = s;
    user = u;
    isLoading = false;
    return null;
  }

  Future<Failure?> signOut() async {
    isSigningOut = true;
    final error = await AuthRepo.signOut();

    if (error != null) {
      isSigningOut = false;
      return Failure(
        errorType: ErrorType.betterAuthError,
        message: error.message,
      );
    }

    user = null;
    session = null;
    isSigningOut = false;
    return null;
  }

  Future<(String?, Failure?)> requestDeleteUser() async {
    isDeleting = true;

    final (result, error) = await AuthRepo.requestDeleteUser();

    if (error != null) {
      isDeleting = false;
      return (null, error);
    }

    isDeleting = false;
    return (result, null);
  }
}
