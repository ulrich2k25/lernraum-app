import { getTranslations } from "next-intl/server";

export default async function HomeHero() {
  const t = await getTranslations("homeHero");

  return (
    <section className="relative mb-7 overflow-hidden rounded-[26px] bg-[#0B3553] text-white shadow-[0_16px_45px_rgba(16,42,67,0.12)] sm:rounded-[30px]">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B3553] via-[#075985] to-[#087D86]" />

      <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[55px] border-white/[0.045]" />
      <div className="absolute -bottom-32 right-24 h-64 w-64 rounded-full border-[40px] border-[#5EEAD4]/[0.07]" />

      <div className="relative flex items-center justify-between gap-6 px-6 py-6 sm:px-8 sm:py-7 lg:px-10">
        <div className="relative z-10 max-w-[650px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-[#D7F7F2] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4C95D]" />
            {t("badge")}
          </div>

          <h2 className="text-[25px] font-extrabold leading-[1.15] tracking-[-0.04em] sm:text-[30px] lg:text-[34px]">
            {t("title")}
            <br className="hidden sm:block" /> {t("titleSecond")}
          </h2>

          <p className="mt-3 max-w-[550px] text-sm leading-6 text-[#D2E6EE] sm:text-[15px]">
            {t("description")}
          </p>
        </div>

        <div className="relative hidden h-36 w-36 shrink-0 items-center justify-center rounded-[35px] border border-white/15 bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.10)] backdrop-blur lg:flex">
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
