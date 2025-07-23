import 'dart:convert';

import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:turi_mail/src/core/services/api/enums/error_code.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/core/services/local_storage/kv_store.dart';
import 'package:turi_mail/src/core/services/local_storage/kv_store_keys.dart';
import 'package:turi_mail/src/modules/auth/data/repo/auth_repo.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider() {
    final sessionCache = KVStore.get<String>(KVStoreKeys.session);

    if (sessionCache != null) {
      final sessionData = SessionResponse.fromJson(jsonDecode(sessionCache));
      session = sessionData.session;
      user = sessionData.user;
    }
  }

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

  Future<ApiFailure?> onAuth({GoogleSignInAuthenticationEvent? event}) async {
    isLoading = true;
    final (result, error) = event != null
        ? await AuthRepo.signInWithGoogleAuthenticationEvent(event: event)
        : await AuthRepo.signInWithGoogle();

    if (error != null) {
      await signOut();
      isLoading = false;
      return error;
    }

    final err = await getSession();

    if (err != null) {
      isLoading = false;
      return err;
    }

    isLoading = false;
    return null;
  }

  Future<ApiFailure?> getSession() async {
    isLoading = true;

    final (result, error) = await AuthRepo.getSession();

    if (error != null) {
      isLoading = false;
      return error;
    }

    if (result == null) {
      return ApiFailure.fromErrorCode(errorType: ErrorCode.unAuthorized);
    }

    await KVStore.set(KVStoreKeys.session, jsonEncode(result.toJson()));

    session = result.session;
    user = result.user;

    isLoading = false;
    return null;
  }

  Future<ApiFailure?> signOut() async {
    isSigningOut = true;
    final error = await AuthRepo.signOut();

    if (error != null) {
      isSigningOut = false;
      return ApiFailure.fromErrorCode(
        errorType: ErrorCode.betterAuthError,
        message: error.message,
      );
    }

    user = null;
    session = null;
    isSigningOut = false;
    await KVStore.clear();

    return null;
  }

  Future<ApiFailure?> deleteUser() async {
    isDeleting = true;

    final error = await AuthRepo.deleteUser();

    if (error != null) {
      isDeleting = false;
      return error;
    }

    isDeleting = false;
    return null;
  }
}
