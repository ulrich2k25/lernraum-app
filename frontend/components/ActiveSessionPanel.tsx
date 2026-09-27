"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { enablePushNotifications } from "@/lib/push-notifications";

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

  const [expiresAt, setExpiresAt] = useState(session.expiresAt);

  const [remainingTime, setRemainingTime] = useState(
    formatRemainingTime(session.expiresAt),
  );

  const [isExtending, setIsExtending] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);
  const [extendSuccess, setExtendSuccess] = useState<string | null>(null);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkOutError, setCheckOutError] = useState<string | null>(null);

  const [isCheckingNotificationState, setIsCheckingNotificationState] =
    useState(true);

  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(
    null,
  );

  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingTime(formatRemainingTime(expiresAt));
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [expiresAt]);

  useEffect(() => {
    let cancelled = false;

    async function checkNotificationState() {
      try {
        if (
          !("serviceWorker" in navigator) ||
          !("PushManager" in window) ||
          !("Notification" in window)
        ) {
          return;
        }

        if (Notification.permission !== "granted") {
          return;
        }

        const registration = await navigator.serviceWorker.register("/sw.js");

        await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();

        if (!cancelled && subscription) {
          setNotificationsEnabled(true);
        }
      } catch (error) {
        console.error("Notification state check failed:", error);
      } finally {
        if (!cancelled) {
          setIsCheckingNotificationState(false);
        }
      }
    }

    void checkNotificationState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleEnableNotifications() {
    if (isEnablingNotifications || notificationsEnabled) {
      return;
    }

    setNotificationError(null);
    setNotificationSuccess(null);

    const clientId = localStorage.getItem("lernraum-client-id");

    if (!clientId) {
      setNotificationError("Die Client-ID konnte nicht gefunden werden.");
      return;
    }

    try {
      setIsEnablingNotifications(true);

      await enablePushNotifications(clientId);

      setNotificationsEnabled(true);

      setNotificationSuccess("Benachrichtigungen wurden aktiviert.");

      window.setTimeout(() => {
        setNotificationSuccess(null);
      }, 3000);
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : "Benachrichtigungen konnten nicht aktiviert werden.",
      );
    } finally {
      setIsEnablingNotifications(false);
    }
  }

  async function handleExtend() {
    if (isExtending) {
      return;
    }

    setExtendError(null);
    setExtendSuccess(null);

    const clientId = localStorage.getItem("lernraum-client-id");

    if (!clientId) {
      setExtendError("Die Client-ID konnte nicht gefunden werden.");
      return;
    }

    try {
      setIsExtending(true);

      const response = await fetch(`${API_URL}/sessions/extend`, {
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
        throw new Error(
          data?.message ?? "Der Aufenthalt konnte nicht verlängert werden.",
        );
      }

      if (!data?.session?.expiresAt) {
        throw new Error("Die neue Sitzungsdauer konnte nicht geladen werden.");
      }

      setExpiresAt(data.session.expiresAt);

      setRemainingTime(formatRemainingTime(data.session.expiresAt));

      setExtendSuccess(data?.message ?? "Aufenthalt erfolgreich verlängert.");

      window.setTimeout(() => {
        setExtendSuccess(null);
      }, 3000);
    } catch (error) {
      setExtendError(
        error instanceof Error
          ? error.message
          : "Der Aufenthalt konnte nicht verlängert werden.",
      );
    } finally {
      setIsExtending(false);
    }
  }

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
              {formatTime(expiresAt)} Uhr
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <span className="text-sm text-slate-500">Verbleibende Zeit</span>

            <span className="text-sm font-bold text-[#075985]">
              {remainingTime}
            </span>
          </div>
        </div>

        {!isCheckingNotificationState && !notificationsEnabled && (
          <div className="mt-5 rounded-2xl border border-[#D9E7EC] bg-[#F7FBFC] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5F5F5] text-lg">
                🔔
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#102A43]">
                  Erinnerung vor Sitzungsende
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Erhalte 10 Minuten vor dem automatischen Ende eine
                  Benachrichtigung.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isEnablingNotifications || isCheckingOut}
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#075985] bg-white px-4 py-3 text-sm font-bold text-[#075985] transition hover:bg-[#EDF7FA] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isEnablingNotifications
                ? "Wird aktiviert..."
                : "Benachrichtigungen aktivieren"}
            </button>

            {notificationError && (
              <p className="mt-3 text-center text-sm font-medium text-red-600">
                {notificationError}
              </p>
            )}
          </div>
        )}

        {notificationSuccess && (
          <p className="mt-4 text-center text-sm font-medium text-emerald-700">
            {notificationSuccess}
          </p>
        )}

        <button
          type="button"
          onClick={handleExtend}
          disabled={isExtending || isCheckingOut}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#075985] bg-white px-5 py-3.5 font-bold text-[#075985] transition hover:bg-[#EDF7FA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExtending ? "Wird verlängert..." : "↻ Aufenthalt verlängern"}
        </button>

        {extendSuccess && (
          <p className="mt-3 text-center text-sm font-medium text-emerald-700">
            {extendSuccess}
          </p>
        )}

        {extendError && (
          <p className="mt-3 text-center text-sm font-medium text-red-600">
            {extendError}
          </p>
        )}

        <button
          type="button"
          onClick={handleCheckOut}
          disabled={isCheckingOut || isExtending}
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
