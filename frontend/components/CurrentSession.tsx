"use client";

import { useEffect, useState } from "react";

import ActiveSessionPanel from "./ActiveSessionPanel";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function CurrentSession() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrentSession() {
      try {
        setError(null);

        const clientId = localStorage.getItem("lernraum-client-id");

        if (!clientId) {
          setSession(null);
          return;
        }

        const response = await fetch(
          `${API_URL}/sessions/current/${encodeURIComponent(clientId)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Die aktuelle Sitzung konnte nicht geladen werden.");
        }

        const text = await response.text();

        if (!text) {
          setSession(null);
          return;
        }

        const data = JSON.parse(text) as ActiveSession | null;

        setSession(data);
      } catch (error) {
        console.error("Current session error:", error);

        setError("Die aktuelle Sitzung konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    void loadCurrentSession();
  }, []);

  if (loading) {
    return (
      <div className="rounded-[26px] border border-[#D9E7EC] bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#BFD8E3] border-t-[#075985]" />

        <p className="mt-4 text-sm font-medium text-slate-500">
          Sitzung wird geladen …
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[26px] border border-red-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
          !
        </div>

        <h2 className="mt-4 font-bold text-[#102A43]">
          Sitzung konnte nicht geladen werden
        </h2>

        <p className="mt-2 text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[26px] border border-dashed border-[#B7CBD4] bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EDF7FA] text-xl text-[#075985]">
          ◷
        </div>

        <h2 className="mt-4 font-bold text-[#102A43]">
          Keine aktuelle Sitzung
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Du bist aktuell in keinem Lernraum eingecheckt.
        </p>
      </div>
    );
  }

  return <ActiveSessionPanel session={session} />;
}
