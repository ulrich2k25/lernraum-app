"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";

type AppHeaderProps = {
  roomCount: number;
};

export default function AppHeader({ roomCount }: AppHeaderProps) {
  const t = useTranslations("header");
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  async function handleShare() {
    const shareData = {
      title: "Lernraum",
      text: t("shareText"),
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(shareData.url);
      setShareMessage(t("linkCopied"));
      window.setTimeout(() => setShareMessage(null), 2500);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      console.error("Share failed:", error);
      setShareMessage(t("shareUnavailable"));
      window.setTimeout(() => setShareMessage(null), 2500);
    }
  }

  return (
    <header className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#155368] sm:h-12 sm:w-12">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-7 w-7 text-white"
              aria-hidden="true"
            >
              <rect
                x="9"
                y="9"
                width="30"
                height="30"
                rx="8"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                d="M16 31V17H24C28 17 30 19 30 23C30 27 28 29 24 29H16"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M25 29L32 34"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-[24px] font-bold tracking-tight text-[#153C52] sm:text-[28px]">
              {t("title")}
            </h1>

            <p className="mt-0.5 hidden text-sm text-[#667D8C] sm:block">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              aria-label={t("shareAria")}
              title={t("share")}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#DCE4EA] bg-white text-[#17566E] transition-colors hover:border-[#A9C2CD] hover:bg-[#EEF5F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F83]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.8 7.6-4.4" />
                <path d="m8.2 13.2 7.6 4.4" />
              </svg>
            </button>

            {shareMessage && (
              <div
                role="status"
                className="absolute right-0 top-12 z-30 max-w-[260px] rounded-lg bg-[#16364C] px-3 py-2.5 text-xs font-medium text-white shadow-md"
              >
                {shareMessage}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-[#DCE5E8] bg-white px-3 py-2.5 text-sm font-semibold text-[#27576A] md:flex">
            <span className="h-2 w-2 rounded-full bg-[#10B89C]" />
            {roomCount} {roomCount === 1 ? t("room") : t("rooms")}
          </div>
        </div>
      </div>
    </header>
  );
}
