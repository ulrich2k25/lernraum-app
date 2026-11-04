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
    <main
      data-lernraum-help
      className="mx-auto w-full max-w-6xl flex-none px-4 pb-8 pt-6 text-[#183247] sm:px-6 md:flex-1 md:px-8 md:pb-12 md:pt-8"
    >
      <Link
        href="/"
        className="mb-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#C7D9E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#17536B] transition-colors hover:border-[#8FB2C1] hover:bg-[#EEF5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791]"
      >
        {t("back")}
      </Link>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#153C52] sm:text-4xl">
          {t("title")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#647D8D] sm:text-base">
          {t("description")}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2" aria-label={t("title")}>
        {steps.map((step) => (
          <article
            key={step.number}
            className="rounded-xl border border-[#DCE5EA] bg-white p-5 sm:p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EDF5F7] text-sm font-semibold text-[#17536B]">
              {step.number}
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[#153C52]">
              {t(step.title)}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#647D8D]">
              {t(step.description)}
            </p>
          </article>
        ))}
      </section>

      <aside className="mt-5 rounded-xl border border-[#CFE4DE] bg-[#F1F8F5] px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-[#153C52]">
          {t("noticeTitle")}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#496B70]">
          {t("noticeDescription")}
        </p>
      </aside>
    </main>
  );
}
