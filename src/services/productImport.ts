import { buildImportRows, createImportApi, normalizeHeader } from './entityImport';
import type { ImportField, SourceRow } from './entityImport';

export function suggestFamilyEquivalences(values: string[], families: { id: number; label: string }[], canCreate: boolean): Record<string, number | string | null> {
    const choices: Record<string, number | string | null> = {};
    for (const value of values) {
        const name = value.trim();
        const matches = families.filter(f => f.label.trim().toLocaleLowerCase('es') === name.toLocaleLowerCase('es'));
        choices[name] = !name ? 0 : matches.length === 1 ? matches[0]!.id : matches.length > 1 ? null : canCreate ? 'CREATE' : null;
    }
    return choices;
}

export const productImportApi = createImportApi('WebProductImports');
export const productImportFields: ImportField[] = [
    { key: 'name', label: 'Descripción *', aliases: ['descripcion', 'nombre', 'articulo', 'producto', 'descripcion espanol'] },
    { key: 'descriptionEn', label: 'Descripción en inglés *', aliases: ['descripcion ingles', 'descripcion en ingles', 'description en', 'english description'] },
    { key: 'code', label: 'Código (vacío: generar)', aliases: ['codigo', 'referencia', 'codigo articulo', 'codigo producto', 'sku'] },
    { key: 'barcode', label: 'Código de barras', aliases: ['codigo de barras', 'codigo barras', 'ean', 'ean13', 'barcode'] },
    { key: 'productCategoryId', label: 'Tipo logístico *', aliases: ['tipo logistico', 'clase'], catalog: 'productCategories' },
    { key: 'categoryId', label: 'Tipo comercial *', aliases: ['tipo comercial', 'categoria'], catalog: 'categoryTypes' },
    { key: 'familyId', label: 'Familia', aliases: ['familia'], catalog: 'families' },
    { key: 'uomId', label: 'Unidad de venta *', aliases: ['unidad de venta', 'unidad venta', 'unidad', 'um'], catalog: 'units' },
    { key: 'uomIdPurchases', label: 'Unidad de compra *', aliases: ['unidad de compra', 'unidad compra'], catalog: 'units' },
    { key: 'salePrice', label: 'Precio base de venta (sin impuestos)', aliases: ['precio venta', 'precio de venta', 'precio base venta', 'pvp'] },
    { key: 'purchasePrice', label: 'Precio base de compra (sin impuestos)', aliases: ['precio compra', 'precio de compra', 'coste', 'costo'] },
    { key: 'saleTaxId', label: 'Impuesto de venta', aliases: ['impuesto venta', 'iva venta', 'iva'], catalog: 'taxes' },
    { key: 'purchaseTaxId', label: 'Impuesto de compra', aliases: ['impuesto compra', 'iva compra'], catalog: 'taxes' },
    { key: 'sale', label: 'Para vender', aliases: ['para vender', 'venta', 'vendible'] },
    { key: 'purchase', label: 'Para comprar', aliases: ['para comprar', 'compra', 'comprable'] },
    { key: 'active', label: 'Activo', aliases: ['activo', 'active'] },
    { key: 'dateUp', label: 'Fecha de alta *', aliases: ['fecha alta', 'fecha de alta'] },
];

export function suggestProductMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};
    for (const f of productImportFields) {
        const indices = headers.map((h, i) => ({ h: normalizeHeader(h), i })).filter(v => f.aliases.includes(v.h));
        mapping[f.key] = indices.length === 1 ? indices[0]!.i : -1;
    }
    return mapping;
}

/** Text prices use Spanish separators; numeric Excel cells are formatted by the reader. */
export function parseProductPrice(value: unknown): string {
    const raw = String(value ?? '').trim();
    if (!raw) return '0';
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,6})?$/.test(raw)) {
        throw new Error('Usa importes como 1.234,56, sin símbolo de moneda y con hasta seis decimales.');
    }
    const normalized = raw.replaceAll('.', '').replace(',', '.');
    if (Number(normalized) > 999999999.999999) throw new Error('El precio supera el máximo admitido.');
    return normalized;
}

export function buildProductImportRows(rows: SourceRow[], mapping: Record<string, number>, defaults: Record<string, unknown>, equivalences: Record<string, Record<string, unknown>>) {
    const familyColumn = mapping.familyId ?? -1;
    const preparedEquivalences = { ...equivalences, familyId: { ...equivalences.familyId } };
    // CREATE is a UI choice, never a database identifier.
    for (const [name, decision] of Object.entries(preparedEquivalences.familyId)) if (decision === 'CREATE') preparedEquivalences.familyId[name] = 0;
    const formattedRows = rows.map(row => {
        const values = [...row.values];
        for (const key of ['salePrice', 'purchasePrice']) {
            const index = mapping[key] ?? -1;
            const number = row.numbers?.[index];
            if (number !== undefined) values[index] = number.toLocaleString('es-ES', { useGrouping: false, maximumFractionDigits: 20 });
        }
        return { ...row, values };
    });
    const result = buildImportRows(formattedRows, mapping, defaults, preparedEquivalences, productImportFields);
    for (const [i, row] of result.entries()) {
        const family = familyColumn >= 0 ? (rows[i]?.values[familyColumn] ?? '').trim() : '';
        if (familyColumn >= 0 && equivalences.familyId?.[family] === 'CREATE') {
            if (family) row.data.familyName = family;
            else row.issues.push('Familia: no se puede crear una familia sin nombre.');
        }
        for (const key of ['salePrice', 'purchasePrice']) {
            try { row.data[key] = parseProductPrice(row.data[key]); }
            catch (e) { row.issues.push(`${key === 'salePrice' ? 'Precio de venta' : 'Precio de compra'}: ${(e as Error).message}`); }
        }
    }
    return result;
}
