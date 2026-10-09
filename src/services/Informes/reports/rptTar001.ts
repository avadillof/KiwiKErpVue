import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';
import type { ReportColumn, ReportRow } from '../reportEngine';

/**
 * Descriptor del RPT-TAR-001 Listado de Tarifas y reglas.
 * Una fila por regla (alcance producto/familia/todos: precio fijo o
 * descuento por cantidad) y, si se pide, una fila por cliente asignado.
 * Sin endpoints nuevos: reutiliza el catálogo de precios y las entidades.
 */

export const RPT_TAR_001_CODE = 'RPT-TAR-001';
export const RPT_TAR_001_TITLE = 'Listado de Tarifas y reglas';

export interface Tar001Filters {
  tarifaId: number;
  includeClients: boolean;
  onlyWithRules: boolean;
}

export const TAR_001_COLUMNS: ReportColumn[] = [
  { key: 'tarifaCode', header: 'Tarifa' },
  { key: 'tarifa', header: 'Descripción' },
  { key: 'currency', header: 'Moneda' },
  { key: 'isDefault', header: 'Predet.', align: 'center' },
  { key: 'tipoTarifa', header: 'Tipo' },
  { key: 'alcance', header: 'Alcance' },
  { key: 'detalle', header: 'Detalle' },
  { key: 'minQty', header: 'Cant. mínima', align: 'right' },
  { key: 'calculo', header: 'Cálculo' },
  { key: 'valor', header: 'Valor', align: 'right' }
];

export const TAR_001_ORDER_FIELDS = [
  { label: 'Tarifa', value: 'tarifaCode' },
  { label: 'Alcance', value: 'alcance' },
  { label: 'Detalle', value: 'detalle' },
  { label: 'Cant. mínima', value: 'minQty' },
  { label: 'Cálculo', value: 'calculo' },
  { label: 'Valor', value: 'valor' }
];

const SCOPE_LABEL: Record<string, string> = { PRODUCT: 'Producto', FAMILY: 'Familia', ALL: 'Todos' };

function portalConfig() {
  try {
    return useAuthStore().portalRequestConfig();
  } catch {
    const err: any = new Error('portal');
    err.response = { data: 'Inicia sesión en el portal para consultar las tarifas.' };
    throw err;
  }
}

/** Opciones del filtro de tarifa: Todas + catálogo. */
export async function tarifaOptions(): Promise<Array<{ label: string; value: number }>> {
  const { data } = await axios.get(backendUrl('/WebSalesPriceLists'), {
    ...portalConfig(),
    params: { page: 0, size: 500 },
    timeout: 15000
  });
  const rows: any[] = Array.isArray(data?.content) ? data.content : Array.isArray(data?.rates) ? data.rates : [];
  return [
    { label: 'Todas', value: 0 },
    ...rows.map((r: any) => ({ label: `${r.code ?? ''} — ${r.description ?? ''}`, value: Number(r.id) }))
  ];
}

export function tar001FiltersText(f: Tar001Filters, tarifaLabel: string): string {
  return `Tarifa: ${tarifaLabel || 'Todas'} · Clientes: ${f.includeClients ? 'sí' : 'no'} · ${f.onlyWithRules ? 'Solo con reglas' : 'Con y sin reglas'}`;
}

const fmtQty = (v: unknown) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(Number(v) || 0);

