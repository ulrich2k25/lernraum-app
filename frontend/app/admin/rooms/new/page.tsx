"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type CreatedRoom = {
  id: number;
  raumBezeichnung: string;
  gebaeude: string;
  etage: string;
  kapazitaet: number;
  status: "ACTIVE" | "INACTIVE";
  raumToken: string;
  autoCloseWhenEmpty: boolean;
  isTemporarilyClosed: boolean;
};

export default function CreateAdminRoomPage() {
  const router = useRouter();

  const [raumBezeichnung, setRaumBezeichnung] = useState("");
  const [gebaeude, setGebaeude] = useState("");
  const [etage, setEtage] = useState("");
  const [kapazitaet, setKapazitaet] = useState("");
  const [autoCloseWhenEmpty, setAutoCloseWhenEmpty] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

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

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/admin/rooms`, {
        method: "POST",
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

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("lernraum-admin-token");
        localStorage.removeItem("lernraum-admin");
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Der Lernraum konnte nicht erstellt werden.",
        );
      }

      const createdRoom = data as CreatedRoom;

      localStorage.setItem(
        "lernraum-created-room",
        JSON.stringify(createdRoom),
      );

      router.push("/admin/rooms");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Der Lernraum konnte nicht erstellt werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
              Lernraum hinzufügen
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Erfassen Sie die grundlegenden Daten des neuen Lernraums. Der
              Raum-Token wird automatisch erzeugt.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="raumBezeichnung"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Raumbezeichnung *
              </label>

              <input
                id="raumBezeichnung"
                type="text"
                value={raumBezeichnung}
                onChange={(event) => setRaumBezeichnung(event.target.value)}
                placeholder="z. B. A102"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <div>
              <label
                htmlFor="gebaeude"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Gebäude *
              </label>

              <input
                id="gebaeude"
                type="text"
                value={gebaeude}
                onChange={(event) => setGebaeude(event.target.value)}
                placeholder="z. B. Gebäude A"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <div>
              <label
                htmlFor="etage"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Etage *
              </label>

              <input
                id="etage"
                type="text"
                value={etage}
                onChange={(event) => setEtage(event.target.value)}
                placeholder="z. B. 1. Etage"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <div>
              <label
                htmlFor="kapazitaet"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Kapazität *
              </label>

              <input
                id="kapazitaet"
                type="number"
                min="1"
                step="1"
                value={kapazitaet}
                onChange={(event) => setKapazitaet(event.target.value)}
                placeholder="z. B. 30"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
              <input
                type="checkbox"
                checked={autoCloseWhenEmpty}
                onChange={(event) =>
                  setAutoCloseWhenEmpty(event.target.checked)
                }
                disabled={isSubmitting}
                className="mt-1 h-4 w-4"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Raum automatisch schließen, wenn er leer ist
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Diese Option kann später weiterhin angepasst werden.
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
                disabled={isSubmitting}
                className="rounded-xl bg-[#075985] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064e73] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Lernraum wird erstellt ..."
                  : "Lernraum erstellen"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
