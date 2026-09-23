"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type LoginResponse = {
  accessToken: string;
  admin: {
    id: number;
    username: string;
  };
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!username.trim() || !password) {
      setError("Bitte Benutzername und Passwort eingeben.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message ?? "Die Anmeldung ist fehlgeschlagen.");
      }

      const loginData = data as LoginResponse;

      localStorage.setItem("lernraum-admin-token", loginData.accessToken);

      localStorage.setItem("lernraum-admin", JSON.stringify(loginData.admin));

      router.push("/admin/rooms");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Die Anmeldung ist fehlgeschlagen.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F8FA] px-4 py-10 text-[#102A43]">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#075985]">
            Lernraum Verwaltung
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Admin-Anmeldung
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Melden Sie sich an, um Lernräume und QR-Codes zu verwalten.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Benutzername
            </label>

            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="Benutzername"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Passwort
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#075985] focus:ring-2 focus:ring-[#075985]/15 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="Passwort"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-[#075985] px-4 py-3 font-semibold text-white transition hover:bg-[#064e73] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Anmeldung läuft ..." : "Anmelden"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Projekt 1 · Hochschule Kaiserslautern
        </p>
      </section>
    </main>
  );
}
