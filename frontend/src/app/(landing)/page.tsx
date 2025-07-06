import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import { Mic, Brain, Zap, Shield } from "lucide-react";
import PrimaryCta from "./_components/primary-cta";

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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/30 overflow-hidden">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Badge */}
            <Badge variant="secondary" className="mb-6">
              <Mic className="h-3 w-3 mr-1" />
              Now in Early Access
            </Badge>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Transform Your Email with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Voice Power
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Meet Turi, the AI assistant that revolutionizes email
              productivity. Compose, reply, and manage your inbox entirely
              hands-free with intelligent voice commands and AI-powered
              summaries.
            </p>

            {/* Primary CTA */}
            <PrimaryCta />
          </div>

          {/* Hero Visual Placeholder */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl border border-border/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <Mic className="h-12 w-12 text-primary" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Product Demo Coming Soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Email That Actually Works for{" "}
              <span className="text-primary">You</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Stop wrestling with your inbox. Turi transforms email from a chore
              into a seamless, intelligent conversation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Feature 1: Voice Control */}
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Mic className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Natural Voice Commands
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Compose emails, schedule replies, and navigate your inbox using
                natural speech. Just talk to Turi like you would a personal
                assistant.
              </p>
            </div>

            {/* Feature 2: AI Summaries */}
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Intelligent Summaries
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Get instant AI-powered summaries of long email threads.
                Understand the key points without reading every message.
              </p>
            </div>

            {/* Feature 3: Hands-Free Productivity */}
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Hands-Free Productivity
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Manage emails while cooking, driving, or multitasking. Turi
                works when your hands are busy but your mind is free.
              </p>
            </div>

            {/* Feature 4: Enterprise Security */}
            <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all">
              <div className="w-16 h-16 mx-auto mb-6 bg-destructive/10 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Enterprise Security
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Bank-level encryption and privacy controls. Your emails stay
                private with zero-knowledge architecture and local processing.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
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
