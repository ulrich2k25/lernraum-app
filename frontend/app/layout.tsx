import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import AppFooter from "@/components/AppFooter";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lernraum",
    template: "%s | Lernraum",
  },
  description:
    "Freie Lernräume finden, einchecken und den eigenen Aufenthalt verwalten.",
  applicationName: "Lernraum",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lernraum",
  },
};

export const viewport: Viewport = {
  themeColor: "#075985",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="lernraum-pwa-install-capture" strategy="beforeInteractive">
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

        <div className="flex flex-1 flex-col pb-20 md:pb-0">
          {children}
        </div>

        <AppFooter />
      </body>
    </html>
  );
}
