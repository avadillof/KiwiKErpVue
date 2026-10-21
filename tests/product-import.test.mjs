import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as vue from 'vue';

const calls = [];
const auth = { headers: { 'X-Portal-Session': 'product-test-session' } };
function load(path, dependencies) {
    const context = { exports: {}, require: name => {
        if (!(name in dependencies)) throw Error(name);
        return dependencies[name];
    }, Date };
    vm.createContext(context);
    vm.runInContext(ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
    return context.exports;
}
const common = load('../src/services/entityImport.ts', {
    axios: Object.fromEntries(['get', 'post'].map(method => [method, async (...args) => { calls.push([method, ...args]); return { data: {} }; }])),
    './backendUrl': { backendUrl: path => path },
    '@/stores/authStore': { useAuthStore: () => ({ portalRequestConfig: () => auth }) },
});
const productServices = load('../src/services/productImport.ts', { './entityImport': common });
const { parseProductPrice, suggestProductMapping, suggestFamilyEquivalences, buildProductImportRows, productImportApi } = productServices;
const plain = value => JSON.parse(JSON.stringify(value));

test('maps product aliases without confusing description with commercial classification', () => {
    const map = suggestProductMapping(['Descripción', 'SKU', 'EAN', 'Familia', 'Tipo logístico', 'Tipo comercial', 'Precio venta']);
    assert.equal(map.name, 0); assert.equal(map.code, 1); assert.equal(map.barcode, 2);
    assert.equal(map.familyId, 3); assert.equal(map.productCategoryId, 4); assert.equal(map.categoryId, 5); assert.equal(map.salePrice, 6);
    assert.equal(suggestProductMapping(['Código', 'SKU']).code, -1);
});
test('parses Spanish monetary text, preserving six decimals and rejecting ambiguity', () => {
    for (const [raw, expected] of [['1.234,56', '1234.56'], ['12,345678', '12.345678'], ['1.000', '1000'], ['0', '0'], ['', '0']]) assert.equal(parseProductPrice(raw), expected);
    for (const bad of ['12.50', '1,234.56', '-1', '12 €', 'NaN', 'Infinity', '0,1234567', '1.000.000.000']) assert.throws(() => parseProductPrice(bad));
});
test('numeric Excel prices are interpreted from raw cells independently of workbook display locale', () => {
    const result = buildProductImportRows([{ row: 11, values: ['12.50', '0012345678901', '0004'], numbers: { 0: 12.5 }, issues: {} }], { salePrice: 0, barcode: 1, code: 2 }, { purchasePrice: '1,25' }, {});
    assert.equal(result[0].data.salePrice, '12.5'); assert.equal(result[0].data.purchasePrice, '1.25');
    assert.equal(result[0].data.barcode, '0012345678901'); assert.equal(result[0].data.code, '0004'); assert.equal(result[0].row, 11);
    assert.equal(result[0].issues.length, 0);
});
test('does not silently round numeric Excel prices beyond six decimals', () => {
    const result = buildProductImportRows([{ row: 2, values: ['0.1234567'], numbers: { 0: 0.1234567 }, issues: {} }], { salePrice: 0 }, { purchasePrice: '0' }, {});
    assert.equal(result[0].issues.length, 1);
});
test('applies explicit product catalog and boolean equivalents, allowing no optional tax', () => {
    const result = plain(buildProductImportRows([{ row: 5, values: ['Pieza', 'Unidades', 'No', ''], issues: {} }], { name: 0, uomId: 1, purchase: 2, saleTaxId: 3 }, { sale: true, salePrice: '10', purchasePrice: '0' }, { uomId: { Unidades: 8 }, purchase: { No: false }, saleTaxId: { '': 0 } }));
    assert.equal(result[0].data.name, 'Pieza'); assert.equal(result[0].data.uomId, 8); assert.equal(result[0].data.purchase, false); assert.equal(result[0].data.saleTaxId, 0); assert.equal(result[0].issues.length, 0);
});
test('preserves mapped formula failures and unknown classifications as row issues', () => {
    const result = buildProductImportRows([{ row: 7, values: ['Desconocido', '0'], issues: { 1: 'Fórmula sin valor' } }], { familyId: 0, salePrice: 1 }, { purchasePrice: '0' }, {});
    assert.equal(result[0].issues.length, 2);
});
test('product import operations use their own authenticated endpoints', async () => {
    await productImportApi.catalogs(); await productImportApi.history(); await productImportApi.preview({ rows: [] });
    await productImportApi.confirm({ id: 'product-batch', rows: [{ row_number: 3, decision: 'CREATE' }] }, false);
    await productImportApi.next('product-batch');
    for (const call of calls) { assert.ok(call[1].startsWith('/WebProductImports')); assert.deepEqual(plain(call.at(-1)), auth); }
    assert.deepEqual(plain(calls[3][2]), { partial: false, decisions: [{ row: 3, action: 'CREATE' }] });
});

test('suggests existing families, creates unknown names only with family editing permission', () => {
    const families = [{ id: 5, label: 'Bebidas' }];
    assert.deepEqual(plain(suggestFamilyEquivalences(['BEBIDAS', 'Pruebas', ''], families, true)), { BEBIDAS: 5, Pruebas: 'CREATE', '': 0 });
    assert.deepEqual(plain(suggestFamilyEquivalences(['Pruebas'], families, false)), { Pruebas: null });
    assert.equal(suggestFamilyEquivalences(['Bebidas'], [...families, { id: 6, label: 'bebidas' }], true).Bebidas, null);
});
test('new families carry their Excel name separately from the database family ID', () => {
    const result = buildProductImportRows([{ row: 3, values: ['Pruebas'], issues: {} }], { familyId: 0 }, { salePrice: '0', purchasePrice: '0' }, { familyId: { Pruebas: 'CREATE' } });
    assert.equal(result[0].data.familyId, 0); assert.equal(result[0].data.familyName, 'Pruebas'); assert.equal(result[0].issues.length, 0);
});
test('never creates an unnamed family or overrides a selected existing family', () => {
    const missing = buildProductImportRows([{ row: 3, values: [''], issues: {} }], { familyId: 0 }, { salePrice: '0', purchasePrice: '0' }, { familyId: { '': 'CREATE' } });
    assert.match(missing[0].issues[0], /sin nombre/);
    const existing = buildProductImportRows([{ row: 4, values: ['Bebidas'], issues: {} }], { familyId: 0 }, { salePrice: '0', purchasePrice: '0' }, { familyId: { Bebidas: 5 } });
    assert.equal(existing[0].data.familyId, 5); assert.equal(existing[0].data.familyName, undefined);
});

test('the actual dialog proposes creating missing families and removes that choice when permission is revoked', async () => {
    const scope = vue.effectScope();
    const allowed = vue.ref(true);
    const source = fs.readFileSync(new URL('../src/views/Frm_Products/ProductImportDialog.vue', import.meta.url), 'utf8').split('<script setup lang="ts">')[1].split('</script>')[0];
    const dependencies = {
        vue,
        '@/services/entityImport': common,
        '@/services/productImport': productServices,
        '@/services/importSecurity': { canImportMasterData: () => true },
        '@/stores/securityStore': { useSecurityStore: () => ({ hasPermission: () => allowed.value }) },
        '@/services/Frm_Main/permissions': { PERM: { FAM_EDIT: 'PROSER_GEN_0006' } },
    };
    const context = { exports: {}, require: name => {
        if (!(name in dependencies)) throw Error(name);
        return dependencies[name];
    }, defineEmits: () => () => {}, defineExpose: () => {} };
    vm.createContext(context);
    scope.run(() => vm.runInContext(ts.transpileModule(source + '\nexports.dialog = { mapping, sourceRows, catalogs, equivalences, pendingFamilyNames, optionsFor };', { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, context));
    try {
        const dialog = context.exports.dialog;
        dialog.catalogs.value = { families: [{ id: 5, label: 'Bebidas' }] };
        dialog.sourceRows.value = [{ row: 2, values: ['Pruebas'], issues: {} }, { row: 3, values: ['Bebidas'], issues: {} }];
        dialog.mapping.value = { familyId: 0 };
        await vue.nextTick();
        assert.deepEqual(plain(dialog.equivalences.value.familyId), { Pruebas: 'CREATE', Bebidas: 5 });
        assert.deepEqual(plain(dialog.pendingFamilyNames.value), ['Pruebas']);
        allowed.value = false; await vue.nextTick();
        assert.equal(dialog.equivalences.value.familyId.Pruebas, null);
        assert.equal(dialog.equivalences.value.familyId.Bebidas, 5);
        assert.ok(!dialog.optionsFor({ key: 'familyId', catalog: 'families' }).some(o => o.id === 'CREATE'));
    } finally { scope.stop(); }
});
