"use client";

import { Badge } from "@/components/ui/badge";
import { Mic } from "lucide-react";
import PrimaryCta from "./primary-cta";
import HeroVisual from "./hero-visual";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-background via-background/50 to-muted/30 overflow-hidden mt-12 md:mt-24">
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Badge */}
          <div className="mb-4">
            <Badge
              variant="default"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 hover:scale-105 cursor-default shadow-lg hover:shadow-xl text-xs px-3 py-1"
            >
              <Mic className="h-3 w-3 mr-1.5" />
              Now in Early Access
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight tracking-tight">
            Effortless Email Just Say It
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-light">
            Stop typing, start talking. Turi manages your entire inbox through
            natural voice conversations, turning email into an effortless,
            hands-free experience.
          </p>

          {/* Primary CTA */}
          <PrimaryCta />
        </div>

        {/* Hero Visual Placeholder */}
        <HeroVisual />
      </div>
    </section>
  );
}
