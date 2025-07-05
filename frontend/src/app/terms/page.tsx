import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  Mail,
  Globe,
  Users,
  Lock,
  Calendar,
  Shield,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function TermsOfService() {
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
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">TuriMail Application</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Effective: July 5, 2025
            </Badge>
            <Badge variant="outline">Freemium Service</Badge>
            <Badge variant="outline">Web Application</Badge>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <p className="text-foreground leading-relaxed">
              Welcome to <strong>TuriMail</strong>! These Terms of Service
              govern your use of our website located at{" "}
              <Link
                href="https://turimail.vercel.app"
                className="text-primary hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://turimail.vercel.app
              </Link>{" "}
              and any related services provided by TuriMail. By accessing or
              using TuriMail, you agree to be bound by these Terms.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Use of Service */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Use of the Service</h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                TuriMail provides tools to help you manage, organize, and
                interact with your email more effectively. You may use our
                service only for lawful purposes and in accordance with these
                Terms.
              </p>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">
                  <strong>You agree not to:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Access or attempt to access data not intended for you</li>
                  <li>
                    Interfere with or disrupt the integrity or performance of
                    the service
                  </li>
                  <li>Use the service for any spam or abusive messaging</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Account and Security */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Account and Security</h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                You may be required to log in via a third-party service (e.g.,
                Gmail) to access certain features. You are responsible for
                maintaining the confidentiality of your credentials and for all
                activities that occur under your account.
              </p>

              <div className="bg-accent/50 border rounded-lg p-4">
                <p className="text-sm">
                  <strong>Security Alert:</strong> If you believe your account
                  has been compromised, please contact us immediately at{" "}
                  <Link
                    href="mailto:jekaksh@gmail.com"
                    className="text-primary hover:underline font-medium"
                  >
                    jekaksh@gmail.com
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Privacy</h2>
            </div>

            <p className="text-foreground">
              Your privacy is important to us. Please review our{" "}
              <Link
                href="/privacy"
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              , which explains how we collect, use, and protect your
              information.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Intellectual Property</h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                All content, features, and functionality provided by TuriMail
                are the property of TuriMail or its licensors and are protected
                by copyright, trademark, and other laws. You may not reproduce,
                distribute, or create derivative works without our written
                consent.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Third-Party Services</h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                TuriMail may integrate with third-party services (like email
                providers). We are not responsible for the practices, content,
                or policies of these third parties. Use of their services is
                governed by their respective terms and policies.
              </p>

              <div className="bg-accent/50 border rounded-lg p-4">
                <p className="text-sm">
                  <strong>Note:</strong> Third-party integrations may include
                  Gmail, Google services, and other email providers. Please
                  review their individual terms of service and privacy policies.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Termination</h2>
            </div>

            <p className="text-foreground">
              We reserve the right to suspend or terminate your access to the
              service at our discretion, without notice, if you violate these
              Terms or use the service in a manner that could harm others or
              disrupt the platform.
            </p>
          </section>

          {/* Disclaimer of Warranties */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                Disclaimer of Warranties
              </h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                TuriMail is provided &quot;as is&quot; and &quot;as
                available.&quot; We do not make any warranties regarding the
                reliability, availability, or accuracy of the service and
                disclaim all warranties to the fullest extent permitted by law.
              </p>

              <div className="bg-muted/50 border border-muted rounded-lg p-4">
                <p className="text-sm">
                  <strong>Important:</strong> This service is provided without
                  warranties of any kind, either express or implied.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Limitation of Liability</h2>
            </div>

            <p className="text-foreground">
              To the maximum extent permitted by law, TuriMail shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of data or profits, arising from
              your use of the service.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Changes to Terms</h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                We may modify these Terms at any time. If we make material
                changes, we will notify you by posting the updated Terms on our
                website. Your continued use of the service after changes means
                you accept the new Terms.
              </p>

              <div className="bg-accent/50 border rounded-lg p-4">
                <p className="text-sm font-medium">
                  These terms are effective as of <strong>July 5, 2025</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Contact</h2>
            </div>

            <div className="space-y-4 text-foreground">
              <p>
                If you have any questions about these Terms, please contact us
                at{" "}
                <Link
                  href="mailto:jekaksh@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  jekaksh@gmail.com
                </Link>
              </p>

              <div className="bg-background border rounded-lg p-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  For support, legal inquiries, or terms-related questions,
                  please use the contact information above.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
