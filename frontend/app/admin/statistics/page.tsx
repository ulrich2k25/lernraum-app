"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type Period = 1 | 7 | 30;

type Statistics = {
  totalCheckIns: number;
  totalPeople: number;
  averageDurationMinutes: number | null;
  dailyCheckIns: {
    date: string;
    count: number;
  }[];
  roomUsage: {
    roomId: number;
    room: string;
    count: number;
  }[];
};

const translations = {
  de: {
    management: "Lernraum Verwaltung",
    title: "Nutzungsstatistiken",
    description: "Nutzung der Lernräume im ausgewählten Zeitraum.",
    rooms: "Lernräume",
    logout: "Abmelden",
    today: "Heute",
    days7: "7 Tage",
    days30: "30 Tage",
    total: "Check-ins gesamt",
    people: "Erfasste Personen",
    average: "Durchschnittliche Sitzungsdauer",
    minutes: "Min.",
    completedOnly: "Nur abgeschlossene Sitzungen berücksichtigt.",
    daily: "Check-ins pro Tag",
    usage: "Nutzung pro Lernraum",
    checkIns: "Check-ins",
    loading: "Statistiken werden geladen ...",
    error: "Die Statistiken konnten nicht geladen werden.",
    empty: "Keine Daten für diesen Zeitraum vorhanden.",
    retry: "Erneut versuchen",
    dataNote:
      "Die Statistiken basieren auf erfassten Check-ins. Die tatsächliche Raumbelegung kann davon abweichen.",
  },
  en: {
    management: "Lernraum Administration",
    title: "Usage statistics",
    description: "Study room usage during the selected period.",
    rooms: "Study rooms",
    logout: "Log out",
    today: "Today",
    days7: "7 days",
    days30: "30 days",
    total: "Total check-ins",
    people: "Recorded people",
    average: "Average session duration",
    minutes: "min",
    completedOnly: "Only completed sessions are included.",
    daily: "Check-ins per day",
    usage: "Usage by study room",
    checkIns: "Check-ins",
    loading: "Loading statistics ...",
    error: "Statistics could not be loaded.",
    empty: "No data available for this period.",
    retry: "Try again",
    dataNote:
      "Statistics are based on recorded check-ins. Actual room occupancy may differ.",
  },
  fr: {
    management: "Administration Lernraum",
    title: "Statistiques d'utilisation",
    description: "Utilisation des salles sur la période sélectionnée.",
    rooms: "Salles",
    logout: "Déconnexion",
    today: "Aujourd'hui",
    days7: "7 jours",
    days30: "30 jours",
    total: "Total des check-ins",
    people: "Personnes enregistrées",
    average: "Durée moyenne des sessions",
    minutes: "min",
    completedOnly: "Seules les sessions terminées sont prises en compte.",
    daily: "Check-ins par jour",
    usage: "Utilisation par salle",
    checkIns: "Check-ins",
    loading: "Chargement des statistiques ...",
    error: "Impossible de charger les statistiques.",
    empty: "Aucune donnée pour cette période.",
    retry: "Réessayer",
    dataNote:
      "Les statistiques reposent sur les check-ins enregistrés. L'occupation réelle des salles peut être différente.",
  },
} as const;

