import type { ReactNode } from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className="bg-[#F4F8FA] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl justify-end">
          <LanguageSwitcher />
        </div>
      </div>

      {children}
    </>
  );
}