"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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

const INSTALL_DECLINED_KEY = "lernraum-install-declined";
const INSTALL_REMIND_AT_KEY = "lernraum-install-remind-at";

const INVITATION_DELAY = 10_000;
const REMINDER_DELAY = 24 * 60 * 60 * 1000;

function getLernraumWindow() {
  return window as LernraumWindow;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroidDevice() {
  return /android/i.test(navigator.userAgent);
}

function isIosSafari() {
  const ua = navigator.userAgent;

  return (
    /iphone|ipad|ipod/i.test(ua) &&
    /safari/i.test(ua) &&
    !/crios|fxios|edgios|opios/i.test(ua)
  );
}

function isStandalone() {
  const nav = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isCheckInPage(pathname: string) {
  return pathname === "/check-in" || pathname.endsWith("/check-in");
}

export default function InstallAppPrompt({
  showManualButton = true,
}: {
  showManualButton?: boolean;
}) {
  const t = useTranslations("install");
  const pathname = usePathname();

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [installed, setInstalled] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [iosSafari, setIosSafari] = useState(false);

  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);

  const [isReady, setIsReady] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Initialisation PWA
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
      setShowInvitation(false);
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

  // Invitation automatique après 10 secondes
  useEffect(() => {
    if (!isReady || installed) return;
    if (!isIos && !isAndroid) return;
    if (isCheckInPage(pathname)) return;

    let declined = false;
    let remindAt = 0;

    try {
      declined = localStorage.getItem(INSTALL_DECLINED_KEY) === "true";

      remindAt = Number(localStorage.getItem(INSTALL_REMIND_AT_KEY) ?? "0");
    } catch {
      // Le stockage peut être indisponible.
    }

    if (declined || Date.now() < remindAt) return;

    const timer = window.setTimeout(() => {
      if (
        isStandalone() ||
        getLernraumWindow().__lernraumAppInstalled ||
        isCheckInPage(window.location.pathname)
      ) {
        return;
      }

      setShowInvitation(true);
    }, INVITATION_DELAY);

    return () => window.clearTimeout(timer);
  }, [isReady, installed, isIos, isAndroid, pathname]);

  async function handleInstall() {
    if (isIos) {
      setShowInvitation(false);
      setShowIosHelp(true);
      return;
    }

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
          setShowInvitation(false);
        } else {
          setShowInvitation(false);
        }
      } catch (error) {
        console.error("App installation failed:", error);
      } finally {
        setIsInstalling(false);
      }

      return;
    }

    if (isAndroid) {
      setShowInvitation(false);
      setShowAndroidHelp(true);
    }
  }

  function declineInstallation() {
    try {
      localStorage.setItem(INSTALL_DECLINED_KEY, "true");
      localStorage.removeItem(INSTALL_REMIND_AT_KEY);
    } catch {
      // Le bouton manuel reste disponible.
    }

    setShowInvitation(false);
  }

  function remindInstallationLater() {
    try {
      localStorage.setItem(
        INSTALL_REMIND_AT_KEY,
        String(Date.now() + REMINDER_DELAY),
      );
    } catch {
      // Le bouton manuel reste disponible.
    }

    setShowInvitation(false);
  }

  if (installed || !isReady) return null;

  if (!isIos && !isAndroid && !installPrompt) {
    return null;
  }

  return (
    <>
      {/* BOUTON D'INSTALLATION EXISTANT */}
      {showManualButton && !showIosHelp && !showAndroidHelp && (
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

      {/* INVITATION AUTOMATIQUE */}
      {showInvitation && !showIosHelp && !showAndroidHelp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-invitation-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2
              id="install-invitation-title"
              className="text-xl font-bold text-[#102A43]"
            >
              Lernraum installieren
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Installiere Lernraum auf deinem Smartphone für einen schnellen
              Zugriff direkt vom Startbildschirm.
              {isIos &&
                " Auf dem iPhone kannst du so auch Erinnerungen vor dem Sitzungsende erhalten."}
            </p>

            <button
              type="button"
              onClick={handleInstall}
              disabled={isInstalling}
              className="mt-6 w-full rounded-xl bg-[#075985] px-4 py-3 font-semibold text-white transition hover:bg-[#0369A1] disabled:opacity-60"
            >
              {isInstalling ? t("installing") : t("install")}
            </button>

            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={declineInstallation}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Nein, danke
              </button>

              <button
                type="button"
                onClick={remindInstallationLater}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-[#075985] hover:bg-slate-100"
              >
                Später
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS IPHONE */}
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

            <div className="text-sm text-slate-600">
              {!iosSafari && (
                <p className="mb-4 rounded-xl bg-amber-50 p-3 leading-6 text-amber-900">
                  Öffne diese Seite zuerst in Safari.
                </p>
              )}

              <ol className="list-decimal space-y-3 pl-5 leading-6">
                {t("iosText")
                  .split("|")
                  .map((step, index) => (
                    <li key={index} className="pl-1">
                      {step}
                    </li>
                  ))}
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className="mt-6 w-full rounded-xl bg-[#075985] px-4 py-3 font-semibold text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ANDROID : COMPORTEMENT EXISTANT */}
      {showAndroidHelp && (
        <div className="mb-4 rounded-2xl border border-[#D9E7EC] bg-white p-4 text-sm text-[#102A43]">
          <p className="font-bold">{t("androidTitle")}</p>

          <p className="mt-2 leading-6 text-slate-600">{t("androidText")}</p>
        </div>
      )}
    </>
  );
}
