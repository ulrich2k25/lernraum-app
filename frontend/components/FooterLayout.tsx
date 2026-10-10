"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function FooterLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return <div className="flex flex-1 flex-col">{children}</div>;
  }

  return <div className="flex flex-col">{children}</div>;
}
