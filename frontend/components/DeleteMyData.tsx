"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { getClientCredentials } from "@/lib/client-id";

const translations = {
  de: {
    title: "Meine Daten verwalten",
    description:
      "Du kannst deine gespeicherten Besuche und Push-Benachrichtigungen dauerhaft löschen.",
    button: "Meine Daten löschen",
    confirm:
      "Möchtest du wirklich alle deine gespeicherten Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    deleting: "Daten werden gelöscht ...",
    success: "Deine Daten wurden erfolgreich gelöscht.",
    error: "Die Daten konnten nicht gelöscht werden. Bitte versuche es erneut.",
    legacy:
      "Für diese ältere Browserkennung ist die direkte Löschung noch nicht verfügbar. Abgeschlossene Besuche werden nach 30 Tagen automatisch gelöscht.",
  },
  en: {
    title: "Manage my data",
    description:
      "You can permanently delete your saved visits and push notification subscriptions.",
    button: "Delete my data",
    confirm:
      "Do you really want to delete all your saved data? This action cannot be undone.",
    deleting: "Deleting data ...",
    success: "Your data has been deleted successfully.",
    error: "Your data could not be deleted. Please try again.",
    legacy:
      "Direct deletion is not yet available for this older browser identifier. Completed visits are automatically deleted after 30 days.",
  },
  fr: {
    title: "Gérer mes données",
    description:
      "Tu peux supprimer définitivement tes visites et tes abonnements aux notifications.",
    button: "Supprimer mes données",
    confirm:
      "Veux-tu vraiment supprimer toutes tes données enregistrées ? Cette action est irréversible.",
    deleting: "Suppression en cours ...",
    success: "Tes données ont été supprimées.",
    error: "Impossible de supprimer les données. Réessaie.",
    legacy:
      "La suppression directe n'est pas encore disponible pour cet ancien identifiant. Les visites terminées sont automatiquement supprimées après 30 jours.",
  },
};

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
          // Les données côté serveur ont déjà été supprimées.
        }
      }

      localStorage.removeItem("lernraum-client-id");
      localStorage.removeItem("lernraum-client-secret");

      setSuccess(true);
      setHasCredentials(false);

      // Actualiser l'historique après la suppression.
      window.location.reload();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-[#D9E7EC] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#102A43]">{t.title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">{t.description}</p>

      {hasCredentials === null && (
        <button
          type="button"
          onClick={checkCredentials}
          className="mt-5 rounded-xl border border-[#D9E7EC] px-4 py-2.5 text-sm font-semibold text-[#102A43] hover:bg-slate-50"
        >
          {t.button}
        </button>
      )}

      {hasCredentials === false && !success && (
        <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          {t.legacy}
        </p>
      )}

      {hasCredentials === true && (
        <button
          type="button"
          onClick={() => void deleteData()}
          disabled={loading}
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {loading ? t.deleting : t.button}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {t.error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-4 text-sm text-emerald-700">
          {t.success}
        </p>
      )}
    </section>
  );
}
