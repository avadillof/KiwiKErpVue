import type { TpvCharge } from "./tpvReceipt";

/** Umbral a partir del cual una apertura se considera larga (horas). */
export const LONG_OPENING_HOURS = 10;

/** Ventana que usa el backend para considerar "actividad reciente" (segundos). */
export const PRESENCE_WINDOW_S = 70;

export interface SupervisionSession {
  name: string;
  lastSeen: string;
  hasDraft: boolean | number;
}

export interface SupervisionOperator {
  name: string;
  tickets?: number;
  sales?: number;
  refunds?: number;
  refundAmount?: number;
}

export interface SupervisionRegister {
  id: number;
  zoneId: number;
  name: string;
  code: string;
  active: boolean | number;
  openingId: number | null;
  openedAt?: string;
  closedAt?: string;
  openedBy?: string;
  pendingReconciliation: boolean | number;
  cashSales: number;
  cardSales: number;
  cashRefunds: number;
  cardRefunds: number;
  sales: number;
  ticketCount: number;
  openTickets: number;
  sessions: SupervisionSession[];
  operators: SupervisionOperator[];
}

export interface SupervisionAlert {
  severity: "error" | "warn" | "info";
  icon: string;
  title: string;
  detail: string;
}

export const truth = (value: unknown) =>
  value === true || value === 1 || value === "1";

export const isOpenRegister = (r: SupervisionRegister) =>
  !!r.openingId && !r.closedAt;

const num = (value: unknown) => Number(value) || 0;

/** Efectivo y tarjeta netos (descontadas devoluciones) de las cajas abiertas. */
export function paymentSplit(registers: SupervisionRegister[]): {
  cash: number;
  card: number;
} {
  let cash = 0;
  let card = 0;
  for (const r of registers) {
    if (!isOpenRegister(r)) continue;
    cash += num(r.cashSales) - num(r.cashRefunds);
    card += num(r.cardSales) - num(r.cardRefunds);
  }
  return { cash: Math.max(0, cash), card: Math.max(0, card) };
}

/** Ticket medio y totales de las aperturas en curso. */
export function shiftTotals(registers: SupervisionRegister[]): {
  sales: number;
  tickets: number;
  average: number;
  openTickets: number;
} {
  let sales = 0;
  let tickets = 0;
  let openTickets = 0;
  for (const r of registers) {
    if (!isOpenRegister(r)) continue;
    sales += num(r.sales);
    tickets += num(r.ticketCount);
    openTickets += num(r.openTickets);
  }
  return {
    sales,
    tickets,
    average: tickets > 0 ? sales / tickets : 0,
    openTickets,
  };
}

