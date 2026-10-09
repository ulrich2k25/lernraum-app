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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br from-[#075985] to-[#0F8B8D] shadow-[0_8px_20px_rgba(7,89,133,0.20)] sm:h-14 sm:w-14">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              className="h-8 w-8 text-white"
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
            <h1 className="truncate text-[25px] font-extrabold tracking-[-0.05em] text-[#102A43] sm:text-[30px]">
              {t("title")}
            </h1>

            <p className="mt-0.5 hidden text-sm text-[#73879B] sm:block">
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
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DDE8EF] bg-white text-[#075985] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9AC9D5] hover:bg-[#EDF7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8B8D]"
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
                className="absolute right-0 top-14 z-30 max-w-[260px] rounded-xl bg-[#102A43] px-4 py-3 text-xs font-semibold text-white shadow-xl"
              >
                {shareMessage}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 rounded-2xl border border-[#D1ECE7] bg-[#ECF9F6] px-4 py-3 text-sm font-bold text-[#087F73] md:flex">
            <span className="h-2 w-2 rounded-full bg-[#10B89C]" />
            {roomCount} {roomCount === 1 ? t("room") : t("rooms")}
          </div>
        </div>
      </div>
    </header>
  );
}
