"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppNavigation() {
  const pathname = usePathname();
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkActiveSession() {
      try {
        const clientId = localStorage.getItem("lernraum-client-id");

        if (!clientId) {
          if (!cancelled) {
            setHasActiveSession(false);
          }

          return;
        }

        const response = await fetch(
          `http://localhost:3002/sessions/current/${clientId}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (!cancelled) {
            setHasActiveSession(false);
          }

          return;
        }

        const text = await response.text();

        const session = text ? JSON.parse(text) : null;

        if (!cancelled) {
          setHasActiveSession(Boolean(session));
        }
      } catch (error) {
        console.error("Aktive Sitzung konnte nicht geprüft werden:", error);

        if (!cancelled) {
          setHasActiveSession(false);
        }
      }
    }

    checkActiveSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const roomsActive = pathname === "/" || pathname.startsWith("/rooms");

  const sessionActive = pathname.startsWith("/session");

  return (
    <>
      <nav className="hidden items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 md:flex">
        <Link
          href="/"
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            roomsActive
              ? "bg-[#102A43] text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Lernräume
        </Link>

        {hasActiveSession && (
          <Link
            href="/session"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              sessionActive
                ? "bg-[#102A43] text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Aktuelle Sitzung
          </Link>
        )}

        <button
          type="button"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
        >
          Besuche
        </button>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <Link
            href="/"
            className={`flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
              roomsActive ? "text-[#0F8B8D]" : "text-slate-400"
            }`}
          >
            <span className="text-xl">⌂</span>
            <span>Lernräume</span>
          </Link>

          {hasActiveSession && (
            <Link
              href="/session"
              className={`flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                sessionActive ? "text-[#0F8B8D]" : "text-slate-400"
              }`}
            >
              <span className="text-xl">◷</span>
              <span>Sitzung</span>
            </Link>
          )}

          <button
            type="button"
            className="flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400"
          >
            <span className="text-xl">↻</span>
            <span>Besuche</span>
          </button>
        </div>
      </nav>
    </>
  );
}
