import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

export const RPT_IVA_001_CODE = 'RPT-IVA-001';
export const RPT_IVA_001_TITLE = 'Preliquidación trimestral de IVA';

export interface Iva001Filters { year: number; quarter: number }
export interface VatSide { documentCount: number; net: number; tax: number; rates: Array<{ rate: number; net: number; tax: number }> }
export interface VatSettlementState { id: number; version: number; status: 'PREPARED' | 'PRESENTED'; label: string; outdated?: boolean; preparedAt?: string; preparedBy?: string; presentedAt?: string; presentedBy?: string }
export interface VatSettlementVersion { version: number; status: 'PREPARED' | 'PRESENTED' | 'SUPERSEDED'; preparedAt?: string; preparedBy?: string; presentedAt?: string; presentedBy?: string }
export interface VatLateChanges { hasChanges: boolean; newDocumentCount: number; changedDocumentCount: number; removedDocumentCount: number; documents: Array<Record<string, any>> }
export interface VatSettlement {
  year: number; quarter: number; dateFrom: string; dateTo: string;
  output: VatSide; input: VatSide; result: number;
  documents: Array<Record<string, any>>; warnings: Array<Record<string, any>>; disclaimer: string; settlement?: VatSettlementState | null; versions?: VatSettlementVersion[]; lateChanges?: VatLateChanges; advisorConfigured?: boolean; advisorName?: string; advisorEmail?: string;
}

export async function prepareIva001(filters: Iva001Filters, regularization = false): Promise<VatSettlement> {
  const { data } = await axios.post<VatSettlement>(backendUrl('/WebPrepareVatQuarterSettlement'), null, { params: { ...filters, regularization }, timeout: 30000 });
  return data;
}

export async function presentIva001(filters: Iva001Filters, report?: Blob, sendToAdvisor = false): Promise<VatSettlement & { advisorEmailStatus?: string; advisorEmail?: string }> {
  const body = new FormData();
  if (report) body.append('report', report, `Liquidacion_IVA_${filters.year}_T${filters.quarter}.pdf`);
  const { data } = await axios.post<VatSettlement & { advisorEmailStatus?: string; advisorEmail?: string }>(backendUrl('/WebPresentVatQuarterSettlement'), body, { params: { ...filters, sendToAdvisor }, timeout: 45000 });
  return data;
}

export const IVA_001_COLUMNS: ReportColumn[] = [
  { key: 'type', header: 'Tipo' }, { key: 'code', header: 'Código interno' }, { key: 'supplierCode', header: 'Factura proveedor' },
  { key: 'date', header: 'Fecha' }, { key: 'party', header: 'Cliente / Proveedor' }, { key: 'nif', header: 'NIF / CIF' },
  { key: 'net', header: 'Base imponible', align: 'right' }, { key: 'tax', header: 'IVA', align: 'right' },
  { key: 'total', header: 'Total', align: 'right' }, { key: 'review', header: 'Revisión' }
];

export const IVA_001_ORDER_FIELDS = [
  { label: 'Fecha', value: 'dateRaw' }, { label: 'Código interno', value: 'code' }, { label: 'Factura proveedor', value: 'supplierCode' },
  { label: 'Cliente / Proveedor', value: 'party' }, { label: 'NIF / CIF', value: 'nif' },
  { label: 'Base imponible', value: 'netRaw' }, { label: 'IVA', value: 'taxRaw' }, { label: 'Total', value: 'totalRaw' }
];

const day = (value: unknown) => value ? new Date(String(value)).toLocaleDateString('es-ES') : '';
const amount = (value: unknown) => Number(value ?? 0).toLocaleString('es-ES', { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });

export async function fetchIva001(filters: Iva001Filters): Promise<{ settlement: VatSettlement; rows: ReportRow[] }> {
  const { data } = await axios.get<VatSettlement>(backendUrl('/WebGetVatQuarterSettlement'), { params: filters, timeout: 30000 });
  const warnings = new Map<string, string[]>();
  for (const warning of data.warnings ?? []) {
    const key = `${warning.direction}|${warning.code}`;
    warnings.set(key, [...(warnings.get(key) ?? []), String(warning.message ?? '')]);
  }
  const rows: ReportRow[] = (data.documents ?? []).map((row: any) => {
    const reviewMessages = warnings.get(`${row.direction}|${row.code}`) ?? warnings.get(`${row.direction}|${row.supplierCode}`) ?? [];
    return {
    direction: row.direction === 'VENTA' ? 'Ventas' : 'Compras', type: String(row.type ?? ''), code: String(row.code ?? ''),
    supplierCode: String(row.supplierCode ?? ''),
    date: day(row.date), dateRaw: String(row.date ?? ''), party: String(row.party ?? ''), nif: String(row.nif ?? ''),
    net: amount(row.net), netRaw: Number(row.net ?? 0), tax: amount(row.tax), taxRaw: Number(row.tax ?? 0),
    total: amount(row.total), totalRaw: Number(row.total ?? 0), review: reviewMessages.join(' ') || 'Correcta', hasReview: reviewMessages.length > 0
  };
  });
  return { settlement: data, rows };
}

export function iva001FiltersText(filters: Iva001Filters, settlement?: VatSettlement | null): string {
  const base = `${filters.quarter}T ${filters.year}`;
  if (!settlement) return base;
  return `${base} · IVA repercutido: ${amount(settlement.output?.tax)} € · IVA soportado: ${amount(settlement.input?.tax)} € · Resultado: ${amount(settlement.result)} €`;
}
