import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";

export interface PushDevice {
  id: number;
  name: string;
  enabled: boolean;
  lastSeen: string;
}
export interface PushSettings {
  available: boolean;
  doNotDisturb: boolean;
  dndFrom: string;
  dndTo: string;
  devices: PushDevice[];
}
export interface PushPairing {
  code: string;
  expiresAt: string;
  pairingUrl: string;
  qrDataUrl: string;
}

const internalConfig = () => useAuthStore().portalRequestConfig();
const paths = (token?: string) =>
  token
    ? {
        settings: "/WebPortalPushSettings",
        subscription: "/WebPortalPushSubscription",
        test: "/WebPortalPushTest",
      }
    : {
        settings: "/WebPushSettings",
        subscription: "/WebPushSubscription",
        test: "/WebPushTest",
      };
const config = (token?: string) =>
  token ? { params: { token } } : internalConfig();

export async function loadPushSettings(token?: string): Promise<PushSettings> {
  const { data } = await axios.get(
    backendUrl(paths(token).settings),
    config(token),
  );
  return data;
}
export async function savePushSettings(
  value: Pick<PushSettings, "doNotDisturb" | "dndFrom" | "dndTo">,
  token?: string,
): Promise<PushSettings> {
  const url = backendUrl(paths(token).settings);
  const { data } = token
    ? await axios.put(url, value, { params: { token } })
    : await axios.put(url, value, internalConfig());
  return data;
}
export async function testPush(token?: string) {
  const url = backendUrl(paths(token).test);
  return token
    ? axios.post(url, {}, { params: { token } })
    : axios.post(url, {}, internalConfig());
}
export async function removePushDevice(id: number, token?: string) {
  const url = backendUrl(`${paths(token).subscription}/${id}`);
  return token
    ? axios.delete(url, { params: { token } })
    : axios.delete(url, internalConfig());
}
export async function createPushPairing(
  origin: string,
  token?: string,
): Promise<PushPairing> {
  const url = backendUrl(token ? "/WebPortalPushPairing" : "/WebPushPairing");
  const body = { origin };
  const { data } = token
    ? await axios.post(url, body, { params: { token } })
    : await axios.post(url, body, internalConfig());
  return data;
}
export async function loadPushPairing(code: string) {
  const { data } = await axios.get(
    backendUrl(`/WebPushPairing/${encodeURIComponent(code)}`),
  );
  return data;
}

function applicationKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
function deviceName() {
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  const browser = /Edg/i.test(navigator.userAgent)
    ? "Edge"
    : /Firefox/i.test(navigator.userAgent)
      ? "Firefox"
      : /Chrome/i.test(navigator.userAgent)
        ? "Chrome"
        : /Safari/i.test(navigator.userAgent)
          ? "Safari"
          : "Navegador";
  return `${mobile ? "Móvil" : "Ordenador"} · ${browser}`;
}
export async function activatePush(token?: string) {
  return subscribePush((body) => {
    const url = backendUrl(paths(token).subscription);
    return token
      ? axios.post(url, body, { params: { token } })
      : axios.post(url, body, internalConfig());
  });
}
export async function activatePairedPush(code: string) {
  return subscribePush((body) =>
    axios.post(
      backendUrl(
        `/WebPushPairing/${encodeURIComponent(code)}/subscription`,
      ),
      body,
    ),
  );
}
async function subscribePush(
  persist: (body: Record<string, unknown>) => Promise<unknown>,
) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    throw new Error("Este navegador no admite notificaciones push.");
  const { data: cfg } = await axios.get(backendUrl("/WebPushConfig"));
  if (!cfg.available || !cfg.publicKey)
    throw new Error(
      "Las claves Web Push todavía no están configuradas en el servidor.",
    );
  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    throw new Error("No se ha concedido permiso para mostrar notificaciones.");
  const registration = await navigator.serviceWorker.register(
    "/push-service-worker.js",
  );
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription)
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationKey(cfg.publicKey),
    });
  const json = subscription.toJSON();
  const body = {
    endpoint: json.endpoint,
    keys: json.keys,
    name: deviceName(),
    userAgent: navigator.userAgent,
  };
  await persist(body);
}
