import axios from 'axios';
import { backendUrl } from '../backendUrl';
import { useAuthStore } from '../../stores/authStore';
import type { LabelTemplate } from '../../libs/labels/labelTemplate';

const KEY = 'kiwik.labelTemplates.v1';
const url = (path = '') => backendUrl(`/WebLabelTemplates${path}`);
const config = () => ({ ...useAuthStore().portalRequestConfig(), timeout: 20000 });

export async function loadTemplates(): Promise<LabelTemplate[]> {
  const { data } = await axios.get<LabelTemplate[]>(url(), config());
  if (!Array.isArray(data)) throw new Error('Respuesta de plantillas no válida.');
  return data.map(template => ({ ...template, tipo: 'producto' }));
}
export async function upsertTemplate(template: LabelTemplate): Promise<LabelTemplate> {
  const { data } = await axios.post<LabelTemplate>(url(), { ...template, tipo: 'producto' }, config());
  return data;
}
export async function removeTemplate(template: LabelTemplate): Promise<void> {
  await axios.delete(url(`/${encodeURIComponent(template.id)}`), { ...config(), params: { version: template.version } });
}
/** Sólo se lee el almacenamiento anterior para una importación solicitada por el usuario. */
export function localTemplates(): LabelTemplate[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('La copia local de plantillas no es válida.');
  return data;
}
export async function importLocalTemplates(): Promise<LabelTemplate[]> {
  const { data } = await axios.post<LabelTemplate[]>(url('/import'), localTemplates(), config());
  // Conservar la copia local: no hay borrado ni fallback silencioso si falla el servidor.
  return data;
}
export function templateError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return 'El backend todavía no dispone del catálogo de plantillas. Despliega la versión actualizada.';
    if (typeof error.response?.data === 'string' && error.response.data.length < 500) return error.response.data;
    if (error.response?.status === 401) return 'Vuelve a iniciar sesión para acceder a las plantillas.';
    if (error.response?.status === 403) return 'No tienes permiso para esta operación de plantillas.';
    return 'No se ha podido completar la operación en base de datos. Comprueba la conexión y vuelve a cargar el catálogo.';
  }
  return error instanceof Error ? error.message : 'No se ha podido completar la operación de plantillas.';
}
