import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import AppFooter from "@/components/AppFooter";
import ClientIdentityInitializer from "@/components/ClientIdentityInitializer";
import "./globals.css";
import { FooterLayout } from "@/components/FooterLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");

  return {
    title: {
      default: "Lernraum",
      template: "%s | Lernraum",
    },
    description: t("description"),
    applicationName: "Lernraum",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Lernraum",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#075985",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#F4F8FA]">
        <Script id="lernraum-pwa-install-capture" strategy="afterInteractive">
          {`
            window.__lernraumInstallPrompt = null;
            window.__lernraumAppInstalled = false;

            window.addEventListener("beforeinstallprompt", function (event) {
              event.preventDefault();
              window.__lernraumInstallPrompt = event;
              window.dispatchEvent(
                new Event("lernraum-install-prompt-ready")
              );
            });

            window.addEventListener("appinstalled", function () {
              window.__lernraumInstallPrompt = null;
              window.__lernraumAppInstalled = true;
              window.dispatchEvent(
                new Event("lernraum-app-installed")
              );
            });
          `}
        </Script>

        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientIdentityInitializer />

          <FooterLayout>{children}</FooterLayout>

          <div
            className="
    border-t border-[#CFDDE5]
    pt-5
    pb-[calc(5.5rem+env(safe-area-inset-bottom))]
    md:border-0
    md:pt-0
    md:pb-0
  "
          >
            <AppFooter />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
