import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold text-foreground">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              TuriMail Application
            </p>
            <p className="text-sm text-muted-foreground">
              Effective Date: July 5, 2025
            </p>
          </div>
        </div>

        {/* Document Content */}
        <div className="prose prose-gray max-w-none text-foreground">
          <div className="mb-8 p-6 bg-muted/30 rounded-lg">
            <p className="text-base leading-relaxed m-0">
              Welcome to <strong>TuriMail</strong>! These Terms of Service
              govern your use of our website located at{" "}
              <Link
                href="https://turimail.vercel.app"
                className="text-primary underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://turimail.vercel.app
              </Link>{" "}
              and any related services provided by TuriMail. By accessing or
              using TuriMail, you agree to be bound by these Terms.
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Use of the Service
              </h2>
              
              <p className="mb-4">
                TuriMail provides tools to help you manage, organize, and
                interact with your email more effectively. You may use our
                service only for lawful purposes and in accordance with these
                Terms.
              </p>

              <p className="mb-4 font-medium bg-destructive/10 p-4 rounded text-destructive-foreground">
                <strong>You agree not to:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Violate any applicable laws or regulations</li>
                <li>Access or attempt to access data not intended for you</li>
                <li>Interfere with or disrupt the integrity or performance of the service</li>
                <li>Use the service for any spam or abusive messaging</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Account and Security
              </h2>
              
              <p className="mb-4">
                You may be required to log in via a third-party service (e.g.,
                Gmail) to access certain features. You are responsible for
                maintaining the confidentiality of your credentials and for all
                activities that occur under your account.
              </p>

              <p className="mb-4 italic text-muted-foreground bg-accent/20 p-4 rounded">
                <strong>Security Alert:</strong> If you believe your account
                has been compromised, please contact us immediately at{" "}
                <Link
                  href="mailto:jekaksh@gmail.com"
                  className="text-primary underline hover:no-underline"
                >
                  jekaksh@gmail.com
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Privacy
              </h2>
              
              <p>
                Your privacy is important to us. Please review our{" "}
                <Link
                  href="/privacy"
                  className="text-primary underline hover:no-underline"
                >
                  Privacy Policy
                </Link>
                , which explains how we collect, use, and protect your
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Intellectual Property
              </h2>
              
              <p>
                All content, features, and functionality provided by TuriMail
                are the property of TuriMail or its licensors and are protected
                by copyright, trademark, and other laws. You may not reproduce,
                distribute, or create derivative works without our written
                consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Third-Party Services
              </h2>
              
              <p className="mb-4">
                TuriMail may integrate with third-party services (like email
                providers). We are not responsible for the practices, content,
                or policies of these third parties. Use of their services is
                governed by their respective terms and policies.
              </p>

              <p className="mb-4 italic text-muted-foreground bg-accent/20 p-4 rounded">
                <strong>Note:</strong> Third-party integrations may include
                Gmail, Google services, and other email providers. Please
                review their individual terms of service and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Termination
              </h2>
              
              <p>
                We reserve the right to suspend or terminate your access to the
                service at our discretion, without notice, if you violate these
                Terms or use the service in a manner that could harm others or
                disrupt the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Disclaimer of Warranties
              </h2>
              
              <p className="mb-4">
                TuriMail is provided "as is" and "as available." We do not make any warranties regarding the
                reliability, availability, or accuracy of the service and
                disclaim all warranties to the fullest extent permitted by law.
              </p>

              <p className="mb-4 italic text-muted-foreground bg-accent/20 p-4 rounded">
                <strong>Important:</strong> This service is provided without
                warranties of any kind, either express or implied.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Limitation of Liability
              </h2>
              
              <p>
                To the maximum extent permitted by law, TuriMail shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, or any loss of data or profits, arising from
                your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Changes to Terms
              </h2>
              
              <p className="mb-4">
                We may modify these Terms at any time. If we make material
                changes, we will notify you by posting the updated Terms on our
                website. Your continued use of the service after changes means
                you accept the new Terms.
              </p>

              <p className="italic bg-accent/20 p-4 rounded">
                These terms are effective as of <strong>July 5, 2025</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Contact
              </h2>
              
              <p className="mb-4">
                If you have any questions about these Terms, please contact us
                at{" "}
                <Link
                  href="mailto:jekaksh@gmail.com"
                  className="text-primary underline hover:no-underline"
                >
                  jekaksh@gmail.com
                </Link>
              </p>

              <p className="text-sm text-muted-foreground italic">
                For support, legal inquiries, or terms-related questions,
                please use the contact information above.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-border text-center">
            <Button size="lg" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
