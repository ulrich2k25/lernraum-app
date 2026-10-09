"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import type { Room } from "../types/room";

type RoomCardProps = {
  room: Room;
};

export default function RoomCard({ room }: RoomCardProps) {
  const t = useTranslations("roomCard");

  const availability =
    room.kapazitaet > 0
      ? Math.min(100, Math.max(0, (room.freiePlaetze / room.kapazitaet) * 100))
      : 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#DFE8EF] bg-white shadow-[0_8px_32px_rgba(16,42,67,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#A9CDD9] hover:shadow-[0_20px_50px_rgba(16,42,67,0.10)]">
      {/* Decorative top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#075985] via-[#0F8B8D] to-[#63C9BA]" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF8F4] px-3 py-1.5 text-[11px] font-bold text-[#087F73]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0FAD91]" />
            {t("active")}
          </span>

          {(room.aktiveGruppen ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3FF] px-3 py-1.5 text-[11px] font-semibold text-[#3157A4]">
              <span aria-hidden="true">👥</span>

              {t("groupPresence", {
                groups: room.aktiveGruppen ?? 0,
                people: room.personenInGruppen ?? 0,
              })}
            </span>
          )}
        </div>

        {/* Room identity */}
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[28px] font-extrabold tracking-[-0.04em] text-[#102A43]">
              {room.raumBezeichnung}
            </h3>

            <p className="mt-1 text-sm text-[#718397]">
              {room.gebaeude} · {room.etage}
            </p>
          </div>

          <Link
            href={`/rooms/${room.id}`}
            aria-label={t("detailsAria", {
              room: room.raumBezeichnung,
            })}
            title={t("openDetails")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#DDEBF0] bg-[#F3F8FA] text-xl text-[#075985] transition-all duration-200 hover:border-[#075985] hover:bg-[#075985] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8B8D] focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {/* Temporary closure */}
        {room.isTemporarilyClosed && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs font-semibold text-amber-800">
            <span className="mt-0.5 text-amber-600" aria-hidden="true">
              ●
            </span>

            <div className="min-w-0 flex-1">
              <p>{t("temporarilyClosed")}</p>

              <p className="mt-1 text-[11px] font-normal leading-4 text-amber-700">
                {t("statusTooltip")}
              </p>
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="mt-5 rounded-[18px] border border-[#CFECE7] bg-gradient-to-br from-[#F0FBF8] via-[#ECF9F7] to-[#E9F5F9] p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#087F73]">
                {t("freeSeats")}
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[44px] font-extrabold leading-none tracking-[-0.06em] text-[#075985]">
                  {room.freiePlaetze}
                </span>

                <span className="text-xs font-semibold text-[#55778A]">
                  {room.freiePlaetze === 1 ? t("seatFree") : t("seatsFree")}
                </span>
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-[#0F8B8D] shadow-sm">
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="3" width="14" height="12" rx="2" />
                <path d="M8 21v-6M16 21v-6M5 9h14M3 21h18" />
              </svg>
            </div>
          </div>

          {/* Availability progress */}
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#D4E8E7]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0F8B8D] to-[#34BFA8] transition-[width] duration-500"
              style={{ width: `${availability}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] font-medium text-[#6B8791]">
            <span>{t("freeSeats")}</span>
            <span>
              {room.freiePlaetze}/{room.kapazitaet}
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E8EFF3] pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#8A9AAD]">
              {t("capacity")}
            </p>

            <p className="mt-1 text-sm font-bold text-[#102A43]">
              {room.kapazitaet}
              <span className="ml-1 font-medium text-[#8A9AAD]">
                {t("seats")}
              </span>
            </p>
          </div>

          <Link
            href={`/rooms/${room.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#102A43] px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-[#075985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F8B8D] focus-visible:ring-offset-2"
          >
            {t("details")}

            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
