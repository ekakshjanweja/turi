"use client";

import { Mic } from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="mt-16 relative max-w-5xl mx-auto">
      <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-2xl border border-border/50 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/10 group">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300">
            <Mic className="h-12 w-12 text-primary" />
          </div>
          <p className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            Product Demo Coming Soon
          </p>
        </div>
      </div>
    </div>
  );
}
