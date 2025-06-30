import 'dart:convert';
import 'dart:developer';

import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:turi_mail/src/core/config/config.dart';
import 'package:turi_mail/src/core/services/api/enums/error_type.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';

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

  static Future<(String?, Failure?)> requestDeleteUser() async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));

      final (result, error) = await betterAuthClient.deleteUser();

      if (error != null) {
        return (
          null,
          Failure(
            errorType: ErrorType.betterAuthError,
            message: error.code.message,
          ),
        );
      }

      return ("Verification code sent to your email", null);
    } catch (e) {
      return (
        null,
        Failure(errorType: ErrorType.unKnownError, message: e.toString()),
      );
    }
  }

  static Future<(String?, Failure?)> verifyDeleteUser(String otp) async {
    try {
      await Future.delayed(const Duration(milliseconds: 500));

      // Get the session to include authorization headers
      final (session, sessionError) = await betterAuthClient.getSession();
      if (sessionError != null || session == null) {
        return (
          null,
          Failure(
            errorType: ErrorType.betterAuthError,
            message: "Session not found",
          ),
        );
      }

      final sessionToken = session.$1?.token;
      if (sessionToken == null) {
        return (
          null,
          Failure(
            errorType: ErrorType.betterAuthError,
            message: "Session token not found",
          ),
        );
      }

      // Construct backend URL
      final port = AppConfig.port != null ? ':${AppConfig.port}' : '';
      final backendUrl = '${AppConfig.scheme}://${AppConfig.host}$port';

      final response = await http.post(
        Uri.parse("$backendUrl/api/auth/verify-delete-otp"),
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'better-auth.session_token=$sessionToken',
        },
        body: jsonEncode({"otp": otp}),
      );

      if (response.statusCode == 200) {
        await googleSignIn.signOut();
        final responseData = jsonDecode(response.body);
        return (responseData['message'] as String? ?? "Account deleted successfully", null);
      } else {
        final errorData = jsonDecode(response.body);
        return (
          null,
          Failure(
            errorType: ErrorType.betterAuthError,
            message: errorData['error'] as String? ?? "Failed to verify OTP",
          ),
        );
      }
    } catch (e) {
      return (
        null,
        Failure(errorType: ErrorType.unKnownError, message: e.toString()),
      );
    }
  }
}
