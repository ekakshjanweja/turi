"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function DeleteResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<{
    type: "success" | "error" | "loading";
    message: string;
  }>({ type: "loading", message: "Processing..." });

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "account_deleted") {
      setResult({
        type: "success",
        message: "Your account has been successfully deleted. We're sorry to see you go!",
      });
    } else if (error) {
      let errorMessage = "An unknown error occurred.";
      
      switch (error) {
        case "missing_token":
          errorMessage = "The deletion link is missing required information.";
          break;
        case "invalid_or_expired_token":
          errorMessage = "The deletion link has expired or is invalid. Please request a new one.";
          break;
        case "invalid_token_type":
          errorMessage = "This link is not valid for account deletion.";
          break;
        case "cannot_identify_user":
          errorMessage = "Cannot identify the user from this deletion request.";
          break;
        case "invalid_user_id":
          errorMessage = "Invalid user information in the deletion request.";
          break;
        case "user_not_found":
          errorMessage = "The user account was not found.";
          break;
        case "server_error":
          errorMessage = "A server error occurred. Please try again later.";
          break;
        default:
          errorMessage = `Error: ${error}`;
      }

      setResult({
        type: "error",
        message: errorMessage,
      });
    } else {
      setResult({
        type: "error",
        message: "No result information found.",
      });
    }
  }, [searchParams]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleRetryDelete = () => {
    router.push("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {result.type === "loading" && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                Processing...
              </h2>
            </>
          )}

          {result.type === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                Account Deleted
              </h2>
            </>
          )}

          {result.type === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                Deletion Failed
              </h2>
            </>
          )}

          <p className="mt-4 text-sm text-gray-600">{result.message}</p>

          <div className="mt-8 space-y-4">
            {result.type === "success" && (
              <Button onClick={handleGoHome} className="w-full">
                Go to Homepage
              </Button>
            )}

            {result.type === "error" && (
              <>
                <Button onClick={handleRetryDelete} className="w-full">
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleGoHome} 
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 