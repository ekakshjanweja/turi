import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import HeroSection from "./_components/hero/hero-section";
import FeaturesSection from "./_components/features/features-section";

export const metadata: Metadata = {
  title: "Turi - Voice-Powered Email Assistant | Transform Your Inbox with AI",
  description:
    "Transform your email experience with Turi's AI-powered voice assistant. Compose, reply, and manage emails hands-free with intelligent voice commands and AI summaries.",
  keywords:
    "voice email, AI assistant, hands-free email, voice commands, email productivity, AI email management",
  openGraph: {
    title: "Turi - Voice-Powered Email Assistant",
    description:
      "Transform your email experience with AI-powered voice commands",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Turi - Voice-Powered Email Assistant",
    description:
      "Transform your email experience with AI-powered voice commands",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background mx-4 md:mx-8 lg:mx-0">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your Email Experience?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of email productivity. Get early access to
              Turi and reclaim hours of your day.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                className="text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90"
                asChild
              >
                <Link href="/signin">Get Early Access</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 h-auto"
              >
                Schedule Demo
              </Button>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                ✅ Free during beta
              </Badge>
              <Badge variant="secondary" className="text-xs">
                ✅ No credit card required
              </Badge>
              <Badge variant="secondary" className="text-xs">
                ✅ Cancel anytime
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-foreground mb-2">Turi</h3>
              <p className="text-muted-foreground">
                Voice-powered email assistant
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex space-x-6">
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms and Conditions
                </Link>
              </div>

              <div className="text-sm text-muted-foreground">
                © 2025 Turi Inc. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
