"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { Room } from "@/types/room";
import { getClientId, registerClientIdentity } from "@/lib/client-id";

type PageStatus = "loading" | "selection" | "checking" | "success" | "error";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export default function DirectCheckInPage() {
  const t = useTranslations("directCheckIn");
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [roomToken, setRoomToken] = useState("");
  const [status, setStatus] = useState<PageStatus>("loading");

  const [message, setMessage] = useState<string | null>(null);
  const [freiePlaetze, setFreiePlaetze] = useState<number | null>(null);

  const [groupMode, setGroupMode] = useState(false);
  const [groupSize, setGroupSize] = useState(2);

  useEffect(() => {
    let cancelled = false;

    async function loadRoom() {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("roomToken")?.trim() ?? "";

      if (!token) {
        setMessage(t("invalidQr"));
        setStatus("error");
        return;
      }

      try {
        setStatus("loading");

        const response = await fetch(
          `${API_URL}/rooms/by-token/${encodeURIComponent(token)}`,
          {
            cache: "no-store",
          },
        );

        const text = await response.text();

        if (!response.ok) {
          if (!cancelled) {
            setMessage(t("roomNotFound"));
            setStatus("error");
          }

          return;
        }

        if (!text) {
          if (!cancelled) {
            setMessage(t("roomLoadError"));
            setStatus("error");
          }

          return;
        }

        const resolvedRoom = JSON.parse(text) as Room;

        if (cancelled) {
          return;
        }

        if (resolvedRoom.isUnderRenovation) {
          setMessage(t("renovationClosed"));
          setStatus("error");
          return;
        }
        setRoom(resolvedRoom);
        setRoomToken(token);

        setGroupSize(Math.min(2, Math.max(resolvedRoom.freiePlaetze, 1)));

        setStatus("selection");
      } catch (error) {
        console.error("Direct room lookup error:", error);

        if (!cancelled) {
          setMessage(t("serverError"));
          setStatus("error");
        }
      }
    }

    void loadRoom();

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function getCurrentSession(clientId: string): Promise<CurrentSession> {
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

      const text = await response.text();

      if (!text) {
        return null;
      }

      return JSON.parse(text) as CurrentSession;
    } catch {
      return null;
    }
  }

  async function performCheckIn(size: number) {
    if (!room || !roomToken || status === "checking") {
      return;
    }

    setMessage(null);
    setStatus("checking");

    try {
      // Enregistrer une nouvelle identité avant le premier check-in.
      // Les anciennes identités restent utilisables sans modification.
      await registerClientIdentity();
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
          groupSize: size,
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
        if (response.status === 409) {
          const currentSession = await getCurrentSession(clientId);

          if (currentSession && currentSession.lernraum.id === room.id) {
            setMessage(
              size >= 2
                ? t("groupSuccessMessage", {
                    room: room.raumBezeichnung,
                    count: size,
                  })
                : t("successMessage", {
                    room: room.raumBezeichnung,
                  }),
            );

            setStatus("success");

            window.setTimeout(() => {
              router.push("/session");
            }, 3000);

            return;
          }
        }

        setMessage(data?.message ?? t("genericError"));

        setStatus("error");
        return;
      }

      if (typeof data?.freiePlaetze === "number") {
        setFreiePlaetze(data.freiePlaetze);

        setRoom((currentRoom) =>
          currentRoom
            ? {
                ...currentRoom,
                freiePlaetze: data.freiePlaetze as number,
              }
            : currentRoom,
        );
      }

      setMessage(
        size >= 2
          ? t("groupSuccessMessage", {
              room: room.raumBezeichnung,
              count: size,
            })
          : t("successMessage", {
              room: room.raumBezeichnung,
            }),
      );

      setStatus("success");

      window.setTimeout(() => {
        router.push("/session");
      }, 3000);
    } catch (error) {
      console.error("Direct check-in error:", error);

      setMessage(t("serverError"));
      setStatus("error");
    }
  }

  function decreaseGroupSize() {
    setGroupSize((current) => Math.max(2, current - 1));
  }

  function increaseGroupSize() {
    if (!room) {
      return;
    }

    setGroupSize((current) => Math.min(room.freiePlaetze, current + 1));
  }

  return (
    <main data-lernraum-check-in className="flex-none bg-[#F6F8FA] pb-8 text-[#183247] md:flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 md:px-8 lg:py-12">
        <section className="overflow-hidden rounded-xl border border-[#DCE5EA] bg-white">
          <div className="border-b border-[#E8EDF0] bg-white px-5 py-6 text-[#153C52] sm:px-8 sm:py-7">
            <p className="text-xs font-semibold text-[#647D8D]">{t("label")}</p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#153C52] sm:text-4xl">
              {room?.raumBezeichnung ?? t("fallbackRoom")}
            </h1>

            {room && (
              <p className="mt-1.5 text-sm text-[#647D8D] sm:text-base">
                {room.gebaeude} · {room.etage}
              </p>
            )}
          </div>

          <div className="p-5 sm:p-8">
            {status === "loading" && (
              <div className="py-12 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#075985]/20 border-t-[#075985]" />

                <h2 className="mt-5 text-xl font-bold">
                  {t("recognizingTitle")}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {t("recognizingText")}
                </p>
              </div>
            )}

            {status === "selection" && room && (
              <div>
                <div className="text-center">
                  <h2 className="text-xl font-bold sm:text-2xl">
                    {t("chooseTypeTitle")}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {t("chooseTypeText")}
                  </p>

                  <div className="mt-3 inline-flex rounded-md border border-[#CDE8DC] bg-[#F0F8F4] px-3 py-1.5 text-sm font-semibold text-[#176346]">
                    {room.freiePlaetze === 1
                      ? t("availableOne", {
                          count: room.freiePlaetze,
                        })
                      : t("availableMany", {
                          count: room.freiePlaetze,
                        })}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGroupMode(false);
                      void performCheckIn(1);
                    }}
                    className="rounded-lg border border-[#DCE5EA] bg-white p-5 text-left transition-colors hover:border-[#8FB2C1] hover:bg-[#F7FAFB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EDF5F7] text-xl">
                      👤
                    </div>

                    <p className="mt-4 font-bold text-[#102A43]">
                      {t("alone")}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {t("aloneText")}
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={room.freiePlaetze < 2}
                    onClick={() => {
                      setGroupMode(true);
                      setGroupSize(2);
                    }}
                    className={`rounded-lg border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791] ${
                      groupMode
                        ? "border-[#17536B] bg-[#EDF5F7]"
                        : "border-[#DCE5EA] bg-white hover:border-[#8FB2C1] hover:bg-[#F7FAFB]"
                    } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:opacity-50`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF4F8] text-xl">
                      👥
                    </div>

                    <p className="mt-4 font-bold text-[#102A43]">
                      {t("group")}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {room.freiePlaetze >= 2
                        ? t("groupText")
                        : t("groupUnavailable")}
                    </p>
                  </button>
                </div>

                {groupMode && room.freiePlaetze >= 2 && (
                  <div className="mt-5 rounded-lg border border-[#CFE0E8] bg-[#F3F8FA] p-5">
                    <p className="text-center text-sm font-semibold text-[#17536B]">
                      {t("groupSizeTitle")}
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-5">
                      <button
                        type="button"
                        onClick={decreaseGroupSize}
                        disabled={groupSize <= 2}
                        aria-label={t("decreaseGroup")}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#C7D9E1] bg-white text-xl font-bold text-[#153C52] transition-colors hover:bg-[#EDF5F7] disabled:cursor-not-allowed disabled:opacity-40"
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
                        disabled={groupSize >= room.freiePlaetze}
                        aria-label={t("increaseGroup")}
                        className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#C7D9E1] bg-white text-xl font-bold text-[#153C52] transition-colors hover:bg-[#EDF5F7] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => void performCheckIn(groupSize)}
                      className="mt-5 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#17536B] px-5 py-3.5 font-semibold text-white transition-colors hover:bg-[#103E52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791]"
                    >
                      {t("confirmGroup", {
                        count: groupSize,
                      })}
                    </button>
                  </div>
                )}

                <Link
                  href="/"
                  className="mt-5 flex min-h-11 w-full items-center justify-center rounded-lg border border-[#C7D9E1] bg-white px-5 py-3.5 text-sm font-semibold text-[#17536B] transition-colors hover:border-[#8FB2C1] hover:bg-[#EEF5F7]"
                >
                  {t("cancel")}
                </Link>
              </div>
            )}

            {status === "checking" && room && (
              <div className="py-8 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#075985]/20 border-t-[#075985]" />

                <h2 className="mt-5 text-xl font-bold">{t("checkingTitle")}</h2>

                <p className="mt-2 text-sm text-slate-500">
                  {t("checkingRoom", {
                    room: room.raumBezeichnung,
                  })}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {t("checkingText")}
                </p>
              </div>
            )}

            {status === "success" && room && (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DFF9F4] text-3xl font-bold text-[#087F73]">
                  ✓
                </div>

                <h2 className="mt-4 text-2xl font-bold text-[#087F73]">
                  {t("success")}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {message}
                </p>

                {freiePlaetze !== null && (
                  <p className="mt-3 text-sm font-semibold text-[#075985]">
                    {freiePlaetze === 1
                      ? t("remainingOne", {
                          count: freiePlaetze,
                        })
                      : t("remainingMany", {
                          count: freiePlaetze,
                        })}
                  </p>
                )}

                <p className="mt-4 text-xs text-slate-400">{t("redirect")}</p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
                  !
                </div>

                <h2 className="mt-4 text-xl font-bold text-red-700">
                  {t("notPossible")}
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-600">
                  {message}
                </p>

                <Link
                  href="/"
                  className="mt-6 flex min-h-11 w-full items-center justify-center rounded-lg border border-[#C7D9E1] bg-white px-5 py-3.5 text-sm font-semibold text-[#17536B] transition-colors hover:border-[#8FB2C1] hover:bg-[#EEF5F7]"
                >
                  {t("toRooms")}
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
