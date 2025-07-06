import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrimaryCta() {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
        <Button asChild>
          <Link href="/early-access">Get Early Access</Link>
        </Button>
        <Button variant="outline">Watch Demo</Button>
      </div>
    </>
  );
}
