"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type LoginResponse = {
  accessToken: string;
  admin: {
    id: number;
    username: string;
  };
};

export default function AdminLoginPage() {
  const t = useTranslations("adminLogin");
  const tc = useTranslations("adminCommon");
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError(t("missing"));
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

      if (!response.ok) {
        throw new Error(t("failed"));
      }

      const loginData = (await response.json()) as LoginResponse;

      localStorage.setItem("lernraum-admin-token", loginData.accessToken);

      localStorage.setItem("lernraum-admin", JSON.stringify(loginData.admin));

      router.push("/admin/rooms");
    } catch (error) {
      setError(error instanceof Error ? error.message : t("failed"));
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#DCE6EC] bg-[#F8FAFC] px-4 py-3.5 text-base text-[#102A43] outline-none transition placeholder:text-[#9AAABA] focus:border-[#087F83] focus:bg-white focus:ring-4 focus:ring-[#087F83]/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#F4F8FA] px-4 py-8 text-[#102A43] sm:px-6">
      <section className="w-full max-w-[460px] rounded-[26px] border border-[#DFE9EF] bg-white shadow-[0_20px_60px_rgba(16,42,67,0.08)]">
        {/* HEADER */}
        <header className="relative z-20 rounded-t-[26px] bg-gradient-to-br from-[#102A43] via-[#164765] to-[#087F83] px-7 pb-6 pt-5 text-white sm:px-9">
          {/* LANGUAGE SWITCHER */}
          <div className="mb-4 flex justify-end">
            <div className="rounded-xl bg-white px-2 py-1">
              <LanguageSwitcher />
            </div>
          </div>

          {/* TITLE */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B7F4EB]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5EEAD4]" />
            {tc("management")}
          </div>

          <h1 className="mt-3 text-[29px] font-extrabold tracking-[-0.035em] sm:text-[32px]">
            {t("title")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#D5E7EE]">
            {t("description")}
          </p>
        </header>

        {/* LOGIN FORM */}
        <div className="px-7 py-8 sm:px-9 sm:py-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* USERNAME */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-[#344F65]"
              >
                {t("username")}
              </label>

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isLoading}
                required
                placeholder={t("username")}
                className={inputClass}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#344F65]"
              >
                {t("password")}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isLoading}
                required
                placeholder={t("password")}
                className={inputClass}
              />
            </div>

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-[#102A43] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#173F5D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F83] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t("loading") : t("submit")}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
