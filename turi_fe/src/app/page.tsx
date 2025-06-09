"use client";

import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = auth.useSession();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const signIn = async () => {
    try {
      await auth.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/dashboard",
      });
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  if (isPending) {
    return <Loading />;
  }

  return (
    <div>
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome to Turi</h1>
            <p className="text-muted-foreground text-lg">
              Sign in to get started
            </p>
          </div>
          <Button onClick={signIn} className="mx-auto">
            Sign in with Google
          </Button>
        </div>
      </main>
    </div>
  );
}
