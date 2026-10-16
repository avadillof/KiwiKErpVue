import {
  printers,
  printerSelections,
  selectionKey,
  refreshPrintSettings,
  printRawProfile,
} from "../../services/Printing/printerService";
import { sendQzHtml } from "../../services/Printing/qzTransport";
import { useCompanyStore } from "../../stores/companyStore";
import {
  buildTpvClosingPdf,
  RPT_TPV_001_CODE,
} from "../../services/Informes/reports/rptTpv001";

export interface TpvClosure {
  openingId: number;
  registerId: number;
  zoneId: number;
  code?: string;
  companyName?: string;
  companyCif?: string;
  zoneName: string;
  registerName: string;
  openedAt: string;
  openedBy?: string;
  closedAt?: string;
  closedBy?: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  cashRefunds: number;
  cardRefunds: number;
  expectedCash: number;
  countedCash?: number | null;
  difference?: number | null;
  status?: "PENDING_RECONCILIATION" | "RECONCILED";
  remote?: boolean;
  reconciliationReason?: string;
  reconciledAt?: string;
  reconciledBy?: number;
  reason?: string;
  ticketCount: number;
  refundCount: number;
  employees: Array<{
    name: string;
    cashSales?: number;
    cardSales?: number;
    cashRefunds?: number;
    cardRefunds?: number;
    ticketCount?: number;
    refundCount?: number;
  }>;
}
const count = (n: unknown) =>
  new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(
    Number(n) || 0,
  );
export const closureMoney = (n: unknown) =>
  new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0) + " EUR";
const date = (s?: string) => (s ? new Date(s).toLocaleString("es-ES") : "");
export function closureRows(r: TpvClosure): string[][] {
  const rows = [
    [
      "Estado",
      r.status === "PENDING_RECONCILIATION"
        ? "Cerrada · pendiente de arqueo"
        : "Arqueo registrado",
    ],
    ["Tipo de cierre", r.remote ? "Remoto desde central" : "Recuento en caja"],
    ["Empresa", r.companyName || ""],
    ["NIF", r.companyCif || ""],
    ["Zona / caja", `${r.zoneName} / ${r.registerName}`],
    ["Apertura", `${date(r.openedAt)} · ${r.openedBy || ""}`],
    ["Cierre", `${date(r.closedAt)} · ${r.closedBy || ""}`],
    ["Fondo inicial", closureMoney(r.openingFloat)],
    ["Ventas efectivo (descontado el cambio)", closureMoney(r.cashSales)],
    ["Ventas tarjeta", closureMoney(r.cardSales)],
    ["Devoluciones efectivo", closureMoney(r.cashRefunds)],
    ["Devoluciones tarjeta", closureMoney(r.cardRefunds)],
    ["Efectivo esperado", closureMoney(r.expectedCash)],
    [
      "Efectivo contado",
      r.countedCash == null
        ? "Pendiente de recuento"
        : closureMoney(r.countedCash),
    ],
    [
      "Diferencia",
      r.difference == null
        ? "Pendiente de recuento"
        : closureMoney(r.difference),
    ],
    ["Motivo", r.reason || "Sin diferencia"],
    [
      "Tickets / devoluciones",
      `${count(r.ticketCount)} / ${count(r.refundCount)}`,
    ],
  ];
  if (r.reconciledAt)
    rows.push(
      [
        "Arqueo posterior",
        `${date(r.reconciledAt)} · Usuario #${r.reconciledBy}`,
      ],
      ["Motivo del arqueo", r.reconciliationReason || "Sin diferencia"],
    );
  for (const e of r.employees || [])
    rows.push(
      ["Empleado", e.name],
      [
        "Tickets / devoluciones",
        `${count(e.ticketCount || 0)} / ${count(e.refundCount || 0)}`,
      ],
      [
        "Ventas efectivo / tarjeta",
        `${closureMoney(e.cashSales)} / ${closureMoney(e.cardSales)}`,
      ],
      [
        "Devoluciones efectivo / tarjeta",
        `${closureMoney(e.cashRefunds)} / ${closureMoney(e.cardRefunds)}`,
      ],
    );
  return rows;
}
export async function downloadClosure(r: TpvClosure) {
  const companyStore = useCompanyStore();
  const url = await buildTpvClosingPdf(r, {
    name: companyStore.companyInfo.nameCompany || r.companyName || "",
    slogan: companyStore.companyInfo.sloganCompany || "",
    logoUrl: companyStore.companyInfo.urlLogo || "",
  });
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${RPT_TPV_001_CODE}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.pdf`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export async function printClosure(r: TpvClosure): Promise<string> {
  refreshPrintSettings();
  const id =
    printerSelections.value[selectionKey("ESCPOS", String(r.registerId))];
  const profile = printers.value.find((p) => p.id === id);
  if (!profile || !["ESCPOS", "PLAIN"].includes(profile.language))
    throw new Error("Selecciona una impresora de tickets para esta caja.");
  const rows = closureRows(r);
  if (profile.language === "PLAIN") {
    const esc = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    await sendQzHtml(
      profile.queue,
      `<!doctype html><html><meta charset="utf-8"><style>body{font:13px Arial;max-width:600px;margin:auto}td{padding:6px;border-bottom:1px solid #ddd}thead{display:table-header-group}tr{break-inside:avoid}</style><h2>Cierre ${esc(r.code || "")}</h2><table>${rows.map((row) => "<tr>" + row.map((c) => `<td>${esc(c)}</td>`).join("") + "</tr>").join("")}</table></html>`,
    );
    return "Informe enviado a la cola de impresión.";
  }
  const clean = (s: string) =>
    s.normalize("NFC").replace(/[\u0000-\u001f\u007f-\u009f]/g, " ");
  const wrap = (s: string) =>
    Array.from(clean(s)).reduce(
      (out, c, i) => out + (i && i % profile.columns === 0 ? "\n" : "") + c,
      "",
    ) + "\n";
  const data =
    "\x1b@\x1bt" +
    String.fromCharCode(profile.codePage) +
    wrap(`CIERRE ${r.code}`) +
    rows
      .map(([a, b]) => wrap(a) + wrap(b) + wrap("-".repeat(profile.columns)))
      .join("") +
    "\n\n\n" +
    (profile.cut ? "\x1dV\x01" : "");
  return printRawProfile(profile, data, "ESCPOS");
}
