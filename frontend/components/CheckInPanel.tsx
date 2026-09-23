"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { getClientId } from "@/lib/client-id";

import type { Room } from "../types/room";

type CheckInPanelProps = {
  room: Room;
};

type ScannerStatus =
  | "starting"
  | "scanning"
  | "checking"
  | "success"
  | "checkin-error"
  | "camera-error";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function extractRoomToken(qrContent: string): string | null {
  const value = qrContent.trim();

  if (!value) {
    return null;
  }

  // Neuer QR-Code:
  // https://.../check-in?roomToken=raum-a101
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const roomToken = url.searchParams.get("roomToken")?.trim();

      return roomToken || null;
    } catch {
      return null;
    }
  }

  // Relative URL ebenfalls unterstützen:
  // /check-in?roomToken=raum-a101
  if (value.startsWith("/")) {
    try {
      const url = new URL(value, window.location.origin);
      const roomToken = url.searchParams.get("roomToken")?.trim();

      return roomToken || null;
    } catch {
      return null;
    }
  }

  // Alte QR-Codes weiterhin unterstützen:
  // raum-a101
  return value;
}

export default function CheckInPanel({ room }: CheckInPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [status, setStatus] = useState<ScannerStatus>("starting");
  const [message, setMessage] = useState<string | null>(null);
  const [freiePlaetze, setFreiePlaetze] = useState<number | null>(null);
  const [scanAttempt, setScanAttempt] = useState(0);

  useEffect(() => {
    let scannerControls: { stop: () => void } | undefined;
    let cancelled = false;
    let qrHandled = false;
    let redirectTimeout: number | undefined;

    async function sendCheckIn(roomToken: string) {
      try {
        setStatus("checking");

        const clientId = getClientId();

        const response = await fetch(`${API_URL}/sessions/check-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomToken,
            roomId: room.id,
            clientId,
          }),
        });

        const text = await response.text();

        let data: {
          message?: string;
          freiePlaetze?: number;
        } | null = null;

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = null;
          }
        }

        if (!response.ok) {
          setMessage(
            data?.message ?? "Der Check-in konnte nicht durchgeführt werden.",
          );

          setStatus("checkin-error");
          return;
        }

        if (cancelled) {
          return;
        }

        setMessage(
          data?.message ??
            `Check-in erfolgreich. Du bist jetzt in Raum ${room.raumBezeichnung} eingecheckt.`,
        );

        setFreiePlaetze(
          typeof data?.freiePlaetze === "number" ? data.freiePlaetze : null,
        );

        setStatus("success");

        redirectTimeout = window.setTimeout(() => {
          window.location.href = "/session";
        }, 4000);
      } catch (error) {
        console.error("Check-in error:", error);

        if (!cancelled) {
          setMessage("Der Server konnte nicht erreicht werden.");
          setStatus("checkin-error");
        }
      }
    }

    async function startScanner() {
      if (!videoRef.current) {
        return;
      }

      // Auf mobilen Browsern ist der Kamerazugriff über HTTP
      // außerhalb von localhost nicht verfügbar.
      // Deshalb prüfen wir die Camera API vor dem Start von ZXing.
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
              setMessage("Der QR-Code enthält keinen gültigen Raumzugang.");
              setStatus("checkin-error");
              return;
            }

            void sendCheckIn(roomToken);
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

      if (redirectTimeout !== undefined) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, [room.id, room.raumBezeichnung, scanAttempt]);

  function restartScanner() {
    setMessage(null);
    setFreiePlaetze(null);
    setStatus("starting");
    setScanAttempt((value) => value + 1);
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white shadow-[0_12px_40px_rgba(15,42,67,0.08)] sm:rounded-[30px]">
      <div className="bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] px-5 py-5 text-white sm:px-8 sm:py-6">
        <p className="text-sm font-medium text-blue-100">Check-in</p>

        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          {room.raumBezeichnung}
        </h1>

        <p className="mt-2 text-sm text-blue-50/80 sm:text-base">
          {room.gebaeude} · {room.etage}. Etage
        </p>
      </div>

      <div className="p-5 sm:p-8">
        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold text-[#102A43] sm:text-2xl">
            QR-Code im Lernraum scannen
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Richte die Kamera auf den QR-Code des Lernraums.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[22px] bg-[#071923]">
          <video
            ref={videoRef}
            className="aspect-[3/4] w-full object-cover sm:aspect-video"
            muted
            playsInline
          />

          {(status === "starting" || status === "scanning") && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-48 w-48 rounded-[28px] border-4 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)] sm:h-56 sm:w-56" />
            </div>
          )}

          {status === "starting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#071923] text-white">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                <p className="mt-4 text-sm font-semibold">
                  Kamera wird gestartet …
                </p>
              </div>
            </div>
          )}

          {status === "checking" && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#063B5C]/95 text-white">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                <p className="mt-4 font-semibold">Check-in wird überprüft …</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#062F35]/95 px-6 text-center text-white">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DFF9F4] text-3xl text-[#087F73]">
                  ✓
                </div>

                <h3 className="mt-4 text-xl font-bold">Check-in erfolgreich</h3>

                <p className="mt-2 text-sm text-white/75">
                  Du bist jetzt in {room.raumBezeichnung} eingecheckt.
                </p>
              </div>
            </div>
          )}

          {status === "checkin-error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#071923] px-6 text-center text-white">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
                  !
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  Check-in nicht möglich
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  {message}
                </p>
              </div>
            </div>
          )}

          {status === "camera-error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#071923] px-6 text-center text-white">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
                  !
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  Kamera konnte nicht geöffnet werden
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Bitte erlaube den Kamerazugriff. Für den QR-Scanner ist auf
                  mobilen Geräten außerdem eine sichere HTTPS-Verbindung
                  erforderlich.
                </p>
              </div>
            </div>
          )}
        </div>

        {status === "success" && (
          <div className="mt-5 rounded-2xl border border-[#BFE8E4] bg-[#F0FCFA] p-4 text-center">
            <p className="font-bold text-[#087F73]">{message}</p>

            {freiePlaetze !== null && (
              <p className="mt-1 text-sm text-slate-500">
                Noch {freiePlaetze}{" "}
                {freiePlaetze === 1 ? "Platz frei" : "Plätze frei"}
              </p>
            )}
          </div>
        )}

        {status === "checkin-error" && (
          <button
            type="button"
            onClick={restartScanner}
            className="mt-5 w-full rounded-2xl bg-[#075985] px-5 py-3.5 font-bold text-white transition hover:bg-[#064B70]"
          >
            Erneut scannen
          </button>
        )}

        <Link
          href={`/rooms/${room.id}`}
          className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          Abbrechen
        </Link>
      </div>
    </section>
  );
}
