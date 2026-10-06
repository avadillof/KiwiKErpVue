import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

/** Descriptor del RPT-SAL-004 Facturas vencidas y pendientes de cobro. */

export const RPT_SAL_004_CODE = 'RPT-SAL-004';
export const RPT_SAL_004_TITLE = 'Facturas vencidas y pendientes de cobro';

export interface Sal004Filters {
  dateTo: Date | null;
  query: string;
  onlyOverdue: boolean;
}

export const SAL_004_COLUMNS: ReportColumn[] = [
  { key: 'invoiceCode', header: 'Factura' },
  { key: 'customer', header: 'Cliente' },
  { key: 'dueDate', header: 'Vencimiento' },
  { key: 'amount', header: 'Importe' },
  { key: 'collectedAmount', header: 'Cobrado' },
  { key: 'pendingAmount', header: 'Pendiente' },
  { key: 'overdue', header: 'Vencida' },
  { key: 'state', header: 'Estado' }
];

export const SAL_004_ORDER_FIELDS = [
  { label: 'Factura', value: 'invoiceCode' },
  { label: 'Vencimiento', value: 'dueDateRaw' },
  { label: 'Cliente', value: 'customer' },
  { label: 'Pendiente', value: 'pendingAmountRaw' },
  { label: 'Estado', value: 'state' }
];

const pad = (v: number) => String(v).padStart(2, '0');
const localDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmtDay = (v: unknown) => {
  if (!v) return '';
  const s = String(v).slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const fmtMoney = (v: unknown) => {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function sal004FiltersText(f: Sal004Filters): string {
  return `Fecha hasta: ${f.dateTo ? fmtDay(localDay(f.dateTo)) : 'Sin límite'} · Buscar: ${f.query.trim() || '—'} · ${f.onlyOverdue ? 'Solo vencidas' : 'Vencidas y pendientes'}`;
}

/** Filas del informe con los filtros del formulario. */
export async function fetchSal004(f: Sal004Filters): Promise<ReportRow[]> {
  const { data } = await axios.get(backendUrl('/WebGetSalesReportPendingDues'), {
    params: {
      dateTo: f.dateTo ? localDay(f.dateTo) : undefined,
      query: f.query.trim() || undefined,
      onlyOverdue: f.onlyOverdue || undefined
    },
    timeout: 25000
  });
  const rows: any[] = Array.isArray(data) ? data : [];
  return rows.map((r) => ({
    invoiceCode: String(r.invoiceCode ?? ''),
    customer: String(r.customer ?? ''),
    dueDate: fmtDay(r.dueDate),
    dueDateRaw: r.dueDate == null ? '' : String(r.dueDate).slice(0, 10),
    amount: fmtMoney(r.amount),
    collectedAmount: fmtMoney(r.collectedAmount),
    pendingAmount: fmtMoney(r.pendingAmount),
    pendingAmountRaw: Number(r.pendingAmount ?? 0),
    overdue: Boolean(r.overdue),
    state: String(r.state ?? '')
  }));
}
