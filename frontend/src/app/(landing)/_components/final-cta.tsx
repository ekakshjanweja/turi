"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function FinalCTA() {
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
    <section className="relative bg-gradient-to-b from-background via-background/50 to-muted/30 overflow-hidden py-16 md:py-24">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* CTA Badge */}
          <div className="mb-4">
            <Badge
              variant="default"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 cursor-default shadow-lg hover:shadow-xl text-xs px-3 py-1"
            >
              <Mic className="h-3 w-3 mr-1.5" />
              Limited Early Access
            </Badge>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-b from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent mb-6 leading-[1.1] tracking-tight max-w-2xl mx-auto">
            Ready to{" "}
            <span className="bg-gradient-to-br from-primary via-accent to-primary/10 bg-clip-text text-transparent">
              Take Back Your Time?
            </span>
          </h2>

          {/* Subheading */}
          <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-light">
            Stop letting email dictate your day. With Turi, you can manage your inbox on your terms hands free, stress free, and always secure.
          </p>

          {/* CTA Form */}
          <div className="flex flex-col max-w-lg items-center justify-center mx-auto gap-4 mb-12">
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
            <p className="text-xs text-muted-foreground text-center leading-relaxed transition-all duration-500 hover:text-primary-foreground">
              free during beta | no credit card required | cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 