type AppHeaderProps = {
  roomCount: number;
};

export default function AppHeader({ roomCount }: AppHeaderProps) {
  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
            Lernräume
          </h1>

          <p className="mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            Finde schnell einen freien Platz zum Lernen.
          </p>
        </div>

        <div className="mt-1 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Lernraum-App teilen"
            title="Teilen"
            className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#BFD8E3] bg-white text-[#075985] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#075985] hover:bg-[#075985] hover:text-white hover:shadow-md"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />

              <path d="m8.2 10.8 7.6-4.4" />
              <path d="m8.2 13.2 7.6 4.4" />
            </svg>
          </button>

          <div className="whitespace-nowrap rounded-full border border-[#BFE8E4] bg-[#E9FAF7] px-4 py-2 text-sm font-bold text-[#087F73]">
            {roomCount} {roomCount === 1 ? "Raum" : "Räume"}
          </div>
        </div>
      </div>
    </header>
  );
}
