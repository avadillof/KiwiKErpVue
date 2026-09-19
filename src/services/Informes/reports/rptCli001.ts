import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import { formatDay, type ReportColumn, type ReportRow } from '../reportEngine';

/**
 * Descriptor del RPT-CLI-001 Listado General de Entidades.
 * Cada informe futuro seguirá esta forma: código, título, columnas,
 * campos ordenables, filtros y obtención de filas. La vista solo orquesta.
 */

export const RPT_CLI_001_CODE = 'RPT-CLI-001';
export const RPT_CLI_001_TITLE = 'Listado General de Entidades';

export interface Cli001Filters {
  dateFrom: Date | null;
  dateTo: Date | null;
  kind: 'ALL' | 'CLIENTS' | 'SUPPLIERS';
  active: 'ALL' | 'ACTIVE' | 'INACTIVE';
  deleted: 'NOT_DELETED' | 'ALL' | 'ONLY_DELETED';
}

export const CLI_001_COLUMNS: ReportColumn[] = [
  { key: 'code', header: 'Código' },
  { key: 'name', header: 'Nombre' },
  { key: 'cif', header: 'NIF' },
  { key: 'dateUp', header: 'Fecha Alta' },
  { key: 'tarifa', header: 'Tarifa Ventas' },
  { key: 'cobro', header: 'Condición Cobro' },
  { key: 'retencion', header: 'Retención' },
  { key: 'province', header: 'Provincia' },
  { key: 'zip', header: 'C.P.' },
  { key: 'country', header: 'País' },
  { key: 'isclient', header: 'Cliente' },
  { key: 'isprove', header: 'Proveedor' },
  { key: 'active', header: 'Activo' },
  { key: 'deleted', header: 'Borrado' }
];

export const CLI_001_ORDER_FIELDS = [
  { label: 'Nombre', value: 'name' },
  { label: 'Código', value: 'code' },
  { label: 'NIF', value: 'cif' },
  { label: 'Fecha Alta', value: 'dateUpRaw' },
  { label: 'Tarifa Ventas', value: 'tarifa' },
  { label: 'Condición Cobro', value: 'cobro' },
  { label: 'Retención', value: 'retencion' },
  { label: 'Provincia', value: 'province' },
  { label: 'C.P.', value: 'zip' },
  { label: 'País', value: 'country' },
  { label: 'Cliente', value: 'isclient' },
  { label: 'Proveedor', value: 'isprove' },
  { label: 'Activo', value: 'active' },
  { label: 'Borrado', value: 'deleted' }
];

function buildCliQuery(f: Cli001Filters, deletedValue: string): string {
  const parts: string[] = [];
  if (f.dateFrom && f.dateTo) {
    parts.push(`[dateUp],[${f.dateFrom.toISOString()}],[${f.dateTo.toISOString()}]`);
  }
  if (f.kind === 'CLIENTS') parts.push('[entitieBolClient],true');
  else if (f.kind === 'SUPPLIERS') parts.push('[entitieBolProve],true');
  if (f.active === 'ACTIVE') parts.push('[entitieBolActive],true');
  else if (f.active === 'INACTIVE') parts.push('[entitieBolActive],false');
  if (deletedValue === 'NOT_DELETED') parts.push('[entitieBolDeleted],false');
  else if (deletedValue === 'ONLY_DELETED') parts.push('[entitieBolDeleted],true');
  return parts.join(';');
}

