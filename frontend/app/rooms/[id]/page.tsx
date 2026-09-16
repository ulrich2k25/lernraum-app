import Link from "next/link";
import { notFound } from "next/navigation";

import type { Room } from "../../../types/room";

type RoomDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;

  const response = await fetch(`http://localhost:3002/rooms/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Der Lernraum konnte nicht geladen werden.");
  }

  const room: Room = await response.json();

  const isActive = room.status === "ACTIVE";

  return (
    <main className="min-h-screen bg-[#F4F8FA] pb-8 text-[#102A43]">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 md:px-8 lg:py-10">
        {/* Zurück */}
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#075985] transition hover:opacity-70 sm:mb-6"
        >
          <span aria-hidden="true">←</span>
          Zurück zu den Lernräumen
        </Link>

        {/* Hauptkarte */}
        <section className="overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white shadow-[0_12px_40px_rgba(15,42,67,0.08)] sm:rounded-[30px]">
          {/* Kopfbereich */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] px-5 py-6 text-white sm:p-8">
            <div className="absolute -right-14 -top-16 h-40 w-40 rounded-full border-[24px] border-white/5 sm:h-44 sm:w-44 sm:border-[26px]" />

            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur sm:mb-4">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-[#5EEAD4]" : "bg-slate-300"
                  }`}
                />

                {isActive ? "Aktiv" : "Nicht verfügbar"}
              </div>

              <p className="text-sm font-medium text-blue-100">Lernraum</p>

              <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {room.raumBezeichnung}
              </h1>

              <p className="mt-2 text-sm text-blue-50/80 sm:mt-3 sm:text-base">
                {room.gebaeude} · {room.etage}. Etage
              </p>
            </div>
          </div>

          {/* Inhalt */}
          <div className="p-5 sm:p-8">
            {/* Übersicht */}
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {/* Freie Plätze */}
              <div className="rounded-2xl border border-[#BFE8E4] bg-gradient-to-br from-[#F0FCFA] to-[#E8F7FA] p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#087F73]">
                  Freie Plätze
                </p>

                <div className="mt-2 flex items-end gap-2 sm:mt-3">
                  <span className="text-3xl font-bold leading-none text-[#075985] sm:text-4xl">
                    —
                  </span>

                  <span className="pb-1 text-sm font-semibold text-slate-500">
                    Plätze frei
                  </span>
                </div>

                <p className="mt-2 hidden text-xs leading-5 text-slate-400 sm:block">
                  Die aktuelle Belegung wird mit der Sitzungslogik berechnet.
                </p>
              </div>

              {/* Gesamtkapazität */}
              <div className="rounded-2xl border border-slate-200 bg-[#FAFCFD] p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                  Gesamtkapazität
                </p>

                <div className="mt-2 flex items-end gap-2 sm:mt-3">
                  <span className="text-3xl font-bold leading-none text-[#102A43] sm:text-4xl">
                    {room.kapazitaet}
                  </span>

                  <span className="pb-1 text-sm font-semibold text-slate-500">
                    Plätze
                  </span>
                </div>

                <p className="mt-2 hidden text-xs leading-5 text-slate-400 sm:block">
                  Maximale Anzahl an Lernplätzen in diesem Raum.
                </p>
              </div>
            </div>

            {/* Raumdetails */}
            <div className="mt-6 sm:mt-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F8B8D]">
                Raumdetails
              </p>

              <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                  <span className="text-sm text-slate-500">Raum</span>

                  <span className="text-sm font-bold text-[#102A43]">
                    {room.raumBezeichnung}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                  <span className="text-sm text-slate-500">Gebäude</span>

                  <span className="text-sm font-bold text-[#102A43]">
                    {room.gebaeude}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                  <span className="text-sm text-slate-500">Etage</span>

                  <span className="text-sm font-bold text-[#102A43]">
                    {room.etage}. Etage
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                  <span className="text-sm text-slate-500">Status</span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isActive
                        ? "bg-[#E9FAF7] text-[#087F73]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isActive ? "Aktiv" : room.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Check-in */}
            <div className="mt-6 border-t border-slate-100 pt-6 sm:mt-8 sm:pt-7">
              <button
                type="button"
                disabled={!isActive}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#075985] px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-[#064B70] disabled:cursor-not-allowed disabled:bg-slate-300 sm:py-4 sm:text-lg"
              >
                Einchecken
                <span aria-hidden="true">→</span>
              </button>

              <p className="mt-3 text-center text-xs text-slate-400">
                NFC wird bevorzugt · QR-Code als Alternative
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-7 text-center text-xs text-slate-400 sm:mt-8">
          Projekt 1 · Hochschule Kaiserslautern
        </footer>
      </div>
    </main>
  );
}
