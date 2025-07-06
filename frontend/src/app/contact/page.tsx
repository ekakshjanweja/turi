import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Mail, Globe, MessageCircle, Calendar } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="h-full bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
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
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
              <p className="text-muted-foreground">
                Get in touch with the Turi team
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <p className="text-foreground leading-relaxed">
              Have questions about <strong>Turi</strong>? We'd love to hear from
              you. Whether you're interested in early access, have feedback, or
              need support, we're here to help.
            </p>
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Email Contact */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Email Support</h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                For general inquiries, support, or feedback about Turi.
              </p>

              <div className="bg-muted/50 border border-muted rounded-lg p-4">
                <Link
                  href="mailto:hello@turi.ai"
                  className="text-primary hover:underline font-medium text-lg"
                >
                  hello@turi.ai
                </Link>
              </div>

              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours during business days.
              </p>
            </div>
          </div>

          {/* Early Access */}
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Early Access</h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Ready to transform your email experience? Join our early access
                program.
              </p>

              <Button className="w-full" size="lg">
                Request Early Access
              </Button>

              <p className="text-sm text-muted-foreground">
                Get priority access to Turi beta and help shape the future of
                voice-powered email.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          {/* Business Inquiries */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Business Inquiries</h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                Interested in partnerships, enterprise solutions, or media
                inquiries? We'd love to explore opportunities to work together.
              </p>

              <div className="bg-accent/50 border rounded-lg p-4">
                <p className="text-sm">
                  <strong>Enterprise Solutions:</strong> Contact us for custom
                  integrations, white-label solutions, or volume licensing
                  options.
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline">Partnership Inquiries</Button>
                <Button variant="outline">Media Kit</Button>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  When will Turi be available?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Turi is currently in early access. Sign up to be notified when
                  we're ready for your email provider.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Which email providers are supported?
                </h3>
                <p className="text-muted-foreground text-sm">
                  We're starting with Gmail and plan to support Outlook, Apple
                  Mail, and other major providers soon.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Is my email data secure?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Absolutely. We use bank-level encryption and zero-knowledge
                  architecture. Your emails never leave your device unencrypted.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Turi Inc. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
