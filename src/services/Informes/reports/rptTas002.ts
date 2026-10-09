import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

export interface Tas002Filters {
  dateFrom: Date | null; dateTo: Date | null; userPkid: number;
  entitiePkid: number | null; entitieLabel: string; pendingOnly: boolean; query: string; requesterPkid?: number;
}
export const TAS_002_COLUMNS: ReportColumn[] = [
  { key: 'workDate', header: 'Fecha' }, { key: 'taskCode', header: 'Tarea' },
  { key: 'taskName', header: 'Descripción' }, { key: 'company', header: 'Cliente' },
  { key: 'userName', header: 'Empleado' }, { key: 'memo', header: 'Trabajo realizado' },
  { key: 'hours', header: 'Horas', align: 'right' }, { key: 'invoicedHours', header: 'Facturadas', align: 'right' },
  { key: 'pendingHours', header: 'Pendientes', align: 'right' }, { key: 'priceHour', header: 'Precio/h', align: 'right' },
  { key: 'pendingAmount', header: 'Importe pend.', align: 'right' }
];
export const TAS_002_ORDER_FIELDS = [
  { label: 'Fecha', value: 'workDateRaw' }, { label: 'Tarea', value: 'taskCode' },
  { label: 'Cliente', value: 'company' }, { label: 'Empleado', value: 'userName' },
  { label: 'Horas', value: 'hoursRaw' }, { label: 'Importe pendiente', value: 'pendingAmountRaw' }
];
const pad = (n: number) => String(n).padStart(2, '0');
const day = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (v: unknown) => v ? String(v).slice(0, 10).split('-').reverse().join('/') : '—';
const fmt = (v: unknown) => Number(v ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function tas002FiltersText(f: Tas002Filters) {
  const dates = f.dateFrom && f.dateTo ? `${fmtDate(day(f.dateFrom))} - ${fmtDate(day(f.dateTo))}` : 'Sin límite';
  return `Periodo: ${dates} · Responsable: ${f.userPkid ? 'Seleccionado' : 'Todos'} · Cliente: ${f.entitieLabel || 'Todos'}${f.pendingOnly ? ' · Solo pendientes de facturar' : ''}`;
}
export async function fetchTas002(f: Tas002Filters): Promise<ReportRow[]> {
  const { data } = await axios.get(backendUrl('/WebGetTaskReportTimes'), { params: {
    dateFrom: f.dateFrom ? day(f.dateFrom) : undefined, dateTo: f.dateTo ? day(f.dateTo) : undefined,
    userPkid: f.userPkid || undefined, entitiePkid: f.entitiePkid || undefined,
    pendingOnly: f.pendingOnly, query: f.query.trim() || undefined, requesterPkid: f.requesterPkid
  }});
  return (Array.isArray(data) ? data : []).map((r: any) => ({
    ...r, workDate: fmtDate(r.workDate), workDateRaw: r.workDate ?? '', hours: fmt(r.hours), hoursRaw: Number(r.hours ?? 0),
    invoicedHours: fmt(r.invoicedHours), pendingHours: fmt(r.pendingHours), priceHour: fmt(r.priceHour),
    pendingAmount: fmt(r.pendingAmount), pendingAmountRaw: Number(r.pendingAmount ?? 0)
  }));
}
