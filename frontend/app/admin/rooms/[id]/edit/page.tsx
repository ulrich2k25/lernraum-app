"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditAdminRoomPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const roomId = Number(params.id);

  const [room, setRoom] = useState<AdminRoom | null>(null);

  const [raumBezeichnung, setRaumBezeichnung] = useState("");
  const [gebaeude, setGebaeude] = useState("");
  const [etage, setEtage] = useState("");
  const [kapazitaet, setKapazitaet] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [autoCloseWhenEmpty, setAutoCloseWhenEmpty] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("lernraum-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (!Number.isInteger(roomId) || roomId <= 0) {
      setError("Ungültiger Lernraum.");
      setIsLoading(false);
      return;
    }

    async function loadRoom() {
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
          throw new Error("Der Lernraum konnte nicht geladen werden.");
        }

        const rooms = (await response.json()) as AdminRoom[];
        const currentRoom = rooms.find((item) => item.id === roomId);

        if (!currentRoom) {
          throw new Error("Der Lernraum wurde nicht gefunden.");
        }

        setRoom(currentRoom);

        setRaumBezeichnung(currentRoom.raumBezeichnung);
        setGebaeude(currentRoom.gebaeude);
        setEtage(currentRoom.etage);
        setKapazitaet(String(currentRoom.kapazitaet));
        setStatus(currentRoom.status);
        setAutoCloseWhenEmpty(currentRoom.autoCloseWhenEmpty);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Der Lernraum konnte nicht geladen werden.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadRoom();
  }, [roomId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!room) {
      return;
    }

    const token = localStorage.getItem("lernraum-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const parsedCapacity = Number(kapazitaet);

    if (
      !raumBezeichnung.trim() ||
      !gebaeude.trim() ||
      !etage.trim() ||
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity <= 0
    ) {
      setError("Bitte alle Pflichtfelder korrekt ausfüllen.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const updateResponse = await fetch(`${API_URL}/admin/rooms/${room.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          raumBezeichnung: raumBezeichnung.trim(),
          gebaeude: gebaeude.trim(),
          etage: etage.trim(),
          kapazitaet: parsedCapacity,
          autoCloseWhenEmpty,
        }),
      });

      const updateData = await updateResponse.json();

      if (updateResponse.status === 401) {
        localStorage.removeItem("lernraum-admin-token");
        localStorage.removeItem("lernraum-admin");
        router.replace("/admin/login");
        return;
      }

      if (!updateResponse.ok) {
        throw new Error(
          updateData?.message ??
            "Der Lernraum konnte nicht aktualisiert werden.",
        );
      }

      if (status !== room.status) {
        const statusResponse = await fetch(
          `${API_URL}/admin/rooms/${room.id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status,
            }),
          },
        );

        const statusData = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(
            statusData?.message ??
              "Der Raumstatus konnte nicht aktualisiert werden.",
          );
        }
      }

      router.push("/admin/rooms");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Der Lernraum konnte nicht aktualisiert werden.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F4F8FA] px-4 py-8 text-[#102A43]">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Lernraum wird geladen ...
        </div>
      </main>
    );
  }

  if (error && !room) {
    return (
      <main className="min-h-screen bg-[#F4F8FA] px-4 py-8 text-[#102A43]">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/admin/rooms"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#075985]"
          >
            ← Zurück zu den Lernräumen
          </Link>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F4F8FA] px-4 py-8 text-[#102A43] sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/admin/rooms"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#075985] transition hover:opacity-70"
        >
          <span aria-hidden="true">←</span>
          Zurück zu den Lernräumen
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#075985]">
              Lernraum Verwaltung
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Lernraum bearbeiten
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Ändern Sie nur die Angaben, die angepasst werden sollen.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="raumBezeichnung"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Raumbezeichnung
              </label>

              <input
                id="raumBezeichnung"
                type="text"
                value={raumBezeichnung}
                onChange={(event) => setRaumBezeichnung(event.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <div>
              <label
                htmlFor="gebaeude"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Gebäude
              </label>

              <input
                id="gebaeude"
                type="text"
                value={gebaeude}
                onChange={(event) => setGebaeude(event.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <div>
              <label
                htmlFor="etage"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Etage
              </label>

              <input
                id="etage"
                type="text"
                value={etage}
                onChange={(event) => setEtage(event.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <div>
              <label
                htmlFor="kapazitaet"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Kapazität
              </label>

              <input
                id="kapazitaet"
                type="number"
                min="1"
                step="1"
                value={kapazitaet}
                onChange={(event) => setKapazitaet(event.target.value)}
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "ACTIVE" | "INACTIVE")
                }
                disabled={isSaving}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              >
                <option value="ACTIVE">Aktiv</option>
                <option value="INACTIVE">Inaktiv</option>
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
              <input
                type="checkbox"
                checked={autoCloseWhenEmpty}
                onChange={(event) =>
                  setAutoCloseWhenEmpty(event.target.checked)
                }
                disabled={isSaving}
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Automatisch als geschlossen anzeigen, wenn niemand eingecheckt
                  ist
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Beim ersten Check-in wird die Kennzeichnung automatisch
                  entfernt.
                </span>
              </span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Link
                href="/admin/rooms"
                className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Abbrechen
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#075985] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064e73] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Änderungen werden gespeichert ..."
                  : "Änderungen speichern"}
              </button>
            </div>
          </form>
        </section>
</div>
    </main>
  );
}
