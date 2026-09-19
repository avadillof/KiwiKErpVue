import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import type { ReportColumn, ReportRow } from '../reportEngine';

/**
 * Descriptor del RPT-ART-001 Listado de Artículos y Servicios.
 * Columnas elegidas como las más importantes del maestro de artículos.
 */

export const RPT_ART_001_CODE = 'RPT-ART-001';
export const RPT_ART_001_TITLE = 'Listado de Artículos y Servicios';

export interface Art001Filters {
  family: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  sale: 'ALL' | 'SALE' | 'PURCHASE';
  active: 'ALL' | 'ACTIVE' | 'INACTIVE';
  deleted: 'NOT_DELETED' | 'ALL' | 'ONLY_DELETED';
}

export const ART_001_COLUMNS: ReportColumn[] = [
  { key: 'code', header: 'Código' },
  { key: 'description', header: 'Descripción' },
  { key: 'category', header: 'Categoría' },
  { key: 'family', header: 'Tipo' },
  { key: 'familiproduct', header: 'Familia' },
  { key: 'uom', header: 'U.M.' },
  { key: 'sale', header: 'Para Vender' },
  { key: 'purchase', header: 'Para Comprar' },
  { key: 'salePrice', header: 'Precio Venta' },
  { key: 'purchasePrice', header: 'Precio Compra' },
  { key: 'dateUp', header: 'Fecha Alta' },
  { key: 'saleTax', header: 'Impuesto Ventas' },
  { key: 'purchaseTax', header: 'Impuesto Compras' },
  { key: 'salesFlow', header: 'Flujo Venta' },
  { key: 'active', header: 'Estado' }
];

export const ART_001_ORDER_FIELDS = [
  { label: 'Descripción', value: 'description' },
  { label: 'Código', value: 'code' },
  { label: 'Categoría', value: 'category' },
  { label: 'Tipo', value: 'family' },
  { label: 'Familia', value: 'familiproduct' },
  { label: 'U.M.', value: 'uom' },
  { label: 'Para Vender', value: 'sale' },
  { label: 'Para Comprar', value: 'purchase' },
  { label: 'Precio Venta', value: 'salePriceRaw' },
  { label: 'Precio Compra', value: 'purchasePriceRaw' },
  { label: 'Fecha Alta', value: 'dateUpRaw' },
  { label: 'Impuesto Ventas', value: 'saleTax' },
  { label: 'Impuesto Compras', value: 'purchaseTax' },
  { label: 'Flujo Venta', value: 'salesFlow' },
  { label: 'Estado', value: 'active' },
  { label: 'Borrado', value: 'deleted' }
];

function buildArtQuery(f: Art001Filters, deletedValue: string): string {
  const parts: string[] = [];
  if (f.family.trim()) parts.push(f.family.trim());
  if (f.dateFrom && f.dateTo) {
    parts.push(`[dateUp],[${f.dateFrom.toISOString()}],[${f.dateTo.toISOString()}]`);
  }
  if (f.sale === 'SALE') parts.push('[sale],true');
  else if (f.sale === 'PURCHASE') parts.push('[purchase],true');
  if (f.active === 'ACTIVE') parts.push('[active],true');
  else if (f.active === 'INACTIVE') parts.push('[active],false');
  if (deletedValue === 'NOT_DELETED') parts.push('[deleted],false');
  else if (deletedValue === 'ONLY_DELETED') parts.push('[deleted],true');
  return parts.join(';');
}

