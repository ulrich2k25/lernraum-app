"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function AppNavigation() {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkActiveSession() {
      try {
        const clientId = localStorage.getItem("lernraum-client-id");

        if (!clientId) {
          if (!cancelled) setHasActiveSession(false);
          return;
        }

        const response = await fetch(
          `${API_URL}/sessions/current/${encodeURIComponent(clientId)}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          if (!cancelled) setHasActiveSession(false);
          return;
        }

        const text = await response.text();

        if (!cancelled) {
          setHasActiveSession(Boolean(text ? JSON.parse(text) : null));
        }
      } catch (error) {
        console.error("Active session check failed:", error);
        if (!cancelled) setHasActiveSession(false);
      }
    }

    void checkActiveSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const roomsActive = pathname === "/" || pathname.startsWith("/rooms");
  const sessionActive = pathname.startsWith("/session");
  const visitsActive = pathname.startsWith("/besuche");

  const desktopBase =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200";

  const mobileBase =
    "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition-colors";

  return (
    <>
      <nav className="mb-5 hidden items-center gap-1 rounded-[18px] border border-[#E1EAF0] bg-white p-1.5 shadow-[0_4px_18px_rgba(16,42,67,0.035)] md:flex">
        <Link
          href="/"
          className={`${desktopBase} ${
            roomsActive
              ? "bg-[#102A43] text-white shadow-sm"
              : "text-[#6B8094] hover:bg-[#F1F6F9] hover:text-[#102A43]"
          }`}
        >
          {t("rooms")}
        </Link>

        {hasActiveSession && (
          <Link
            href="/session"
            className={`${desktopBase} ${
              sessionActive
                ? "bg-[#102A43] text-white shadow-sm"
                : "text-[#6B8094] hover:bg-[#F1F6F9] hover:text-[#102A43]"
            }`}
          >
            {t("currentSession")}
          </Link>
        )}

        <Link
          href="/besuche"
          className={`${desktopBase} ${
            visitsActive
              ? "bg-[#102A43] text-white shadow-sm"
              : "text-[#6B8094] hover:bg-[#F1F6F9] hover:text-[#102A43]"
          }`}
        >
          {t("visits")}
        </Link>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E1EAF0] bg-white/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(16,42,67,0.06)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <Link
            href="/"
            aria-current={roomsActive ? "page" : undefined}
            className={`${mobileBase} ${
              roomsActive
                ? "bg-[#E9F7F4] text-[#087F73]"
                : "text-[#8A9BAD] hover:bg-[#F2F7F9]"
            }`}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              ⌂
            </span>
            <span>{t("rooms")}</span>
          </Link>

          {hasActiveSession && (
            <Link
              href="/session"
              aria-current={sessionActive ? "page" : undefined}
              className={`${mobileBase} ${
                sessionActive
                  ? "bg-[#E9F7F4] text-[#087F73]"
                  : "text-[#8A9BAD] hover:bg-[#F2F7F9]"
              }`}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                ◷
              </span>
              <span>{t("session")}</span>
            </Link>
          )}

          <Link
            href="/besuche"
            aria-current={visitsActive ? "page" : undefined}
            className={`${mobileBase} ${
              visitsActive
                ? "bg-[#E9F7F4] text-[#087F73]"
                : "text-[#8A9BAD] hover:bg-[#F2F7F9]"
            }`}
          >
            <span className="text-xl leading-none" aria-hidden="true">
              ↻
            </span>
            <span>{t("visits")}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
