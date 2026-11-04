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

  const isClosed = room.isUnderRenovation || room.isTemporarilyClosed;

  return (
    <article className="flex flex-col rounded-xl border border-[#DCE5EA] bg-white transition-colors duration-200 hover:border-[#A2BCC8]">
      <div className="flex flex-col p-5 sm:p-6">

        {/* Room information */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[25px] font-bold tracking-tight text-[#153C52]">
              {room.raumBezeichnung}
            </h3>

            <p className="mt-1 text-sm text-[#647D8D]">
              {room.gebaeude} · {room.etage}
            </p>
          </div>

          {room.isUnderRenovation ? (
            <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {t("renovationBadge")}
            </span>
          ) : room.isTemporarilyClosed ? (
            <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {t("temporarilyClosed")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-md border border-[#CDE8DC] bg-[#F0F8F4] px-2.5 py-1.5 text-xs font-semibold text-[#176346]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1A9B76]" />
              {t("active")}
            </span>
          )}
        </div>

        {/* Group presence */}
        {(room.aktiveGruppen ?? 0) > 0 && (
          <div className="mt-4">
            <span className="inline-flex rounded-md bg-[#EDF4FA] px-2.5 py-1.5 text-xs font-medium text-[#315779]">
              {t("groupPresence", {
                groups: room.aktiveGruppen ?? 0,
                people: room.personenInGruppen ?? 0,
              })}
            </span>
          </div>
        )}

        {/* Renovation information */}
        {room.isUnderRenovation && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800"
          >
            {t("renovationMessage")}
          </p>
        )}

        {/* Temporary closure information */}
        {!room.isUnderRenovation && room.isTemporarilyClosed && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800"
          >
            {t("statusTooltip")}
          </p>
        )}

        {/* Availability */}
        <div className="mt-5 border-t border-[#E8EDF0] pt-4">
          <p className="text-xs font-semibold text-[#667E8D]">
            {t("freeSeats")}
          </p>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[38px] font-bold leading-none tracking-tight text-[#153C52]">
              {room.freiePlaetze}
            </span>

            <span className="text-sm text-[#647D8D]">
              {room.freiePlaetze === 1 ? t("seatFree") : t("seatsFree")}
            </span>
          </div>

          <div
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#E7EDF0]"
            role="progressbar"
            aria-valuenow={room.freiePlaetze}
            aria-valuemin={0}
            aria-valuemax={room.kapazitaet}
            aria-label={t("freeSeats")}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                isClosed ? "bg-[#B9C7CF]" : "bg-[#27867E]"
              }`}
              style={{ width: `${availability}%` }}
            />
          </div>

          <p className="mt-2 text-right text-xs text-[#718796]">
            {room.freiePlaetze}/{room.kapazitaet}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8EDF0] pt-4">
          <div>
            <p className="text-xs text-[#718796]">
              {t("capacity")}
            </p>

            <p className="mt-1 text-sm font-semibold text-[#153C52]">
              {room.kapazitaet} {t("seats")}
            </p>
          </div>

          <Link
            href={`/rooms/${room.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#17536B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#103E52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7791] focus-visible:ring-offset-2"
          >
            {t("details")}
          </Link>
        </div>
      </div>
    </article>
  );
}