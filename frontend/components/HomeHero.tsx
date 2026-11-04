import { getTranslations } from "next-intl/server";

export default async function HomeHero() {
  const t = await getTranslations("homeHero");

  return (
    <section className="relative mb-6 overflow-hidden rounded-lg border border-[#D7E5EA] border-l-4 border-l-[#0B6E85] bg-[#EDF4F6] text-[#153C52]">
      <div className="hidden" />

      <div className="hidden" />
      <div className="hidden" />

      <div className="relative flex items-center gap-4 px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
        <div className="relative z-10 w-full max-w-[900px]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-[#CBDEE5] bg-white/70 px-2.5 py-1 text-xs font-medium text-[#24566B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0E8193]" />
            {t("badge")}
          </div>

          <h2 className="text-[25px] font-semibold leading-[1.25] tracking-tight sm:text-[28px] lg:text-[30px]">
            {t("title")}
            <br className="hidden" /> {t("titleSecond")}
          </h2>

          <p className="mt-2 max-w-[720px] text-sm leading-6 text-[#547081] sm:text-[15px]">
            {t("description")}
          </p>
        </div>

        <div className="hidden">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            className="h-24 w-24 text-white"
            aria-hidden="true"
          >
            <rect
              x="20"
              y="15"
              width="60"
              height="43"
              rx="8"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              d="M31 35H69M31 46H59"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M35 82V60M65 82V60M22 82H78"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="70" cy="25" r="5" fill="#5EEAD4" />
          </svg>
        </div>
      </div>
    </section>
  );
}
