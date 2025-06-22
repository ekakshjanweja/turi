"use client";

import { Navbar } from "@/components/navbar";
import { usePathname } from "next/navigation";

export function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Show navbar on authenticated pages (not on the login page)
  const shouldShowNavbar = pathname !== "/";
  
  if (!shouldShowNavbar) {
    return null;
  }
  
  return <Navbar />;
}
