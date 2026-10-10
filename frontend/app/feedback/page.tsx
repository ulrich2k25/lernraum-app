"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

type Rating = "POSITIVE" | "NEGATIVE";

export default function FeedbackPage() {
  const t = useTranslations("feedback");

  const [rating, setRating] = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rating || isSubmitting) return;

    setIsSubmitting(true);
    setError(false);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          message: message.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Feedback submission failed");
      }

      setIsSuccess(true);
      setRating(null);
      setMessage("");
    } catch {
      setError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="w-full flex-none bg-[#F4F8FA] pb-8 text-[#102A43] md:flex-1 md:pb-24">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#075985] transition hover:text-[#087F83]"
        >
          <span aria-hidden="true">←</span>
          {t("back")}
        </Link>

        <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#102A43] via-[#075985] to-[#087F83] px-6 py-9 text-white shadow-[0_16px_45px_rgba(16,42,67,0.13)] sm:px-9 sm:py-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10"
          />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A5F3E7]">
              {t("eyebrow")}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[#DCECF2] sm:text-base">
              {t("description")}
            </p>
          </div>
        </header>

        <section className="mt-7 rounded-[26px] border border-[#D9E7EC] bg-white p-6 shadow-[0_8px_30px_rgba(16,42,67,0.04)] sm:p-9">
          {isSuccess ? (
            <div role="status" className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                ✓
              </div>

              <h2 className="mt-5 text-2xl font-extrabold text-[#102A43]">
                {t("successTitle")}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                {t("successText")}
              </p>

              <Link
                href="/"
                className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#087F83] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#076B70]"
              >
                {t("backToRooms")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-extrabold text-[#102A43]">
                {t("ratingTitle")}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {t("ratingDescription")}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={rating === "POSITIVE"}
                  onClick={() => setRating("POSITIVE")}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${
                    rating === "POSITIVE"
                      ? "border-[#087F83] bg-[#EAF7F7] shadow-sm"
                      : "border-[#E2EAF0] bg-white hover:border-[#9DCFD0] hover:bg-[#F8FCFC]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl"
                  >
                    👍
                  </span>

                  <span className="font-bold text-[#102A43]">
                    {t("positive")}
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={rating === "NEGATIVE"}
                  onClick={() => setRating("NEGATIVE")}
                  className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${
                    rating === "NEGATIVE"
                      ? "border-[#087F83] bg-[#EAF7F7] shadow-sm"
                      : "border-[#E2EAF0] bg-white hover:border-[#9DCFD0] hover:bg-[#F8FCFC]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl"
                  >
                    👎
                  </span>

                  <span className="font-bold text-[#102A43]">
                    {t("negative")}
                  </span>
                </button>
              </div>

              <div className="mt-8">
                <label
                  htmlFor="feedback-message"
                  className="block text-sm font-bold text-[#102A43]"
                >
                  {t("messageLabel")}
                </label>

                <p className="mt-1 text-xs text-slate-500">
                  {t("messageHint")}
                </p>

                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder={t("messagePlaceholder")}
                  className="mt-4 w-full resize-y rounded-2xl border border-[#D9E7EC] bg-[#F8FAFC] px-4 py-3 text-sm leading-6 text-[#102A43] outline-none transition placeholder:text-slate-400 focus:border-[#087F83] focus:ring-2 focus:ring-[#087F83]/10"
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {message.length}/1000
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {t("error")}
                </p>
              )}

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E8EEF2] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">{t("anonymous")}</p>

                <button
                  type="submit"
                  disabled={!rating || isSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-[#087F83] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#076B70] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t("sending") : t("submit")}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
