"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const steps = [
  {
    number: "01",
    title: "findTitle",
    description: "findDescription",
  },
  {
    number: "02",
    title: "checkInTitle",
    description: "checkInDescription",
  },
  {
    number: "03",
    title: "sessionTitle",
    description: "sessionDescription",
  },
  {
    number: "04",
    title: "checkOutTitle",
    description: "checkOutDescription",
  },
] as const;

export default function HelpPage() {
  const t = useTranslations("help");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6 text-[#102A43] sm:px-6 md:px-8 md:pt-8">
      <section className="rounded-[26px] bg-gradient-to-br from-[#102A43] via-[#164765] to-[#087F83] px-6 py-8 text-white sm:px-9 sm:py-10">
        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#B7F4EB]">
          Lernraum
        </span>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#D5E7EE] sm:text-base">
          {t("description")}
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <article
            key={step.number}
            className="rounded-[22px] border border-[#DFE9EF] bg-white p-6 shadow-[0_8px_30px_rgba(16,42,67,0.04)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F5F2] text-sm font-extrabold text-[#087F83]">
              {step.number}
            </div>

            <h2 className="mt-5 text-lg font-bold">{t(step.title)}</h2>

            <p className="mt-2 text-sm leading-7 text-[#60778A]">
              {t(step.description)}
            </p>
          </article>
        ))}
      </section>

      <aside className="mt-6 rounded-[22px] border border-[#CFE5E4] bg-[#EAF7F5] px-6 py-5">
        <h2 className="font-bold text-[#102A43]">{t("noticeTitle")}</h2>

        <p className="mt-2 text-sm leading-7 text-[#496B70]">
          {t("noticeDescription")}
        </p>
      </aside>

      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-[#102A43] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#173F5D]"
        >
          {t("back")}
        </Link>
      </div>
    </main>
  );
}
