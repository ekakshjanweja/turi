"use client";

import { Loading } from "@/components/loading";
import { Unauthorized } from "@/components/unauthorized";
import { auth } from "@/lib/auth";

export default function Dashboard() {
  const { data: session, isPending } = auth.useSession();

  if (isPending) {
    return <Loading />;
  }

  if (!session?.user) {
    return <Unauthorized />;
  }

  return <></>;
}
