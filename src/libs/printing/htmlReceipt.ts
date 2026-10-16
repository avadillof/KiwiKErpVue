import type { TpvReceipt, TpvRefund } from "../../views/TPV/tpvReceipt";
import { ticketBarcodeSvg } from "./ticketBarcode";

// Recibo HTML para impresoras de oficina/láser vía QZ pixel: lo rasteriza el
// controlador del sistema, así vale también para host-based (sin PCL/PS).
// Aquí sí hay UTF-8 completo: tildes y ñ sin problema.
const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmtDate = (raw: unknown): string => {
  if (!raw) return "";
  const date = new Date(
    String(raw).includes("T") ? String(raw) : `${raw}T00:00:00`,
  );
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const money = (value: unknown, currency: string): string => {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency || "EUR",
    }).format(Number(value) || 0);
  } catch {
    return `${(Number(value) || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || "EUR"}`;
  }
};

const METHOD_LABEL: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
};

/** Documento HTML completo del recibo no fiscal. */
export function buildHtmlReceipt(receipt: TpvReceipt): string {
  const prebill = receipt.documentKind === "PREBILL";
  // Prebills can never carry fiscal identifiers, QR codes or payment confirmation.
  if (prebill)
    receipt = {
      ...receipt,
      fiscalCode: undefined,
      qrPng: undefined,
      qrUrl: undefined,
      code: undefined,
      payments: [],
    };
  const currency = receipt.currency || "EUR";
  const lines = (receipt.lines ?? [])
    .map(
      (l) =>
        `<tr><td class="qty">${esc(new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 }).format(Number(l.quantity) || 0))}&times;</td><td>${esc(l.name)}<br><span class="dim">${esc(l.code)} &middot; ${esc(money(l.unitGross, currency))}/ud</span></td><td class="r">${esc(money(l.total, currency))}</td></tr>`,
    )
    .join("");
  const payments = (receipt.payments ?? [])
    .map(
      (p) =>
        `<div class="row"><span>${esc((p.method && METHOD_LABEL[p.method]) || p.method)}</span><span>${esc(money(p.amount, currency))}</span></div>`,
    )
    .join("");
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${prebill ? "Precuenta" : `Ticket ${esc(receipt.code)}`}</title><style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;color:#111;max-width:320px;margin:0 auto;padding:12px;font-size:13px}
h1{font-size:17px;text-align:center}h2{font-size:14px;text-align:center;margin:2px 0 8px}.c{text-align:center}.dim{color:#555;font-size:11px}
hr{border:none;border-top:1px dashed #999;margin:8px 0}.row{display:flex;justify-content:space-between;padding:1px 0}
table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:3px 0}.qty{white-space:nowrap;padding-right:6px}.r{text-align:right;white-space:nowrap}
.total{font-size:17px;font-weight:bold}.change{font-size:15px;font-weight:bold}.nofiscal{border:1px solid #111;padding:6px;text-align:center;font-weight:bold;margin:8px 0}
</style></head><body>
<h1>${esc(receipt.companyName || "KiwiKERP · TPV")}</h1>
${receipt.companyCif ? `<p class="c dim">N.I.F: ${esc(receipt.companyCif)}</p>` : ""}
${receipt.companyName ? `<p class="c dim">KiwiKERP · TPV</p>` : ""}
<p class="c dim">${esc(receipt.zoneName ?? "")}${receipt.registerName ? ` &middot; ${esc(receipt.registerName)}` : ""}${receipt.tableName ? ` &middot; Mesa ${esc(receipt.tableName)}` : ""}</p>
<h2>${prebill ? "PRECUENTA · PENDIENTE DE COBRO" : `Ticket ${esc(receipt.code)}`}</h2>
${receipt.fiscalCode ? `<h2>FACTURA SIMPLIFICADA ${esc(receipt.fiscalCode)}</h2>` : ""}
<p class="c dim">${esc(fmtDate(receipt.chargedAt))}${receipt.cashier ? ` &middot; ${esc(receipt.cashier)}` : ""}</p>
${receipt.customerName ? `<p class="c">Cliente: ${esc(receipt.customerName)}${receipt.customerNif ? ` &middot; N.I.F: ${esc(receipt.customerNif)}` : ""}</p>` : ""}
<hr><table>${lines}</table><hr>
<div class="row"><span>Base imponible</span><span>${esc(money(receipt.net, currency))}</span></div>
<div class="row"><span>Impuestos</span><span>${esc(money(receipt.tax, currency))}</span></div>
<div class="row total"><span>Total</span><span>${esc(money(receipt.total, currency))}</span></div>
${
  prebill
    ? ""
    : `<hr>${payments}
<div class="row"><span>Entregado</span><span>${esc(money(receipt.paid, currency))}</span></div>
<div class="row change"><span>Cambio</span><span>${esc(money(receipt.change, currency))}</span></div>
`
}
${receipt.qrPng ? `<p class="c"><img src="data:image/png;base64,${receipt.qrPng}" width="150" height="150" alt="QR AEAT"><br><span class="dim">Verifica en AEAT</span></p>` : ""}
<div class="nofiscal">${receipt.fiscalCode ? "Factura simplificada" : "Documento no v&aacute;lido como factura"}</div>
${prebill ? "" : ticketBarcodeSvg(receipt.code)}
<p class="c dim">&iexcl;Gracias por su visita!</p>
</body></html>`;
}

/** Resguardo de devolución en HTML (impresión por controlador). */
export function buildHtmlRefund(refund: TpvRefund): string {
  const currency = refund.currency || "EUR";
  const lines = (refund.lines ?? [])
    .map(
      (l) =>
        `<tr><td class="qty">${esc(new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 }).format(Number(l.quantity) || 0))}&times;</td><td>${esc(l.name)}<br><span class="dim">${esc(l.code)} &middot; ${esc(money(l.unitGross, currency))}/ud</span></td><td class="r">${esc(money(l.total, currency))}</td></tr>`,
    )
    .join("");
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Devoluci&oacute;n ${esc(refund.code)}</title><style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;color:#111;max-width:320px;margin:0 auto;padding:12px;font-size:13px}
h1{font-size:17px;text-align:center}h2{font-size:14px;text-align:center;margin:2px 0 8px}.c{text-align:center}.dim{color:#555;font-size:11px}
hr{border:none;border-top:1px dashed #999;margin:8px 0}.row{display:flex;justify-content:space-between;padding:1px 0}
table{width:100%;border-collapse:collapse}td{vertical-align:top;padding:3px 0}.qty{white-space:nowrap;padding-right:6px}.r{text-align:right;white-space:nowrap}
.total{font-size:17px;font-weight:bold}.nofiscal{border:1px solid #111;padding:6px;text-align:center;font-weight:bold;margin:8px 0}
.reason{background:#f4f4f4;padding:6px;margin:6px 0;font-size:12px}
</style></head><body>
<h1>${esc(refund.companyName || "KiwiKERP · TPV")}</h1>
${refund.companyCif ? `<p class="c dim">N.I.F: ${esc(refund.companyCif)}</p>` : ""}
<h2>DEVOLUCI&Oacute;N ${esc(refund.code)}</h2>
${refund.chargeCode ? `<p class="c dim">Devuelve ticket ${esc(refund.chargeCode)}</p>` : ""}
<p class="c dim">${esc(fmtDate(refund.refundedAt))}${refund.cashier ? ` &middot; ${esc(refund.cashier)}` : ""}</p>
${refund.customerName ? `<p class="c">Cliente: ${esc(refund.customerName)}${refund.customerNif ? ` &middot; N.I.F: ${esc(refund.customerNif)}` : ""}</p>` : ""}
${refund.reason ? `<div class="reason">Motivo: ${esc(refund.reason)}</div>` : ""}
<hr><table>${lines}</table><hr>
<div class="row total"><span>Total devuelto</span><span>${esc(money(refund.total, currency))}</span></div>
<div class="row"><span>M&eacute;todo</span><span>${esc((refund.method && METHOD_LABEL[refund.method]) || refund.method)}</span></div>
<div class="nofiscal">Documento no v&aacute;lido como factura</div>
</body></html>`;
}
