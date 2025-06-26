// import 'dart:developer';
// import 'package:better_auth_flutter/better_auth_flutter.dart';
// import 'package:google_sign_in/google_sign_in.dart';
// import 'package:google_sign_in_platform_interface/google_sign_in_platform_interface.dart';
// import 'package:turi_mobile/src/core/services/api/enums/error_type.dart';
// import 'package:turi_mobile/src/core/services/api/models/api_failure.dart';

// class AuthRepo {
//   static final betterAuth = BetterAuth.instance.client;

//   static final GoogleSignIn googleSignIn = GoogleSignIn.instance;

//   static final List<String> scopes = <String>[
//     "openid",
//     "email",
//     "profile",
//     "https://www.googleapis.com/auth/gmail.readonly",
//     "https://www.googleapis.com/auth/gmail.modify",
//     "https://mail.google.com/",
//   ];

//   static Future<void> initialize() async {
//     try {
//       await googleSignIn.initialize(
//         clientId:
//             '119116600577-u66nh3m5son4cn6r12ncf4rsq6vj28nt.apps.googleusercontent.com',
//         serverClientId:
//             '119116600577-n7sh5uu8phcgbk3jttk68qoi19655i0o.apps.googleusercontent.com',
//       );
//     } catch (e) {
//       log("Failed to initialize Google Sign-In: ${e.toString()}", error: e);
//     }
//   }

//   static Future<(User?, Failure?)> signInWithGoogle() async {
//     try {
//       log("Starting Google Sign-In", name: "AuthRepo");
//       final GoogleSignInAccount user = await googleSignIn.authenticate(
//         scopeHint: scopes,
//       );
//       log("Google Sign-In successful: ${user.email}", name: "AuthRepo");

//       final GoogleSignInServerAuthorization? serverAuthorization = await user
//           .authorizationClient
//           .authorizeServer(scopes);

//       if (serverAuthorization == null) {
//         return (
//           null,
//           Failure(
//             errorType: ErrorType.googleSignInError,
//             message: "Failed to authorize with Google server",
//           ),
//         );
//       }

//       final String serverAuthCode = serverAuthorization.serverAuthCode;

//       final accessToken = await _getAccessToken(user);

//       if (accessToken == null) {
//         return (
//           null,
//           Failure(
//             errorType: ErrorType.googleSignInError,
//             message: "Failed to retrieve access token",
//           ),
//         );
//       }

//       log(
//         "Access Token $accessToken\n Server Auth Code: $serverAuthCode",
//         name: "AuthRepo",
//       );

//       final (result, error) = await betterAuth.signInWithIdToken(
//         provider: SocialProvider.google,
//         idToken: serverAuthCode,
//         accessToken: accessToken,
//       );

//       if (error != null) {
//         return (
//           null,
//           Failure(
//             errorType: ErrorType.betterAuthError,
//             message: error.code.message,
//           ),
//         );
//       }

//       if (result == null) {
//         return (
//           null,
//           Failure(
//             errorType: ErrorType.betterAuthError,
//             message: "Better Auth User is null",
//           ),
//         );
//       }

//       return (result, null);
//     } on GoogleSignInException catch (e) {
//       log("Google Sign-In error: ${e.toString()}", error: e);
//       return (
//         null,
//         Failure(errorType: ErrorType.googleSignInError, message: e.toString()),
//       );
//     } catch (e) {
//       return (
//         null,
//         Failure(errorType: ErrorType.unKnownError, message: e.toString()),
//       );
//     }
//   }

//   static Future<String?> _getAccessToken(GoogleSignInAccount user) async {
//     //TODO: This can be used to get other auth headers as well

//     final ClientAuthorizationTokenData? tokens = await GoogleSignInPlatform
//         .instance
//         .clientAuthorizationTokensForScopes(
//           ClientAuthorizationTokensForScopesParameters(
//             request: AuthorizationRequestDetails(
//               scopes: scopes,
//               userId: user.id,
//               email: user.email,
//               promptIfUnauthorized: false,
//             ),
//           ),
//         );
//     if (tokens == null) {
//       return null;
//     }

//     return tokens.accessToken;
//   }

//   static Future<Failure?> signOut() async {
//     try {
//       final error = await betterAuth.signOut();

//       if (error != null) {
//         return Failure(
//           errorType: ErrorType.betterAuthError,
//           message: error.code.message,
//         );
//       }

//       await googleSignIn.signOut();

//       return null;
//     } catch (e) {
//       return Failure(errorType: ErrorType.unKnownError, message: e.toString());
//     }
//   }
// }
