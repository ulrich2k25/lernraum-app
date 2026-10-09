import Link from "next/link";
import { getLocale } from "next-intl/server";

const content = {
  de: {
    title: "Datenschutz",
    intro:
      "Hier erfährst du, welche Daten Lernraum verarbeitet und wie lange sie gespeichert werden.",
    sections: [
      {
        title: "Welche Daten werden gespeichert?",
        text: "Lernraum verwendet eine zufällig erzeugte Browserkennung. Bei einem Check-in werden der Lernraum, der Zeitpunkt, die Sitzungsdauer und gegebenenfalls die Gruppengröße gespeichert. Für aktivierte Push-Benachrichtigungen werden technische Abonnementdaten verarbeitet.",
      },
      {
        title: "Wofür werden die Daten verwendet?",
        text: "Die Daten dienen ausschließlich der Anzeige der Lernraumauslastung, der Verwaltung aktiver Sitzungen, der Besuchshistorie und optionaler Erinnerungen.",
      },
      {
        title: "Wie lange werden Daten gespeichert?",
        text: "Beendete Sitzungen werden nach 30 Tagen automatisch gelöscht. Der technische Bereinigungsvorgang erfolgt täglich.",
      },
      {
        title: "Kann ich meine Daten löschen?",
        text: "Soweit für deine Browserkennung verfügbar, kannst du deine gespeicherten Daten über „Besuche“ selbst löschen.",
      },
      {
        title: "Ist eine Anmeldung erforderlich?",
        text: "Nein. Studierende benötigen weder ein Benutzerkonto noch eine Anmeldung.",
      },
    ],
    visits: "Zu meinen Besuchen",
    back: "Zur Startseite",
  },
  en: {
    title: "Privacy",
    intro: "Learn which data Lernraum processes and how long it is stored.",
    sections: [
      {
        title: "What data is stored?",
        text: "Lernraum uses a randomly generated browser identifier. Check-ins store the room, timestamps, session duration and, where applicable, group size. Technical subscription data is processed when push notifications are enabled.",
      },
      {
        title: "Why is this data used?",
        text: "The data is used to display room occupancy, manage active sessions, show visit history and provide optional reminders.",
      },
      {
        title: "How long is data stored?",
        text: "Completed sessions are automatically deleted after 30 days. Cleanup runs daily.",
      },
      {
        title: "Can I delete my data?",
        text: "Where supported for your browser identifier, you can delete your stored data from the Visits page.",
      },
      {
        title: "Is an account required?",
        text: "No. Students do not need an account or login.",
      },
    ],
    visits: "My visits",
    back: "Back to home",
  },
  fr: {
    title: "Protection des données",
    intro:
      "Découvrez quelles données Lernraum traite et combien de temps elles sont conservées.",
    sections: [
      {
        title: "Quelles données sont enregistrées ?",
        text: "Lernraum utilise un identifiant de navigateur généré aléatoirement. Les check-ins enregistrent la salle, les horaires, la durée de session et, le cas échéant, la taille du groupe. Les notifications Push nécessitent des données techniques d'abonnement.",
      },
      {
        title: "Pourquoi ces données sont-elles utilisées ?",
        text: "Elles servent à afficher l'occupation des salles, gérer les sessions actives, présenter l'historique et envoyer des rappels facultatifs.",
      },
      {
        title: "Combien de temps sont-elles conservées ?",
        text: "Les sessions terminées sont automatiquement supprimées après 30 jours. Le nettoyage est effectué quotidiennement.",
      },
      {
        title: "Puis-je supprimer mes données ?",
        text: "Lorsque cette fonction est disponible pour votre identifiant de navigateur, vous pouvez supprimer vos données depuis la page Visites.",
      },
      {
        title: "Faut-il créer un compte ?",
        text: "Non. Aucun compte ni aucune connexion n'est nécessaire pour les étudiants.",
      },
    ],
    visits: "Mes visites",
    back: "Retour à l'accueil",
  },
};

export default async function DatenschutzPage() {
  const locale = await getLocale();
  const t = content[locale as keyof typeof content] ?? content.de;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 pb-24 sm:px-6">
      <Link
        href="/"
        className="text-sm font-semibold text-[#087F83] hover:underline"
      >
        ← {t.back}
      </Link>

      <header className="mt-8">
        <h1 className="text-3xl font-bold text-[#102A43]">{t.title}</h1>
        <p className="mt-3 leading-7 text-slate-600">{t.intro}</p>
      </header>

      <div className="mt-8 space-y-4">
        {t.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-[#D9E7EC] bg-white p-6"
          >
            <h2 className="text-lg font-bold text-[#102A43]">
              {section.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {section.text}
            </p>
          </section>
        ))}
      </div>

      <Link
        href="/besuche"
        className="mt-8 inline-flex rounded-xl bg-[#075985] px-5 py-3 text-sm font-semibold text-white hover:bg-[#064B70]"
      >
        {t.visits}
      </Link>
    </main>
  );
}
