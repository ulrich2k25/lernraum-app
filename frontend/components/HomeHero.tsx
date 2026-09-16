export default function HomeHero() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#063B5C] via-[#075985] to-[#0F8B8D] p-6 text-white shadow-[0_18px_50px_rgba(7,89,133,0.18)] sm:p-8 lg:p-10">
      <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-[30px] border-white/5" />
      <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full border-[24px] border-[#F4C95D]/10" />

      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#D8F5F2] backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[#F4C95D]" />
          Lernplatz gesucht?
        </div>

        <h2 className="max-w-2xl text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
          Verfügbare Lernräume
          <br className="hidden sm:block" /> auf einen Blick.
        </h2>

        <p className="mt-4 max-w-xl text-sm leading-6 text-blue-50/80 sm:text-base">
          Wähle einen Raum aus und sieh sofort, wie viele Plätze zur Verfügung
          stehen.
        </p>
      </div>
    </section>
  );
}
