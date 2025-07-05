import { auth } from "../../../lib/auth";

export const lazyGmailService = async () => {
  const { GmailService } = await import("../../gmail");
  return GmailService;
};

// Enhanced Gmail service initialization with retry logic
export async function initializeGmailService(
  userId: string,
  retries = 2
): Promise<any> {
  const GmailService = await lazyGmailService();
  const gmailService = new GmailService();

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await gmailService.init(userId);
      return gmailService;
    } catch (error) {
      console.warn(`Gmail service init attempt ${attempt + 1} failed:`, error);

      if (attempt === retries) {
        // Try to refresh token on final attempt
        try {
          const accounts = await auth.api.listUserAccounts({
            query: { userId },
          });

          if (accounts[0]) {
            console.log("Attempting token refresh for user:", userId);
            await auth.api.refreshToken({
              body: {
                providerId: "google",
                userId,
                accountId: accounts[0].id,
              },
            });

            // Retry init after token refresh
            await gmailService.init(userId);
            return gmailService;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}
