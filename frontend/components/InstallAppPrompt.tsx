"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type LernraumWindow = Window & typeof globalThis & {
  __lernraumInstallPrompt?: BeforeInstallPromptEvent | null;
  __lernraumAppInstalled?: boolean;
};

function getLernraumWindow() { return window as LernraumWindow; }
function isIosDevice() { return /iphone|ipad|ipod/i.test(window.navigator.userAgent); }
function isAndroidDevice() { return /android/i.test(window.navigator.userAgent); }
function isStandalone() {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export default function InstallAppPrompt() {
  const t = useTranslations("install");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function syncInstallPrompt() {
      if (cancelled) return;
      const deferredPrompt = getLernraumWindow().__lernraumInstallPrompt;
      if (deferredPrompt) setInstallPrompt(deferredPrompt);
      setIsReady(true);
    }

    function handleAppInstalled() {
      if (cancelled) return;
      setInstalled(true);
      setInstallPrompt(null);
      setShowIosHelp(false);
      setShowAndroidHelp(false);
    }

    async function preparePwa() {
      try {
        if ("serviceWorker" in navigator) {
          await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
        }
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }

      syncInstallPrompt();
    }

    window.addEventListener("lernraum-install-prompt-ready", syncInstallPrompt);
    window.addEventListener("lernraum-app-installed", handleAppInstalled);

    const initializationTimer = window.setTimeout(() => {
      if (cancelled) return;

      const lernraumWindow = getLernraumWindow();

      if (isStandalone() || lernraumWindow.__lernraumAppInstalled) {
        setInstalled(true);
        setIsReady(true);
        return;
      }

      setInstalled(false);
      setIsIos(isIosDevice());
      setIsAndroid(isAndroidDevice());
      void preparePwa();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(initializationTimer);
      window.removeEventListener("lernraum-install-prompt-ready", syncInstallPrompt);
      window.removeEventListener("lernraum-app-installed", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (isIos) { setShowIosHelp(true); return; }
    const deferredPrompt = installPrompt ?? getLernraumWindow().__lernraumInstallPrompt ?? null;
    if (deferredPrompt) {
      try {
        setIsInstalling(true);
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        getLernraumWindow().__lernraumInstallPrompt = null;
        setInstallPrompt(null);
        if (choice.outcome === "accepted") setInstalled(true);
      } finally { setIsInstalling(false); }
      return;
    }
    if (isAndroid) setShowAndroidHelp(true);
  }

  if (installed || !isReady) return null;
  if (!isIos && !isAndroid && !installPrompt) return null;

  return (
    <>
      {!showIosHelp && !showAndroidHelp && (
        <div className="mb-4 flex justify-end">
          <button type="button" onClick={handleInstall} disabled={isInstalling} className="inline-flex items-center gap-2 rounded-full border border-[#B7CBD4] bg-white px-5 py-2.5 text-sm font-bold text-[#075985] shadow-sm transition hover:bg-[#EDF7FA] disabled:cursor-not-allowed disabled:opacity-60">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
            {isInstalling ? t("installing") : t("install")}
          </button>
        </div>
      )}
      {showIosHelp && <div className="mb-4 rounded-2xl border border-[#D9E7EC] bg-white p-4 text-sm text-[#102A43]"><p className="font-bold">{t("iosTitle")}</p><p className="mt-2 leading-6 text-slate-600">{t("iosText")}</p></div>}
      {showAndroidHelp && <div className="mb-4 rounded-2xl border border-[#D9E7EC] bg-white p-4 text-sm text-[#102A43]"><p className="font-bold">{t("androidTitle")}</p><p className="mt-2 leading-6 text-slate-600">{t("androidText")}</p></div>}
    </>
  );
}
