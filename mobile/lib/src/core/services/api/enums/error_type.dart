enum ErrorType {
  unKnownError("An unknown error occurred. Please try again later."),
  betterAuthError(
    "An error occurred while communicating with the authentication service.",
  ),
  googleSignInError(
    "An error occurred while communicating with Google Sign-In.",
  ),
  unAuthorized("You are not authorized to perform this action."),
  invalidInput("The input provided is invalid."),
  serverError("An error occurred on the server. Please try again later.");

  final String message;
  const ErrorType(this.message);
}
