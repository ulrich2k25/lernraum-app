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
    <main className="flex-none bg-[#F4F8FA] pb-8 text-[#102A43] md:flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 md:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[26px] border border-[#D9E7EC] bg-white shadow-[0_12px_40px_rgba(15,42,67,0.08)] sm:rounded-[30px]">
          <div className="bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] px-5 py-6 text-white sm:px-8 sm:py-8">
            <p className="text-sm font-medium text-blue-100">{t("label")}</p>

            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {room?.raumBezeichnung ?? t("fallbackRoom")}
            </h1>

            {room && (
              <p className="mt-2 text-sm text-blue-50/80 sm:text-base">
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

                  <div className="mt-3 inline-flex rounded-full bg-[#E9FAF7] px-3 py-1.5 text-sm font-bold text-[#087F73]">
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
                    className="rounded-2xl border-2 border-[#D9E7EC] bg-white p-5 text-left transition hover:border-[#075985] hover:bg-[#F7FBFC]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDF7FA] text-xl">
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
                    className={`rounded-2xl border-2 p-5 text-left transition ${
                      groupMode
                        ? "border-[#3157A4] bg-[#F7F9FF]"
                        : "border-[#D9E7EC] bg-white hover:border-[#3157A4] hover:bg-[#F7F9FF]"
                    } disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:opacity-50`}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF4FF] text-xl">
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
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl font-bold text-[#102A43] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl font-bold text-[#102A43] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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

                <Link
                  href="/"
                  className="mt-5 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
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
                  className="mt-6 flex w-full items-center justify-center rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
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
