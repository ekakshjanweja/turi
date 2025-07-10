import { Metadata } from "next";
import HeroSection from "./_components/hero/hero-section";
import FeaturesSection from "./_components/features/features-section";
import HowItWorksSection from "./_components/how-it-works-section";
import FinalCTA from "./_components/final-cta";
import Footer from "./_components/footer";

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

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Final CTA Section */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
}
