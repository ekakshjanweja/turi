"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = auth.useSession();

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
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Brand/Logo */}
          <BrandLogo />

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/early-access"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Early Access
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
            <ModeToggle />
            {session && !isPending && (
              <Button variant="outline" size="sm" onClick={signOut}>
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
