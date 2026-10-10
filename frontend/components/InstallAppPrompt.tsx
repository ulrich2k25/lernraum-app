"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type LernraumWindow = Window &
  typeof globalThis & {
    __lernraumInstallPrompt?: BeforeInstallPromptEvent | null;
    __lernraumAppInstalled?: boolean;
  };

function getLernraumWindow() {
  return window as LernraumWindow;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isAndroidDevice() {
  return /android/i.test(window.navigator.userAgent);
}

function isIosSafari() {
  const ua = window.navigator.userAgent;

  return (
    /iphone|ipad|ipod/i.test(ua) &&
    /safari/i.test(ua) &&
    !/crios|fxios|edgios|opios/i.test(ua)
  );
}

function isStandalone() {
  const nav = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export default function InstallAppPrompt() {
  const t = useTranslations("install");

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [iosSafari, setIosSafari] = useState(false);

  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);

  const [isReady, setIsReady] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function syncInstallPrompt() {
      if (cancelled) return;

      const deferredPrompt = getLernraumWindow().__lernraumInstallPrompt;

      if (deferredPrompt) {
        setInstallPrompt(deferredPrompt);
      }

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
      setIosSafari(isIosSafari());

      void preparePwa();
    }, 0);

    return () => {
      cancelled = true;

      window.clearTimeout(initializationTimer);

      window.removeEventListener(
        "lernraum-install-prompt-ready",
        syncInstallPrompt,
      );

      window.removeEventListener("lernraum-app-installed", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    // iPhone / iPad : instructions manuelles
    if (isIos) {
      setShowIosHelp(true);
      return;
    }

    // Android : comportement existant conservé
    const deferredPrompt =
      installPrompt ?? getLernraumWindow().__lernraumInstallPrompt ?? null;

    if (deferredPrompt) {
      try {
        setIsInstalling(true);

        await deferredPrompt.prompt();

        const choice = await deferredPrompt.userChoice;

        getLernraumWindow().__lernraumInstallPrompt = null;
        setInstallPrompt(null);

        if (choice.outcome === "accepted") {
          setInstalled(true);
        }
      } finally {
        setIsInstalling(false);
      }

      return;
    }

    if (isAndroid) {
      setShowAndroidHelp(true);
    }
  }

  if (installed || !isReady) {
    return null;
  }

  if (!isIos && !isAndroid && !installPrompt) {
    return null;
  }

  return (
    <>
      {/* INSTALL BUTTON */}
      {!showIosHelp && !showAndroidHelp && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            className="inline-flex items-center gap-2 rounded-full border border-[#B7CBD4] bg-white px-5 py-2.5 text-sm font-bold text-[#075985] shadow-sm transition hover:bg-[#EDF7FA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>

            {isInstalling ? t("installing") : t("install")}
          </button>
        </div>
      )}

      {/* iOS INSTALL MODAL */}
      {showIosHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2
                id="ios-install-title"
                className="text-lg font-bold text-[#102A43]"
              >
                {t("iosTitle")}
              </h2>

              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                aria-label="Schließen"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              {iosSafari
                ? t("iosText")
                : "Öffne Lernraum in Safari. Tippe dort auf „Teilen“ und anschließend auf „Zum Home-Bildschirm“."}
            </p>

            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className="mt-6 w-full rounded-xl bg-[#075985] px-4 py-3 font-semibold text-white transition hover:bg-[#0369A1]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ANDROID INSTALL HELP — UNCHANGED */}
      {showAndroidHelp && (
        <div className="mb-4 rounded-2xl border border-[#D9E7EC] bg-white p-4 text-sm text-[#102A43]">
          <p className="font-bold">{t("androidTitle")}</p>

          <p className="mt-2 leading-6 text-slate-600">{t("androidText")}</p>
        </div>
      )}
    </>
  );
}
