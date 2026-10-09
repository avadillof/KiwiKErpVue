import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

export interface Tas001Filters {
  dateFrom: Date | null; dateTo: Date | null; state: string; priority: string;
  userPkid: number; entitiePkid: number | null; entitieLabel: string;
  overdueOnly: boolean; includeArchived: boolean; query: string; requesterPkid?: number;
}

export const TAS_001_COLUMNS: ReportColumn[] = [
  { key: 'taskCode', header: 'Tarea' }, { key: 'taskName', header: 'Descripción' },
  { key: 'company', header: 'Cliente' }, { key: 'assignee', header: 'Responsable' },
  { key: 'state', header: 'Estado' }, { key: 'priority', header: 'Prioridad' },
  { key: 'startDate', header: 'Inicio' }, { key: 'dueDate', header: 'Vencimiento' },
  { key: 'estimatedHours', header: 'Previstas', align: 'right' },
  { key: 'workedHours', header: 'Realizadas', align: 'right' },
  { key: 'progress', header: 'Progreso', align: 'right' },
  { key: 'pendingHours', header: 'Pend. facturar', align: 'right' }
];
export const TAS_001_ORDER_FIELDS = [
  { label: 'Tarea', value: 'taskCode' }, { label: 'Descripción', value: 'taskName' },
  { label: 'Cliente', value: 'company' }, { label: 'Responsable', value: 'assignee' },
  { label: 'Estado', value: 'state' }, { label: 'Prioridad', value: 'priority' },
  { label: 'Vencimiento', value: 'dueDateRaw' }, { label: 'Horas realizadas', value: 'workedHoursRaw' }
];
const pad = (n: number) => String(n).padStart(2, '0');
const day = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (v: unknown) => v ? String(v).slice(0, 10).split('-').reverse().join('/') : '—';
const fmt = (v: unknown) => Number(v ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const labels: Record<string, string> = { PLANIFICADA: 'Planificada', EN_CURSO: 'En curso', FINALIZADA: 'Finalizada', DESCARTADA: 'Descartada' };

export function tas001FiltersText(f: Tas001Filters) {
  const dates = f.dateFrom && f.dateTo ? `${fmtDate(day(f.dateFrom))} - ${fmtDate(day(f.dateTo))}` : 'Sin límite';
  return `Periodo: ${dates} · Estado: ${labels[f.state] ?? 'Todos'} · Responsable: ${f.userPkid ? 'Seleccionado' : 'Todos'} · Cliente: ${f.entitieLabel || 'Todos'}${f.overdueOnly ? ' · Solo vencidas' : ''}`;
}
export async function fetchTas001(f: Tas001Filters): Promise<ReportRow[]> {
  const { data } = await axios.get(backendUrl('/WebGetTaskReportTracking'), { params: {
    dateFrom: f.dateFrom ? day(f.dateFrom) : undefined, dateTo: f.dateTo ? day(f.dateTo) : undefined,
    state: f.state === 'ALL' ? undefined : f.state, priority: f.priority === 'ALL' ? undefined : f.priority,
    userPkid: f.userPkid || undefined, entitiePkid: f.entitiePkid || undefined,
    overdueOnly: f.overdueOnly, includeArchived: f.includeArchived, query: f.query.trim() || undefined,
    requesterPkid: f.requesterPkid
  }});
  return (Array.isArray(data) ? data : []).map((r: any) => ({
    ...r, state: labels[r.state] ?? r.state, priority: ({ BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta', URGENTE: 'Urgente' } as any)[r.priority] ?? r.priority,
    startDate: fmtDate(r.startDate), dueDate: fmtDate(r.dueDate), dueDateRaw: r.dueDate ?? '',
    estimatedHours: fmt(r.estimatedHours), workedHours: fmt(r.workedHours), workedHoursRaw: Number(r.workedHours ?? 0),
    progress: `${fmt(r.progress)} %`, pendingHours: fmt(r.pendingHours), overdue: Boolean(r.overdue)
  }));
}