/** Empleados ordenados por ventas del turno (solo filas con tickets). */
export function rankOperators(
  registers: SupervisionRegister[],
  limit = 6,
): Array<{ name: string; tickets: number; sales: number }> {
  const byName = new Map<string, { tickets: number; sales: number }>();
  for (const r of registers) {
    if (!isOpenRegister(r)) continue;
    for (const op of r.operators ?? []) {
      if (!num(op.tickets)) continue;
      const name = op.name || "Sin identificar";
      const prev = byName.get(name) ?? { tickets: 0, sales: 0 };
      prev.tickets += num(op.tickets);
      prev.sales += num(op.sales);
      byName.set(name, prev);
    }
  }
  return [...byName.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}

/** Absolute quarter-hour buckets keep dates and repeated DST hours separate. */
export const SLOT_STEP_MIN = 15;
const STEP_MS = SLOT_STEP_MIN * 60000;
export const currentTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;
export function timeZoneLabel(
  timeZone = currentTimeZone(),
  now = new Date(),
): string {
  const offset =
    new Intl.DateTimeFormat("es-ES", { timeZone, timeZoneName: "longOffset" })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return `${timeZone} · ${offset}`;
}
type TimedCharge = {
  chargedAt?: string;
  chargedAtEpoch?: number;
  total?: number;
  zoneId?: number;
  zoneName?: string;
};
function bucket(c: TimedCharge): number | null {
  // The server supplies epoch milliseconds: its SQL wall clock must not be reinterpreted as browser time.
  const time =
    c.chargedAtEpoch != null
      ? Number(c.chargedAtEpoch)
      : new Date(c.chargedAt ?? "").getTime();
  return Number.isFinite(time) ? Math.floor(time / STEP_MS) * STEP_MS : null;
}
function timeline(charges: TimedCharge[], timeZone: string) {
  const times = charges.map(bucket).filter((t): t is number => t !== null);
  if (!times.length) return { ticks: [] as number[], labels: [] as string[] };
  let first = times[0],
    last = times[0];
  for (const t of times) {
    first = Math.min(first, t);
    last = Math.max(last, t);
  }
  const ticks = Array.from(
    { length: (last - first) / STEP_MS + 1 },
    (_, i) => first + i * STEP_MS,
  );
  const format = new Intl.DateTimeFormat("es-ES", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "shortOffset",
    hourCycle: "h23",
  });
  return { ticks, labels: ticks.map((t) => format.format(t)) };
}
export function hourlySales(
  charges: TimedCharge[],
  timeZone = currentTimeZone(),
): { labels: string[]; data: number[] } {
  const { ticks, labels } = timeline(charges, timeZone);
  const cents = new Map<number, number>();
  for (const c of charges) {
    const t = bucket(c);
    if (t !== null)
      cents.set(t, (cents.get(t) ?? 0) + Math.round(num(c.total) * 100));
  }
  return { labels, data: ticks.map((t) => (cents.get(t) ?? 0) / 100) };
}
const ZONE_PALETTE = [
  "#648506",
  "#2875b6",
  "#d9a021",
  "#7c5cbf",
  "#c96a1e",
  "#16a085",
  "#b74267",
  "#4fb3bf",
];
export function zoneHourlySales(
  charges: TimedCharge[],
  timeZone = currentTimeZone(),
): {
  labels: string[];
  datasets: Array<{ label: string; data: number[]; backgroundColor: string }>;
} {
  const { ticks, labels } = timeline(charges, timeZone);
  const zones = new Map<
    string,
    { name: string; id?: number; cents: Map<number, number> }
  >();
  for (const c of charges) {
    const t = bucket(c);
    if (t === null) continue;
    const key =
      c.zoneId != null
        ? `id:${c.zoneId}`
        : `legacy:${c.zoneName || "Sin zona"}`;
    if (!zones.has(key))
      zones.set(key, {
        name: c.zoneName || "Sin zona",
        id: c.zoneId,
        cents: new Map(),
      });
    const zone = zones.get(key)!;
    zone.cents.set(
      t,
      (zone.cents.get(t) ?? 0) + Math.round(num(c.total) * 100),
    );
  }
  // Order and colours follow zone identity, not fluctuating sales totals on each refresh.
  const ordered = [...zones.entries()].sort(([a], [b]) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  return {
    labels,
    datasets: ordered.map(([, z], i) => ({
      label:
        [...zones.values()].filter((other) => other.name === z.name).length > 1
          ? `${z.name} (#${z.id ?? "?"})`
          : z.name,
      data: ticks.map((t) => (z.cents.get(t) ?? 0) / 100),
      backgroundColor: ZONE_PALETTE[(z.id ?? i) % ZONE_PALETTE.length],
    })),
  };
}

export type FiscalGroup = "ok" | "pending" | "attention";

export function fiscalGroupOf(status?: string | null): FiscalGroup {
  switch ((status ?? "").toUpperCase()) {
    case "ACCEPTED":
      return "ok";
    case "PENDING":
    case "PROCESSING":
    case "":
      return "pending";
    default:
      return "attention";
  }
}

/** Resumen fiscal de los tickets cobrados en los turnos abiertos. */ export function fiscalSummary(
  charges: TpvCharge[],
): {
  ok: number;
  pending: number;
  attention: number;
  total: number;
} {
  const out = { ok: 0, pending: 0, attention: 0, total: 0 };
  for (const c of charges) {
    out[fiscalGroupOf(c.verifactuStatus)] += 1;
    out.total += 1;
  }
  return out;
}

/** "hace 12 s" · "hace 3 min" · "hace 2 h" · fecha corta como último recurso. */
export function timeAgo(iso: string | undefined, now = Date.now()): string {
  if (!iso) return "sin datos";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "sin datos";
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 5) return "ahora mismo";
  if (s < 60) return `hace ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(t).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Antigüedad de una apertura: "7 h 12 min" (y horas totales para umbrales). */
export function openingAge(
  openedAt: string | undefined,
  now = Date.now(),
): { text: string; hours: number } {
  if (!openedAt) return { text: "—", hours: 0 };
  const t = new Date(openedAt).getTime();
  if (Number.isNaN(t)) return { text: "—", hours: 0 };
  const mins = Math.max(0, Math.floor((now - t) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const text = h > 0 ? `${h} h ${m} min` : `${m} min`;
  return { text, hours: mins / 60 };
}

/** Alertas automáticas calculadas con los datos de central + pulso fiscal. */
export function buildAlerts(
  registers: SupervisionRegister[],
  fiscalAttention: number,
  now = Date.now(),
): SupervisionAlert[] {
  const alerts: SupervisionAlert[] = [];
  const open = registers.filter(isOpenRegister);

  if (fiscalAttention > 0) {
    alerts.push({
      severity: "error",
      icon: "pi pi-times-circle",
      title: "Atención fiscal VeriFactu",
      detail: `${fiscalAttention} ticket(s) con error o corrección pendiente en los turnos abiertos.`,
    });
  }

  const long = open
    .map((r) => ({ r, age: openingAge(r.openedAt, now) }))
    .filter(({ age }) => age.hours >= LONG_OPENING_HOURS);
  if (long.length) {
    alerts.push({
      severity: "warn",
      icon: "pi pi-clock",
      title: "Aperturas largas",
      detail: long
        .map(({ r, age }) => `${r.name} lleva abierta ${age.text}`)
        .join(" · "),
    });
  }

  const silent = open.filter((r) => (r.sessions ?? []).length === 0);
  if (silent.length) {
    alerts.push({
      severity: "warn",
      icon: "pi pi-wifi",
      title: "Cajas sin comunicación reciente",
      detail: `${silent.map((r) => r.name).join(", ")}: ningún terminal ha respondido en los últimos ${PRESENCE_WINDOW_S} s.`,
    });
  }

  const blocked = open.filter(
    (r) =>
      num(r.openTickets) > 0 ||
      (r.sessions ?? []).some((s) => truth(s.hasDraft)),
  );
  if (blocked.length) {
    const tickets = blocked.reduce((sum, r) => sum + num(r.openTickets), 0);
    alerts.push({
      severity: "info",
      icon: "pi pi-lock",
      title: "Cierres bloqueados",
      detail: `${blocked.map((r) => r.name).join(", ")}: ${tickets} ticket(s) abiertos o ventas en preparación impiden el cierre remoto.`,
    });
  }

  return alerts;
}

/** Compact daily view: retain the familiar 06–23 axis, extending it for actual night activity. */
export function dailySales(
  charges: TimedCharge[],
  now = Date.now(),
  timeZone = currentTimeZone(),
) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const minute = (t: number) => {
    const [h, m] = time.format(t).split(":").map(Number);
    return h * 60 + m;
  };
  const today = day.format(now);
  const selected = charges.filter((c) => {
    const t = bucket(c);
    return t !== null && day.format(t) === today;
  });
  const current = minute(now);
  let start = Math.min(360, Math.floor(current / 15) * 15),
    end = Math.max(1380, Math.ceil(current / 15) * 15);
  for (const c of selected) {
    const m = minute(bucket(c)!);
    start = Math.min(start, m);
    end = Math.max(end, m);
  }
  const labels = Array.from({ length: (end - start) / 15 + 1 }, (_, i) => {
    const m = start + i * 15;
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  });
  const totals = labels.map(() => 0);
  const zones = new Map<
    string,
    { label: string; id?: number; data: number[] }
  >();
  for (const c of selected) {
    const index = (minute(bucket(c)!) - start) / 15,
      cents = Math.round(num(c.total) * 100);
    totals[index] += cents;
    const key = c.zoneId != null ? `id:${c.zoneId}` : `legacy:${c.zoneName}`;
    if (!zones.has(key))
      zones.set(key, {
        label: c.zoneName || "Sin zona",
        id: c.zoneId,
        data: labels.map(() => 0),
      });
    zones.get(key)!.data[index] += cents;
  }
  const datasets = [...zones.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, z], i) => ({
      label:
        [...zones.values()].filter((other) => other.label === z.label).length >
        1
          ? `${z.label} (#${z.id ?? "?"})`
          : z.label,
      data: z.data.map((c) => c / 100),
      backgroundColor: ZONE_PALETTE[(z.id ?? i) % ZONE_PALETTE.length],
    }));
  return {
    labels,
    data: totals.map((c) => c / 100),
    datasets,
    currentIndex: (current - start) / 15,
    currentLabel: time.format(now),
  };
}
