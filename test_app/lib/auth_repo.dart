import 'dart:developer';

import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthRepo {
  static final betterAuth = BetterAuth.instance.client;

  static final GoogleSignIn googleSignIn = GoogleSignIn(
    clientId:
        "119116600577-u66nh3m5son4cn6r12ncf4rsq6vj28nt.apps.googleusercontent.com",
    serverClientId:
        "119116600577-n7sh5uu8phcgbk3jttk68qoi19655i0o.apps.googleusercontent.com",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://mail.google.com/",
    ],
  );

  static Future<(User?, Failure?)> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleSignInAccount =
          await googleSignIn.signIn();

      if (googleSignInAccount == null) {
        log("Google sign in cancelled");
        return (
          null,
          Failure(code: BetterAuthError.unKnownError, message: "Cancelled"),
        );
      }

      final GoogleSignInAuthentication googleSignInAuthentication =
          await googleSignInAccount.authentication;

      final accessToken = googleSignInAuthentication.accessToken;
      final idToken = googleSignInAuthentication.idToken;

      if (accessToken == null) {
        log("Google access token is null");
        return (
          null,
          Failure(
            code: BetterAuthError.unKnownError,
            message: "Access token is null",
          ),
        );
      }

      if (idToken == null) {
        log("Google id token is null");
        return (
          null,
          Failure(
            code: BetterAuthError.unKnownError,
            message: "ID token is null",
          ),
        );
      }

      final (res, err) = await BetterAuth.instance.client.signInWithIdToken(
        provider: SocialProvider.google,
        idToken: idToken,
        accessToken: accessToken,
      );

      if (err != null) {
        log(err.message.toString());
        return (
          null,
          Failure(code: BetterAuthError.unKnownError, message: err.message),
        );
      }

      log(res.toString());

      if (res == null) {
        log("Sign in response is null");
        return (
          null,
          Failure(
            code: BetterAuthError.unKnownError,
            message: "Response is null",
          ),
        );
      }

      return (res, null);
    } catch (e) {
      return (
        null,
        Failure(code: BetterAuthError.unKnownError, message: e.toString()),
      );
    }
  }

  static Future<(Session?, Failure?)> getSession() async {
    try {
      final (result, error) = await betterAuth.getSession();

      if (error != null) return (null, error);

      if (result == null) {
        return (
          null,
          Failure(
            code: BetterAuthError.unKnownError,
            message: "No session found",
          ),
        );
      }

      return (result.$1, null);
    } catch (e) {
      return (
        null,
        Failure(code: BetterAuthError.unKnownError, message: e.toString()),
      );
    }
  }

  static Future<Failure?> signOut() async {
    try {
      await googleSignIn.signOut();
      final error = await betterAuth.signOut();

      if (error != null) return error;
      return null;
    } catch (e) {
      return Failure(code: BetterAuthError.unKnownError, message: e.toString());
    }
  }
}
