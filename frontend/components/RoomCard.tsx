"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Room } from "../types/room";

type RoomCardProps = { room: Room };

export default function RoomCard({ room }: RoomCardProps) {
  const t = useTranslations("roomCard");
  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white p-5 shadow-[0_8px_30px_rgba(15,42,67,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#9CCFD3] hover:shadow-[0_16px_40px_rgba(15,42,67,0.12)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E9FAF7] px-3 py-1.5 text-xs font-bold text-[#087F73]"><span className="h-2 w-2 rounded-full bg-[#14B8A6]" />{t("active")}</div>
            {room.isTemporarilyClosed && (
              <div className="relative inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" /><span>{t("temporarilyClosed")}</span>
                <button type="button" aria-label={t("statusInfo")} onMouseLeave={(event) => event.currentTarget.blur()} className="group/info relative flex h-5 w-5 items-center justify-center rounded-full text-sm font-semibold text-amber-600 outline-none">ⓘ
                  <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-64 -translate-x-1/2 rounded-xl bg-[#102A43] px-3 py-2 text-center text-xs font-medium leading-5 text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/info:opacity-100 group-focus/info:opacity-100">{t("statusTooltip")}</span>
                </button>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-[#102A43]">{room.raumBezeichnung}</h3>
          <p className="mt-1 text-sm text-slate-500">{room.gebaeude} · {room.etage}</p>
        </div>
        <Link href={`/rooms/${room.id}`} aria-label={t("detailsAria", { room: room.raumBezeichnung })} title={t("openDetails")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EDF7FA] text-xl text-[#075985] transition duration-200 hover:scale-105 hover:bg-[#075985] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0F8B8D] focus:ring-offset-2">→</Link>
      </div>
      <div className="mt-6 rounded-2xl border border-[#BFE8E4] bg-gradient-to-br from-[#F0FCFA] to-[#E8F7FA] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#087F73]">{t("freeSeats")}</p>
        <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-bold leading-none text-[#075985]">{room.freiePlaetze}</span><span className="pb-1 text-sm font-semibold text-slate-500">{room.freiePlaetze === 1 ? t("seatFree") : t("seatsFree")}</span></div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
        <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{t("capacity")}</p><p className="mt-1 text-2xl font-bold text-[#102A43]">{room.kapazitaet}<span className="ml-1 text-sm font-medium text-slate-400">{t("seats")}</span></p></div>
        <Link href={`/rooms/${room.id}`} className="rounded-xl text-right transition hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[#0F8B8D] focus:ring-offset-2"><p className="text-sm font-semibold text-[#075985]">{t("details")}</p><p className="mt-1 text-xs text-slate-400">{t("openDetails")}</p></Link>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#075985] via-[#0F8B8D] to-[#F4C95D]" />
    </article>
  );
}
