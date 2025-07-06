"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export function BrandLogo() {
  const { theme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    router.push("/");
  };

  if (!mounted) {
    return null;
  }

  return (
    <Image
      src={
        theme === "dark" ? "/monochrome_logo.png" : "/monochrome_logo_light.png"
      }
      alt="Turi Logo"
      width={100}
      height={48}
      className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleClick}
      priority
    />
  );
}
