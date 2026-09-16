import AppNavigation from "../../components/AppNavigation";
import CurrentSession from "../../components/CurrentSession";

export default function SessionPage() {
  return (
    <main className="min-h-screen bg-[#F4F8FA] pb-24 text-[#102A43] md:pb-0">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:px-8 lg:py-10">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F8B8D]">
            Sitzung
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Aktuelle Sitzung
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Hier siehst du deinen aktuellen Lernraum und die verbleibende Zeit.
          </p>
        </header>

        <AppNavigation />

        <CurrentSession />

        <footer className="mt-8 text-center text-xs text-slate-400">
          Projekt 1 · Hochschule Kaiserslautern
        </footer>
      </div>
    </main>
  );
}
