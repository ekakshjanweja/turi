import 'dart:developer';
import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:google_sign_in_platform_interface/google_sign_in_platform_interface.dart';
import 'package:turi_mail/src/core/config/config.dart';
import 'package:turi_mail/src/core/services/api/api.dart';
import 'package:turi_mail/src/core/services/api/enums/error_code.dart';
import 'package:turi_mail/src/core/services/api/models/api_failure.dart';
import 'package:turi_mail/src/core/services/api/models/method_type.dart';

class AuthRepo {
  static final BetterAuthClient _client = BetterAuthFlutter.client;

  static final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  static final List<String> scopes = <String>[
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://mail.google.com/",
  ];

  static Future<void> initialize() async {
    try {
      await _googleSignIn.initialize(
        serverClientId: AppConfig.googleServerClientId,
      );
    } catch (e) {
      log("Failed to initialize Google Sign-In: ${e.toString()}", error: e);
    }
  }

  static Future<(SignInSocialResponse?, ApiFailure?)> signInWithGoogle() async {
    try {
      final GoogleSignInAccount user = await _googleSignIn.authenticate(
        scopeHint: scopes,
      );

      final GoogleSignInAuthentication authentication = user.authentication;

      final String? idToken = authentication.idToken;

      if (idToken == null) {
        return (
          null,
          ApiFailure.fromErrorCode(errorType: ErrorCode.idTokenIsNull),
        );
      }

      final accessToken = await _getAccessToken(user);

      if (accessToken == null) {
        return (
          null,
          ApiFailure.fromErrorCode(errorType: ErrorCode.accessTokenIsNull),
        );
      }

      final response = await _client.signIn.social(
        request: SignInSocialRequest(
          provider: SocialProvider.google,
          idToken: SocialIdTokenBody(token: idToken, accessToken: accessToken),
          scopes: scopes,
        ),
      );

      if (response.error != null) {
        return (
          null,
          ApiFailure(
            message: response.error!.message,
            code: response.error!.code,
          ),
        );
      }

      return (response.data, null);
    } on GoogleSignInException catch (e) {
      return (
        null,
        ApiFailure.fromErrorCode(
          errorType: ErrorCode.googleSignInError,
          message: e.toString(),
        ),
      );
    } catch (e) {
      return (
        null,
        ApiFailure.fromErrorCode(
          errorType: ErrorCode.unKnownError,
          message: e.toString(),
        ),
      );
    }
  }

  static Future<String?> _getAccessToken(GoogleSignInAccount user) async {
    final ClientAuthorizationTokenData? tokens = await GoogleSignInPlatform
        .instance
        .clientAuthorizationTokensForScopes(
          ClientAuthorizationTokensForScopesParameters(
            request: AuthorizationRequestDetails(
              scopes: scopes,
              userId: user.id,
              email: user.email,
              promptIfUnauthorized: false,
            ),
          ),
        );

    if (tokens == null) {
      final GoogleSignInClientAuthorization authorization = await user
          .authorizationClient
          .authorizeScopes(scopes);

      return authorization.accessToken;
    }

    return tokens.accessToken;
  }

  static Future<(SessionResponse?, ApiFailure?)> getSession() async {
    try {
      final response = await _client.getSession();

      if (response.error != null) {
        return (
          null,
          ApiFailure(
            message: response.error!.message,
            code: response.error!.code,
          ),
        );
      }

      return (response.data, null);
    } catch (e) {
      return (
        null,
        ApiFailure.fromErrorCode(
          errorType: ErrorCode.unKnownError,
          message: e.toString(),
        ),
      );
    }
  }

  static Future<ApiFailure?> signOut() async {
    try {
      await _googleSignIn.signOut();

      final (result, error) = await Api.sendRequest(
        "/sign-out",
        method: MethodType.get,
      );

      if (error != null) {
        return ApiFailure.fromErrorCode(
          errorType: ErrorCode.failedToSignOut,
          message: error.message,
        );
      }

      log("Sign out response: $result");

      return null;
    } catch (e) {
      log("Error signing out: ${e.toString()}", error: e);
      return ApiFailure.fromErrorCode(
        errorType: ErrorCode.unKnownError,
        message: e.toString(),
      );
    }
  }

  static Future<ApiFailure?> deleteUser() async {
    try {
      final (result, error) = await Api.sendRequest(
        "/delete",
        method: MethodType.get,
      );

      if (error != null) {
        return ApiFailure.fromErrorCode(
          errorType: ErrorCode.failedToDeleteUser,
          message: error.message,
        );
      }

      return null;
    } catch (e) {
      return ApiFailure.fromErrorCode(
        errorType: ErrorCode.unKnownError,
        message: e.toString(),
      );
    }
  }
}
