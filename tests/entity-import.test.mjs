import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as XLSX from 'xlsx';

const source = fs.readFileSync(new URL('../src/services/entityImport.ts', import.meta.url), 'utf8');
const posts = [];
const gets = [];
let authenticated = true;
const authConfig = { headers: { 'X-Portal-Session': 'test-session' } };
const context = { exports: {}, require: name => {
    if (name === 'axios') return { get: async (...args) => { gets.push(args); return { data: {} }; }, post: async (...args) => { posts.push(args); return { data: {} }; } };
    if (name === '@/stores/authStore') return { useAuthStore: () => ({ portalRequestConfig: () => {
        if (!authenticated) throw new Error('Inicia sesión.');
        return authConfig;
    } }) };
    if (name === './backendUrl') return { backendUrl: s => s };
    if (name === 'xlsx') return XLSX;
    throw Error(name);
}, Date };
vm.createContext(context);
vm.runInContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
const { suggestMapping, parseImportDate, buildImportRows, entityImportApi, downloadImportWorkbook } = context.exports;
const plain = value => JSON.parse(JSON.stringify(value));

test('matches accented headers and leaves ambiguous columns for explicit choice', () => {
    const map = suggestMapping(['Razón social', 'CIF', 'CP', 'Código cliente', 'Código proveedor']);
    assert.equal(map.name, 0); assert.equal(map.cif, 1); assert.equal(map.zipcode, 2); assert.equal(map.code, -1);
});
test('dates are validated strictly, including leap years and ambiguous formats', () => {
    assert.equal(parseImportDate('29/02/2024'), '2024-02-29');
    assert.equal(parseImportDate('2026-10-20'), '2026-10-20');
    for (const bad of ['29/02/2025', '31/04/2026', '10/20/26', '2026-13-01', '2026-00-01', '2026-02-30', '2026-1-2']) assert.throws(() => parseImportDate(bad));
});
test('preserves textual zeros and source row, maps false explicitly, keeps common commercial values', () => {
    const result = plain(buildImportRows([{ row: 18, values: ['0012', '08001', 'No', 'Contado'], issues: {} }], { code: 0, zipcode: 1, active: 2, salesTermId: 3 }, { isclient: true, purchasesTermId: 9 }, { active: { No: false }, salesTermId: { Contado: 3 } }));
    assert.deepEqual(result, [{ row: 18, data: { isclient: true, purchasesTermId: 9, code: '0012', zipcode: '08001', active: false, salesTermId: 3 }, issues: [] }]);
});
test('unmapped boolean/catalog values and mapped formula errors block the source row', () => {
    const result = buildImportRows([{ row: 12, values: ['Quizá', 'Pago raro', ''], issues: { 2: 'Fórmula sin resultado' } }], { active: 0, salesTermId: 1, name: 2 }, {}, {});
    assert.equal(result[0].issues.length, 3);
    assert.ok(result[0].issues.some(s => s.includes('Fórmula sin resultado')));
});
test('ignored cells do not block the import and invalid mapped dates do', () => {
    const row = { row: 9, values: ['Nombre', '31/02/2026', ''], issues: { 2: 'Error de Excel' } };
    assert.equal(buildImportRows([row], { name: 0 }, {}, {})[0].issues.length, 0);
    const mapped = buildImportRows([row], { name: 0, dateUp: 1 }, {}, {})[0];
    assert.equal(mapped.issues.length, 1); assert.equal(mapped.data.dateUp, '');
});
test('confirmation carries explicit skip/link decisions and target IDs', async () => {
    await entityImportApi.confirm({ id: 'batch-id', rows: [{ row_number: 18, decision: 'LINK', target_id: 42 }, { row_number: 19, decision: 'SKIP' }] }, true);
    assert.deepEqual(plain(posts.at(-1)), ['/WebEntityImports/batch-id/confirm', { partial: true, decisions: [{ row: 18, action: 'LINK', targetId: 42 }, { row: 19, action: 'SKIP' }] }, authConfig]);
});
test('all import operations transmit the current authenticated session', async () => {
    await entityImportApi.catalogs(); await entityImportApi.history(); await entityImportApi.detail('batch-id');
    await entityImportApi.preview({ rows: [] }); await entityImportApi.next('batch-id');
    for (const request of gets.slice(-3)) assert.deepEqual(plain(request.at(-1)), authConfig);
    for (const request of posts.slice(-2)) assert.deepEqual(plain(request.at(-1)), authConfig);
});
test('a missing session prevents unauthenticated import requests', async () => {
    const before = gets.length + posts.length;
    authenticated = false;
    try { await assert.rejects(entityImportApi.catalogs(), /Inicia sesión/); await assert.rejects(entityImportApi.preview({}), /Inicia sesión/); }
    finally { authenticated = true; }
    assert.equal(gets.length + posts.length, before);
});
test('exported user input remains string cells, including formula-like content', async t => {
    const path = new URL('../tmp/entity-import-export-check.xlsx', import.meta.url);
    t.after(() => fs.rmSync(path, { force: true }));
    await downloadImportWorkbook(path.pathname.replace(/^\/([A-Za-z]:)/, '$1'), ['Nombre', 'Código'], [['=HYPERLINK("bad")', '0012'], ['+SUM(1,2)', '@formula']]);
    const book = XLSX.read(fs.readFileSync(path), { type: 'buffer', cellFormula: true });
    const sheet = book.Sheets.Entidades;
    assert.equal(sheet.A2.t, 's'); assert.equal(sheet.A2.f, undefined); assert.equal(sheet.B2.v, '0012');
    assert.equal(sheet.A3.t, 's'); assert.equal(sheet.B3.t, 's');
});
