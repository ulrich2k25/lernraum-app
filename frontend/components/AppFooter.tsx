"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function AppFooter() {
  const t = useTranslations("footer");
  const help = useTranslations("help");
  const locale = useLocale();
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return null;
  }

  const privacyLabel =
    locale === "en"
      ? "Privacy"
      : locale === "fr"
        ? "Protection des données"
        : "Datenschutz";

  const feedbackLabel =
    locale === "en"
      ? "Give feedback"
      : locale === "fr"
        ? "Donner un avis"
        : "Feedback geben";

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
      <div className="flex flex-col gap-5 rounded-[24px] border border-[#1C4765] bg-[#102A43] px-6 py-7 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/10 text-[#5EEAD4]">
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
              <p className="text-sm font-extrabold tracking-[-0.02em] text-white">
                Lernraum
              </p>

              <p className="mt-0.5 text-xs text-[#B8CCDA]">{t("school")}</p>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {/* Hilfe */}
            <Link
              href="/hilfe"
              className="text-sm font-semibold text-[#D5E7EE] transition hover:text-[#5EEAD4]"
            >
              {help("title")}
            </Link>

            {/* Feedback */}
            <Link
              href="/feedback"
              className="text-sm font-semibold text-[#D5E7EE] transition hover:text-[#5EEAD4]"
            >
              {feedbackLabel}
            </Link>

            {/* Datenschutz */}
            <Link
              href="/datenschutz"
              className="text-sm font-semibold text-[#D5E7EE] transition hover:text-[#5EEAD4]"
            >
              {privacyLabel}
            </Link>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs leading-5 text-[#A8BECD]">{t("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
