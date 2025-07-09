"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mic, Mail, CheckCircle } from "lucide-react";

export default function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    // Simulate API call - replace with actual submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsLoading(false);
    setEmail("");
  };

  if (isSubmitted) {
    return (
      <main className="h-full bg-background overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="text-center">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-4">
              You&apos;re on the list!
            </h1>

            <p className="text-muted-foreground text-lg mb-8">
              Thanks for your interest in Turi. We&apos;ll notify you as soon as
              early access becomes available.
            </p>

            <div className="bg-card border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    We&apos;ll send you an email confirmation shortly
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    You&apos;ll get priority access when we launch the beta
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-muted-foreground">
                    We&apos;ll keep you updated on our progress
                  </p>
                </div>
              </div>
            </div>

            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full bg-background overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Get Early Access
              </h1>
              <p className="text-muted-foreground">
                Join the Turi beta waitlist
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary">Limited Beta Access</Badge>
            <Badge variant="outline">Free During Beta</Badge>
            <Badge variant="outline">No Credit Card Required</Badge>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <p className="text-foreground leading-relaxed mb-4">
              Be among the first to experience voice-powered email management.
              Turi is currently in private beta, and we&apos;re gradually
              rolling out access to early adopters.
            </p>

            <div className="bg-muted/50 border border-muted rounded-lg p-4">
              <p className="text-sm mb-3">
                <strong>Early access includes:</strong>
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Priority access to all beta features</li>
                <li>• Direct feedback channel with our development team</li>
                <li>• Free access throughout the entire beta period</li>
                <li>• Exclusive updates on new features and improvements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Email Form */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Request Beta Access</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                We&apos;ll only use your email to contact you about Turi early
                access and updates.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!email.trim() || isLoading}
            >
              {isLoading ? "Submitting..." : "Join Beta Waitlist"}
            </Button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By joining our waitlist, you agree to our{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          © 2025 Turi Inc. All rights reserved.
        </div>
      </div>
    </main>
  );
}
