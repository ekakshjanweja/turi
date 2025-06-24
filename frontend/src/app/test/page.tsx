"use client";

import { Loader } from "@/components/ui/loader";
import { auth } from "@/lib/auth";

export default function TestPage() {
  const { data: session, isPending } = auth.useSession();

  if (isPending) {
    return <Loader />;
  }

  if (!session?.user) {
    return <p>Unauthorized</p>;
  }

  return (
    <main className="flex items-center justify-center h-full">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Test Page</h1>
          <p className="text-muted-foreground text-lg">This is a test page.</p>
        </div>
      </div>
    </main>
  );
}
