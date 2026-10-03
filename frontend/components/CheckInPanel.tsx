"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useTranslations } from "next-intl";

import { getClientId } from "@/lib/client-id";
import type { Room } from "../types/room";

type CheckInPanelProps = {
  room: Room;
};

type ScannerStatus =
  | "starting"
  | "scanning"
  | "selection"
  | "checking"
  | "success"
  | "checkin-error"
  | "camera-error";

type CheckInResponse = {
  message?: string;
  freiePlaetze?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function extractRoomToken(qrContent: string): string | null {
  const value = qrContent.trim();

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).searchParams.get("roomToken")?.trim() || null;
    } catch {
      return null;
    }
  }

  if (value.startsWith("/")) {
    try {
      return (
        new URL(value, window.location.origin).searchParams
          .get("roomToken")
          ?.trim() || null
      );
    } catch {
      return null;
    }
  }

  return value;
}

export default function CheckInPanel({ room }: CheckInPanelProps) {
  const t = useTranslations("checkIn");
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [status, setStatus] = useState<ScannerStatus>("starting");
  const [message, setMessage] = useState<string | null>(null);
  const [freiePlaetze, setFreiePlaetze] = useState<number | null>(null);

  const [scanAttempt, setScanAttempt] = useState(0);
  const [scannedRoomToken, setScannedRoomToken] = useState<string | null>(null);

  const [availableSeats, setAvailableSeats] = useState(room.freiePlaetze);

  const [groupMode, setGroupMode] = useState(false);
  const [groupSize, setGroupSize] = useState(2);

  useEffect(() => {
    let scannerControls: { stop: () => void } | undefined;
    let cancelled = false;
    let qrHandled = false;

    async function validateScannedRoom(roomToken: string) {
      try {
        const response = await fetch(
          `${API_URL}/rooms/by-token/${encodeURIComponent(roomToken)}`,
          {
            cache: "no-store",
          },
        );

        const text = await response.text();

        if (!response.ok || !text) {
          if (!cancelled) {
            setMessage(t("invalidQr"));
            setStatus("checkin-error");
          }

          return;
        }

        const resolvedRoom = JSON.parse(text) as Room;

        if (resolvedRoom.id !== room.id) {
          if (!cancelled) {
            setMessage(t("wrongRoom"));
            setStatus("checkin-error");
          }

          return;
        }

        if (cancelled) {
          return;
        }

        setScannedRoomToken(roomToken);
        setAvailableSeats(resolvedRoom.freiePlaetze);
        setGroupSize(2);
        setGroupMode(false);
        setStatus("selection");
      } catch (error) {
        console.error("QR validation error:", error);

        if (!cancelled) {
          setMessage(t("serverError"));
          setStatus("checkin-error");
        }
      }
    }

    async function startScanner() {
      if (!videoRef.current) {
        return;
      }

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        if (!cancelled) {
          setStatus("camera-error");
        }

        return;
      }

      try {
        setStatus("starting");

        const permissionStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
        });

        permissionStream.getTracks().forEach((track) => track.stop());

        if (cancelled) {
          return;
        }

        const codeReader = new BrowserQRCodeReader();

        const controls = await codeReader.decodeFromConstraints(
          {
            audio: false,
            video: {
              facingMode: {
                ideal: "environment",
              },
            },
          },
          videoRef.current,
          (result) => {
            if (!result || cancelled || qrHandled) {
              return;
            }

            qrHandled = true;

            const roomToken = extractRoomToken(result.getText());

            scannerControls?.stop();

            if (!roomToken) {
              setMessage(t("invalidQr"));
              setStatus("checkin-error");
              return;
            }

            void validateScannedRoom(roomToken);
          },
        );

        scannerControls = controls;

        if (!cancelled && !qrHandled) {
          setStatus("scanning");
        }
      } catch (error) {
        console.error("QR scanner error:", error);

        if (!cancelled) {
          setStatus("camera-error");
        }
      }
    }

    void startScanner();

    return () => {
      cancelled = true;
      scannerControls?.stop();
    };
  }, [room.id, scanAttempt, t]);

  async function performCheckIn(groupSizeToUse: number) {
    if (!scannedRoomToken || status === "checking") {
      return;
    }

    setMessage(null);
    setStatus("checking");

    try {
      const clientId = getClientId();

      const response = await fetch(`${API_URL}/sessions/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomToken: scannedRoomToken,
          roomId: room.id,
          clientId,
          groupSize: groupSizeToUse,
        }),
      });

      const text = await response.text();

      let data: CheckInResponse | null = null;

      if (text) {
        try {
          data = JSON.parse(text) as CheckInResponse;
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        setMessage(data?.message ?? t("genericError"));
        setStatus("checkin-error");
        return;
      }

      setMessage(
        groupSizeToUse >= 2
          ? t("groupSuccessRoom", {
              room: room.raumBezeichnung,
              count: groupSizeToUse,
            })
          : t("successRoom", {
              room: room.raumBezeichnung,
            }),
      );

      if (typeof data?.freiePlaetze === "number") {
        setFreiePlaetze(data.freiePlaetze);
        setAvailableSeats(data.freiePlaetze);
      }

      setStatus("success");

      window.setTimeout(() => {
        router.push("/session");
      }, 4000);
    } catch (error) {
      console.error("Check-in error:", error);

      setMessage(t("serverError"));
      setStatus("checkin-error");
    }
  }

  function restartScanner() {
    setMessage(null);
    setFreiePlaetze(null);
    setScannedRoomToken(null);
    setGroupMode(false);
    setGroupSize(2);
    setStatus("starting");
    setScanAttempt((value) => value + 1);
  }

  function decreaseGroupSize() {
    setGroupSize((current) => Math.max(2, current - 1));
  }

  function increaseGroupSize() {
    setGroupSize((current) => Math.min(availableSeats, current + 1));
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white shadow-[0_12px_40px_rgba(15,42,67,0.08)] sm:rounded-[30px]">
      <div className="bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] px-5 py-5 text-white sm:px-8 sm:py-6">
        <p className="text-sm font-medium text-blue-100">{t("title")}</p>

        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          {room.raumBezeichnung}
        </h1>

        <p className="mt-2 text-sm text-blue-50/80 sm:text-base">
          {room.gebaeude} · {room.etage}
        </p>
      </div>

      <div className="p-5 sm:p-8">
        {(status === "starting" || status === "scanning") && (
          <>
            <div className="mb-5 text-center">
              <h2 className="text-xl font-bold text-[#102A43] sm:text-2xl">
                {t("scanTitle")}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {t("scanText")}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[22px] bg-[#071923]">
              <video
                ref={videoRef}
                className="aspect-[3/4] w-full object-cover sm:aspect-video"
                muted
                playsInline
              />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 rounded-[28px] border-4 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)] sm:h-56 sm:w-56" />
              </div>

              {status === "starting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#071923] text-white">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                    <p className="mt-4 text-sm font-semibold">
                      {t("cameraStarting")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {status === "selection" && (
          <div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E9FAF7] text-2xl">
                ✓
              </div>

              <h2 className="mt-4 text-xl font-bold text-[#102A43]">
                {t("roomVerified")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {room.raumBezeichnung}
              </p>

              <div className="mt-3 inline-flex rounded-full bg-[#E9FAF7] px-3 py-1.5 text-sm font-bold text-[#087F73]">
                {availableSeats === 1
                  ? t("availableOne", { count: availableSeats })
                  : t("availableMany", { count: availableSeats })}
              </div>

              <h3 className="mt-6 text-lg font-bold">{t("chooseTypeTitle")}</h3>

              <p className="mt-1 text-sm text-slate-500">
                {t("chooseTypeText")}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => void performCheckIn(1)}
                className="rounded-2xl border-2 border-[#D9E7EC] bg-white p-5 text-left transition hover:border-[#075985] hover:bg-[#F7FBFC]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDF7FA] text-xl">
                  👤
                </div>

                <p className="mt-4 font-bold">{t("alone")}</p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {t("aloneText")}
                </p>
              </button>

              <button
                type="button"
                disabled={availableSeats < 2}
                onClick={() => {
                  setGroupMode(true);
                  setGroupSize(2);
                }}
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  groupMode
                    ? "border-[#3157A4] bg-[#F7F9FF]"
                    : "border-[#D9E7EC] bg-white hover:border-[#3157A4] hover:bg-[#F7F9FF]"
                } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:opacity-50`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF4FF] text-xl">
                  👥
                </div>

                <p className="mt-4 font-bold">{t("group")}</p>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {availableSeats >= 2 ? t("groupText") : t("groupUnavailable")}
                </p>
              </button>
            </div>

            {groupMode && availableSeats >= 2 && (
              <div className="mt-5 rounded-2xl border border-[#D5E1FF] bg-[#F7F9FF] p-5">
                <p className="text-center text-sm font-bold text-[#3157A4]">
                  {t("groupSizeTitle")}
                </p>

                <div className="mt-4 flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={decreaseGroupSize}
                    disabled={groupSize <= 2}
                    aria-label={t("decreaseGroup")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <div className="min-w-24 text-center">
                    <p className="text-4xl font-bold text-[#075985]">
                      {groupSize}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {t("people")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={increaseGroupSize}
                    disabled={groupSize >= availableSeats}
                    aria-label={t("increaseGroup")}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void performCheckIn(groupSize)}
                  className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#075985] px-5 py-3.5 font-bold text-white transition hover:bg-[#064B70]"
                >
                  {t("confirmGroup", {
                    count: groupSize,
                  })}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={restartScanner}
              className="mt-5 w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              {t("scanAgain")}
            </button>
          </div>
        )}

        {status === "checking" && (
          <div className="py-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#075985]/20 border-t-[#075985]" />

            <h2 className="mt-5 text-xl font-bold">{t("checking")}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DFF9F4] text-3xl font-bold text-[#087F73]">
              ✓
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#087F73]">
              {t("success")}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {message}
            </p>

            {freiePlaetze !== null && (
              <p className="mt-3 text-sm font-semibold text-[#075985]">
                {freiePlaetze === 1
                  ? t("remainingOne", { count: freiePlaetze })
                  : t("remainingMany", { count: freiePlaetze })}
              </p>
            )}
          </div>
        )}

        {status === "checkin-error" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
              !
            </div>

            <h3 className="mt-4 text-lg font-bold">{t("notPossible")}</h3>

            <p className="mt-2 text-sm leading-6 text-red-600">{message}</p>

            <button
              type="button"
              onClick={restartScanner}
              className="mt-5 w-full rounded-2xl bg-[#075985] px-5 py-3.5 font-bold text-white transition hover:bg-[#064B70]"
            >
              {t("scanAgain")}
            </button>
          </div>
        )}

        {status === "camera-error" && (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
              !
            </div>

            <h3 className="mt-4 text-lg font-bold">{t("cameraErrorTitle")}</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t("cameraErrorText")}
            </p>
          </div>
        )}

        {status !== "selection" && (
          <Link
            href={`/rooms/${room.id}`}
            className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            {t("cancel")}
          </Link>
        )}
      </div>
    </section>
  );
}
