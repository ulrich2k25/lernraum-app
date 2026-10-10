"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import DeleteMyData from "@/components/DeleteMyData";

type Visit = {
  id: number;
  status: string;
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
  groupSize: number;
  lernraum: {
    id: number;
    raumBezeichnung: string;
    gebaeude: string;
    etage: string;
  };
};

function HistoryIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function RoomIcon() {
  return (
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
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
      <path d="M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" />
    </svg>
  );
}

export default function BesuchePage() {
  const t = useTranslations("visits");
  const locale = useLocale();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));

  const formatTime = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(value))
      : "–";

  useEffect(() => {
    async function loadVisits() {
      try {
        const clientId = localStorage.getItem("lernraum-client-id");

        if (!clientId) {
          setVisits([]);
          return;
        }

        const response = await fetch(
          `/api/sessions/history/${encodeURIComponent(clientId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error(t("loadError"));
        }

        setVisits((await response.json()) as Visit[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadVisits();
  }, [t]);

  return (
    <main className="w-full flex-none bg-[#F4F8FA] pb-8 text-[#102A43] md:flex-1 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 lg:py-10">
        {/* Navigation */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#075985] transition hover:text-[#087F83]"
        >
          <span aria-hidden="true">←</span>
          {t("back")}
        </Link>

        {/* En-tête */}
        <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102A43] via-[#075985] to-[#087F83] px-6 py-8 text-white shadow-[0_16px_45px_rgba(16,42,67,0.13)] sm:px-9 sm:py-10">
          <div
            className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/10"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-white/15 bg-white/10 text-[#A5F3E7]">
              <HistoryIcon className="h-8 w-8" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A5F3E7]">
                {t("eyebrow")}
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {t("title")}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#DCECF2] sm:text-base">
                {t("description")}
              </p>
            </div>
          </div>
        </header>

        {/* Historique */}
        <section className="mt-8" aria-label={t("title")}>
          {isLoading && (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-[24px] border border-[#D9E7EC] bg-white p-8">
              <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#D9E7EC] border-t-[#087F83]" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                {t("loading")}
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div
              role="alert"
              className="rounded-[24px] border border-red-200 bg-red-50 p-6"
            >
              <p className="font-bold text-red-700">{t("loadError")}</p>
              <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && visits.length === 0 && (
            <div className="relative overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(16,42,67,0.035)] sm:py-16">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#EAF7F7] text-[#087F83]">
                <HistoryIcon className="h-10 w-10" />
              </div>

              <h2 className="mt-6 text-xl font-extrabold text-[#102A43] sm:text-2xl">
                {t("emptyTitle")}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 sm:text-base">
                {t("emptyText")}
              </p>

              <div className="mx-auto mt-7 h-1 w-12 rounded-full bg-[#0F8B8D]/25" />
            </div>
          )}

          {!isLoading && !error && visits.length > 0 && (
            <div className="space-y-4">
              {visits.map((visit) => {
                const isGroupVisit = visit.groupSize >= 2;

                return (
                  <article
                    key={visit.id}
                    className="group overflow-hidden rounded-[24px] border border-[#D9E7EC] bg-white shadow-[0_6px_24px_rgba(16,42,67,0.035)] transition hover:border-[#B8D9DE] hover:shadow-[0_12px_35px_rgba(16,42,67,0.07)]"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF7F7] text-[#087F83]">
                            <RoomIcon />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#087F83]">
                              <CalendarIcon />
                              <span>{formatDate(visit.startedAt)}</span>
                            </div>

                            <h2 className="mt-2 text-lg font-extrabold tracking-tight text-[#102A43] sm:text-xl">
                              {t("room", {
                                room: visit.lernraum.raumBezeichnung,
                              })}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              {visit.lernraum.gebaeude} ·{" "}
                              {t("floor", {
                                floor: visit.lernraum.etage,
                              })}
                            </p>

                            {isGroupVisit && (
                              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D5E1FF] bg-[#EEF4FF] px-3 py-1.5 text-xs font-bold text-[#3157A4]">
                                <GroupIcon />
                                {t("groupVisit", {
                                  count: visit.groupSize,
                                })}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D7EDE7] bg-[#EFFAF5] px-3 py-1.5 text-xs font-bold text-[#25846A]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#25846A]" />
                          {t("ended")}
                        </span>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-[#F5F9FA] p-4 sm:max-w-lg sm:gap-6">
                        <div>
                          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <ClockIcon />
                            {t("checkIn")}
                          </p>

                          <p className="mt-2 text-base font-extrabold text-[#102A43]">
                            {formatTime(visit.startedAt)}{" "}
                            <span className="text-xs font-medium text-slate-500">
                              {t("timeSuffix")}
                            </span>
                          </p>
                        </div>

                        <div className="border-l border-[#DCE8EC] pl-4 sm:pl-6">
                          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <ClockIcon />
                            {t("checkOut")}
                          </p>

                          <p className="mt-2 text-base font-extrabold text-[#102A43]">
                            {visit.endedAt ? (
                              <>
                                {formatTime(visit.endedAt)}{" "}
                                <span className="text-xs font-medium text-slate-500">
                                  {t("timeSuffix")}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm">
                                {t("automaticEnd")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Gestion des données */}
        <DeleteMyData />
      </div>
    </main>
  );
}
