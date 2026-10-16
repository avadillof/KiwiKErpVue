export interface Preparation {
  destination: "NONE" | "KITCHEN" | "BAR";
  note: string;
  modifiers: string[];
}
export interface KitchenItem extends Preparation {
  name: string;
  quantity: number;
  action: "ADD" | "REMOVE" | "MOVE";
  fromTable?: string;
}
export interface KitchenOrder {
  id: number;
  tableName: string;
  destination: string;
  createdAt: number;
  items: KitchenItem[];
  copy?: boolean;
  token?: string;
  state: string;
  printState: string;
  printAt?: number;
}
const clean = (v: unknown) => String(v ?? "").replace(/[\x00-\x1f\x7f]/g, " ");
export function kitchenText(order: KitchenOrder): string {
  return [
    order.copy ? "*** COPIA - COMPROBAR ORIGINAL ***" : "COMANDA",
    order.destination === "KITCHEN" ? "COCINA" : "BARRA",
    clean(order.tableName) + " · #" + order.id,
    new Date(Number(order.createdAt)).toLocaleString("es-ES"),
    ...order.items.flatMap((i) => [
      "--------------------------------",
      (i.action === "REMOVE"
        ? "ANULAR "
        : i.action === "MOVE"
          ? "CAMBIO DE MESA "
          : "AÑADIR ") +
        Number(i.quantity).toLocaleString("es-ES") +
        " x " +
        clean(i.name),
      ...(i.fromTable ? ["Desde: " + clean(i.fromTable)] : []),
      ...i.modifiers.map((m) => "  + " + clean(m)),
      ...(i.note ? ["NOTA: " + clean(i.note)] : []),
    ]),
    "",
    "Documento de preparación",
    "",
  ].join("\n");
}
export function kitchenEscpos(
  order: KitchenOrder,
  codePage: number,
  cut: boolean,
): string {
  return (
    "\x1b@\x1bt" +
    String.fromCharCode(codePage) +
    kitchenText(order) +
    "\n\n\n" +
    (cut ? "\x1dV\x00" : "")
  );
}
export function kitchenHtml(order: KitchenOrder): string {
  const text = kitchenText(order).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
  return (
    '<html><meta charset="utf-8"><body><pre style="font:18px monospace;white-space:pre-wrap">' +
    text +
    "</pre></body></html>"
  );
}
