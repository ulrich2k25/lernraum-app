"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AppFooter() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  // Aucun footer sur la page de connexion administrateur
  if (pathname === "/admin/login") {
    return null;
  }

  return (
    <footer className="mx-auto hidden w-full max-w-6xl px-4 sm:px-6 md:block md:px-8">
      <div className="flex flex-col gap-3 border-t border-[#DCE6EC] px-1 py-5 md:flex-row md:items-center md:justify-between md:gap-6 md:rounded-[24px] md:border-[#1C4765] md:bg-[#102A43] md:px-6 md:py-7 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5F5F2] text-[#008F83] md:h-10 md:w-10 md:rounded-[14px] md:border md:border-white/10 md:bg-white/10 md:text-[#5EEAD4]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="4" y="3" width="16" height="18" rx="3" />
              <path d="M9 8h6M9 12h6M9 16h3" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-extrabold tracking-[-0.02em] text-[#102A43] md:text-white">
              Lernraum
            </p>

            <p className="mt-0.5 text-xs text-[#71869A] md:text-[#B8CCDA]">
              {t("school")}
            </p>
          </div>
        </div>

        <p className="text-xs leading-5 text-[#8295A5] md:max-w-sm md:text-right md:text-[#A8BECD]">
          {t("tagline")}
        </p>
      </div>
    </footer>
  );
}
