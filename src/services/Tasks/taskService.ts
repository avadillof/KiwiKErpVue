import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';

export type TaskState = 'PLANIFICADA' | 'EN_CURSO' | 'FINALIZADA' | 'DESCARTADA';

export type TaskPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface TaskDTO {
  pkid: number | null;
  code: string;
  name: string;
  memo: string;
  state: TaskState;
  discardReason: string;
  priority: TaskPriority;
  dueDate: string | null;
  startDate: string | null;
  overdue?: boolean;
  userPkid: number | null;
  userName?: string;
  creatorPkid: number | null;
  creatorName?: string;
  entitiePkid: number | null;
  entitieName?: string;
  entitieCode?: string;
  contactPkid: number | null;
  contactName?: string;
  contactAuthorPkid?: number | null;
  estimatedHours: number | null;
  progress: number;
  position: number | null;
  priceHour: number | null;
  billable: boolean;
  billingState: string;
  totalHours?: number;
  dateUp?: string | null;
  updatedAt?: string | null;
  active?: boolean;
  attachmentCount?: number;
  pendingHours?: number;
  links?: TaskBillingLinkDTO[];
}

export interface TaskBillingLinkDTO {
  pkid: number | null;
  taskPkid: number | null;
  invoiceId: number | null;
  invoiceCode?: string;
  invoiceState?: string;
  hoursBilled?: number;
  createdAt?: string | null;
}

export interface TaskTimeDTO {
  pkid: number | null;
  taskPkid: number | null;
  userPkid: number | null;
  userName?: string;
  workDate: string | null;
  hours: number;
  memo: string;
  invoicedHours?: number;
}

export interface TaskCommentDTO {
  pkid: number | null;
  taskPkid: number | null;
  userPkid: number | null;
  userName?: string;
  createdAt?: string | null;
  text: string;
}

export const TASK_STATES: { value: TaskState; label: string; severity: string }[] = [
  { value: 'PLANIFICADA', label: 'Planificado', severity: 'info' },
  { value: 'EN_CURSO', label: 'Realizándose', severity: 'warn' },
  { value: 'FINALIZADA', label: 'Hecho', severity: 'success' },
  { value: 'DESCARTADA', label: 'Descartado', severity: 'danger' }
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; severity: string }[] = [
  { value: 'BAJA', label: 'Baja', severity: 'secondary' },
  { value: 'MEDIA', label: 'Media', severity: 'info' },
  { value: 'ALTA', label: 'Alta', severity: 'warn' },
  { value: 'URGENTE', label: 'Urgente', severity: 'danger' }
];

export function priorityOf(task: { priority?: string | null }): { label: string; severity: string } {
  return TASK_PRIORITIES.find((p) => p.value === task.priority)
    ?? { label: task.priority ?? 'Media', severity: 'info' };
}

export function emptyTask(): TaskDTO {
  return {
    pkid: null,
    code: '',
    name: '',
    memo: '',
    state: 'PLANIFICADA',
    discardReason: '',
    priority: 'MEDIA',
    dueDate: null,
    startDate: null,
    userPkid: null,
    creatorPkid: null,
    entitiePkid: null,
    contactPkid: null,
    estimatedHours: null,
    progress: 0,
    position: null,
    priceHour: null,
    billable: false,
    billingState: 'NO_FACTURABLE'
  };
}

export interface TaskQuery {
  query?: string;
  state?: string;
  states?: string;
  userPkid?: number | null;
  entitiePkid?: number | null;
  priority?: string;
  overdue?: boolean;
  updatedSince?: string;
  requesterPkid?: number | null;
  page?: number;
  size?: number;
}

export async function getTasksPage(params: TaskQuery): Promise<{ items: TaskDTO[]; total: number }> {
  const p: Record<string, any> = { page: params.page ?? 0, size: params.size ?? 500 };
  if (params.query) p.query = params.query;
  if (params.state) p.state = params.state;
  if (params.states) p.states = params.states;
  if (params.userPkid != null) p.userPkid = params.userPkid;
  if (params.entitiePkid != null) p.entitiePkid = params.entitiePkid;
  if (params.priority) p.priority = params.priority;
  if (params.overdue) p.overdue = true;
  if (params.updatedSince) p.updatedSince = params.updatedSince;
  if (params.requesterPkid != null) p.requesterPkid = params.requesterPkid;
  const { data } = await axios.get(backendUrl('/WebGetTasks'), { params: p });
  const content = (Array.isArray(data) ? data : (data?.content ?? [])) as TaskDTO[];
  return { items: content, total: Number(data?.totalElements ?? content.length) };
}

export async function getTasks(params: TaskQuery): Promise<TaskDTO[]> {
  return (await getTasksPage(params)).items;
}

export async function getTask(pkid: number, requesterPkid?: number | null): Promise<TaskDTO> {
  const p: Record<string, any> = { pkid };
  if (requesterPkid != null) p.requesterPkid = requesterPkid;
  const { data } = await axios.get(backendUrl('/WebGetTask'), { params: p });
  return data as TaskDTO;
}

