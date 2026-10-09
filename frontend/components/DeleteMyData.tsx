"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

import { getClientCredentials } from "@/lib/client-id";

const translations = {
  de: {
    title: "Meine Daten verwalten",
    description:
      "Du entscheidest, welche Daten gespeichert bleiben. Deine abgeschlossenen Besuche werden nach 30 Tagen automatisch gelöscht.",
    button: "Meine Daten löschen",
    confirm:
      "Möchtest du wirklich alle deine gespeicherten Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    deleting: "Daten werden gelöscht ...",
    success: "Deine Daten wurden erfolgreich gelöscht.",
    error: "Die Daten konnten nicht gelöscht werden. Bitte versuche es erneut.",
    legacy:
      "Für diese ältere Browserkennung ist die direkte Löschung noch nicht verfügbar. Abgeschlossene Besuche werden nach 30 Tagen automatisch gelöscht.",
    privacy: "Mehr zum Datenschutz",
  },
  en: {
    title: "Manage my data",
    description:
      "You control your stored data. Completed visits are automatically deleted after 30 days.",
    button: "Delete my data",
    confirm:
      "Do you really want to delete all your saved data? This action cannot be undone.",
    deleting: "Deleting data ...",
    success: "Your data has been deleted successfully.",
    error: "Your data could not be deleted. Please try again.",
    legacy:
      "Direct deletion is not yet available for this older browser identifier. Completed visits are automatically deleted after 30 days.",
    privacy: "Learn about privacy",
  },
  fr: {
    title: "Gérer mes données",
    description:
      "Tu gardes le contrôle de tes données. Les visites terminées sont automatiquement supprimées après 30 jours.",
    button: "Supprimer mes données",
    confirm:
      "Veux-tu vraiment supprimer toutes tes données enregistrées ? Cette action est irréversible.",
    deleting: "Suppression en cours ...",
    success: "Tes données ont été supprimées.",
    error: "Impossible de supprimer les données. Réessaie.",
    legacy:
      "La suppression directe n'est pas encore disponible pour cet ancien identifiant. Les visites terminées sont automatiquement supprimées après 30 jours.",
    privacy: "En savoir plus sur la confidentialité",
  },
};

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7" />
    </svg>
  );
}

export default function DeleteMyData() {
  const locale = useLocale();
  const t =
    translations[locale as keyof typeof translations] ?? translations.de;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);

  function checkCredentials() {
    const { clientId, secret } = getClientCredentials();
    setHasCredentials(Boolean(clientId && secret));
  }

  async function deleteData() {
    if (!window.confirm(t.confirm)) return;

    const { clientId, secret } = getClientCredentials();

    if (!clientId || !secret) {
      setHasCredentials(false);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await fetch("/api/sessions/delete-my-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clientId, secret }),
      });

      if (!response.ok) {
        throw new Error("Deletion failed");
      }

      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();

          if (subscription) {
            await subscription.unsubscribe();
          }
        } catch {
          // Les données serveur ont déjà été supprimées.
        }
      }

      localStorage.removeItem("lernraum-client-id");
      localStorage.removeItem("lernraum-client-secret");

      setSuccess(true);
      setHasCredentials(false);

      window.location.reload();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-[24px] border border-[#D9E7EC] bg-white shadow-[0_6px_24px_rgba(16,42,67,0.035)]">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-7">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF7F7] text-[#087F83]">
          <ShieldIcon />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold tracking-tight text-[#102A43] sm:text-xl">
            {t.title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {t.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {hasCredentials === null && (
              <button
                type="button"
                onClick={checkCredentials}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:border-red-300 hover:bg-red-50"
              >
                <TrashIcon />
                {t.button}
              </button>
            )}

            {hasCredentials === true && (
              <button
                type="button"
                onClick={() => void deleteData()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon />
                {loading ? t.deleting : t.button}
              </button>
            )}
          </div>

          {hasCredentials === false && !success && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              {t.legacy}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {t.error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              {t.success}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
