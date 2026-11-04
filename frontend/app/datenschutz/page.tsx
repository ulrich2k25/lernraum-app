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
    <main
      data-lernraum-privacy
      className="w-full flex-none bg-[#F6F8FA] pb-8 text-[#183247] md:flex-1"
    >
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 sm:px-6 md:px-8 lg:pt-9">

        <Link
          href="/"
          className="mb-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#C7D9E1] bg-white px-4 py-2.5 text-sm font-semibold text-[#17536B] transition-colors hover:border-[#8FB2C1] hover:bg-[#EEF5F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791]"
        >
          {t.back}
        </Link>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[#153C52] sm:text-4xl">
            {t.title}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#647D8D] sm:text-base">
            {t.intro}
          </p>
        </header>

        <div className="space-y-3 sm:space-y-4">
          {t.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-[#DCE5EA] bg-white px-5 py-5 sm:px-7 sm:py-6"
            >
              <h2 className="text-base font-semibold text-[#153C52] sm:text-lg">
                {section.title}
              </h2>

              <p className="mt-2 text-sm leading-7 text-[#647D8D]">
                {section.text}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-6">
          <Link
            href="/besuche"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#17536B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#103E52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B7791]"
          >
            {t.visits}
          </Link>
        </div>

      </div>
    </main>
  );
}
