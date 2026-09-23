"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AdminRoomQrCode from "@/components/AdminRoomQrCode";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type AdminRoom = {
  id: number;
  raumBezeichnung: string;
  gebaeude: string;
  etage: string;
  kapazitaet: number;
  status: "ACTIVE" | "INACTIVE";
  raumToken: string;
  autoCloseWhenEmpty: boolean;
  isTemporarilyClosed: boolean;
  aktiveSitzungen: number;
  freiePlaetze: number;
};

export default function AdminRoomsPage() {
  const router = useRouter();

  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQrRoomId, setSelectedQrRoomId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("lernraum-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    async function loadRooms() {
      try {
        const response = await fetch(`${API_URL}/admin/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("lernraum-admin-token");
          localStorage.removeItem("lernraum-admin");
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Die Lernräume konnten nicht geladen werden.");
        }

        const data = (await response.json()) as AdminRoom[];
        setRooms(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Die Lernräume konnten nicht geladen werden.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadRooms();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("lernraum-admin-token");
    localStorage.removeItem("lernraum-admin");

    router.push("/admin/login");
  }

  function toggleQrCode(roomId: number) {
    setSelectedQrRoomId((currentRoomId) =>
      currentRoomId === roomId ? null : roomId,
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F8FA] text-[#102A43]">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#075985]">
              Lernraum Verwaltung
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Lernräume
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Räume, Kapazitäten und QR-Zugänge verwalten.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/rooms/new"
              className="rounded-xl bg-[#075985] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#064e73]"
            >
              + Lernraum hinzufügen
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Abmelden
            </button>
          </div>
        </header>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Lernräume werden geladen ...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!isLoading && !error && rooms.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Keine Lernräume vorhanden
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Erstellen Sie den ersten Lernraum.
            </p>
          </div>
        )}

        {!isLoading && !error && rooms.length > 0 && (
          <section className="grid gap-5 md:grid-cols-2">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {room.raumBezeichnung}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {room.gebaeude} · {room.etage}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      room.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {room.status === "ACTIVE" ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#F4F8FA] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Kapazität
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {room.kapazitaet}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F4F8FA] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Freie Plätze
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#075985]">
                      {room.freiePlaetze}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl bg-[#F4F8FA] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Aktive Sitzungen
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {room.aktiveSitzungen}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleQrCode(room.id)}
                    className="flex-1 rounded-xl border border-[#075985] px-4 py-3 text-sm font-semibold text-[#075985] transition hover:bg-[#075985]/5"
                  >
                    {selectedQrRoomId === room.id
                      ? "QR-Code schließen"
                      : "QR-Code"}
                  </button>

                  <button
                    type="button"
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Bearbeiten
                  </button>
                </div>

                {selectedQrRoomId === room.id && (
                  <div className="mt-5">
                    <AdminRoomQrCode
                      raumBezeichnung={room.raumBezeichnung}
                      gebaeude={room.gebaeude}
                      etage={room.etage}
                      raumToken={room.raumToken}
                    />
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
