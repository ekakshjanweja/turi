import Link from "next/link";

export default function Footer() {
  return (
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
  );
} 