"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Visit = { id:number; status:string; startedAt:string; expiresAt:string; endedAt:string|null; lernraum:{id:number;raumBezeichnung:string;gebaeude:string;etage:string} };

export default function BesuchePage() {
  const t = useTranslations("visits");
  const locale = useLocale();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (value:string) => new Intl.DateTimeFormat(locale,{day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(value));
  const formatTime = (value:string|null) => value ? new Intl.DateTimeFormat(locale,{hour:"2-digit",minute:"2-digit"}).format(new Date(value)) : "–";

  useEffect(() => {
    async function loadVisits() {
      try {
        const clientId = localStorage.getItem("lernraum-client-id");
        if (!clientId) { setVisits([]); return; }
        const response = await fetch(`/api/sessions/history/${encodeURIComponent(clientId)}`, { cache:"no-store" });
        if (!response.ok) throw new Error(t("loadError"));
        setVisits((await response.json()) as Visit[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("loadError"));
      } finally { setIsLoading(false); }
    }
    void loadVisits();
  }, [t]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0B7285] transition hover:text-[#075985]"><span aria-hidden="true">←</span>{t("back")}</Link>
      <div className="mb-8"><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#0B7285]">{t("eyebrow")}</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("title")}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{t("description")}</p></div>
      {isLoading && <div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm text-slate-600">{t("loading")}</p></div>}
      {!isLoading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5"><p className="font-semibold text-red-700">{t("loadError")}</p><p className="mt-1 text-sm text-red-600">{error}</p></div>}
      {!isLoading && !error && visits.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F5F7] text-[#0B7285]">↻</div><h2 className="text-lg font-bold text-slate-900">{t("emptyTitle")}</h2><p className="mt-2 text-sm text-slate-600">{t("emptyText")}</p></div>}
      {!isLoading && !error && visits.length > 0 && <div className="space-y-4">{visits.map((visit)=><article key={visit.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-sm font-semibold text-[#0B7285]">{formatDate(visit.startedAt)}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("room",{room:visit.lernraum.raumBezeichnung})}</h2><p className="mt-1 text-sm text-slate-600">{visit.lernraum.gebaeude} · {t("floor",{floor:visit.lernraum.etage})}</p></div><span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{t("ended")}</span></div><div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:max-w-md"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("checkIn")}</p><p className="mt-1 font-semibold text-slate-800">{formatTime(visit.startedAt)} {t("timeSuffix")}</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t("checkOut")}</p><p className="mt-1 font-semibold text-slate-800">{visit.endedAt ? `${formatTime(visit.endedAt)} ${t("timeSuffix")}` : t("automaticEnd")}</p></div></div></article>)}</div>}
    </main>
  );
}
