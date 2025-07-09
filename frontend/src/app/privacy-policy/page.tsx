import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Turi Mail Application
            </p>
            <p className="text-sm text-muted-foreground">
              Effective Date: June 28, 2025
            </p>
          </div>
        </div>

        {/* Document Content */}
        <div className="prose prose-gray max-w-none text-foreground">
          <div className="mb-8 p-6 bg-muted/30 rounded-lg">
            <p className="text-base leading-relaxed m-0">
              This privacy policy applies to the Turi Mail app for mobile
              devices that was created by Ekaksh Janweja as a Freemium service.
              This service is intended for use &quot;AS IS&quot;.
            </p>
          </div>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Information Collection and Use
              </h2>

              <p className="mb-4">
                The Application collects information when you download and use
                it. This information may include:
              </p>

              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  Your device&apos;s Internet Protocol address (e.g. IP address)
                </li>
                <li>
                  The pages of the Application that you visit, the time and date
                  of your visit, the time spent on those pages
                </li>
                <li>The time spent on the Application</li>
                <li>The operating system you use on your mobile device</li>
              </ul>

              <p className="mb-4 italic text-muted-foreground bg-accent/20 p-4 rounded">
                <strong>Note:</strong> The Application does not gather precise
                information about the location of your mobile device.
              </p>

              <p className="mb-4">
                The Service Provider may use the information you provided to
                contact you from time to time to provide you with important
                information, required notices and marketing promotions.
              </p>

              <p>
                For a better experience, while using the Application, the
                Service Provider may require you to provide us with certain
                personally identifiable information. The information that the
                Service Provider request will be retained by them and used as
                described in this privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Third Party Access
              </h2>

              <p className="mb-4">
                Only aggregated, anonymized data is periodically transmitted to
                external services to aid the Service Provider in improving the
                Application and their service. The Service Provider may share
                your information with third parties in the ways that are
                described in this privacy statement.
              </p>

              <p className="mb-4">
                Please note that the Application utilizes third-party services
                that have their own Privacy Policy about handling data. Below
                are the links to the Privacy Policy of the third-party service
                providers used by the Application:
              </p>

              <div className="mb-6 p-4 bg-accent/20 rounded">
                <p className="m-0">
                  <Link
                    href="https://www.google.com/policies/privacy/"
                    className="text-primary underline hover:no-underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Play Services
                  </Link>
                </p>
              </div>

              <p className="mb-4">
                The Service Provider may disclose User Provided and
                Automatically Collected Information:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>
                  as required by law, such as to comply with a subpoena, or
                  similar legal process;
                </li>
                <li>
                  when they believe in good faith that disclosure is necessary
                  to protect their rights, protect your safety or the safety of
                  others, investigate fraud, or respond to a government request;
                </li>
                <li>
                  with their trusted services providers who work on their
                  behalf, do not have an independent use of the information we
                  disclose to them, and have agreed to adhere to the rules set
                  forth in this privacy statement.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Opt-Out Rights
              </h2>

              <p>
                You can stop all collection of information by the Application
                easily by uninstalling it. You may use the standard uninstall
                processes as may be available as part of your mobile device or
                via the mobile application marketplace or network.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Data Retention Policy
              </h2>

              <p>
                The Service Provider will retain User Provided data for as long
                as you use the Application and for a reasonable time thereafter.
                If you&apos;d like them to delete User Provided Data that you
                have provided via the Application, please contact them at{" "}
                <Link
                  href="mailto:jekaksh@gmail.com"
                  className="text-primary underline hover:no-underline"
                >
                  jekaksh@gmail.com
                </Link>{" "}
                and they will respond in a reasonable time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Children
              </h2>

              <p className="mb-4">
                The Service Provider does not use the Application to knowingly
                solicit data from or market to children under the age of 13.
              </p>

              <p className="mb-4 font-medium bg-destructive/10 p-4 rounded text-destructive-foreground">
                <strong>Important:</strong> The Application does not address
                anyone under the age of 13. The Service Provider does not
                knowingly collect personally identifiable information from
                children under 13 years of age. In the case the Service Provider
                discover that a child under 13 has provided personal
                information, the Service Provider will immediately delete this
                from their servers.
              </p>

              <p>
                If you are a parent or guardian and you are aware that your
                child has provided us with personal information, please contact
                the Service Provider ({" "}
                <Link
                  href="mailto:jekaksh@gmail.com"
                  className="text-primary underline hover:no-underline"
                >
                  jekaksh@gmail.com
                </Link>
                ) so that they will be able to take the necessary actions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Security
              </h2>

              <p>
                The Service Provider is concerned about safeguarding the
                confidentiality of your information. The Service Provider
                provides physical, electronic, and procedural safeguards to
                protect information the Service Provider processes and
                maintains.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Changes
              </h2>

              <p className="mb-4">
                This Privacy Policy may be updated from time to time for any
                reason. The Service Provider will notify you of any changes to
                the Privacy Policy by updating this page with the new Privacy
                Policy. You are advised to consult this Privacy Policy regularly
                for any changes, as continued use is deemed approval of all
                changes.
              </p>

              <p className="italic bg-accent/20 p-4 rounded">
                This privacy policy is effective as of{" "}
                <strong>2025-06-28</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Your Consent
              </h2>

              <p>
                By using the Application, you are consenting to the processing
                of your information as set forth in this Privacy Policy now and
                as amended by us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
                Contact Us
              </h2>

              <p className="mb-4">
                If you have any questions regarding privacy while using the
                Application, or have questions about the practices, please
                contact the Service Provider via email at{" "}
                <Link
                  href="mailto:jekaksh@gmail.com"
                  className="text-primary underline hover:no-underline"
                >
                  jekaksh@gmail.com
                </Link>
              </p>

              <p className="text-sm text-muted-foreground italic">
                This privacy policy page was generated by App Privacy Policy
                Generator
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