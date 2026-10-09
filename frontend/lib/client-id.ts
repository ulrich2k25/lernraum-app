const CLIENT_ID_KEY = "lernraum-client-id";
const CLIENT_SECRET_KEY = "lernraum-client-secret";

function createRandomId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  throw new Error("Secure random generation is unavailable.");
}

export function getClientId(): string {
  let clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!clientId) {
    clientId = createRandomId();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId;
}

export async function registerClientIdentity(): Promise<boolean> {
  const existingClientId = localStorage.getItem(CLIENT_ID_KEY);
  const clientId = getClientId();

  let secret = localStorage.getItem(CLIENT_SECRET_KEY);

  if (!secret) {
    if (existingClientId) {
      return false;
    }

    secret = createRandomId();
    localStorage.setItem(CLIENT_SECRET_KEY, secret);
  }

  const response = await fetch("/api/sessions/identity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ clientId, secret }),
  });

  return response.ok;
}

export function getClientCredentials() {
  return {
    clientId: localStorage.getItem(CLIENT_ID_KEY),
    secret: localStorage.getItem(CLIENT_SECRET_KEY),
  };
}

export async function initializeClientIdentity(): Promise<void> {
  const existingId = localStorage.getItem(CLIENT_ID_KEY);
  const existingSecret = localStorage.getItem(CLIENT_SECRET_KEY);

  if (existingId && !existingSecret) {
    return;
  }

  await registerClientIdentity();
}
