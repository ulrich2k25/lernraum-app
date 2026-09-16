export default function AppNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:static md:mb-7 md:rounded-2xl md:border md:px-2 md:py-2 md:shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-around gap-1 md:justify-start md:gap-2">
        {/* Lernräume */}
        <button
          type="button"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-[#075985] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition sm:text-sm md:flex-none md:flex-row md:px-5"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a3 3 0 0 1 3 3v14a3 3 0 0 0-3-3H6.5A2.5 2.5 0 0 0 4 19.5v-14Z" />
            <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H14v17a3 3 0 0 1 3-3h.5a2.5 2.5 0 0 1 2.5 2.5v-14Z" />
          </svg>

          <span>Lernräume</span>
        </button>

        {/* Aktuelle Sitzung */}
        <button
          type="button"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-[#EDF7FA] hover:text-[#075985] sm:text-sm md:flex-none md:flex-row md:px-5"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7v5l3 2" />
          </svg>

          <span>Aktuelle Sitzung</span>
        </button>

        {/* Besuche */}
        <button
          type="button"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-[#EDF7FA] hover:text-[#075985] sm:text-sm md:flex-none md:flex-row md:px-5"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M4 12a8 8 0 1 0 2.3-5.7" />
            <path d="M4 4v5h5" />
            <path d="M12 8v4l2.5 1.5" />
          </svg>

          <span>Besuche</span>
        </button>
      </div>
    </nav>
  );
}