/** Catálogo de ventas (tarifas y condiciones de cobro) para describir los códigos. */
let catalogCache: { tarifas: Map<number, string>; terms: Map<number, string>; retentions: Map<number, string> } | null = null;
async function salesCatalog() {
  if (catalogCache) return catalogCache;
  catalogCache = { tarifas: new Map(), terms: new Map(), retentions: new Map() };
  try {
    const { data } = await axios.get(backendUrl('/loadSalesCatalog'), { timeout: 15000 });
    for (const t of data?.tarifas ?? []) {
      if (t?.salesTarifasPkId != null) catalogCache.tarifas.set(Number(t.salesTarifasPkId), String(t.salesTarifasDsCode ?? ''));
    }
    for (const t of data?.terms ?? []) {
      if (t?.id != null) catalogCache.terms.set(Number(t.id), String(t.descriptionEs ?? ''));
    }
    for (const t of data?.retentions ?? []) {
      if (t?.id != null) catalogCache.retentions.set(Number(t.id), String(t.description ?? ''));
    }
  } catch {
    /* sin catálogo: se muestra vacío */
  }
  return catalogCache;
}

export function cli001FiltersText(f: Cli001Filters): string {
  const kinds: Record<string, string> = { ALL: 'Todos', CLIENTS: 'Clientes', SUPPLIERS: 'Proveedores' };
  const states: Record<string, string> = { ALL: 'Todos', ACTIVE: 'Activos', INACTIVE: 'Inactivos' };
  const dels: Record<string, string> = { NOT_DELETED: 'Sin borrar', ALL: 'Todos', ONLY_DELETED: 'Solo borrados' };
  const fmt = (d: Date | null) =>
    d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '—';
  return `Alta: ${fmt(f.dateFrom)} – ${fmt(f.dateTo)} · ${kinds[f.kind]} · ${states[f.active]} · Borrados: ${dels[f.deleted]}`;
}

/** Filas del informe con los filtros del formulario. */
export async function fetchCli001(f: Cli001Filters): Promise<ReportRow[]> {
  // "Todos" en borrados trae no borrados + borrados y los une.
  const deletedModes = f.deleted === 'ALL' ? ['NOT_DELETED', 'ONLY_DELETED'] : [f.deleted];
  const seen = new Set<number>();
  const merged: any[] = [];
  for (const mode of deletedModes) {
    const { data } = await axios.get(backendUrl('/WebGetClients'), {
      params: { page: 0, size: 2000, query: buildCliQuery(f, mode) || undefined },
      timeout: 20000
    });
    const rows: any[] = Array.isArray(data?.content) ? data.content : [];
    for (const r of rows) {
      if (r?.pkid == null || seen.has(r.pkid)) continue;
      seen.add(r.pkid);
      merged.push({ ...r, __deleted: mode === 'ONLY_DELETED' });
    }
  }
  const catalog = await salesCatalog();
  // El listado no trae salesAttributes: se pide el detalle por entidad.
  const details = new Map<number, any>();
  await Promise.allSettled(
    merged.map(async (r) => {
      try {
        const { data } = await axios.get(backendUrl('/WebGetClient'), { params: { pkid: r.pkid }, timeout: 15000 });
        if (data) details.set(Number(r.pkid), data);
      } catch {
        /* sin detalle: se muestra vacío en tarifa/cobro */
      }
    })
  );
  return merged.map((r) => {
    const det = details.get(Number(r.pkid)) ?? r;
    return {
      code: String(r.code ?? ''),
      name: String(r.name ?? ''),
      cif: String(r.cif ?? ''),
      dateUp: formatDay(r.dateUp),
      dateUpRaw: String(r.dateUp ?? ''),
      tarifa: det.salesAttributes?.salesTarifaId != null ? (catalog.tarifas.get(Number(det.salesAttributes.salesTarifaId)) ?? '') : '',
      cobro: det.salesAttributes?.salesTermId != null ? (catalog.terms.get(Number(det.salesAttributes.salesTermId)) ?? '') : '',
      retencion: det.salesAttributes?.retentionId != null ? (catalog.retentions.get(Number(det.salesAttributes.retentionId)) ?? '') : '',
      province: String(det.province ?? r.province ?? ''),
      zip: String(det.zipcode ?? r.zipcode ?? ''),
      country: String(det.country ?? r.country ?? ''),
      isclient: Boolean(r.isclient),
      isprove: Boolean(r.isprove),
      active: Boolean(r.active),
      deleted: Boolean(r.__deleted)
    };
  });
}
