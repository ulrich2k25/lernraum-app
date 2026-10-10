"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import LanguageSwitcher from "@/components/LanguageSwitcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type Rating = "POSITIVE" | "NEGATIVE";
type Filter = "ALL" | Rating;
type Sort = "NEWEST" | "OLDEST";

type Feedback = {
  id: number;
  rating: Rating;
  message: string | null;
  createdAt: string;
};

type Statistics = {
  total: number;
  positive: number;
  negative: number;
};

const translations = {
  de: {
    management: "Lernraum Verwaltung",
    title: "Feedback",
    description:
      "Rückmeldungen der Studierenden auswerten und Verbesserungsmöglichkeiten erkennen.",
    rooms: "Lernräume",
    logout: "Abmelden",
    total: "Feedback gesamt",
    positive: "Positiv",
    negative: "Negativ",
    satisfaction: "Positive Bewertungen",
    all: "Alle",
    search: "Feedback durchsuchen ...",
    newest: "Neueste zuerst",
    oldest: "Älteste zuerst",
    refresh: "Aktualisieren",
    refreshing: "Wird aktualisiert ...",
    loading: "Feedback wird geladen ...",
    error: "Die Rückmeldungen konnten nicht geladen werden.",
    empty: "Noch kein Feedback vorhanden",
    noResults: "Keine passenden Rückmeldungen gefunden.",
    noMessage: "Kein Kommentar hinterlassen.",
    results: "Rückmeldungen",
    anonymous: "Anonymes Feedback",
    retry: "Erneut versuchen",
  },
  en: {
    management: "Lernraum Administration",
    title: "Feedback",
    description:
      "Review student feedback and identify opportunities for improvement.",
    rooms: "Study rooms",
    logout: "Log out",
    total: "Total feedback",
    positive: "Positive",
    negative: "Negative",
    satisfaction: "Positive ratings",
    all: "All",
    search: "Search feedback ...",
    newest: "Newest first",
    oldest: "Oldest first",
    refresh: "Refresh",
    refreshing: "Refreshing ...",
    loading: "Loading feedback ...",
    error: "Feedback could not be loaded.",
    empty: "No feedback yet",
    noResults: "No matching feedback found.",
    noMessage: "No comment provided.",
    results: "Feedback entries",
    anonymous: "Anonymous feedback",
    retry: "Try again",
  },
  fr: {
    management: "Administration Lernraum",
    title: "Avis des étudiants",
    description:
      "Consulter les avis des étudiants et identifier les améliorations possibles.",
    rooms: "Salles",
    logout: "Déconnexion",
    total: "Total des avis",
    positive: "Positifs",
    negative: "Négatifs",
    satisfaction: "Avis positifs",
    all: "Tous",
    search: "Rechercher un avis ...",
    newest: "Plus récents",
    oldest: "Plus anciens",
    refresh: "Actualiser",
    refreshing: "Actualisation ...",
    loading: "Chargement des avis ...",
    error: "Impossible de charger les avis.",
    empty: "Aucun avis pour le moment",
    noResults: "Aucun avis correspondant.",
    noMessage: "Aucun commentaire.",
    results: "Avis",
    anonymous: "Avis anonyme",
    retry: "Réessayer",
  },
} as const;

