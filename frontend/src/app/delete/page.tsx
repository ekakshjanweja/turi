"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DeletePageContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const message = searchParams.get("message");

  if (success === "true") {
    return <DeleteSuccess />;
  } else {
    return <DeleteError message={message} />;
  }
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-3xl animate-pulse">
          ⟳
        </div>
        <h1 className="text-3xl font-semibold mb-2 text-foreground">
          Loading...
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Processing your request...
        </p>
      </div>
    </div>
  );
}

export default function DeletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DeletePageContent />
    </Suspense>
  );
}

function DeleteSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-3xl font-semibold mb-2 text-foreground">
          Account Deleted
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Your account has been successfully deleted.
        </p>
      </div>
    </div>
  );
}

function DeleteError({ message }: { message: string | null }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-3xl text-destructive">
          ✕
        </div>
        <h1 className="text-3xl font-semibold mb-2 text-foreground">
          Deletion Failed
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {message
            ? decodeURIComponent(message)
            : "An error occurred while deleting your account."}
        </p>
      </div>
    </div>
  );
}
