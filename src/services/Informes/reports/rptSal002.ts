import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

/** Descriptor del RPT-SAL-002 Pedidos pendientes de entrega. */

export const RPT_SAL_002_CODE = 'RPT-SAL-002';
export const RPT_SAL_002_TITLE = 'Pedidos pendientes de entrega';

export interface Sal002Filters {
  dateTo: Date | null;
  query: string;
}

export const SAL_002_COLUMNS: ReportColumn[] = [
  { key: 'orderCode', header: 'Pedido' },
  { key: 'orderDate', header: 'Fecha pedido' },
  { key: 'expectedDate', header: 'Fecha prevista' },
  { key: 'customer', header: 'Cliente' },
  { key: 'reference', header: 'Referencia' },
  { key: 'productCode', header: 'Cód. artículo' },
  { key: 'product', header: 'Artículo' },
  { key: 'orderedQuantity', header: 'Pedida' },
  { key: 'deliveredQuantity', header: 'Entregada' },
  { key: 'pendingQuantity', header: 'Pendiente' },
  { key: 'state', header: 'Estado' }
];

export const SAL_002_ORDER_FIELDS = [
  { label: 'Pedido', value: 'orderCode' },
  { label: 'Fecha prevista', value: 'expectedDateRaw' },
  { label: 'Cliente', value: 'customer' },
  { label: 'Artículo', value: 'product' },
  { label: 'Cantidad pendiente', value: 'pendingQuantityRaw' },
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

export function sal002FiltersText(f: Sal002Filters): string {
  return `Fecha prevista hasta: ${f.dateTo ? fmtDay(localDay(f.dateTo)) : 'Sin límite'} · Buscar: ${f.query.trim() || '—'}`;
}

/** Filas del informe con los filtros del formulario. */
export async function fetchSal002(f: Sal002Filters): Promise<ReportRow[]> {
  const { data } = await axios.get(backendUrl('/WebGetSalesReportPendingOrders'), {
    params: {
      dateTo: f.dateTo ? localDay(f.dateTo) : undefined,
      query: f.query.trim() || undefined
    },
    timeout: 25000
  });
  const rows: any[] = Array.isArray(data) ? data : [];
  return rows.map((r) => ({
    orderCode: String(r.orderCode ?? ''),
    orderDate: fmtDay(r.orderDate),
    expectedDate: fmtDay(r.expectedDate),
    expectedDateRaw: r.expectedDate == null ? '' : String(r.expectedDate).slice(0, 10),
    customer: String(r.customer ?? ''),
    reference: String(r.reference ?? ''),
    productCode: String(r.productCode ?? ''),
    product: String(r.product ?? ''),
    orderedQuantity: fmtQty(r.orderedQuantity),
    deliveredQuantity: fmtQty(r.deliveredQuantity),
    pendingQuantity: fmtQty(r.pendingQuantity),
    pendingQuantityRaw: Number(r.pendingQuantity ?? 0),
    state: String(r.state ?? '')
  }));
}