export async function saveTask(task: TaskDTO): Promise<TaskDTO> {
  const { data } = await axios.post(backendUrl('/WebSaveTask'), task);
  return data as TaskDTO;
}

export async function deleteTask(pkid: number): Promise<void> {
  await axios.post(backendUrl('/WebDeleteTask'), { pkid });
}

export async function getTaskTimes(taskPkid: number, requesterPkid?: number | null): Promise<TaskTimeDTO[]> {
  try {
    const p: Record<string, any> = { taskPkid };
    if (requesterPkid != null) p.requesterPkid = requesterPkid;
    const { data } = await axios.get(backendUrl('/WebGetTaskTimes'), { params: p });
    return (Array.isArray(data) ? data : []) as TaskTimeDTO[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export async function saveTaskTime(entry: TaskTimeDTO): Promise<TaskTimeDTO> {
  const { data } = await axios.post(backendUrl('/WebSaveTaskTime'), entry);
  return data as TaskTimeDTO;
}

export async function deleteTaskTime(pkid: number): Promise<void> {
  await axios.post(backendUrl('/WebDeleteTaskTime'), { pkid });
}

export async function getTaskComments(taskPkid: number, requesterPkid?: number | null): Promise<TaskCommentDTO[]> {
  try {
    const p: Record<string, any> = { taskPkid };
    if (requesterPkid != null) p.requesterPkid = requesterPkid;
    const { data } = await axios.get(backendUrl('/WebGetTaskComments'), { params: p });
    return (Array.isArray(data) ? data : []) as TaskCommentDTO[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export async function saveTaskComment(entry: TaskCommentDTO): Promise<TaskCommentDTO> {
  const { data } = await axios.post(backendUrl('/WebSaveTaskComment'), entry);
  return data as TaskCommentDTO;
}

export async function saveTaskOrder(order: { pkid: number | null; state: string; position: number }[], requesterPkid?: number | null): Promise<number> {
  const { data } = await axios.post(backendUrl('/WebSaveTaskOrder'), { order, requesterPkid: requesterPkid ?? null });
  return Number(data?.updated ?? 0);
}

export async function getTaskStats(userPkid?: number | null): Promise<{ mine: number; overdue: number }> {
  const p: Record<string, any> = {};
  if (userPkid != null) p.userPkid = userPkid;
  const { data } = await axios.get(backendUrl('/WebGetTaskStats'), { params: p });
  return { mine: Number(data?.mine ?? 0), overdue: Number(data?.overdue ?? 0) };
}

export async function notifyOverdueTasks(userPkid?: number | null): Promise<{ overdue: number; notified: number }> {
  const { data } = await axios.post(backendUrl('/WebNotifyOverdueTasks'), { userPkid: userPkid ?? null });
  return { overdue: Number(data?.overdue ?? 0), notified: Number(data?.notified ?? 0) };
}

export function formatTaskDate(value: any): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export async function exportTaskTimesToExcel(tasks: TaskDTO[], companyName = '', requesterPkid?: number | null): Promise<number> {
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'KiwiKERP';
  wb.created = new Date();

  const ws = wb.addWorksheet('Resumen de tareas', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    headerFooter: { oddFooter: 'Página &P de &N' }
  });

  const KIWI = 'FF9CC10A';
  const KIWI_DARK = 'FF648506';
  const ALT = 'FFF4F7E8';
  const INK = 'FF253000';
  const GREY = 'FF687386';
  const thin = { style: 'thin' as const, color: { argb: 'FFD9DECB' } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const clients = [...new Set(tasks.map((t) => t.entitieName).filter(Boolean))];
  const scope = clients.length === 1 ? `Cliente: ${clients[0]}` : `Clientes: ${clients.length || 0}`;

  ws.mergeCells('A1:M1');
  const cTitle = ws.getCell('A1');
  cTitle.value = companyName || 'KiwiKERP';
  cTitle.font = { size: 16, bold: true, color: { argb: KIWI_DARK } };

  ws.mergeCells('A2:M2');
  const cSub = ws.getCell('A2');
  cSub.value = `Resumen de tareas asignadas — ${scope}`;
  cSub.font = { size: 12, bold: true, color: { argb: INK } };

  ws.mergeCells('A3:M3');
  const cMeta = ws.getCell('A3');
  cMeta.value = `Generado el ${todayStr} · ${tasks.length} tarea${tasks.length === 1 ? '' : 's'}`;
  cMeta.font = { size: 10, italic: true, color: { argb: GREY } };

  const headers = ['Código', 'Tarea', 'Estado', 'Prioridad', 'Avance %', 'Inicio', 'Vencimiento', 'Cliente', 'Responsable', 'Asignado a', 'Fecha', 'Horas', 'Comentario'];
  const headerRow = ws.getRow(5);
  headers.forEach((h, i) => {
    const c = headerRow.getCell(i + 1);
    c.value = h;
    c.font = { bold: true, color: { argb: INK } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KIWI } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = border;
  });
  headerRow.height = 22;

  let rowIdx = 6;
  let dataRows = 0;
  for (const t of tasks) {
    let times: TaskTimeDTO[] = [];
    if (t.pkid) {
      try {
        times = await getTaskTimes(t.pkid, requesterPkid);
      } catch {
        times = [];
      }
    }
    const entries: (TaskTimeDTO | null)[] = times.length ? times : [null];
    for (const e of entries) {
      const r = ws.getRow(rowIdx);
      const vals: any[] = [
        t.code, t.name, t.state, t.priority,
        Number(t.progress ?? 0) / 100,
        t.startDate ? new Date(String(t.startDate).slice(0, 10) + 'T00:00:00') : null,
        t.dueDate ? new Date(String(t.dueDate).slice(0, 10) + 'T00:00:00') : null,
        t.entitieName ?? '', t.creatorName ?? '', e?.userName ?? t.userName ?? t.contactName ?? '',
        e?.workDate ? new Date(String(e.workDate).slice(0, 10) + 'T00:00:00') : null,
        e ? Number(e.hours ?? 0) : null,
        e?.memo ?? ''
      ];
      vals.forEach((v, i) => {
        const c = r.getCell(i + 1);
        c.value = v;
        c.border = border;
        if (rowIdx % 2 === 0) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ALT } };
      });
      r.getCell(5).numFmt = '0%';
      r.getCell(5).alignment = { horizontal: 'center' };
      r.getCell(6).numFmt = 'DD/MM/YYYY';
      r.getCell(7).numFmt = 'DD/MM/YYYY';
      r.getCell(11).numFmt = 'DD/MM/YYYY';
      r.getCell(12).numFmt = '#,##0.00';
      r.getCell(12).alignment = { horizontal: 'right' };
      if (t.overdue) {
        r.getCell(7).font = { bold: true, color: { argb: 'FFC53030' } };
      }
      rowIdx++;
      dataRows++;
    }
  }

  const totalRow = ws.getRow(rowIdx);
  totalRow.getCell(1).value = 'TOTAL';
  totalRow.getCell(1).font = { bold: true, color: { argb: INK } };
  ws.mergeCells(`A${rowIdx}:K${rowIdx}`);
  const cTotal = totalRow.getCell(12);
  const firstData = 6;
  const lastData = rowIdx - 1;
  cTotal.value = lastData >= firstData ? { formula: `SUM(L${firstData}:L${lastData})` } : 0;
  cTotal.numFmt = '#,##0.00';
  cTotal.font = { bold: true, color: { argb: INK } };
  cTotal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: KIWI } };
  cTotal.border = border;
  cTotal.alignment = { horizontal: 'right' };
  totalRow.getCell(1).alignment = { horizontal: 'right' };
  totalRow.height = 20;

  ws.columns = [
    { width: 12 }, { width: 36 }, { width: 14 }, { width: 11 }, { width: 10 },
    { width: 13 }, { width: 13 }, { width: 28 }, { width: 20 }, { width: 22 }, { width: 13 }, { width: 9 }, { width: 44 }
  ];
  ws.views = [{ state: 'frozen', ySplit: 5 }];
  if (lastData >= firstData) ws.autoFilter = { from: 'A5', to: `M${lastData}` };

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tareas_resumen_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return dataRows;
}

export async function getBillingPending(requesterPkid?: number | null): Promise<TaskDTO[]> {
  try {
    const p: Record<string, any> = {};
    if (requesterPkid != null) p.requesterPkid = requesterPkid;
    const { data } = await axios.get(backendUrl('/WebGetBillingPending'), { params: p });
    return (Array.isArray(data) ? data : []) as TaskDTO[];
  } catch (e: any) {
    if (e?.response?.status === 404 || e?.response?.status === 204) return [];
    throw e;
  }
}

export async function linkTaskInvoice(taskPkid: number, invoiceId: number, hoursBilled: number): Promise<TaskBillingLinkDTO> {
  const { data } = await axios.post(backendUrl('/WebLinkTaskInvoice'), { taskPkid, invoiceId, hoursBilled });
  return data as TaskBillingLinkDTO;
}

export async function unlinkTaskInvoice(linkPkid: number): Promise<void> {
  await axios.post(backendUrl('/WebUnlinkTaskInvoice'), { pkid: linkPkid });
}

export function isTaskLocked(task: TaskDTO): boolean {
  return (task.links ?? []).length > 0;
}

export async function getUsers(): Promise<any[]> {
  try {
    const { data } = await axios.get(backendUrl('/WebGetUsers'), { params: { page: 0, size: 500 } });
    if (!data) return [];
    const content = Array.isArray(data) ? data : (data?.content ?? []);
    return content as any[];
  } catch (e: any) {
    if (e?.response?.status === 204 || e?.response?.status === 404) return [];
    throw e;
  }
}

export async function getContacts(entitieId: number): Promise<any[]> {
  const { data } = await axios.get(backendUrl('/WebGetContacts'), {
    params: { entitieId, page: 0, size: 200 }
  });
  const content = Array.isArray(data) ? data : (data?.content ?? []);
  return content as any[];
}
