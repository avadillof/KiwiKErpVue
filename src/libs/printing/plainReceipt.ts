import type { TpvReceipt } from "../../views/TPV/tpvReceipt";

export interface PlainLayout {
  columns: 32 | 42 | 48;
}

// Texto plano para impresoras láser/de oficina vía QZ RAW: entienden texto
// pero no ESC/POS. Sin tildes (NFD->ASCII) porque el puerto RAW no negocia
// UTF-8 y los multibyte saldrían como basura en la mayoría de drivers.
const clean = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const money = (value: unknown, currency: string) => {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency || "EUR",
    }).format(Number(value) || 0);
  } catch {
    return `${(Number(value) || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || "EUR"}`;
  }
};

/** Recibo en texto plano (una línea = un \r\n). */
export function buildPlainReceipt(
  receipt: TpvReceipt,
  layout: PlainLayout,
): string {
  if (![32, 42, 48].includes(layout.columns))
    throw new Error("Configuración de papel inválida.");
  const currency = receipt.currency || "EUR";
  const width = layout.columns;
  const out: string[] = [];
  const line = (text: unknown) => {
    const chars = Array.from(clean(text));
    if (!chars.length) {
      out.push("");
      return;
    }
    for (let i = 0; i < chars.length; i += width)
      out.push(chars.slice(i, i + width).join(""));
  };
  const pair = (label: string, value: string) => {
    label = clean(label);
    value = clean(value);
    if (label.length + value.length + 1 > width) {
      line(label);
      line(value.padStart(width));
    } else
      out.push(label + " ".repeat(width - label.length - value.length) + value);
  };
  line("KiwiKERP - TPV");
  line("Ticket " + clean(receipt.code));
  line(
    [receipt.zoneName, receipt.registerName]
      .map((v) => clean(v))
      .filter(Boolean)
      .join(" - "),
  );
  if (receipt.tableName) line("Mesa: " + clean(receipt.tableName));
  if (receipt.cashier) line("Atendido por: " + clean(receipt.cashier));
  if (receipt.chargedAt) line(clean(receipt.chargedAt).replace("T", " "));
  line("-".repeat(width));
  for (const item of receipt.lines ?? []) {
    line(item.name || item.code || "Articulo");
    const quantity = new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 3,
    }).format(Number(item.quantity) || 0);
    pair(
      `${quantity} x ${money(item.unitGross, currency)}`,
      money(item.total, currency),
    );
  }
  line("-".repeat(width));
  pair("Base imponible", money(receipt.net, currency));
  pair("Impuestos", money(receipt.tax, currency));
  pair("TOTAL", money(receipt.total, currency));
  for (const payment of receipt.payments ?? [])
    pair(
      payment.method === "CASH"
        ? "Efectivo"
        : payment.method === "CARD"
          ? "Tarjeta"
          : clean(payment.method),
      money(payment.amount, currency),
    );
  pair("Entregado", money(receipt.paid, currency));
  pair("Cambio", money(receipt.change, currency));
  line("-".repeat(width));
  line("Documento no valido como factura");
  line("Gracias por su visita");
  out.push("", "", "");
  return out.join("\r\n");
}
