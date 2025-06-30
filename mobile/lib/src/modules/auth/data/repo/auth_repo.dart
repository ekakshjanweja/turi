import 'dart:developer';
import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:turi_mail/src/core/config/config.dart';
import 'package:turi_mail/src/core/services/api/enums/error_type.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/core/services/api/api.dart' as api_service;
import 'package:turi_mail/src/core/services/api/models/method_type.dart'
    as api_service_method_type;

class AuthRepo {
  static final betterAuthClient = BetterAuth.instance.client;

  static final List<String> scopes = <String>[
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://mail.google.com/",
  ];

  static final GoogleSignIn googleSignIn = GoogleSignIn(
    // clientId: AppConfig.googleAndroidClientId,
    serverClientId: AppConfig.googleServerClientId,
    scopes: scopes,
  );

  static Future<void> initialize() async {
    try {} catch (e) {
      log("Failed to initialize Google Sign-In: ${e.toString()}", error: e);
    }
  }

  static Future<(User?, Failure?)> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? user = await googleSignIn.signIn();

      if (user == null) {
        return (
          null,
          Failure(
            errorType: ErrorType.googleSignInError,
            message: "Google Sign-In cancelled or failed",
          ),
        );
      }

      final GoogleSignInAuthentication googleAuth = await user.authentication;

      final idToken = googleAuth.idToken;
      final accessToken = googleAuth.accessToken;

      if (idToken == null) {
        return (
          null,
          Failure(
            errorType: ErrorType.googleSignInError,
            message: "Google Sign-In ID Token is null",
          ),
        );
      }

      if (accessToken == null) {
        return (
          null,
          Failure(
            errorType: ErrorType.googleSignInError,
            message: "Google Sign-In Access Token is null",
          ),
        );
      }

      final (result, error) = await betterAuthClient.signInWithIdToken(
        provider: SocialProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      if (error != null) {
        return (
          null,
          Failure(
            errorType: ErrorType.betterAuthError,
            message: error.code.message,
          ),
        );
      }

      if (result == null) {
        return (
          null,
          Failure(
            errorType: ErrorType.betterAuthError,
            message: "Better Auth User is null",
          ),
        );
      }

      return (result, null);
    } catch (e) {
      return (
        null,
        Failure(errorType: ErrorType.unKnownError, message: e.toString()),
      );
    }
  }

  static Future<((Session?, User?)?, Failure?)> getSession() async {
    try {
      final (result, error) = await betterAuthClient.getSession();

      if (error != null) {
        return (
          null,
          Failure(
            errorType: ErrorType.betterAuthError,
            message: error.code.message,
          ),
        );
      }

      return (result, null);
    } catch (e) {
      return (
        (null, null),
        Failure(errorType: ErrorType.unKnownError, message: e.toString()),
      );
    }
  }

  static Future<Failure?> signOut() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));

      await googleSignIn.signOut();

      final error = await betterAuthClient.signOut();

      if (error != null) {
        return Failure(
          errorType: ErrorType.betterAuthError,
          message: error.code.message,
        );
      }

      return null;
    } catch (e) {
      return Failure(errorType: ErrorType.unKnownError, message: e.toString());
    }
  }

  static Future<Failure?> deleteUser() async {
    try {
      final (result, error) = await api_service.Api.sendRequest(
        "/delete",
        method: api_service_method_type.MethodType.get,
      );

      if (error != null) {
        return Failure(
          errorType: ErrorType.failedToDeleteUser,
          message: error.message,
        );
      }

      return null;
    } catch (e) {
      return Failure(errorType: ErrorType.unKnownError, message: e.toString());
    }
  }
}
