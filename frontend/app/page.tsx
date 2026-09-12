type Room = {
  id: number;
  raumBezeichnung: string;
  gebaeude: string;
  etage: string;
  kapazitaet: number;
  status: string;
  raumToken: string;
};

export default async function Home() {
  const response = await fetch("http://localhost:3002/rooms", {
    cache: "no-store",
  });

  const rooms: Room[] = await response.json();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 lg:py-12">
        {/* Header */}
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-slate-500">
            Hochschule Kaiserslautern
          </p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Lernräume
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Finde schnell einen passenden Lernraum.
              </p>
            </div>

            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {rooms.length} {rooms.length === 1 ? "Raum" : "Räume"}
            </div>
          </div>
        </header>

        {/* Info */}
        <section className="mb-6 rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
          <p className="text-sm font-medium text-slate-300">
            Lernplatz gesucht?
          </p>

          <h2 className="mt-2 max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">
            Verfügbare Lernräume auf einen Blick.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Wähle einen Raum aus, um später weitere Informationen und die
            Check-in-Funktion zu öffnen.
          </p>
        </section>

        {/* Rooms */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Räume</h2>

            <span className="text-sm text-slate-400">
              Live-Daten aus PostgreSQL
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Aktiv
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight">
                      {room.raumBezeichnung}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {room.gebaeude} · {room.etage}. Etage
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                    →
                  </div>
                </div>

                <div className="mt-7 flex items-end justify-between border-t border-slate-100 pt-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Kapazität
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {room.kapazitaet}
                      <span className="ml-1 text-sm font-medium text-slate-400">
                        Plätze
                      </span>
                    </p>
                  </div>

                  <p className="text-sm font-medium text-slate-500">
                    Details ansehen
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
