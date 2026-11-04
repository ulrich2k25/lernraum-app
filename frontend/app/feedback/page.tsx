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
    <main
      data-lernraum-feedback
      className="w-full flex-none bg-[#F6F8FA] pb-8 text-[#183247] md:flex-1 md:pb-8"
    >
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 sm:px-6 lg:pt-9">

        <Link
          href="/"
          className="mb-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#C7D9E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#17536B] transition-colors hover:border-[#8FB2C1] hover:bg-[#EEF5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791]"
        >
          {t("back")}
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#153C52] sm:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#647D8D] sm:text-base">
            {t("description")}
          </p>
        </header>

        <section className="rounded-xl border border-[#DCE5EA] bg-white px-5 py-6 sm:px-8 sm:py-8">
          {isSuccess ? (
            <div role="status" className="py-7 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#E9F7F0] text-2xl font-semibold text-[#17805E]">
                ✓
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#153C52] sm:text-2xl">
                {t("successTitle")}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#647D8D]">
                {t("successText")}
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#17536B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#103E52]"
              >
                {t("backToRooms")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              <h2 className="text-lg font-semibold text-[#153C52] sm:text-xl">
                {t("ratingTitle")}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#647D8D]">
                {t("ratingDescription")}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  aria-pressed={rating === "POSITIVE"}
                  onClick={() => setRating("POSITIVE")}
                  className={`flex min-h-[88px] items-center gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791] ${
                    rating === "POSITIVE"
                      ? "border-[#78AD98] bg-[#EFF8F3]"
                      : "border-[#DCE5EA] bg-white hover:border-[#A2BCC8] hover:bg-[#F7FAFB]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-xl"
                  >
                    👍
                  </span>

                  <span className="font-semibold text-[#153C52]">
                    {t("positive")}
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={rating === "NEGATIVE"}
                  onClick={() => setRating("NEGATIVE")}
                  className={`flex min-h-[88px] items-center gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791] ${
                    rating === "NEGATIVE"
                      ? "border-[#C6A57F] bg-[#FBF6EF]"
                      : "border-[#DCE5EA] bg-white hover:border-[#A2BCC8] hover:bg-[#F7FAFB]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FAF1E5] text-xl"
                  >
                    👎
                  </span>

                  <span className="font-semibold text-[#153C52]">
                    {t("negative")}
                  </span>
                </button>
              </div>

              <div className="mt-7 border-t border-[#E8EDF0] pt-6">
                <label
                  htmlFor="feedback-message"
                  className="block text-sm font-semibold text-[#153C52]"
                >
                  {t("messageLabel")}
                </label>

                <p className="mt-1.5 text-xs leading-5 text-[#647D8D]">
                  {t("messageHint")}
                </p>

                <textarea
                  id="feedback-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder={t("messagePlaceholder")}
                  className="mt-3 w-full resize-y rounded-lg border border-[#C7D9E1] bg-[#FAFCFD] px-4 py-3 text-sm leading-6 text-[#183247] outline-none transition-colors placeholder:text-[#8094A0] focus:border-[#528B99] focus:ring-2 focus:ring-[#528B99]/15"
                />

                <p className="mt-2 text-right text-xs text-[#718796]">
                  {message.length}/1000
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {t("error")}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-4 border-t border-[#E8EDF0] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-[#647D8D]">
                  {t("anonymous")}
                </p>

                <button
                  type="submit"
                  disabled={!rating || isSubmitting}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#17536B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#103E52] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
