const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function enablePushNotifications(clientId: string) {
  if (!clientId.trim()) {
    throw new Error("Die Client-ID konnte nicht gefunden werden.");
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Service Worker werden von diesem Browser nicht unterstützt.",
    );
  }

  if (!("PushManager" in window)) {
    throw new Error(
      "Push-Benachrichtigungen werden von diesem Browser nicht unterstützt.",
    );
  }

  if (!("Notification" in window)) {
    throw new Error(
      "Benachrichtigungen werden von diesem Browser nicht unterstützt.",
    );
  }

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission === "denied") {
    throw new Error("Benachrichtigungen wurden im Browser blockiert.");
  }

  if (permission !== "granted") {
    throw new Error("Benachrichtigungen wurden nicht erlaubt.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");

  await navigator.serviceWorker.ready;

  const keyResponse = await fetch(`${API_URL}/push-notifications/public-key`);

  if (!keyResponse.ok) {
    throw new Error("Der Push-Schlüssel konnte nicht geladen werden.");
  }

  const keyData: {
    publicKey?: string;
  } = await keyResponse.json();

  if (!keyData.publicKey) {
    throw new Error("Der öffentliche Push-Schlüssel fehlt.");
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
    });
  }

  const subscriptionJson = subscription.toJSON();

  if (
    !subscriptionJson.endpoint ||
    !subscriptionJson.keys?.p256dh ||
    !subscriptionJson.keys?.auth
  ) {
    throw new Error("Die Push-Subscription ist unvollständig.");
  }

  const response = await fetch(`${API_URL}/push-notifications/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId,
      subscription: {
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth,
        },
      },
    }),
  });

  const text = await response.text();

  let data: {
    message?: string;
    subscriptionId?: number;
  } | null = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ??
        "Push-Benachrichtigungen konnten nicht aktiviert werden.",
    );
  }

  return data;
}

export function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}
