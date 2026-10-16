import type { TpvReceipt, TpvRefund } from "../../views/TPV/tpvReceipt";
import { ticketBarcodeEscpos } from "./ticketBarcode";

export interface ReceiptLayout {
  columns: 32 | 42 | 48;
  codePage: number;
  cut: boolean;
}

// Receipt data must never be able to inject printer commands (cut, drawer, reset, etc.).
const clean = (value: unknown) =>
  String(value ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
/** QR nativo ESC/POS (GS ( k): modelo 2, módulo 6, corrección M. Solo ASCII. */
function qrEscpos(data: string): string {
  const bytes: number[] = [];
  for (const ch of data) {
    const code = ch.charCodeAt(0);
    if (code > 127) return "";
    bytes.push(code);
  }
  const len = bytes.length + 3;
  const head =
    "\x1d(k\x04\x001A2\x00" +
    "\x1d(k\x03\x001C\x06" +
    "\x1d(k\x03\x001E1" +
    "\x1d(k" +
    String.fromCharCode(len & 0xff) +
    String.fromCharCode((len >> 8) & 0xff) +
    "1P0";
  return (
    head +
    bytes.map((b) => String.fromCharCode(b)).join("") +
    "\x1d(k\x03\x001Q0" +
    "\n"
  );
}
const money = (value: unknown) =>
  new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0) + " EUR";

/** ESC/POS text job. Transport must encode it as CP858, matching ESC t's configured page. */
export function buildEscposReceipt(
  receipt: TpvReceipt,
  layout: ReceiptLayout,
): string {
  const prebill = receipt.documentKind === "PREBILL";
  if (prebill)
    receipt = {
      ...receipt,
      fiscalCode: undefined,
      qrUrl: undefined,
      qrPng: undefined,
      code: undefined,
      payments: [],
    };
  if (
    ![32, 42, 48].includes(layout.columns) ||
    !Number.isInteger(layout.codePage) ||
    layout.codePage < 0 ||
    layout.codePage > 255
  )
    throw new Error("Configuración de papel o tabla de caracteres inválida.");
  if ((receipt.currency || "EUR") !== "EUR")
    throw new Error("El recibo ESC/POS requiere importes en EUR.");
  const width = layout.columns;
  const chunks: string[] = [];
  const line = (text: unknown) => {
    const chars = Array.from(clean(text));
    if (!chars.length) {
      chunks.push("\n");
      return;
    }
    for (let i = 0; i < chars.length; i += width)
      chunks.push(chars.slice(i, i + width).join("") + "\n");
  };
  const pair = (label: string, value: string) => {
    label = clean(label);
    value = clean(value);
    if (label.length + value.length + 1 > width) {
      line(label);
      line(value.padStart(width));
    } else
      chunks.push(
        label + " ".repeat(width - label.length - value.length) + value + "\n",
      );
  };
  // A number >127 is an octet, not a CP858 Unicode character. Restrict page choices in the UI to 0..127.
  if (layout.codePage > 127)
    throw new Error("Esta integración admite índices de tabla entre 0 y 127.");
  chunks.push(
    "\x1b@",
    "\x1bM\x00",
    "\x1bt" + String.fromCharCode(layout.codePage),
    "\x1ba\x01",
    "\x1bE\x01",
  );

  line("KiwiKERP · TPV");
  if (clean(receipt.companyName)) line(receipt.companyName);
  if (clean(receipt.companyCif)) line("N.I.F: " + clean(receipt.companyCif));
  line(
    prebill
      ? "PRECUENTA - PENDIENTE DE COBRO"
      : "Ticket " + clean(receipt.code),
  );
  if (clean(receipt.fiscalCode)) {
    line("FACTURA SIMPLIFICADA");
    line(clean(receipt.fiscalCode));
  }
  chunks.push("\x1bE\x00");
  line(receipt.zoneName);
  line(receipt.registerName);
  if (receipt.tableName) line("Mesa: " + clean(receipt.tableName));
  if (receipt.cashier) line("Atendido por: " + clean(receipt.cashier));
  if (receipt.chargedAt) line(clean(receipt.chargedAt).replace("T", " "));
  if (clean(receipt.customerName))
    line("Cliente: " + clean(receipt.customerName));
  if (clean(receipt.customerNif)) line("N.I.F: " + clean(receipt.customerNif));
  chunks.push("\x1ba\x00");
  line("-".repeat(width));
  for (const item of receipt.lines ?? []) {
    line(item.name || item.code || "Artículo");
    const quantity = new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 3,
    }).format(Number(item.quantity) || 0);
    pair(`${quantity} x ${money(item.unitGross)}`, money(item.total));
  }
  line("-".repeat(width));
  pair("Base imponible", money(receipt.net));
  pair("Impuestos", money(receipt.tax));
  chunks.push("\x1bE\x01");
  pair("TOTAL", money(receipt.total));
  chunks.push("\x1bE\x00");
  for (const payment of receipt.payments ?? [])
    pair(
      payment.method === "CASH"
        ? "Efectivo"
        : payment.method === "CARD"
          ? "Tarjeta"
          : clean(payment.method),
      money(payment.amount),
    );
  if (!prebill) {
    pair("Entregado", money(receipt.paid));
    pair("Cambio", money(receipt.change));
  }
  line("-".repeat(width));
  const qr = clean(receipt.qrUrl) ? qrEscpos(clean(receipt.qrUrl)) : "";
  if (qr) {
    chunks.push("\x1ba\x01");
    line("Verifica en AEAT");
    chunks.push(qr);
    chunks.push("\x1ba\x00");
  }
  chunks.push("\x1ba\x01");
  line(
    clean(receipt.fiscalCode)
      ? "Factura simplificada"
      : "Documento no válido como factura",
  );
  if (!prebill) chunks.push(ticketBarcodeEscpos(receipt.code));
  line("Gracias por su visita");
  chunks.push("\x1ba\x00", "\n\n\n");
  if (layout.cut) chunks.push("\x1dV\x01");
  // No drawer pulse: printing a copy must not open the cash drawer.
  return chunks.join("");
}

