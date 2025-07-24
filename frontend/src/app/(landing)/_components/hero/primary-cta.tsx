"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export default function PrimaryCta() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/early-access`,
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );

    if (response.ok) {
      toast.success("Successfully joined early access!", {
        position: "top-center",
        duration: 3000,
      });
    } else {
      const error = await response.json();

      if (error.error === "Email already registered") {
        toast.error("Email already registered", {
          position: "top-center",
          duration: 3000,
          style: {
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        return;
      }

      toast.error("Failed to join early access. Please try again.", {
        position: "top-center",
        duration: 3000,
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
    }

    setIsLoading(false);
  };

  return (
    <>
      <div className="flex flex-col max-w-lg items-center justify-center mx-auto gap-4 mb-24">
        <div className="flex w-full items-center gap-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            className="flex-4/6 h-10 border-muted-foreground/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmit} disabled={isLoading}>
            Get Early Access
          </Button>
        </div>
        {/* <Button variant="outline" disabled={isLoading}>
          Watch Demo
        </Button> */}
        <p className="text-xs text-muted-foreground text-center leading-relaxed transition-all duration-500 hover:text-primary-foreground">
          free during beta | no credit card required | cancel anytime
        </p>
      </div>

      {/* <div className="flex flex-col max-w-xl items-center justify-center mx-auto gap-4 mb-24">
        <Input
          type="email"
          placeholder="Enter your email address"
          className="h-10 border-muted-foreground/30 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex gap-4 w-full">
          <Button
            className="flex-1 w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            Get Early Access
          </Button>
          <Button
            className="flex-1 w-full"
            variant="outline"
            disabled={isLoading}
          >
            Watch Demo
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center leading-relaxed transition-all duration-500 hover:text-primary-foreground">
          free during beta | no credit card required | cancel anytime
        </p>
      </div> */}
    </>
  );
}
