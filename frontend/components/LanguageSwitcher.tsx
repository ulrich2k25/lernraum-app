"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function changeLanguage(language: string) {
    // Cookie write is intentional: it persists the user-selected locale.
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `lernraum-locale=${language}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={t("aria")} aria-expanded={open} className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18" /><path d="M12 3a15 15 0 0 0 0 18" />
        </svg>
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 min-w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {languages.map((language) => (
            <button key={language.code} type="button" onClick={() => changeLanguage(language.code)} className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition ${locale === language.code ? "bg-[#E7F5F7] font-semibold text-[#075985]" : "text-slate-700 hover:bg-slate-50"}`}>
              {language.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
