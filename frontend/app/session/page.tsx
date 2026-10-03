import { getTranslations } from "next-intl/server";
import AppNavigation from "../../components/AppNavigation";
import CurrentSession from "../../components/CurrentSession";

export default async function SessionPage() {
  const t = await getTranslations("sessionPage");
  return (
    <main className="min-h-screen bg-[#F4F8FA] pb-24 text-[#102A43] md:pb-0">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 md:px-8 lg:py-10">
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0F8B8D]">{t("eyebrow")}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">{t("description")}</p>
        </header>
        <AppNavigation />
        <CurrentSession />
      </div>
    </main>
  );
}
