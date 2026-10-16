import qz from "qz-tray";
import axios from "axios";
import { backendUrl } from "../backendUrl";
import { useAuthStore } from "../../stores/authStore";

let signingFailure: Error | null = null;
let securitySetup: Promise<void> | null = null;
async function configureSecurity(): Promise<void> {
  if (!securitySetup)
    securitySetup = (async () => {
      const response = await axios.get(
        backendUrl("/WebTpv/printing/qz/certificate"),
        {
          ...useAuthStore().portalRequestConfig(),
          responseType: "text",
          timeout: 10000,
        },
      );
      // An explicitly unconfigured installation keeps the interactive QZ workflow.
      if (response.status === 204) return;
      if (!String(response.data).includes("-----BEGIN CERTIFICATE-----"))
        throw new Error("Certificado QZ inválido.");
      const certificate = String(response.data);
      qz.security.setCertificatePromise((resolve) => resolve(certificate));
      qz.security.setSignatureAlgorithm("SHA512");
      // QZ signs the hexadecimal SHA-256 digest, not the original JSON.
      // Keep the original so the server can authorize it and compute the digest itself.
      const messages = new Map<string, string>();
      qz.api.setSha256Type(async (message) => {
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(message),
        );
        const hash = Array.from(new Uint8Array(digest), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
        messages.set(hash, message);
        return hash;
      });
      qz.security.setSignaturePromise((hash) => (resolve, reject) => {
        const message = messages.get(hash);
        messages.delete(hash);
        if (!message) {
          signingFailure = new Error(
            "No se encontró la solicitud original de QZ.",
          );
          reject(signingFailure);
          return;
        }
        axios
          .post(backendUrl("/WebTpv/printing/qz/sign"), message, {
            ...useAuthStore().portalRequestConfig(),
            headers: {
              ...useAuthStore().portalRequestConfig().headers,
              "Content-Type": "text/plain",
            },
            responseType: "text",
            timeout: 10000,
          })
          .then((r) => resolve(String(r.data)))
          .catch((e) => {
            let body = e?.response?.data;
            if (typeof body === "string") {
              try {
                body = JSON.parse(body);
              } catch {
                body = null;
              }
            }
            signingFailure = new Error(
              body?.message ||
                body?.detail ||
                "El servidor no pudo firmar la solicitud QZ. Revisa la sesión y la configuración del certificado.",
            );
            reject(signingFailure);
          });
      });
    })().catch((e) => {
      securitySetup = null;
      throw e;
    });
  await securitySetup;
}

let connecting: Promise<void> | null = null;
let sending = false;
export async function connectQz(): Promise<void> {
  await configureSecurity();
  if (qz.websocket.isActive()) return;
  if (!connecting)
    connecting = qz.websocket
      .connect({ retries: 0 })
      .then(() => undefined)
      .catch(() => {
        throw new Error(
          "No se pudo conectar con QZ Tray. Instálalo, mantenlo abierto y autoriza este sitio en su ventana.",
        );
      })
      .finally(() => {
        connecting = null;
      });
  await connecting;
}
export async function discoverQzPrinters(): Promise<string[]> {
  await connectQz();
  signingFailure = null;
  try {
    const result = await qz.printers.find();
    return Array.isArray(result) ? result : [result];
  } catch (e) {
    throw signingFailure || e;
  }
}
export async function sendQzRaw(
  printerName: string,
  data: string,
  encoding: "CP858" | "UTF-8",
): Promise<void> {
  await sendQz(
    printerName,
    [{ type: "raw", format: "command", flavor: "plain", data }],
    { encoding },
  );
}

/**
 * Impresión por controlador (pixel/HTML): QZ rasteriza el documento con el
 * driver del sistema. Vale para cualquier impresora de oficina, incluidas
 * las host-based sin PCL/PostScript que ignoran el texto RAW.
 */
export async function sendQzHtml(
  printerName: string,
  html: string,
): Promise<void> {
  await sendQz(printerName, [
    { type: "pixel", format: "html", flavor: "plain", data: html },
  ]);
}

async function sendQz(
  printerName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Array<any>,
  options: Record<string, unknown> = {},
): Promise<void> {
  if (sending)
    throw new Error(
      "Hay un envío en curso. Espera su resultado antes de imprimir otro trabajo.",
    );
  sending = true;
  let submitted = false;
  signingFailure = null;
  try {
    await connectQz();
    // Exact queue name: never fall back to the operating system's default printer.
    const available = await qz.printers.find();
    if (
      !(Array.isArray(available) ? available : [available]).includes(
        printerName,
      )
    )
      throw new Error(
        "La impresora configurada no está disponible. Revisa su nombre en QZ Tray.",
      );
    const config = qz.configs.create(printerName, {
      ...options,
      jobName: "KiwiKERP",
    });
    submitted = true;
    await qz.print(config, payload);
  } catch (error) {
    if (signingFailure) throw signingFailure;
    if (submitted)
      throw new Error(
        "No se ha confirmado el envío. Comprueba la cola y la impresora antes de repetir para evitar copias duplicadas.",
      );
    throw error;
  } finally {
    sending = false;
  }
}
