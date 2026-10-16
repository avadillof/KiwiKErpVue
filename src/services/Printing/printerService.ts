import { ref } from "vue";
import { printViaBrowserPrint } from "../../libs/labels/zplGenerator";
import { sendQzHtml, sendQzRaw } from "./qzTransport";
import { backendUrl } from "../backendUrl";
import { useCompanyStore } from "../../stores/companyStore";
import {
  buildEscposReceipt,
  buildEscposRefund,
} from "../../libs/printing/escposReceipt";
import {
  buildHtmlReceipt,
  buildHtmlRefund,
} from "../../libs/printing/htmlReceipt";
import type { TpvReceipt, TpvRefund } from "../../views/TPV/tpvReceipt";

export type PrintLanguage = "ZPL" | "ESCPOS" | "PLAIN";
/** Los dos lenguajes de tickets comparten destino por caja. */
export const isTicketLanguage = (language: string): boolean =>
  language === "ESCPOS" || language === "PLAIN";
export interface PrinterProfile {
  id: string;
  name: string;
  language: PrintLanguage;
  transport: "zebra" | "qz";
  queue: string;
  host: string;
  port: number;
  uid: string;
  columns: 32 | 42 | 48;
  codePage: number;
  cut: boolean;
  drawerEnabled?: boolean;
  drawerPin?: 0 | 1;
}
const KEY = "kiwik.printers.v2";
const LEGACY = "kiwik.labelPrinters.v1";
export const printers = ref<PrinterProfile[]>([]);
export const printerSelections = ref<Record<string, string>>({});
export const printerStorageError = ref("");
export const selectionKey = (language: PrintLanguage, registerId = "") =>
  language === "ZPL" ? "labels" : `receipt:${registerId || "default"}`;

/** Preparation destinations never fall back to the sales receipt printer. */
export const kitchenSelectionKey = (
  zoneId: number,
  destination: "KITCHEN" | "BAR",
) => `preparation:${zoneId}:${destination}`;
export function restoreKitchenSelection(
  zoneId: number,
  destination: "KITCHEN" | "BAR",
): void {
  const key = kitchenSelectionKey(zoneId, destination);
  if (Object.prototype.hasOwnProperty.call(printerSelections.value, key))
    return;
  try {
    const id = localStorage.getItem(
      `kiwik.kitchen.printer:${zoneId}:${destination}`,
    );
    if (
      id &&
      printers.value.some((p) => p.id === id && isTicketLanguage(p.language))
    )
      persistPrintSettings(printers.value, {
        ...printerSelections.value,
        [key]: id,
      });
  } catch {
    printerStorageError.value =
      "No se pudo recuperar la impresora de preparación de este navegador.";
  }
}

