export default function AppFooter() {
  return (
    <footer className="mb-20 border-t border-slate-200 bg-[#F8FAFC] md:mb-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-center text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
        <div>
          <p className="font-semibold text-slate-700">Lernraum</p>
          <p className="mt-1">Hochschule Kaiserslautern</p>
        </div>

        <p className="text-xs text-slate-400">
          Freie Lernräume einfach finden und nutzen
        </p>
      </div>
    </footer>
  );
}
