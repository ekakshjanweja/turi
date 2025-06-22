"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  const signOut = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.log("Sign-out error:", error);
    }
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Brand/Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">Turi</h1>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={signOut}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
