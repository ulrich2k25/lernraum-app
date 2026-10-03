"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { enablePushNotifications } from "@/lib/push-notifications";

type ActiveSession = {
  id: number;
  status: string;
  startedAt: string;
  expiresAt: string;
  endedAt: string | null;
  groupSize: number;
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

export default function ActiveSessionPanel({
  session,
}: ActiveSessionPanelProps) {
  const t = useTranslations("activeSession");
  const locale = useLocale();
  const router = useRouter();

  const isGroupSession = session.groupSize >= 2;

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  function formatRemainingTime(value: string, now: number) {
    const diff = new Date(value).getTime() - now;

    if (diff <= 0) {
      return `0 ${t("minutesShort")}`;
    }

    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} ${t("hoursShort")} ${minutes} ${t("minutesShort")}`;
    }

    if (hours > 0) {
      return `${hours} ${t("hoursShort")}`;
    }

    return `${minutes} ${t("minutesShort")}`;
  }

  const [expiresAt, setExpiresAt] = useState(session.expiresAt);
  const [remainingTime, setRemainingTime] = useState("");

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
    const updateRemainingTime = () => {
      setRemainingTime(formatRemainingTime(expiresAt, Date.now()));
    };

    const initialTimer = window.setTimeout(updateRemainingTime, 0);
    const interval = window.setInterval(updateRemainingTime, 30000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [expiresAt, t]);

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
      setNotificationError(t("clientIdMissing"));
      return;
    }

    try {
      setIsEnablingNotifications(true);

      await enablePushNotifications(clientId);

      setNotificationsEnabled(true);
      setNotificationSuccess(t("notificationsEnabled"));

      window.setTimeout(() => {
        setNotificationSuccess(null);
      }, 3000);
    } catch {
      setNotificationError(t("notificationsError"));
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
      setExtendError(t("clientIdMissing"));
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
        throw new Error(t("extendError"));
      }

      if (!data?.session?.expiresAt) {
        throw new Error(t("newDurationError"));
      }

      setExpiresAt(data.session.expiresAt);

      setRemainingTime(formatRemainingTime(data.session.expiresAt, Date.now()));

      setExtendSuccess(t("extendSuccess"));

      window.setTimeout(() => {
        setExtendSuccess(null);
      }, 3000);
    } catch (error) {
      setExtendError(error instanceof Error ? error.message : t("extendError"));
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
      setCheckOutError(t("clientIdMissing"));
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

      if (!response.ok) {
        throw new Error(t("checkOutError"));
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setCheckOutError(
        error instanceof Error ? error.message : t("checkOutError"),
      );

      setIsCheckingOut(false);
    }
  }

  const suffix = t("timeSuffix");

  return (
    <section className="overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white shadow-[0_12px_40px_rgba(15,42,67,0.08)] sm:rounded-[30px]">
      <div className="bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] px-5 py-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#5EEAD4]" />
            {t("active")}
          </div>

          {isGroupSession && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-50 backdrop-blur">
              <span aria-hidden="true">👥</span>

              <span>
                {t("groupBadge", {
                  count: session.groupSize,
                })}
              </span>
            </div>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          {t("room", {
            room: session.lernraum.raumBezeichnung,
          })}
        </h1>

        <p className="mt-2 text-sm text-blue-50/80 sm:text-base">
          {session.lernraum.gebaeude} · {session.lernraum.etage}
        </p>
      </div>

      <div className="p-5 sm:p-8">
        {isGroupSession && (
          <div className="mb-5 rounded-2xl border border-[#D5E1FF] bg-[#F7F9FF] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-lg">
                👥
              </div>

              <div>
                <p className="font-bold text-[#3157A4]">
                  {t("groupSessionTitle")}
                </p>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {t("groupSessionText", {
                    count: session.groupSize,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <span className="text-sm text-slate-500">{t("checkIn")}</span>

            <span className="text-sm font-bold text-[#102A43]">
              {formatTime(session.startedAt)} {suffix}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <span className="text-sm text-slate-500">{t("automaticEnd")}</span>

            <span className="text-sm font-bold text-[#102A43]">
              {formatTime(expiresAt)} {suffix}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
            <span className="text-sm text-slate-500">{t("remaining")}</span>

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
                <p className="font-bold text-[#102A43]">{t("reminderTitle")}</p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {t("reminderText")}
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
                ? t("enabling")
                : t("enableNotifications")}
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
          {isExtending ? t("extending") : t("extend")}
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
          {isCheckingOut
            ? t("checkingOut")
            : isGroupSession
              ? t("checkOutGroup")
              : t("checkOut")}
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
