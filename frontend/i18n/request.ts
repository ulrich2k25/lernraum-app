import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

const supportedLocales = ["de", "en", "fr"] as const;
type SupportedLocale = (typeof supportedLocales)[number];

function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}

function detectBrowserLocale(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return "de";

  const languages = acceptLanguage
    .split(",")
    .map((value) => value.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const language of languages) {
    const locale = language.split("-")[0];
    if (isSupportedLocale(locale)) return locale;
  }

  return "de";
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const savedLocale = cookieStore.get("lernraum-locale")?.value;
  const locale = savedLocale && isSupportedLocale(savedLocale)
    ? savedLocale
    : detectBrowserLocale(headerStore.get("accept-language"));

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
