"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ActiveSession = {
  id: number;
  status: string;
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
  lernraum: {
    id: number;
    raumBezeichnung: string;
    gebaeude: string;
    etage: string;
    kapazitaet: number;
    status: string;
  };
};

type ActiveSessionPanelProps = {
  session: ActiveSession;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRemainingTime(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();

  if (diff <= 0) {
    return "0 Min.";
  }

  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} Std. ${minutes} Min.`;
  }

  if (hours > 0) {
    return `${hours} Std.`;
  }

  return `${minutes} Min.`;
}

export default function ActiveSessionPanel({
  session,
}: ActiveSessionPanelProps) {
  const router = useRouter();

  const [remainingTime, setRemainingTime] = useState(
    formatRemainingTime(session.expiresAt),
  );

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkOutError, setCheckOutError] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingTime(formatRemainingTime(session.expiresAt));
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [session.expiresAt]);

  async function handleCheckOut() {
    if (isCheckingOut) {
      return;
    }

    setCheckOutError(null);

    const clientId = localStorage.getItem("lernraum-client-id");

    if (!clientId) {
      setCheckOutError("Die Client-ID konnte nicht gefunden werden.");
      return;
    }

    try {
      setIsCheckingOut(true);

      const response = await fetch(`${API_URL}/sessions/check-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
        }),
      });

      const text = await response.text();

      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        throw new Error(data?.message ?? "Check-out fehlgeschlagen.");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setCheckOutError(
        error instanceof Error ? error.message : "Check-out fehlgeschlagen.",
      );

      setIsCheckingOut(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white shadow-[0_12px_40px_rgba(15,42,67,0.08)] sm:rounded-[30px]">
      <div className="bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] px-5 py-6 text-white sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[#5EEAD4]" />
          AKTIV
        </div>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          Raum {session.lernraum.raumBezeichnung}
        </h1>

        <p className="mt-2 text-sm text-blue-50/80 sm:text-base">
          {session.lernraum.gebaeude} · {session.lernraum.etage}. Etage
        </p>
      </div>

      <div className="p-5 sm:p-8">
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <span className="text-sm text-slate-500">Check-in</span>

            <span className="text-sm font-bold text-[#102A43]">
              {formatTime(session.startedAt)} Uhr
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <span className="text-sm text-slate-500">Automatisches Ende</span>

            <span className="text-sm font-bold text-[#102A43]">
              {formatTime(session.expiresAt)} Uhr
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <span className="text-sm text-slate-500">Verbleibende Zeit</span>

            <span className="text-sm font-bold text-[#075985]">
              {remainingTime}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#075985] bg-white px-5 py-3.5 font-bold text-[#075985] transition hover:bg-[#EDF7FA]"
        >
          ↻ Aufenthalt verlängern
        </button>

        <button
          type="button"
          onClick={handleCheckOut}
          disabled={isCheckingOut}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#075985] px-5 py-3.5 font-bold text-white transition hover:bg-[#064B70] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCheckingOut ? "Auschecken..." : "⇥ Auschecken"}
        </button>

        {checkOutError && (
          <p className="mt-3 text-center text-sm font-medium text-red-600">
            {checkOutError}
          </p>
        )}
      </div>
    </section>
  );
}