export default function AdminFeedbackPage() {
  const locale = useLocale();
  const router = useRouter();

  const language = locale === "en" || locale === "fr" ? locale : "de";

  const t = translations[language];

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    positive: 0,
    negative: 0,
  });

  const [filter, setFilter] = useState<Filter>("ALL");
  const [sort, setSort] = useState<Sort>("NEWEST");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("lernraum-admin-token");
    localStorage.removeItem("lernraum-admin");
    router.replace("/admin/login");
  }, [router]);

  const loadFeedback = useCallback(
    async (showLoading = false, signal?: AbortSignal) => {
      const token = localStorage.getItem("lernraum-admin-token");

      if (!token) {
        handleUnauthorized();
        return;
      }

      if (!showLoading) {
        setRefreshing(true);
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [feedbackResponse, statisticsResponse] = await Promise.all([
          fetch(`${API_URL}/admin/feedback`, {
            headers,
            cache: "no-store",
            signal,
          }),
          fetch(`${API_URL}/admin/feedback/statistics`, {
            headers,
            cache: "no-store",
            signal,
          }),
        ]);

        if (
          feedbackResponse.status === 401 ||
          statisticsResponse.status === 401
        ) {
          handleUnauthorized();
          return;
        }

        if (!feedbackResponse.ok || !statisticsResponse.ok) {
          throw new Error("Failed to load feedback");
        }

        const feedbackData = (await feedbackResponse.json()) as Feedback[];

        const statisticsData = (await statisticsResponse.json()) as Statistics;

        if (signal?.aborted) return;

        setFeedback(feedbackData);
        setStatistics(statisticsData);
        setError(null);
      } catch (err) {
        if (signal?.aborted) return;

        console.error("Feedback loading failed:", err);
        setError(t.error);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [handleUnauthorized, t.error],
  );

  useEffect(() => {
    const controller = new AbortController();

    void Promise.resolve().then(() => loadFeedback(true, controller.signal));

    return () => {
      controller.abort();
    };
  }, [loadFeedback]);

  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return feedback
      .filter((item) => {
        if (filter !== "ALL" && item.rating !== filter) {
          return false;
        }

        if (
          query &&
          !(item.message ?? "").toLocaleLowerCase().includes(query)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const difference =
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        return sort === "NEWEST" ? difference : -difference;
      });
  }, [feedback, filter, search, sort]);

  const positivePercentage =
    statistics.total > 0
      ? Math.round((statistics.positive / statistics.total) * 100)
      : 0;

  const dateLocale =
    language === "de" ? "de-DE" : language === "fr" ? "fr-FR" : "en-GB";

  function handleLogout() {
    localStorage.removeItem("lernraum-admin-token");
    localStorage.removeItem("lernraum-admin");
    router.push("/admin/login");
  }

  return (
    <main className="flex-none bg-[#F4F8FA] text-[#102A43] md:flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 md:px-8">
        {/* HEADER */}
        <header className="relative z-20 rounded-[26px] bg-gradient-to-br from-[#102A43] via-[#164765] to-[#087F83] px-6 py-7 text-white shadow-[0_14px_35px_rgba(16,42,67,0.12)] sm:px-8 sm:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B7F4EB]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
                {t.management}
              </div>

              <h1 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">
                {t.title}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#D5E7EE]">
                {t.description}
              </p>
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

        {/* STATISTICS */}
        <section
          aria-label={t.title}
          className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        >
          <StatCard label={t.total} value={statistics.total} accent="blue" />

          <StatCard
            label={t.positive}
            value={statistics.positive}
            accent="teal"
          />

          <StatCard
            label={t.negative}
            value={statistics.negative}
            accent="rose"
          />

          <StatCard
            label={t.satisfaction}
            value={`${positivePercentage}%`}
            accent="teal"
          />
        </section>

        {/* FILTERS */}
        <section className="mt-7 rounded-[24px] border border-[#E0EAF0] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold">{t.results}</h2>

              <button
                type="button"
                onClick={() => void loadFeedback()}
                disabled={loading || refreshing}
                className="rounded-xl border border-[#DCE6EC] px-4 py-2.5 text-sm font-semibold text-[#075985] transition hover:bg-[#F4F8FA] disabled:opacity-50"
              >
                {refreshing ? t.refreshing : t.refresh}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["ALL", t.all],
                  ["POSITIVE", t.positive],
                  ["NEGATIVE", t.negative],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    filter === value
                      ? "bg-[#102A43] text-white"
                      : "bg-[#F4F8FA] text-[#526B7D] hover:bg-[#E7EFF3]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                aria-label={t.search}
                className="w-full rounded-xl border border-[#DCE6EC] bg-[#F8FAFC] px-4 py-3 text-sm outline-none transition focus:border-[#087F83] focus:ring-2 focus:ring-[#087F83]/10"
              />

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                aria-label={t.newest}
                className="rounded-xl border border-[#DCE6EC] bg-[#F8FAFC] px-4 py-3 text-sm outline-none focus:border-[#087F83]"
              >
                <option value="NEWEST">{t.newest}</option>
                <option value="OLDEST">{t.oldest}</option>
              </select>
            </div>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <div
            role="status"
            className="mt-5 rounded-2xl border border-[#E0EAF0] bg-white p-8 text-center text-sm text-[#71869A]"
          >
            {t.loading}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6"
          >
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => void loadFeedback()}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              {t.retry}
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredFeedback.length === 0 && (
          <div className="mt-5 rounded-2xl border border-[#E0EAF0] bg-white p-10 text-center">
            <p className="text-lg font-bold">
              {feedback.length === 0 ? t.empty : t.noResults}
            </p>
          </div>
        )}

        {/* FEEDBACK LIST */}
        {!loading && !error && filteredFeedback.length > 0 && (
          <section className="mt-5 space-y-4">
            {filteredFeedback.map((item) => {
              const isPositive = item.rating === "POSITIVE";

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[22px] border border-[#E0EAF0] bg-white shadow-[0_4px_16px_rgba(16,42,67,0.03)]"
                >
                  <div
                    className={`h-1 ${
                      isPositive ? "bg-[#087F83]" : "bg-rose-400"
                    }`}
                  />

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                          isPositive
                            ? "bg-[#E7F7F2] text-[#087F83]"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <span aria-hidden="true">
                          {isPositive ? "👍" : "👎"}
                        </span>

                        {isPositive ? t.positive : t.negative}
                      </span>

                      <time
                        dateTime={item.createdAt}
                        className="text-xs font-medium text-[#71869A]"
                      >
                        {new Date(item.createdAt).toLocaleString(dateLocale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                    </div>

                    <p
                      className={`mt-4 whitespace-pre-wrap break-words text-sm leading-7 ${
                        item.message
                          ? "text-[#344F65]"
                          : "italic text-[#94A3B8]"
                      }`}
                    >
                      {item.message || t.noMessage}
                    </p>

                    <div className="mt-5 border-t border-[#EDF2F5] pt-4">
                      <p className="text-xs text-[#94A3B8]">
                        {t.anonymous} · #{item.id}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: "blue" | "teal" | "rose";
}) {
  const valueColor =
    accent === "teal"
      ? "text-[#087F83]"
      : accent === "rose"
        ? "text-rose-600"
        : "text-[#102A43]";

  return (
    <div className="rounded-[20px] border border-[#E0EAF0] bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-semibold text-[#71869A]">{label}</p>

      <p
        className={`mt-2 text-[28px] font-extrabold tracking-tight ${valueColor}`}
      >
        {value}
      </p>
    </div>
  );
}
