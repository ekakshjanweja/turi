import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Deleted - Turi Mail",
  description: "Your account has been successfully deleted.",
};

export default function DeletePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 max-w-sm">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-3xl">
          ✓
        </div>
        <h1 className="text-3xl font-semibold mb-2 text-foreground">
          Account Deleted
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Your account has been successfully deleted.
        </p>
      </div>
    </div>
  );
}