export function validProfile(p: PrinterProfile): boolean {
  return (
    !!p &&
    typeof p.id === "string" &&
    !!p.id &&
    typeof p.name === "string" &&
    !!p.name.trim() &&
    ["ZPL", "ESCPOS", "PLAIN"].includes(p.language) &&
    ["zebra", "qz"].includes(p.transport) &&
    typeof p.queue === "string" &&
    typeof p.uid === "string" &&
    typeof p.host === "string" &&
    Number.isInteger(p.port) &&
    p.port > 0 &&
    p.port <= 65535 &&
    [32, 42, 48].includes(p.columns) &&
    Number.isInteger(p.codePage) &&
    p.codePage >= 0 &&
    p.codePage <= 127 &&
    typeof p.cut === "boolean" &&
    (p.drawerEnabled == null || typeof p.drawerEnabled === "boolean") &&
    (p.drawerPin == null || p.drawerPin === 0 || p.drawerPin === 1) &&
    (p.transport === "qz"
      ? !!p.queue.trim()
      : p.language === "ZPL" &&
        (!!p.uid || /^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(p.host)))
  );
}
export function refreshPrintSettings(): void {
  try {
    const raw = localStorage.getItem(KEY);
    let saved;
    if (raw != null) saved = JSON.parse(raw);
    else {
      // Import old Zebra destinations without deleting or overwriting their original storage.
      const old = JSON.parse(
        localStorage.getItem(LEGACY) || '{"printers":[],"selected":""}',
      );
      if (!Array.isArray(old.printers)) throw new Error();
      saved = {
        printers: old.printers.map((p: any) => ({
          ...p,
          transport: "zebra",
          language: "ZPL",
          queue: "",
          columns: 48,
          codePage: 19,
          cut: false,
        })),
        selections: { labels: old.selected },
      };
    }
    if (
      !Array.isArray(saved.printers) ||
      !saved.selections ||
      typeof saved.selections !== "object" ||
      Array.isArray(saved.selections) ||
      !saved.printers.every(validProfile)
    )
      throw new Error();
    printers.value = saved.printers;
    printerSelections.value = Object.fromEntries(
      Object.entries(saved.selections).filter(
        (entry): entry is [string, string] =>
          typeof entry[1] === "string" &&
          printers.value.some((p) => p.id === entry[1]),
      ),
    );
    printerStorageError.value = "";
  } catch {
    printers.value = [];
    printerSelections.value = {};
    printerStorageError.value =
      "No se puede leer la configuración de impresoras. No se sobrescribirá; revisa el almacenamiento de este navegador.";
  }
}
export function persistPrintSettings(
  list: PrinterProfile[],
  selections: Record<string, string>,
): void {
  if (printerStorageError.value) throw new Error(printerStorageError.value);
  if (
    !list.every(validProfile) ||
    new Set(list.map((p) => p.id)).size !== list.length
  )
    throw new Error("Configuración de impresoras inválida.");
  localStorage.setItem(KEY, JSON.stringify({ printers: list, selections }));
  printers.value = list;
  printerSelections.value = selections;
}
export async function printRawProfile(
  profile: PrinterProfile,
  data: string,
  language: PrintLanguage,
): Promise<string> {
  if (!validProfile(profile) || profile.language !== language)
    throw new Error("La impresora no admite el formato de este documento.");
  if (profile.transport === "zebra") {
    const result = await printViaBrowserPrint(
      data,
      profile.uid || `${profile.host}:${profile.port}`,
    );
    if (!result.ok) throw new Error(result.message);
    return result.message;
  }
  await sendQzRaw(
    profile.queue,
    data,
    language === "ESCPOS" ? "CP858" : "UTF-8",
  );
  return "Trabajo enviado a la cola de impresión. Comprueba la salida en la impresora.";
}
/** Printing never opens the drawer; cash operations use a separate command. */
export async function printConfiguredReceipt(
  receipt: TpvReceipt,
  registerId: string,
): Promise<string> {
  const id = printerSelections.value[selectionKey("ESCPOS", registerId)];
  const profile = printers.value.find(
    (p) => p.id === id && isTicketLanguage(p.language),
  );
  if (!profile)
    throw new Error("Selecciona una impresora de tickets para esta caja.");
  const company = await companyHeader();
  const full: TpvReceipt = {
    ...receipt,
    companyName: receipt.companyName || company.name,
    companyCif: receipt.companyCif || company.cif,
  };
  if (profile.language === "PLAIN") {
    // Oficina/láser (incluidas host-based sin PCL): imprime por controlador.
    await sendQzHtml(profile.queue, buildHtmlReceipt(full));
    return "Trabajo enviado a la cola de impresión. Comprueba la salida en la impresora.";
  }
  return printRawProfile(profile, buildEscposReceipt(full, profile), "ESCPOS");
}

