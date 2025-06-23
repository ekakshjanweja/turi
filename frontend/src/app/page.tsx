"use client";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = auth.useSession();

  useEffect(() => {
    if (session?.user) {
      router.push("/home");
    }
  }, [session, router]);

  const signIn = async () => {
    try {
      await auth.signIn.social({
        provider: "google",
        callbackURL: `${
          process.env.NODE_ENV == "production"
            ? process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "https://turimail.vercel.app"
            : "http://localhost:3000"
        }/home`,
      });
    } catch (error) {
      console.log("Sign-in error:", error);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <main className="flex items-center justify-center h-full">
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
  );
}