export default function AdminStatisticsPage() {
  const router = useRouter();
  const locale = useLocale();

  const language = locale === "en" || locale === "fr" ? locale : "de";
  const t = translations[language];

  const [period, setPeriod] = useState<Period>(7);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("lernraum-admin-token");
    localStorage.removeItem("lernraum-admin");
    router.replace("/admin/login");
  }, [router]);

  const loadStatistics = useCallback(
    async (days: Period, signal?: AbortSignal) => {
      const token = localStorage.getItem("lernraum-admin-token");

      if (!token) {
        handleUnauthorized();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/admin/statistics?days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            signal,
          },
        );

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load statistics");
        }

        const data = (await response.json()) as Statistics;

        if (signal?.aborted) return;

        setStatistics(data);
      } catch (err) {
        if (signal?.aborted) return;

        console.error("Statistics loading failed:", err);
        setError(t.error);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [handleUnauthorized, t.error],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadStatistics(period, controller.signal);

    return () => controller.abort();
  }, [period, loadStatistics]);

  function handleLogout() {
    localStorage.removeItem("lernraum-admin-token");
    localStorage.removeItem("lernraum-admin");
    router.push("/admin/login");
  }

  const dateLocale =
    language === "de" ? "de-DE" : language === "fr" ? "fr-FR" : "en-GB";

  const maxDailyCount = Math.max(
    1,
    ...(statistics?.dailyCheckIns.map((item) => item.count) ?? []),
  );

  function formatDuration(minutes: number | null): string {
    if (minutes === null) {
      return "–";
    }

    if (minutes > 0 && minutes < 1) {
      return `< 1 ${t.minutes}`;
    }

    return `${Math.round(minutes)} ${t.minutes}`;
  }

  return (
    <main className="flex-none bg-[#F4F8FA] text-[#102A43] md:flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 md:px-8">
        {/* HEADER */}
        <header className="rounded-[26px] bg-gradient-to-br from-[#102A43] via-[#164765] to-[#087F83] px-6 py-7 text-white sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#B7F4EB]">
                {t.management}
              </p>

              <h1 className="mt-3 text-3xl font-extrabold">{t.title}</h1>

              <p className="mt-2 text-sm text-[#D5E7EE]">{t.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-white px-2 py-1">
                <LanguageSwitcher />
              </div>

              <Link
                href="/admin/rooms"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#102A43] transition hover:bg-[#EAF8F6]"
              >
                {t.rooms}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </header>

        {/* PERIOD FILTERS */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              [1, t.today],
              [7, t.days7],
              [30, t.days30],
            ] as const
          ).map(([days, label]) => (
            <button
              key={days}
              type="button"
              onClick={() => setPeriod(days)}
              aria-pressed={period === days}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                period === days
                  ? "bg-[#102A43] text-white"
                  : "border border-[#E0EAF0] bg-white text-[#526B7D] hover:bg-[#EAF8F6]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-[#71869A]">
            {t.loading}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <p className="text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => void loadStatistics(period)}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              {t.retry}
            </button>
          </div>
        )}

        {/* STATISTICS */}
        {!loading && !error && statistics && (
          <>
            {/* MAIN INDICATORS */}
            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <StatCard label={t.total} value={statistics.totalCheckIns} />

              <StatCard label={t.people} value={statistics.totalPeople} />

              <div>
                <StatCard
                  label={t.average}
                  value={formatDuration(statistics.averageDurationMinutes)}
                />

                <p className="mt-2 px-1 text-xs text-[#71869A]">
                  {t.completedOnly}
                </p>
              </div>
            </section>

            {/* DAILY CHECK-INS */}
            <section className="mt-6 rounded-[22px] border border-[#E0EAF0] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-extrabold">{t.daily}</h2>

              {statistics.dailyCheckIns.length === 0 ? (
                <p className="mt-5 text-sm text-[#71869A]">{t.empty}</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {statistics.dailyCheckIns.map((item) => (
                    <div
                      key={item.date}
                      className="grid grid-cols-[85px_1fr_35px] items-center gap-3"
                    >
                      <span className="text-xs text-[#526B7D]">
                        {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                          dateLocale,
                          {
                            day: "2-digit",
                            month: "2-digit",
                          },
                        )}
                      </span>

                      <div className="h-3 overflow-hidden rounded-full bg-[#EDF2F5]">
                        <div
                          className="h-full rounded-full bg-[#087F83]"
                          style={{
                            width: `${(item.count / maxDailyCount) * 100}%`,
                          }}
                        />
                      </div>

                      <span className="text-right text-sm font-bold">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ROOM USAGE */}
            <section className="mt-6 rounded-[22px] border border-[#E0EAF0] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-extrabold">{t.usage}</h2>

              {statistics.roomUsage.length === 0 ? (
                <p className="mt-5 text-sm text-[#71869A]">{t.empty}</p>
              ) : (
                <div className="mt-5 divide-y divide-[#EDF2F5]">
                  {statistics.roomUsage.map((item) => (
                    <div
                      key={item.roomId}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <span className="text-sm font-medium">{item.room}</span>

                      <span className="text-sm font-bold text-[#087F83]">
                        {item.count} {t.checkIns}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* DATA LIMITATIONS */}
            <p className="mt-5 text-xs leading-5 text-[#71869A]">
              {t.dataNote}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[20px] border border-[#E0EAF0] bg-white p-5">
      <p className="text-xs font-semibold text-[#71869A]">{label}</p>

      <p className="mt-2 text-3xl font-extrabold text-[#087F83]">{value}</p>
    </div>
  );
}
