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
    <header className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-1 flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />

          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              aria-label={t("shareAria")}
              title={t("share")}
              className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#BFD8E3] bg-white text-[#075985] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#075985] hover:bg-[#075985] hover:text-white hover:shadow-md"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="m8.2 10.8 7.6-4.4" />
                <path d="m8.2 13.2 7.6 4.4" />
              </svg>
            </button>

            {shareMessage && (
              <div role="status" className="absolute right-0 top-14 z-20 whitespace-nowrap rounded-lg bg-[#102A43] px-3 py-2 text-xs font-semibold text-white shadow-lg">
                {shareMessage}
              </div>
            )}
          </div>

          <div className="hidden whitespace-nowrap rounded-full border border-[#BFE8E4] bg-[#E9FAF7] px-4 py-2 text-sm font-bold text-[#087F73] sm:block">
            {roomCount} {roomCount === 1 ? t("room") : t("rooms")}
          </div>
        </div>
      </div>
    </header>
  );
}