const fmtPrice = (v: unknown) => {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDay = (v: unknown) => {
  if (!v) return '';
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** Catálogo de producto: impuestos, tipos comerciales (flujo heredado) y familias. */
let productCatalogCache: {
  saleTaxes: Map<number, string>;
  types: Map<number, { requireDelivery: boolean; invoicingPolicy: string }>;
  families: Array<{ label: string; value: string }>;
} | null = null;
async function productCatalog() {
  if (productCatalogCache) return productCatalogCache;
  productCatalogCache = { saleTaxes: new Map(), types: new Map(), families: [] };
  try {
    const { data } = await axios.get(backendUrl('/WebLoadProductCatalog'), { timeout: 15000 });
    for (const t of data?.salesTaxes ?? []) {
      if (t?.pkid != null) productCatalogCache.saleTaxes.set(Number(t.pkid), String(t.description ?? ''));
    }
    for (const t of data?.productCategoryTypes ?? []) {
      if (t?.pkid != null) {
        productCatalogCache.types.set(Number(t.pkid), {
          requireDelivery: Boolean(t.requireDelivery),
          invoicingPolicy: String(t.invoicingPolicy ?? 'ORDERED')
        });
      }
    }
    productCatalogCache.families = (data?.categories ?? [])
      .filter((c: any) => Number(c?.categoryTypeId) === 4)
      .map((c: any) => ({ label: String(c.description ?? ''), value: String(c.description ?? '') }))
      .sort((a: any, b: any) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
  } catch {
    /* sin catálogo: se muestra vacío */
  }
  return productCatalogCache;
}

/** Familias para el filtro (misma tabla de búsqueda que el maestro). */
export async function artFamilyOptions(): Promise<Array<{ label: string; value: string }>> {
  const catalog = await productCatalog();
  return [{ label: 'Todas', value: '' }, ...catalog.families];
}

/** Flujo de venta efectivo en abreviaturas: Alb:S/N · Ent/Ped. */
function salesFlowText(r: any, catalog: { types: Map<number, { requireDelivery: boolean; invoicingPolicy: string }> }): string {
  const type = r.categoryId != null ? catalog.types.get(Number(r.categoryId)) : undefined;
  const req = r.requireDeliveryOverride ?? type?.requireDelivery;
  const pol = r.invoicingPolicyOverride ?? type?.invoicingPolicy;
  if (req == null && pol == null) return '';
  return `Alb:${req ? 'S' : 'N'}·${pol === 'DELIVERED' ? 'Ent' : 'Ped'}`;
}

export function art001FiltersText(f: Art001Filters): string {
  const sales: Record<string, string> = { ALL: 'Todos', SALE: 'Para vender', PURCHASE: 'Para comprar' };
  const states: Record<string, string> = { ALL: 'Todos', ACTIVE: 'Activos', INACTIVE: 'Inactivos' };
  const dels: Record<string, string> = { NOT_DELETED: 'Sin borrar', ALL: 'Todos', ONLY_DELETED: 'Solo borrados' };
  return `Familia: ${f.family.trim() || 'Todas'} · Alta: ${fmtDay(f.dateFrom)} – ${fmtDay(f.dateTo)} · ${sales[f.sale]} · ${states[f.active]} · Borrados: ${dels[f.deleted]}`;
}

/** Filas del informe con los filtros del formulario. */
export async function fetchArt001(f: Art001Filters): Promise<ReportRow[]> {
  // "Todos" en borrados trae no borrados + borrados y los une.
  const deletedModes = f.deleted === 'ALL' ? ['NOT_DELETED', 'ONLY_DELETED'] : [f.deleted];
  const seen = new Set<number>();
  const merged: any[] = [];
  for (const mode of deletedModes) {
    const { data } = await axios.get(backendUrl('/WebGetProducts'), {
      params: { page: 0, size: 2000, query: buildArtQuery(f, mode) || undefined },
      timeout: 20000
    });
    const rows: any[] = Array.isArray(data?.content) ? data.content : [];
    for (const r of rows) {
      if (r?.pkid == null || seen.has(r.pkid)) continue;
      seen.add(r.pkid);
      merged.push({ ...r, __deleted: mode === 'ONLY_DELETED' });
    }
  }
  const catalog = await productCatalog();
  return merged.map((r) => ({
    code: String(r.code ?? ''),
    description: String(r.description ?? ''),
    category: String(r.category ?? ''),
    family: String(r.family ?? ''),
    familiproduct: String(r.familiproduct ?? ''),
    uom: String(r.uom ?? ''),
    sale: Boolean(r.sale),
    purchase: Boolean(r.purchase),
    salePrice: fmtPrice(r.salePrice),
    salePriceRaw: r.salePrice == null || r.salePrice === '' ? '' : Number(r.salePrice),
    purchasePrice: fmtPrice(r.purchasePrice),
    purchasePriceRaw: r.purchasePrice == null || r.purchasePrice === '' ? '' : Number(r.purchasePrice),
    dateUp: fmtDay(r.dateUp),
    dateUpRaw: String(r.dateUp ?? ''),
    saleTax: r.saleTaxId != null ? (catalog.saleTaxes.get(Number(r.saleTaxId)) ?? '') : '',
    purchaseTax: r.purchaseTaxId != null ? (catalog.saleTaxes.get(Number(r.purchaseTaxId)) ?? '') : '',
    salesFlow: salesFlowText(r, catalog),
    active: Boolean(r.active),
    deleted: Boolean(r.__deleted)
  }));
}
