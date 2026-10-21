import axios from 'axios';
import { backendUrl } from './backendUrl';
import { useAuthStore } from '@/stores/authStore';

export type ImportField = { key: string; label: string; aliases: string[]; catalog?: string };
export const importFields: ImportField[] = [
    { key: 'name', label: 'Nombre / razón social *', aliases: ['nombre', 'razon social', 'denominacion', 'cliente', 'proveedor'] },
    { key: 'cif', label: 'Identificación fiscal *', aliases: ['cif', 'nif', 'nie', 'identificacion fiscal', 'vat'] },
    { key: 'code', label: 'Código (vacío: generar)', aliases: ['codigo', 'codigo cliente', 'codigo proveedor', 'code'] },
    { key: 'isclient', label: '¿Cliente?', aliases: ['es cliente', 'isclient'] },
    { key: 'isprove', label: '¿Proveedor?', aliases: ['es proveedor', 'isprove'] },
    { key: 'dateUp', label: 'Fecha de alta *', aliases: ['fecha de alta', 'fecha alta'] },
    { key: 'salesTermId', label: 'Término de venta * para clientes', aliases: ['termino venta', 'condicion venta', 'forma pago cliente'], catalog: 'salesTerms' },
    { key: 'purchasesTermId', label: 'Término de compra * para proveedores', aliases: ['termino compra', 'condicion compra', 'forma pago proveedor'], catalog: 'purchaseTerms' },
    { key: 'purchasesTarifaId', label: 'Tarifa de compra * para proveedores', aliases: ['tarifa compra'], catalog: 'tariffs' },
    { key: 'address', label: 'Dirección', aliases: ['direccion', 'domicilio', 'direccion 1'] },
    { key: 'address2', label: 'Dirección adicional', aliases: ['direccion 2'] },
    { key: 'zipcode', label: 'Código postal', aliases: ['cp', 'codigo postal', 'postal'] },
    { key: 'city', label: 'Población', aliases: ['poblacion', 'municipio', 'localidad'] },
    { key: 'province', label: 'Provincia', aliases: ['provincia'] },
    { key: 'country', label: 'País', aliases: ['pais', 'country'] },
    { key: 'phone', label: 'Teléfono', aliases: ['telefono', 'movil', 'phone'] },
    { key: 'email', label: 'Correo electrónico', aliases: ['email', 'correo', 'correo electronico', 'e mail'] },
    { key: 'web', label: 'Web', aliases: ['web', 'sitio web', 'pagina web'] },
    { key: 'active', label: 'Activo', aliases: ['activo', 'active'] },
];
export const normalizeHeader = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function suggestMapping(headers: string[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (const f of importFields) {
        const matches = headers.map((h, i) => ({ h: normalizeHeader(h), i })).filter(({ h }) => f.aliases.includes(h));
        result[f.key] = matches.length === 1 ? matches[0]!.i : -1;
    }
    return result;
}
export function parseImportDate(value: string): string {
    let y: number, m: number, d: number;
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const spanish = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
    if (iso) [, y, m, d] = iso.map(Number) as [number, number, number, number];
    else if (spanish) { d = Number(spanish[1]); m = Number(spanish[2]); y = Number(spanish[3]); }
    else throw new Error('Fecha: usa dd/mm/aaaa o aaaa-mm-dd.');
    const date = new Date(Date.UTC(y, m - 1, d));
    if (y < 1900 || y > 9999 || date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) throw new Error('Fecha inválida.');
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export type SourceRow = { row: number; values: string[]; issues: Record<number, string>; numbers?: Record<number, number> };
export type CatalogOption = { id: number; label: string; parentId?: number };
export type Catalogs = Record<string, CatalogOption[]>;
export type ReviewRow = {
    row_number: number;
    data: Record<string, string | number | boolean>;
    review: { issues: string[]; candidates: { id: number; code: string; name: string; cif?: string; barcode?: string; canLink: boolean }[]; original: Record<string, unknown> };
    decision: 'CREATE' | 'LINK' | 'SKIP';
    target_id?: number | null;
    state: string;
    message: string;
    entity_id?: number;
};
export type ImportBatch = { id: string; filename: string; sheet_name: string; state: string; created_at: string; rows: ReviewRow[]; configuration: Record<string, unknown> };
export type HistoryItem = Omit<ImportBatch, 'rows' | 'configuration'>;
const sessionConfig = () => useAuthStore().portalRequestConfig();
export function createImportApi(resource: 'WebEntityImports' | 'WebProductImports') {
    const endpoint = (suffix = '') => backendUrl(`/${resource}${suffix}`);
    return {
    catalogs: async () => (await axios.get<Catalogs>(endpoint('/catalogs'), sessionConfig())).data,
    history: async () => (await axios.get<HistoryItem[]>(endpoint(), sessionConfig())).data,
    detail: async (id: string) => (await axios.get<ImportBatch>(endpoint(`/${id}`), sessionConfig())).data,
    preview: async (input: unknown) => (await axios.post<ImportBatch>(endpoint('/preview'), input, sessionConfig())).data,
    confirm: async (batch: ImportBatch, partial: boolean) => (await axios.post<ImportBatch>(endpoint(`/${batch.id}/confirm`), {
        partial, decisions: batch.rows.map(r => ({ row: r.row_number, action: r.decision, targetId: r.target_id })),
    }, sessionConfig())).data,
    next: async (id: string) => (await axios.post<ImportBatch>(endpoint(`/${id}/next`), {}, sessionConfig())).data,
    };
}
export const entityImportApi = createImportApi('WebEntityImports');

export function buildImportRows(rows: SourceRow[], mapping: Record<string, number>, defaults: Record<string, unknown>, equivalences: Record<string, Record<string, unknown>>, fields = importFields) {
    return rows.map(source => {
        const data: Record<string, unknown> = { ...defaults };
        const issues: string[] = [];
        for (const field of fields) {
            const index = mapping[field.key] ?? -1;
            if (index < 0) continue;
            const raw = (source.values[index] ?? '').trim();
            if (source.issues[index]) issues.push(`${field.label}: ${source.issues[index]}`);
            if (field.catalog || ['active', 'isclient', 'isprove', 'sale', 'purchase'].includes(field.key)) {
                const equivalent = equivalences[field.key]?.[raw];
                if (equivalent === undefined || equivalent === null || equivalent === '') issues.push(`${field.label}: falta relacionar «${raw || '(vacío)'}».`);
                else data[field.key] = equivalent;
            } else if (field.key === 'dateUp') {
                try { data.dateUp = parseImportDate(raw); } catch (e) { issues.push((e as Error).message); data.dateUp = ''; }
            } else data[field.key] = raw;
        }
        return { row: source.row, data, issues };
    });
}

export async function downloadImportWorkbook(filename: string, headers: string[], rows: unknown[][]) {
    const XLSX = await import('xlsx');
    // Explicit string cells prevent spreadsheet formula injection in user-supplied values.
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows.map(r => r.map(v => v == null ? '' : String(v)))]);
    sheet['!cols'] = headers.map(() => ({ wch: 28 }));
    const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, 'Entidades');
    XLSX.writeFile(book, filename);
}
