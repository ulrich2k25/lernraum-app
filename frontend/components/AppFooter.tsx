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

  const mobileLinkClass =
    "flex min-h-[44px] items-center justify-center " +
    "rounded-xl border border-white/10 bg-white/[0.06] " +
    "px-2 py-2 text-center text-[11px] font-semibold leading-4 " +
    "text-[#D5E7EE] transition " +
    "hover:border-[#5EEAD4]/30 hover:bg-white/10 hover:text-[#5EEAD4] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[#5EEAD4] " +
    "md:inline md:min-h-0 md:rounded-none md:border-0 " +
    "md:bg-transparent md:px-0 md:py-0 md:text-left " +
    "md:text-sm md:leading-5 md:hover:bg-transparent";

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
      <div
        className="
          flex flex-col
          gap-3
          rounded-[20px]
          border border-[#1C4765]
          bg-[#102A43]
          px-4 py-4
          shadow-[0_8px_24px_rgba(16,42,67,0.08)]

          md:gap-5
          md:rounded-[24px]
          md:px-6 md:py-7
          md:shadow-none

          lg:px-8
        "
      >
        <div
          className="
            flex flex-col
            gap-3

            md:flex-row
            md:flex-wrap
            md:items-center
            md:justify-between
            md:gap-5
          "
        >
          {/* Identité Lernraum */}
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-xl
                border border-white/10
                bg-white/10
                text-[#5EEAD4]

                md:h-10 md:w-10
                md:rounded-[14px]
              "
            >
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

            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-[-0.02em] text-white">
                Lernraum
              </p>

              <p className="mt-0.5 text-xs text-[#B8CCDA]">{t("school")}</p>
            </div>
          </div>

          {/* Navigation footer */}
          <nav
            aria-label="Footer"
            className="
              grid grid-cols-3 gap-2

              md:flex
              md:flex-wrap
              md:items-center
              md:gap-x-6
              md:gap-y-3
            "
          >
            <Link href="/hilfe" className={mobileLinkClass}>
              {help("title")}
            </Link>

            <Link href="/feedback" className={mobileLinkClass}>
              {feedbackLabel}
            </Link>

            <Link href="/datenschutz" className={mobileLinkClass}>
              {privacyLabel}
            </Link>
          </nav>
        </div>

        {/* Texte informatif */}
        <div className="border-t border-white/10 pt-3 md:pt-4">
          <p className="text-[11px] leading-[18px] text-[#A8BECD] md:text-xs md:leading-5">
            {t("tagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}
