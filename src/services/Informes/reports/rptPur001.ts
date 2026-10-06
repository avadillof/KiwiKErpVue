import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

/** Descriptor del RPT-PUR-001 Albaranes pendientes de facturar. */

export const RPT_PUR_001_CODE = 'RPT-PUR-001';
export const RPT_PUR_001_TITLE = 'Albaranes pendientes de facturar';

export interface Pur001Filters {
  dateTo: Date | null;
  query: string;
}

export const PUR_001_COLUMNS: ReportColumn[] = [
  { key: 'deliveryCode', header: 'Albarán' },
  { key: 'createDate', header: 'Fecha' },
  { key: 'supplier', header: 'Proveedor' },
  { key: 'supplierCode', header: 'Nº proveedor' },
  { key: 'reference', header: 'Referencia' },
  { key: 'quantity', header: 'Cantidad' },
  { key: 'totalTotal', header: 'Total' },
  { key: 'state', header: 'Estado' }
];

export const PUR_001_ORDER_FIELDS = [
  { label: 'Albarán', value: 'deliveryCode' },
  { label: 'Fecha', value: 'createDateRaw' },
  { label: 'Proveedor', value: 'supplier' },
  { label: 'Total', value: 'totalTotalRaw' },
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

const fmtQty = (v: unknown) => {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('de-DE', { maximumFractionDigits: 3 });
};

const fmtMoney = (v: unknown) => {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function pur001FiltersText(f: Pur001Filters): string {
  return `Fecha hasta: ${f.dateTo ? fmtDay(localDay(f.dateTo)) : 'Sin límite'} · Buscar: ${f.query.trim() || '—'}`;
}

/** Filas del informe con los filtros del formulario. */
export async function fetchPur001(f: Pur001Filters): Promise<ReportRow[]> {
  const { data } = await axios.get(backendUrl('/WebGetPurchasesReportPendingDeliveries'), {
    params: {
      dateTo: f.dateTo ? localDay(f.dateTo) : undefined,
      query: f.query.trim() || undefined
    },
    timeout: 25000
  });
  const rows: any[] = Array.isArray(data) ? data : [];
  return rows.map((r) => ({
    deliveryCode: String(r.deliveryCode ?? ''),
    createDate: fmtDay(r.createDate),
    createDateRaw: r.createDate == null ? '' : String(r.createDate).slice(0, 10),
    supplier: String(r.supplier ?? ''),
    supplierCode: String(r.supplierCode ?? ''),
    reference: String(r.reference ?? ''),
    quantity: fmtQty(r.quantity),
    totalTotal: fmtMoney(r.totalTotal),
    totalTotalRaw: Number(r.totalTotal ?? 0),
    state: String(r.state ?? '')
  }));
}
