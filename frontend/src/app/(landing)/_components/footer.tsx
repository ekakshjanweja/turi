"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/20 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand Section */}
            <div className="flex items-center">
              <div className="transform transition-transform duration-300 hover:scale-105">
                <BrandLogo />
              </div>
            </div>

            {/* Navigation & Status */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Navigation Links */}
              <div className="flex items-center gap-4">
                <Link
                  href="/privacy"
                  className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-y-[-1px] relative group"
                >
                  Privacy
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <span className="text-muted-foreground/30">•</span>
                <Link
                  href="/terms"
                  className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-y-[-1px] relative group"
                >
                  Terms
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </div>

              {/* Beta Status */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground group cursor-default">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse group-hover:animate-none group-hover:bg-green-400 transition-colors duration-300"></span>
                <span className="transition-colors duration-300 group-hover:text-foreground/80">
                  Beta
                </span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </footer>
  );
} 