/** Filas del informe con los filtros del formulario. */
export async function fetchTar001(f: Tar001Filters): Promise<ReportRow[]> {
  const config = portalConfig();

  const [catalogRes, listRes] = await Promise.all([
    axios.get(backendUrl('/WebSalesPricingCatalog'), { ...config, timeout: 15000 }),
    axios.get(backendUrl('/WebSalesPriceLists'), { ...config, params: { page: 0, size: 500 }, timeout: 15000 })
  ]);
  const catalog = catalogRes.data ?? {};
  const defaultTarifaId = catalog?.settings?.defaultTarifaId ?? null;
  const families = new Map<number, string>();
  for (const fam of catalog?.families ?? []) {
    if (fam?.id != null) families.set(Number(fam.id), String(fam.label ?? fam.description ?? ''));
  }
  const allRates: any[] = Array.isArray(listRes.data?.content)
    ? listRes.data.content
    : Array.isArray(listRes.data?.rates)
      ? listRes.data.rates
      : [];
  const rates = f.tarifaId ? allRates.filter((r: any) => Number(r.id) === Number(f.tarifaId)) : allRates;

  // Detalle (reglas) de cada tarifa.
  const details = new Map<number, any>();
  await Promise.allSettled(
    rates.map(async (r: any) => {
      try {
        const { data } = await axios.get(backendUrl(`/WebSalesPriceList/${r.id}`), { ...config, timeout: 15000 });
        if (data) details.set(Number(r.id), data);
      } catch {
        /* sin detalle: la tarifa sale sin reglas */
      }
    })
  );

  // Clientes por tarifa (detalle de entidad, como el RPT-CLI-001).
  const clientsByTarifa = new Map<number, Array<{ code: string; name: string }>>();
  if (f.includeClients) {
    try {
      const { data } = await axios.get(backendUrl('/WebGetClients'), {
        params: { page: 0, size: 2000 },
        timeout: 20000
      });
      const entities: any[] = Array.isArray(data?.content) ? data.content : [];
      await Promise.allSettled(
        entities.map(async (e: any) => {
          if (e?.pkid == null) return;
          try {
            const { data: det } = await axios.get(backendUrl('/WebGetClient'), {
              params: { pkid: e.pkid },
              timeout: 15000
            });
            const tarifaId = det?.salesAttributes?.salesTarifaId;
            if (tarifaId == null) return;
            const list = clientsByTarifa.get(Number(tarifaId)) ?? [];
            list.push({ code: String(e.code ?? ''), name: String(e.name ?? '') });
            clientsByTarifa.set(Number(tarifaId), list);
          } catch {
            /* sin detalle: no se asigna */
          }
        })
      );
    } catch {
      /* sin entidades: solo reglas */
    }
  }

  const rows: ReportRow[] = [];
  for (const r of rates) {
    const id = Number(r.id);
    const detail = details.get(id) ?? {};
    const rules: any[] = Array.isArray(detail.rules) ? detail.rules : [];
    if (f.onlyWithRules && !rules.length) continue;
    const calcs = new Set(rules.map((x: any) => String(x.calculation ?? '')));
    const tipoTarifa = !rules.length
      ? 'Sin reglas · precio base'
      : calcs.size === 1 && calcs.has('FIXED')
        ? 'Todo precio fijo'
        : calcs.size === 1 && calcs.has('DISCOUNT')
          ? 'Todo descuento'
          : 'Mixta';
    const base = {
      tarifaCode: String(r.code ?? ''),
      tarifa: String(r.description ?? ''),
      currency: String(r.currencyCode ?? ''),
      isDefault: defaultTarifaId != null && Number(defaultTarifaId) === id,
      tipoTarifa
    };
    if (!rules.length) {
      rows.push({ ...base, alcance: '—', detalle: 'Sin reglas: se aplica el precio base si la moneda coincide.', minQty: '', calculo: '', valor: '' });
    }
    for (const x of rules) {
      const scope = String(x.scope ?? 'ALL');
      const detalle = scope === 'PRODUCT'
        ? String(x.productLabel || '—')
        : scope === 'FAMILY'
          ? (families.get(Number(x.familyId)) || `Familia ${x.familyId ?? ''}`).trim() || '—'
          : 'Todos los productos y servicios';
      const calc = String(x.calculation ?? '');
      rows.push({
        ...base,
        alcance: SCOPE_LABEL[scope] ?? scope,
        detalle,
        minQty: Number(x.minQuantity) || 0,
        calculo: calc === 'FIXED' ? 'Precio fijo' : calc === 'DISCOUNT' ? 'Descuento' : calc,
        valor: calc === 'DISCOUNT' ? `${fmtQty(x.value)} %` : `${fmtQty(x.value)} ${String(r.currencyCode ?? '').trim()}`
      });
    }
    if (f.includeClients) {
      for (const c of clientsByTarifa.get(id) ?? []) {
        rows.push({ ...base, alcance: 'Cliente', detalle: `${c.code} — ${c.name}`, minQty: '', calculo: '', valor: '' });
      }
    }
  }
  return rows;
}
