import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

/** Descriptor del RPT-PUR-002 Facturas pendientes de pago. */

export const RPT_PUR_002_CODE = 'RPT-PUR-002';
export const RPT_PUR_002_TITLE = 'Facturas pendientes de pago';

export interface Pur002Filters {
  dateTo: Date | null;
  query: string;
  onlyOverdue: boolean;
}

export const PUR_002_COLUMNS: ReportColumn[] = [
  { key: 'invoiceCode', header: 'Factura' },
  { key: 'supplier', header: 'Proveedor' },
  { key: 'supplierCode', header: 'Nº proveedor' },
  { key: 'createDate', header: 'Fecha' },
  { key: 'dueDate', header: 'Vencimiento' },
  { key: 'totalTotal', header: 'Total' },
  { key: 'paidAmount', header: 'Pagado' },
  { key: 'pendingAmount', header: 'Pendiente' },
  { key: 'overdue', header: 'Vencida' }
];

export const PUR_002_ORDER_FIELDS = [
  { label: 'Factura', value: 'invoiceCode' },
  { label: 'Vencimiento', value: 'dueDateRaw' },
  { label: 'Proveedor', value: 'supplier' },
  { label: 'Pendiente', value: 'pendingAmountRaw' }
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

export function pur002FiltersText(f: Pur002Filters): string {
  return `Fecha hasta: ${f.dateTo ? fmtDay(localDay(f.dateTo)) : 'Sin límite'} · Buscar: ${f.query.trim() || '—'} · ${f.onlyOverdue ? 'Solo vencidas' : 'Vencidas y pendientes'}`;
}

/** Filas del informe con los filtros del formulario. */
export async function fetchPur002(f: Pur002Filters): Promise<ReportRow[]> {
  const { data } = await axios.get(backendUrl('/WebGetPurchasesReportPendingInvoices'), {
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
    supplier: String(r.supplier ?? ''),
    supplierCode: String(r.supplierCode ?? ''),
    createDate: fmtDay(r.createDate),
    dueDate: fmtDay(r.dueDate),
    dueDateRaw: r.dueDate == null ? '' : String(r.dueDate).slice(0, 10),
    totalTotal: fmtMoney(r.totalTotal),
    paidAmount: fmtMoney(r.paidAmount),
    pendingAmount: fmtMoney(r.pendingAmount),
    pendingAmountRaw: Number(r.pendingAmount ?? 0),
    overdue: Boolean(r.overdue)
  }));
}
