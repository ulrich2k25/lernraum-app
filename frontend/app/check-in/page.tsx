"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Room } from "@/types/room";
import { getClientId } from "@/lib/client-id";

type PageStatus = "loading" | "checking" | "success" | "error";

type CheckInResponse = {
  message?: string;
  freiePlaetze?: number;
};

type CurrentSession = {
  id: number;
  status: string;
  lernraum: {
    id: number;
    raumBezeichnung: string;
  };
} | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export default function DirectCheckInPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [freiePlaetze, setFreiePlaetze] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let redirectTimeout: number | undefined;

    async function getCurrentSession(
      clientId: string,
    ): Promise<CurrentSession> {
      try {
        const response = await fetch(
          `${API_URL}/sessions/current/${encodeURIComponent(clientId)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return null;
        }

        return (await response.json()) as CurrentSession;
      } catch {
        return null;
      }
    }

    async function startDirectCheckIn() {
      const searchParams = new URLSearchParams(window.location.search);
      const roomToken = searchParams.get("roomToken")?.trim() ?? "";

      if (!roomToken) {
        setMessage("Der QR-Code enthält keinen gültigen Raumzugang.");
        setStatus("error");
        return;
      }

      try {
        /*
         * 1. Lernraum anhand des roomToken ermitteln.
         */
        setStatus("loading");

        const roomResponse = await fetch(
          `${API_URL}/rooms/by-token/${encodeURIComponent(roomToken)}`,
          {
            cache: "no-store",
          },
        );

        const roomText = await roomResponse.text();

        if (!roomResponse.ok) {
          let errorMessage = "Der Lernraum konnte nicht gefunden werden.";

          if (roomText) {
            try {
              const data = JSON.parse(roomText) as {
                message?: string;
              };

              if (data.message) {
                errorMessage = data.message;
              }
            } catch {
              // Standardmeldung verwenden.
            }
          }

          if (!cancelled) {
            setMessage(errorMessage);
            setStatus("error");
          }

          return;
        }

        if (!roomText) {
          if (!cancelled) {
            setMessage("Der Lernraum konnte nicht geladen werden.");
            setStatus("error");
          }

          return;
        }

        const resolvedRoom = JSON.parse(roomText) as Room;

        if (cancelled) {
          return;
        }

        setRoom(resolvedRoom);
        setStatus("checking");

        /*
         * 2. Gleiche clientId wie beim normalen Check-in verwenden.
         */
        const clientId = getClientId();

        /*
         * 3. Exakt denselben Backend-Check-in aufrufen
         *    wie beim Check-in innerhalb der App.
         */
        const checkInResponse = await fetch(`${API_URL}/sessions/check-in`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomToken,
            roomId: resolvedRoom.id,
            clientId,
          }),
        });

        const checkInText = await checkInResponse.text();

        let checkInData: CheckInResponse | null = null;

        if (checkInText) {
          try {
            checkInData = JSON.parse(checkInText) as CheckInResponse;
          } catch {
            checkInData = null;
          }
        }

        /*
         * In der Next.js-Entwicklungsumgebung kann ein Effect
         * zweimal geprüft werden. Falls dadurch bereits dieselbe
         * Sitzung erstellt wurde, behandeln wir sie nicht als Fehler.
         */
        if (!checkInResponse.ok) {
          if (checkInResponse.status === 409) {
            const currentSession = await getCurrentSession(clientId);

            if (
              currentSession &&
              currentSession.lernraum.id === resolvedRoom.id
            ) {
              if (cancelled) {
                return;
              }

              setMessage(
                `Check-in erfolgreich. Du bist jetzt in Raum ${resolvedRoom.raumBezeichnung} eingecheckt.`,
              );

              setStatus("success");

              redirectTimeout = window.setTimeout(() => {
                window.location.href = "/session";
              }, 3000);

              return;
            }
          }

          if (!cancelled) {
            setMessage(
              checkInData?.message ??
                "Der Check-in konnte nicht durchgeführt werden.",
            );

            setStatus("error");
          }

          return;
        }

        if (cancelled) {
          return;
        }

        if (typeof checkInData?.freiePlaetze === "number") {
          setFreiePlaetze(checkInData.freiePlaetze);

          setRoom({
            ...resolvedRoom,
            freiePlaetze: checkInData.freiePlaetze,
          });
        }

        setMessage(
          checkInData?.message ??
            `Check-in erfolgreich. Du bist jetzt in Raum ${resolvedRoom.raumBezeichnung} eingecheckt.`,
        );

        setStatus("success");

        /*
         * 4. Automatisch zur aktiven Sitzung wechseln.
         */
        redirectTimeout = window.setTimeout(() => {
          window.location.href = "/session";
        }, 3000);
      } catch (error) {
        console.error("Direct check-in error:", error);

        if (!cancelled) {
          setMessage("Der Server konnte nicht erreicht werden.");
          setStatus("error");
        }
      }
    }

    void startDirectCheckIn();

    return () => {
      cancelled = true;

      if (redirectTimeout !== undefined) {
        window.clearTimeout(redirectTimeout);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F8FA] pb-8 text-[#102A43]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 md:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white shadow-[0_12px_40px_rgba(15,42,67,0.08)] sm:rounded-[30px]">
          <div className="bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] px-5 py-6 text-white sm:px-8 sm:py-8">
            <p className="text-sm font-medium text-blue-100">
              Direkter QR-Check-in
            </p>

            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {room?.raumBezeichnung ?? "Lernraum"}
            </h1>

            {room && (
              <p className="mt-2 text-sm text-blue-50/80 sm:text-base">
                {room.gebaeude} · {room.etage}. Etage
              </p>
            )}
          </div>

          <div className="p-5 sm:p-8">
            {status === "loading" && (
              <div className="py-12 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#075985]/20 border-t-[#075985]" />

                <h2 className="mt-5 text-xl font-bold">
                  Lernraum wird erkannt …
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Der QR-Code wird überprüft.
                </p>
              </div>
            )}

            {status === "checking" && room && (
              <div className="py-8 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#075985]/20 border-t-[#075985]" />

                <h2 className="mt-5 text-xl font-bold">
                  Check-in wird überprüft …
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Lernraum {room.raumBezeichnung}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Die Check-in-Regeln werden geprüft.
                </p>
              </div>
            )}

            {status === "success" && room && (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DFF9F4] text-3xl font-bold text-[#087F73]">
                  ✓
                </div>

                <h2 className="mt-4 text-2xl font-bold text-[#087F73]">
                  Check-in erfolgreich
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {message}
                </p>

                {freiePlaetze !== null && (
                  <p className="mt-3 text-sm font-semibold text-[#075985]">
                    Noch {freiePlaetze}{" "}
                    {freiePlaetze === 1 ? "Platz frei" : "Plätze frei"}
                  </p>
                )}

                <p className="mt-4 text-xs text-slate-400">
                  Du wirst automatisch zu deiner aktiven Sitzung weitergeleitet.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
                  !
                </div>

                <h2 className="mt-4 text-xl font-bold text-red-700">
                  Check-in nicht möglich
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-600">
                  {message}
                </p>

                <Link
                  href="/"
                  className="mt-6 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Zu den Lernräumen
                </Link>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-7 text-center text-xs text-slate-400">
          Projekt 1 · Hochschule Kaiserslautern
        </footer>
      </div>
    </main>
  );
}
