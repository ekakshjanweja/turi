enum ErrorCode {
  unKnownError,
  betterAuthError,
  googleSignInError,
  unAuthorized,
  invalidInput,
  serverError,
  failedToDeleteUser,
  idTokenIsNull,
  accessTokenIsNull,
  failedToSignOut,
}

extension ErrorCodeId on ErrorCode {
  String get id {
    switch (this) {
      case ErrorCode.unKnownError:
        return "UNKNOWN_ERROR";
      case ErrorCode.betterAuthError:
        return "BETTER_AUTH_ERROR";
      case ErrorCode.googleSignInError:
        return "GOOGLE_SIGNIN_ERROR";
      case ErrorCode.unAuthorized:
        return "UNAUTHORIZED";
      case ErrorCode.invalidInput:
        return "INVALID_INPUT";
      case ErrorCode.serverError:
        return "SERVER_ERROR";
      case ErrorCode.failedToDeleteUser:
        return "FAILED_TO_DELETE_USER";
      case ErrorCode.idTokenIsNull:
        return "ID_TOKEN_IS_NULL";
      case ErrorCode.accessTokenIsNull:
        return "ACCESS_TOKEN_IS_NULL";
      case ErrorCode.failedToSignOut:
        return "FAILED_TO_SIGN_OUT";
    }
  }
}

extension ErrorCodeMessage on ErrorCode {
  String get message {
    switch (this) {
      case ErrorCode.unKnownError:
        return "An unknown error occurred. Please try again later.";
      case ErrorCode.betterAuthError:
        return "An error occurred while communicating with the authentication service.";
      case ErrorCode.googleSignInError:
        return "An error occurred while communicating with Google Sign-In.";
      case ErrorCode.unAuthorized:
        return "You are not authorized to perform this action.";
      case ErrorCode.invalidInput:
        return "The input provided is invalid.";
      case ErrorCode.serverError:
        return "An error occurred on the server. Please try again later.";
      case ErrorCode.failedToDeleteUser:
        return "Failed to delete user.";
      case ErrorCode.idTokenIsNull:
        return "Id token is null";
      case ErrorCode.accessTokenIsNull:
        return "Access token is null";
      case ErrorCode.failedToSignOut:
        return "Failed to sign out";
    }
  }
}
