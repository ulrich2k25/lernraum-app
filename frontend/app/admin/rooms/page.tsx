"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import AdminRoomQrCode from "@/components/AdminRoomQrCode";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type AdminRoom = {
  id: number;
  raumBezeichnung: string;
  gebaeude: string;
  etage: string;
  kapazitaet: number;
  status: "ACTIVE" | "INACTIVE";
  raumToken: string;
  autoCloseWhenEmpty: boolean;
  isTemporarilyClosed: boolean;
  aktiveSitzungen: number;
  freiePlaetze: number;
};

export default function AdminRoomsPage() {
  const t = useTranslations("adminRooms");
  const tc = useTranslations("adminCommon");
  const router = useRouter();

  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQrRoomId, setSelectedQrRoomId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("lernraum-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    let isMounted = true;

    async function loadRooms(showLoading = false) {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`${API_URL}/admin/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          localStorage.removeItem("lernraum-admin-token");
          localStorage.removeItem("lernraum-admin");
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(t("loadError"));
        }

        const data = (await response.json()) as AdminRoom[];

        if (isMounted) {
          setRooms(data);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : t("loadError"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRooms(true);

    const interval = window.setInterval(() => {
      void loadRooms();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [router, t]);

  function handleLogout() {
    localStorage.removeItem("lernraum-admin-token");
    localStorage.removeItem("lernraum-admin");
    router.push("/admin/login");
  }

  function toggleQrCode(roomId: number) {
    setSelectedQrRoomId((current) => (current === roomId ? null : roomId));
  }

  const totalCapacity = rooms.reduce((sum, room) => sum + room.kapazitaet, 0);

  const totalFreeSeats = rooms.reduce(
    (sum, room) => sum + room.freiePlaetze,
    0,
  );

  const activeRooms = rooms.filter((room) => room.status === "ACTIVE").length;

  return (
    <main className="bg-[#F4F8FA] text-[#102A43]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-6 pt-0 sm:px-6 md:px-8 lg:pb-8 lg:pt-0">
        {/* HEADER */}
        <header className="relative z-20 rounded-[26px] bg-gradient-to-br from-[#102A43] via-[#164765] to-[#087F83] px-6 py-7 text-white shadow-[0_14px_35px_rgba(16,42,67,0.12)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-12 h-44 w-44 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B7F4EB]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
                {tc("management")}
              </div>

              <h1 className="text-[27px] font-extrabold tracking-[-0.035em] sm:text-[34px]">
                {t("title")}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#D5E7EE]">
                {t("description")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* LANGUAGE SWITCHER */}
              <div className="rounded-xl bg-white px-2 py-1">
                <LanguageSwitcher />
              </div>

              {/* ADD ROOM */}
              <Link
                href="/admin/rooms/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#102A43] transition hover:bg-[#EAF8F6]"
              >
                <span className="text-lg leading-none"></span>
                {t("add")}
              </Link>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {t("logout")}
              </button>
            </div>
          </div>
        </header>

        {/* LOADING */}
        {isLoading && (
          <div className="mt-6 rounded-2xl border border-[#E0EAF0] bg-white p-8 text-center text-sm text-[#71869A]">
            {t("loading")}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!isLoading && !error && rooms.length === 0 && (
          <div className="mt-6 rounded-2xl border border-[#E0EAF0] bg-white p-8 text-center">
            <h2 className="text-lg font-bold">{t("emptyTitle")}</h2>

            <p className="mt-2 text-sm text-[#71869A]">{t("emptyText")}</p>
          </div>
        )}

        {!isLoading && !error && rooms.length > 0 && (
          <>
            {/* STATISTICS */}
            <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              <StatCard label={t("title")} value={rooms.length} accent="blue" />

              <StatCard
                label={tc("active")}
                value={activeRooms}
                accent="teal"
              />

              <StatCard
                label={tc("capacity")}
                value={totalCapacity}
                accent="blue"
              />

              <StatCard
                label={t("freeSeats")}
                value={totalFreeSeats}
                accent="teal"
              />
            </section>

            {/* ROOMS */}
            <section className="mt-7 grid gap-5 md:grid-cols-2 xl:gap-6">
              {rooms.map((room) => {
                const isActive = room.status === "ACTIVE";

                const occupancy =
                  room.kapazitaet > 0
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          ((room.kapazitaet - room.freiePlaetze) /
                            room.kapazitaet) *
                            100,
                        ),
                      )
                    : 0;

                return (
                  <article
                    key={room.id}
                    className="overflow-hidden rounded-[24px] border border-[#E0EAF0] bg-white shadow-[0_5px_20px_rgba(16,42,67,0.035)] transition-shadow hover:shadow-[0_12px_30px_rgba(16,42,67,0.08)]"
                  >
                    <div className="h-1 bg-gradient-to-r from-[#087F83] to-[#5EEAD4]" />

                    <div className="p-5 sm:p-6">
                      {/* ROOM HEADER */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-[#102A43]">
                            {room.raumBezeichnung}
                          </h2>

                          <p className="mt-1 text-sm text-[#71869A]">
                            {room.gebaeude} · {room.etage}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                            isActive
                              ? "bg-[#E7F7F2] text-[#087F83]"
                              : "bg-[#EDF1F4] text-[#71869A]"
                          }`}
                        >
                          {isActive ? tc("active") : tc("inactive")}
                        </span>
                      </div>

                      {/* ROOM STATS */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[#F4F8FA] p-4">
                          <p className="text-xs font-medium text-[#71869A]">
                            {tc("capacity")}
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-[#102A43]">
                            {room.kapazitaet}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#EAF8F6] p-4">
                          <p className="text-xs font-medium text-[#087F83]">
                            {t("freeSeats")}
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-[#087F83]">
                            {room.freiePlaetze}
                          </p>
                        </div>
                      </div>

                      {/* ACTIVE SESSIONS */}
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-medium text-[#71869A]">
                            {t("activeSessions")}
                          </p>

                          <p className="text-sm font-bold text-[#102A43]">
                            {room.aktiveSitzungen}
                          </p>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#E7EEF2]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#087F83] to-[#43C6B2]"
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#E8EFF3] pt-5">
                        <button
                          type="button"
                          onClick={() => toggleQrCode(room.id)}
                          aria-expanded={selectedQrRoomId === room.id}
                          className="flex-1 rounded-xl border border-[#087F83] px-4 py-3 text-sm font-semibold text-[#087F83] transition hover:bg-[#EAF8F6]"
                        >
                          {selectedQrRoomId === room.id
                            ? t("qrClose")
                            : t("qr")}
                        </button>

                        <Link
                          href={`/admin/rooms/${room.id}/edit`}
                          className="flex-1 rounded-xl bg-[#102A43] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#173F5D]"
                        >
                          {t("edit")}
                        </Link>
                      </div>

                      {/* QR CODE */}
                      {selectedQrRoomId === room.id && (
                        <div className="mt-5">
                          <AdminRoomQrCode
                            raumBezeichnung={room.raumBezeichnung}
                            gebaeude={room.gebaeude}
                            etage={room.etage}
                            raumToken={room.raumToken}
                          />
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "blue" | "teal";
}) {
  return (
    <div className="rounded-[20px] border border-[#E0EAF0] bg-white p-4 shadow-[0_4px_16px_rgba(16,42,67,0.025)] sm:p-5">
      <p className="text-xs font-semibold text-[#71869A]">{label}</p>

      <p
        className={`mt-2 text-[28px] font-extrabold tracking-[-0.04em] ${
          accent === "teal" ? "text-[#087F83]" : "text-[#102A43]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
