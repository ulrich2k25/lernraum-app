import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import type { Room } from "../../../types/room";
import RoomDetailAutoRefresh from "../../../components/RoomDetailAutoRefresh";

type RoomDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const t = await getTranslations("roomDetail");
  const { id } = await params;

  const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3002"}/rooms/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(t("loadError"));
  }

  const room: Room = await response.json();

  const isActive = room.status === "ACTIVE";
  const canCheckIn = isActive && !room.isUnderRenovation;
  const hasGroups = (room.aktiveGruppen ?? 0) > 0;

  return (
    <main data-lernraum-room-detail className="flex-none bg-[#F6F8FA] pb-8 text-[#183247] md:flex-1">
      <RoomDetailAutoRefresh />
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:px-8 lg:py-9">
        {room.isUnderRenovation && (
          <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:p-5">
            <p className="text-base font-bold">
              <span aria-hidden="true">&#128679;</span>{" "}
              {t("renovationTitle")}
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              {t("renovationMessage")}
            </p>
          </div>
        )}
        <Link
          href="/"
          className="mb-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#C7D9E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#17536B] transition-colors hover:border-[#8FB2C1] hover:bg-[#EEF5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791] sm:mb-6"
        >
          {t("back")}
        </Link>

        <section className="overflow-hidden rounded-xl border border-[#DCE5EA] bg-white">
          <div className="border-b border-[#E8EDF0] bg-white px-5 py-6 text-[#153C52] sm:px-7 sm:py-7">


            <div className="relative">
              <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
                <div
                  className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                    room.isUnderRenovation
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : isActive
                        ? "border-[#CDE8DC] bg-[#F0F8F4] text-[#176346]"
                        : "border-[#DCE5EA] bg-[#F3F5F6] text-[#596C79]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      room.isUnderRenovation
                        ? "bg-amber-500"
                        : isActive
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                    }`}
                  />

                  {room.isUnderRenovation ? t("renovationTitle") : isActive ? t("active") : t("unavailable")}
                </div>

                {hasGroups && (
                  <div className="inline-flex items-center gap-2 rounded-md border border-[#D8E5F0] bg-[#F0F5FA] px-2.5 py-1.5 text-xs font-medium text-[#315779]">
                    <span aria-hidden="true">👥</span>

                    <span>
                      {t("groupPresence", {
                        groups: room.aktiveGruppen ?? 0,
                        people: room.personenInGruppen ?? 0,
                      })}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs font-semibold text-[#698090]">
                {t("roomLabel")}
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#153C52] sm:text-4xl">
                {room.raumBezeichnung}
              </h1>

              <p className="mt-1.5 text-sm text-[#647D8D] sm:text-base">
                {room.gebaeude} · {room.etage}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="rounded-lg border border-[#CFE4DE] bg-[#F2F8F6] p-4 sm:p-5">
                <p className="text-xs font-semibold text-[#286C61]">
                  {t("freeSeats")}
                </p>

                <div className="mt-2 flex items-end gap-2 sm:mt-3">
                  <span className="text-3xl font-bold leading-none text-[#075985] sm:text-4xl">
                    {room.freiePlaetze}
                  </span>

                  <span className="pb-1 text-sm font-semibold text-slate-500">
                    {room.freiePlaetze === 1 ? t("seatFree") : t("seatsFree")}
                  </span>
                </div>

                <p className="mt-2 hidden text-xs leading-5 text-[#667E8D] sm:block">
                  {t("occupancyHint")}
                </p>
              </div>

              <div className="rounded-lg border border-[#E0E7EB] bg-[#F7F9FA] p-4 sm:p-5">
                <p className="text-xs font-semibold text-[#647D8D]">
                  {t("capacity")}
                </p>

                <div className="mt-2 flex items-end gap-2 sm:mt-3">
                  <span className="text-3xl font-bold leading-none text-[#102A43] sm:text-4xl">
                    {room.kapazitaet}
                  </span>

                  <span className="pb-1 text-sm font-semibold text-slate-500">
                    {t("seats")}
                  </span>
                </div>

                <p className="mt-2 hidden text-xs leading-5 text-[#667E8D] sm:block">
                  {t("capacityHint")}
                </p>
              </div>
            </div>

            {hasGroups && (
              <div className="mt-5 rounded-lg border border-[#D8E5F0] bg-[#F3F7FB] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-lg">
                    👥
                  </div>

                  <div>
                    <p className="font-bold text-[#3157A4]">
                      {t("groupsInRoom")}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {t("groupPresence", {
                        groups: room.aktiveGruppen ?? 0,
                        people: room.personenInGruppen ?? 0,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 pt-6 sm:mt-8 sm:pt-7">
              {canCheckIn ? (
                <Link
                  href={`/rooms/${room.id}/check-in`}
                  className="flex w-full items-center justify-center rounded-lg bg-[#17536B] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#103E52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B7791] focus-visible:ring-offset-2 sm:py-4"
                >
                  {t("checkIn")}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center rounded-lg bg-[#CBD5DB] px-6 py-3.5 text-base font-semibold text-[#5C6F7B] sm:py-4"
                >
                  {t("checkIn")}
                </button>
              )}

              {canCheckIn && (
                <p className="mt-3 text-center text-xs text-slate-400">
                  {t("checkInHint")}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