/** Imprime el resguardo de devolución en la impresora de tickets de la caja. */
export async function printConfiguredRefund(
  refund: TpvRefund,
  registerId: string,
): Promise<string> {
  const id = printerSelections.value[selectionKey("ESCPOS", registerId)];
  const profile = printers.value.find(
    (p) => p.id === id && isTicketLanguage(p.language),
  );
  if (!profile)
    throw new Error("Selecciona una impresora de tickets para esta caja.");
  const company = await companyHeader();
  const full: TpvRefund = {
    ...refund,
    companyName: refund.companyName || company.name,
    companyCif: refund.companyCif || company.cif,
  };
  if (profile.language === "PLAIN") {
    await sendQzHtml(profile.queue, buildHtmlRefund(full));
    return "Trabajo enviado a la cola de impresión. Comprueba la salida en la impresora.";
  }
  return printRawProfile(profile, buildEscposRefund(full, profile), "ESCPOS");
}

/** Nombre y CIF de la empresa (del store; recarga si entró por PIN sin pasar por el login). */
async function companyHeader(): Promise<{ name: string; cif: string }> {
  const store = useCompanyStore();
  if (!store.companyInfo.nameCompany || !store.companyInfo.cifCompany) {
    try {
      const response = await fetch(backendUrl("/WebGetParameters"));
      if (response.ok) store.setCompanyParameters(await response.json());
    } catch {
      /* sin empresa: el recibo sale sin cabecera fiscal */
    }
  }
  return {
    name: store.companyInfo.nameCompany || "",
    cif: store.companyInfo.cifCompany || "",
  };
}

/** Uses the same device registry as labels, with a separate preparation destination. */
export async function printKitchenOrder(
  order: import("../../libs/printing/kitchenOrder").KitchenOrder,
  printerId: string,
) {
  const profile = printers.value.find(
    (p) => p.id === printerId && isTicketLanguage(p.language),
  );
  if (!profile)
    throw new Error("Selecciona una impresora para cocina o barra.");
  const { kitchenHtml, kitchenEscpos } = await import(
    "../../libs/printing/kitchenOrder"
  );
  if (profile.language === "PLAIN")
    await sendQzHtml(profile.queue, kitchenHtml(order));
  else
    await printRawProfile(
      profile,
      kitchenEscpos(order, profile.codePage, profile.cut),
      "ESCPOS",
    );
}

/** Claim before submitting: an ambiguous transport failure must never trigger an automatic retry.
 * Claims persist across reloads; Web Locks also serialize tabs of this terminal.
 */
export async function openCashDrawerOnce(
  document: TpvReceipt | TpvRefund,
  registerId: string,
): Promise<void> {
  const refund = "refundId" in document;
  const cash = refund
    ? (document as TpvRefund).method === "CASH" && Number(document.total) > 0
    : !(document as TpvReceipt).documentKind &&
      (document as TpvReceipt).payments?.some(
        (p) => p.method === "CASH" && Number(p.amount) > 0,
      );
  if (!cash) return;
  const id = refund
    ? (document as TpvRefund).refundId
    : (document as TpvReceipt).chargeId;
  if (!id || !registerId)
    throw new Error(
      "No se puede identificar la operación para abrir el cajón.",
    );
  refreshPrintSettings();
  const profile = printers.value.find(
    (p) => p.id === printerSelections.value[selectionKey("ESCPOS", registerId)],
  );
  if (!profile)
    throw new Error(
      "Selecciona la impresora de esta caja para abrir el cajón.",
    );
  if (profile.language !== "ESCPOS" || profile.drawerEnabled === false) return;
  const key =
    "kiwik.drawer.v1:" +
    JSON.stringify([
      backendUrl("/"),
      registerId,
      refund ? "refund" : "charge",
      id,
    ]);
  const submit = async () => {
    if (localStorage.getItem(key)) return;
    // Do not send if persistence fails: a reload could otherwise repeat the pulse.
    localStorage.setItem(key, "attempted");
    await printRawProfile(
      profile,
      "\x1bp" + String.fromCharCode(profile.drawerPin ?? 0) + "\x19\x64",
      "ESCPOS",
    );
  };
  if (typeof navigator !== "undefined" && navigator.locks)
    await navigator.locks.request(key, submit);
  else await submit();
}
