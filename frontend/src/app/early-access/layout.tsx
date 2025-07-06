import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Early Access - Turi Voice Email Assistant",
  description: "Join the Turi beta waitlist and be among the first to experience voice-powered email management. Free early access available.",
  keywords: "Turi early access, voice email beta, email assistant waitlist",
};

export default function EarlyAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 