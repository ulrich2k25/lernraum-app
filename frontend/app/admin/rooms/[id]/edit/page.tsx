"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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

export default function EditAdminRoomPage() {
  const t = useTranslations("adminRoomForm");
  const tc = useTranslations("adminCommon");
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const roomId = Number(params.id);
  const invalidRoom = !Number.isInteger(roomId) || roomId <= 0;

  const [room, setRoom] = useState<AdminRoom | null>(null);

  const [raumBezeichnung, setRaumBezeichnung] = useState("");
  const [gebaeude, setGebaeude] = useState("");
  const [etage, setEtage] = useState("");
  const [kapazitaet, setKapazitaet] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [autoCloseWhenEmpty, setAutoCloseWhenEmpty] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("lernraum-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (invalidRoom) {
      return;
    }

    let isMounted = true;

    async function loadRoom() {
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

        const currentRoom = ((await response.json()) as AdminRoom[]).find(
          (item) => item.id === roomId,
        );

        if (!currentRoom) {
          throw new Error(t("notFound"));
        }

        if (!isMounted) return;

        setRoom(currentRoom);
        setRaumBezeichnung(currentRoom.raumBezeichnung);
        setGebaeude(currentRoom.gebaeude);
        setEtage(currentRoom.etage);
        setKapazitaet(String(currentRoom.kapazitaet));
        setStatus(currentRoom.status);
        setAutoCloseWhenEmpty(currentRoom.autoCloseWhenEmpty);
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

    void loadRoom();

    return () => {
      isMounted = false;
    };
  }, [invalidRoom, roomId, router, t]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!room) return;

    const token = localStorage.getItem("lernraum-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const parsedCapacity = Number(kapazitaet);

    if (
      !raumBezeichnung.trim() ||
      !gebaeude.trim() ||
      !etage.trim() ||
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity <= 0
    ) {
      setError(tc("requiredError"));
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const updateResponse = await fetch(`${API_URL}/admin/rooms/${room.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          raumBezeichnung: raumBezeichnung.trim(),
          gebaeude: gebaeude.trim(),
          etage: etage.trim(),
          kapazitaet: parsedCapacity,
          autoCloseWhenEmpty,
        }),
      });

      if (updateResponse.status === 401) {
        localStorage.removeItem("lernraum-admin-token");
        localStorage.removeItem("lernraum-admin");
        router.replace("/admin/login");
        return;
      }

      if (!updateResponse.ok) {
        throw new Error(t("updateError"));
      }

      if (status !== room.status) {
        const statusResponse = await fetch(
          `${API_URL}/admin/rooms/${room.id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          },
        );

        if (statusResponse.status === 401) {
          localStorage.removeItem("lernraum-admin-token");
          localStorage.removeItem("lernraum-admin");
          router.replace("/admin/login");
          return;
        }

        if (!statusResponse.ok) {
          throw new Error(t("statusError"));
        }
      }

      router.push("/admin/rooms");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#DCE6EC] bg-[#F8FAFC] px-4 py-3.5 text-sm text-[#102A43] outline-none transition placeholder:text-[#9AAABA] focus:border-[#087F83] focus:bg-white focus:ring-4 focus:ring-[#087F83]/10 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass = "mb-2 block text-sm font-semibold text-[#344F65]";

  const pageContainer =
    "mx-auto w-full max-w-6xl px-4 pb-8 pt-0 sm:px-6 md:px-8 lg:pb-10";

  // INVALID ROOM
  if (invalidRoom) {
    return (
      <main className="bg-[#F4F8FA] text-[#102A43]">
        <div className={pageContainer}>
          <Link
            href="/admin/rooms"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F83]"
          >
            ← {tc("back")}
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
            {t("invalidRoom")}
          </div>
        </div>
      </main>
    );
  }

  // LOADING
  if (isLoading) {
    return (
      <main className="bg-[#F4F8FA] text-[#102A43]">
        <div className={pageContainer}>
          <div className="rounded-[24px] border border-[#E0EAF0] bg-white p-8 text-center text-sm text-[#71869A]">
            {t("loading")}
          </div>
        </div>
      </main>
    );
  }

  // ERROR
  if (error && !room) {
    return (
      <main className="bg-[#F4F8FA] text-[#102A43]">
        <div className={pageContainer}>
          <Link
            href="/admin/rooms"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F83]"
          >
            ← {tc("back")}
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!room) return null;

  return (
    <main className="bg-[#F4F8FA] text-[#102A43]">
      <div className={pageContainer}>
        {/* HEADER */}
        <header className="relative z-20 rounded-[26px] bg-gradient-to-br from-[#102A43] via-[#164765] to-[#087F83] px-6 py-7 text-white shadow-[0_14px_35px_rgba(16,42,67,0.12)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-10 top-0 h-44 w-44 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B7F4EB]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
                {tc("management")}
              </div>

              <h1 className="text-[27px] font-extrabold tracking-[-0.035em] sm:text-[34px]">
                {t("editTitle")}
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#D5E7EE]">
                {t("editDescription")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-white px-2 py-1">
                <LanguageSwitcher />
              </div>

              <Link
                href="/admin/rooms"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <span aria-hidden="true">←</span>
                {tc("back")}
              </Link>
            </div>
          </div>
        </header>

        {/* FORM */}
        <section className="mt-6 w-full overflow-hidden rounded-[26px] border border-[#E0EAF0] bg-white shadow-[0_8px_30px_rgba(16,42,67,0.045)]">
          <div className="h-1 bg-gradient-to-r from-[#087F83] to-[#5EEAD4]" />

          <div className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ROOM NAME */}
              <div>
                <label htmlFor="raumBezeichnung" className={labelClass}>
                  {tc("roomName")}
                </label>

                <input
                  id="raumBezeichnung"
                  type="text"
                  value={raumBezeichnung}
                  onChange={(e) => setRaumBezeichnung(e.target.value)}
                  disabled={isSaving}
                  required
                  className={inputClass}
                />
              </div>

              {/* BUILDING + FLOOR */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="gebaeude" className={labelClass}>
                    {tc("building")}
                  </label>

                  <input
                    id="gebaeude"
                    type="text"
                    value={gebaeude}
                    onChange={(e) => setGebaeude(e.target.value)}
                    disabled={isSaving}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="etage" className={labelClass}>
                    {tc("floor")}
                  </label>

                  <input
                    id="etage"
                    type="text"
                    value={etage}
                    onChange={(e) => setEtage(e.target.value)}
                    disabled={isSaving}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* CAPACITY + STATUS */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="kapazitaet" className={labelClass}>
                    {tc("capacity")}
                  </label>

                  <input
                    id="kapazitaet"
                    type="number"
                    min="1"
                    step="1"
                    value={kapazitaet}
                    onChange={(e) => setKapazitaet(e.target.value)}
                    disabled={isSaving}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="status" className={labelClass}>
                    {tc("status")}
                  </label>

                  <select
                    id="status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ACTIVE" | "INACTIVE")
                    }
                    disabled={isSaving}
                    className={inputClass}
                  >
                    <option value="ACTIVE">{tc("active")}</option>

                    <option value="INACTIVE">{tc("inactive")}</option>
                  </select>
                </div>
              </div>

              {/* AUTO CLOSE */}
              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#DCEBE8] bg-[#F0F9F7] p-4 transition hover:border-[#A9D8D0] sm:p-5">
                <input
                  type="checkbox"
                  checked={autoCloseWhenEmpty}
                  onChange={(e) => setAutoCloseWhenEmpty(e.target.checked)}
                  disabled={isSaving}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#087F83]"
                />

                <span>
                  <span className="block text-sm font-bold text-[#102A43]">
                    {t("autoCloseEdit")}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-[#71869A]">
                    {t("autoCloseEditHint")}
                  </span>
                </span>
              </label>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#E8EFF3] pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/rooms"
                  className="rounded-xl border border-[#DCE6EC] bg-white px-6 py-3.5 text-center text-sm font-semibold text-[#526B80] transition hover:bg-[#F4F8FA]"
                >
                  {tc("cancel")}
                </Link>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-[#102A43] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#173F5D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? t("saving") : t("save")}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
