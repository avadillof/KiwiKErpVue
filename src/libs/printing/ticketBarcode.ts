/** The encoded value is exactly the persisted ticket reference, never a product barcode. */
export function ticketBarcodeValue(code: unknown): string {
  const value = String(code ?? "")
    .trim()
    .toUpperCase();
  return /^T-[1-9][0-9]{0,18}$/.test(value) ? value : "";
}

/** Code 128 B for the prefix and C for digit pairs keeps even long IDs within 58 mm. */
export function ticketBarcodeEscpos(code: unknown): string {
  const value = ticketBarcodeValue(code);
  if (!value) return "";
  const digits = value.slice(2);
  const odd = digits.length % 2;
  const pairs = digits.slice(odd).match(/.{2}/g) ?? [];
  const data =
    "{BT-" +
    (odd ? digits[0] : "") +
    (pairs.length
      ? "{C" + pairs.map((pair) => String.fromCharCode(Number(pair))).join("")
      : "");
  return (
    "\n\x1dH\x02\x1dh\x50\x1dw\x02\x1dk\x49" +
    String.fromCharCode(data.length) +
    data +
    "\n"
  );
}
import JsBarcode from "jsbarcode";

/** Inline SVG with quiet zones: no remote barcode service or image-loading race. */
export function ticketBarcodeSvg(code: unknown): string {
  const value = ticketBarcodeValue(code);
  if (!value) return "";
  const target = {} as { encodings?: Array<{ data: string }> };
  JsBarcode(target, value, { format: "CODE128", displayValue: false });
  const bits = (target.encodings ?? []).map((row) => row.data).join("");
  const width = bits.length + 20;
  const bars = Array.from(bits, (bit, x) =>
    bit === "1" ? `<rect x="${x + 10}" y="0" width="1" height="55"/>` : "",
  ).join("");
  return `<div style="text-align:center;margin:12px 0;break-inside:avoid"><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${value}" viewBox="0 0 ${width} 55" style="width:${width * 2}px;max-width:100%;height:55px" preserveAspectRatio="none"><rect width="100%" height="100%" fill="white"/><g fill="black">${bars}</g></svg><div>${value}</div></div>`;
}
