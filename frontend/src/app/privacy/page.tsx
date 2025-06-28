import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Shield, Mail, Globe, Users, Lock, Calendar } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="h-full bg-background overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-4 -ml-2"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
              <p className="text-muted-foreground">Turi Mail Application</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Effective: June 28, 2025
            </Badge>
            <Badge variant="outline">Freemium Service</Badge>
            <Badge variant="outline">Mobile App</Badge>
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <p className="text-foreground leading-relaxed">
              This privacy policy applies to the <strong>Turi Mail app</strong> for mobile devices that was created by 
              <strong> Ekaksh Janweja</strong> as a Freemium service. This service is intended for use "AS IS".
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Information Collection */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Information Collection and Use</h2>
            </div>
            
            <div className="space-y-4 text-foreground">
              <p>The Application collects information when you download and use it. This information may include:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                <li>Your device's Internet Protocol address (e.g. IP address)</li>
                <li>The pages of the Application that you visit, the time and date of your visit, the time spent on those pages</li>
                <li>The time spent on the Application</li>
                <li>The operating system you use on your mobile device</li>
              </ul>
              
              <div className="bg-muted/50 border border-muted rounded-lg p-4 mt-4">
                <p className="text-sm">
                  <strong>Note:</strong> The Application does not gather precise information about the location of your mobile device.
                </p>
              </div>
              
              <p>
                The Service Provider may use the information you provided to contact you from time to time to provide you with 
                important information, required notices and marketing promotions.
              </p>
              
              <p>
                For a better experience, while using the Application, the Service Provider may require you to provide us with 
                certain personally identifiable information, including but not limited to 
                <strong> ekakshjanweja@gmail.com, 32, mail</strong>. The information that the Service Provider request will be 
                retained by them and used as described in this privacy policy.
              </p>
            </div>
          </section>

          {/* Third Party Access */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Third Party Access</h2>
            </div>
            
            <div className="space-y-4 text-foreground">
              <p>
                Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider 
                in improving the Application and their service. The Service Provider may share your information with third parties 
                in the ways that are described in this privacy statement.
              </p>
              
              <p>
                Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data. 
                Below are the links to the Privacy Policy of the third-party service providers used by the Application:
              </p>
              
              <div className="bg-accent/50 border rounded-lg p-4">
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="https://www.google.com/policies/privacy/" 
                      className="text-primary hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Play Services
                    </Link>
                  </li>
                </ul>
              </div>
              
              <p>The Service Provider may disclose User Provided and Automatically Collected Information:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                <li>as required by law, such as to comply with a subpoena, or similar legal process;</li>
                <li>when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;</li>
                <li>with their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement.</li>
              </ul>
            </div>
          </section>

          {/* Opt-Out Rights */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Opt-Out Rights</h2>
            </div>
            
            <p className="text-foreground">
              You can stop all collection of information by the Application easily by uninstalling it. You may use the standard 
              uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.
            </p>
          </section>

          {/* Data Retention */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Data Retention Policy</h2>
            </div>
            
            <div className="space-y-4 text-foreground">
              <p>
                The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable 
                time thereafter. If you'd like them to delete User Provided Data that you have provided via the Application, 
                please contact them at{" "}
                <Link 
                  href="mailto:jekaksh@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  jekaksh@gmail.com
                </Link>{" "}
                and they will respond in a reasonable time.
              </p>
            </div>
          </section>

          {/* Children */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Children</h2>
            </div>
            
            <div className="space-y-4 text-foreground">
              <p>
                The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13.
              </p>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Important:</strong> The Application does not address anyone under the age of 13. The Service Provider does not 
                  knowingly collect personally identifiable information from children under 13 years of age. In the case the Service Provider 
                  discover that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers.
                </p>
              </div>
              
              <p>
                If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact 
                the Service Provider ({" "}
                <Link 
                  href="mailto:jekaksh@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  jekaksh@gmail.com
                </Link>
                ) so that they will be able to take the necessary actions.
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>
            
            <p className="text-foreground">
              The Service Provider is concerned about safeguarding the confidentiality of your information. The Service Provider 
              provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains.
            </p>
          </section>

          {/* Changes */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Changes</h2>
            </div>
            
            <div className="space-y-4 text-foreground">
              <p>
                This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any 
                changes to the Privacy Policy by updating this page with the new Privacy Policy. You are advised to consult this 
                Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.
              </p>
              
              <div className="bg-accent/50 border rounded-lg p-4">
                <p className="text-sm font-medium">
                  This privacy policy is effective as of <strong>2025-06-28</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Consent */}
          <section className="bg-card border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Consent</h2>
            </div>
            
            <p className="text-foreground">
              By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy 
              now and as amended by us.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Contact Us</h2>
            </div>
            
            <div className="space-y-4 text-foreground">
              <p>
                If you have any questions regarding privacy while using the Application, or have questions about the practices, 
                please contact the Service Provider via email at{" "}
                <Link 
                  href="mailto:jekaksh@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  jekaksh@gmail.com
                </Link>
              </p>
              
              <div className="bg-background border rounded-lg p-4 mt-4">
                <p className="text-xs text-muted-foreground">
                  This privacy policy page was generated by App Privacy Policy Generator
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <Button asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