/** Resguardo de devolución: documento nuevo referenciado al ticket origen. */
export function buildEscposRefund(
  refund: TpvRefund,
  layout: ReceiptLayout,
): string {
  if (
    ![32, 42, 48].includes(layout.columns) ||
    !Number.isInteger(layout.codePage) ||
    layout.codePage < 0 ||
    layout.codePage > 255
  )
    throw new Error("Configuración de papel o tabla de caracteres inválida.");
  const width = layout.columns;
  const chunks: string[] = [];
  const line = (text: unknown) => {
    const chars = Array.from(clean(text));
    if (!chars.length) {
      chunks.push("\n");
      return;
    }
    for (let i = 0; i < chars.length; i += width)
      chunks.push(chars.slice(i, i + width).join("") + "\n");
  };
  const pair = (label: string, value: string) => {
    label = clean(label);
    value = clean(value);
    if (label.length + value.length + 1 > width) {
      line(label);
      line(value.padStart(width));
    } else
      chunks.push(
        label + " ".repeat(width - label.length - value.length) + value + "\n",
      );
  };
  if (layout.codePage > 127)
    throw new Error("Esta integración admite índices de tabla entre 0 y 127.");
  chunks.push(
    "\x1b@",
    "\x1bM\x00",
    "\x1bt" + String.fromCharCode(layout.codePage),
    "\x1ba\x01",
    "\x1bE\x01",
  );
  line("KiwiKERP · TPV");
  if (clean(refund.companyName)) line(refund.companyName);
  if (clean(refund.companyCif)) line("N.I.F: " + clean(refund.companyCif));
  line("DEVOLUCIÓN " + clean(refund.code));
  chunks.push("\x1bE\x00");

  chunks.push("\x1bE\x00");
  if (refund.chargeCode) line("Devuelve ticket: " + clean(refund.chargeCode));
  if (refund.cashier) line("Devuelto por: " + clean(refund.cashier));
  if (refund.refundedAt) line(clean(refund.refundedAt).replace("T", " "));
  if (clean(refund.customerName))
    line("Cliente: " + clean(refund.customerName));
  if (clean(refund.customerNif)) line("N.I.F: " + clean(refund.customerNif));
  if (refund.reason) line("Motivo: " + clean(refund.reason));
  chunks.push("\x1ba\x00");
  line("-".repeat(width));
  for (const item of refund.lines ?? []) {
    line(item.name || item.code || "Artículo");
    const quantity = new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 3,
    }).format(Number(item.quantity) || 0);
    pair(`${quantity} x ${money(item.unitGross)}`, money(item.total));
  }
  line("-".repeat(width));
  chunks.push("\x1bE\x01");
  pair("TOTAL DEVUELTO", money(refund.total));
  chunks.push("\x1bE\x00");
  pair(
    "Método",
    refund.method === "CASH"
      ? "Efectivo"
      : refund.method === "CARD"
        ? "Tarjeta"
        : clean(refund.method),
  );
  line("-".repeat(width));
  chunks.push("\x1ba\x01");
  line("Documento no válido como factura");
  chunks.push("\x1ba\x00", "\n\n\n");
  if (layout.cut) chunks.push("\x1dV\x01");
  return chunks.join("");
}
