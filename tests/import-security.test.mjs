import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as vue from 'vue';

function evaluate(source, dependencies) {
    const context = { exports: {}, require: name => {
        if (!(name in dependencies)) throw Error(name);
        return dependencies[name];
    }, defineEmits: () => () => {}, defineExpose: () => {} };
    vm.createContext(context);
    vm.runInContext(ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, context);
    return context.exports;
}
const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const permissions = evaluate(read('../src/services/Frm_Main/permissions.ts'), {});
const rules = evaluate(read('../src/services/importSecurity.ts'), { './Frm_Main/permissions': permissions });
const { PERM } = permissions;

for (const [resource, edit, specific] of [['entities', PERM.ENTI_GEN_EDIT, PERM.ENTI_GEN_IMPORT], ['products', PERM.PROD_EDIT, PERM.PROD_IMPORT]]) {
    test(`${resource}: importing requires editing AND its own specific permission`, () => {
        for (const [grants, expected] of [[[], false], [[edit], false], [[specific], false], [[edit, specific], true]]) {
            assert.equal(rules.canImportMasterData({ hasPermission: code => grants.includes(code) }, resource), expected);
        }
        assert.equal(rules.canImportMasterData({ hasPermission: () => true }, resource), true);
    });
}
test('entity import rights do not grant product import rights', () => {
    const grants = [PERM.ENTI_GEN_EDIT, PERM.ENTI_GEN_IMPORT, PERM.PROD_EDIT];
    const security = { hasPermission: code => grants.includes(code) };
    assert.equal(rules.canImportMasterData(security, 'entities'), true);
    assert.equal(rules.canImportMasterData(security, 'products'), false);
});

for (const [resource, path] of [['entities', '../src/views/Ventas/Frm_Clientes/EntityImportDialog.vue'], ['products', '../src/views/Frm_Products/ProductImportDialog.vue']]) {
    test(`${resource}: real dialog blocks opening and actions after permission revocation`, async () => {
        const scope = vue.effectScope();
        const granted = vue.ref(false);
        let calls = 0;
        const api = { catalogs: async () => { calls++; return {}; } };
        const services = { entityImportApi: api, productImportApi: api, importFields: [], productImportFields: [] };
        const source = read(path).split('<script setup lang="ts">')[1].split('</script>')[0];
        let dialog;
        scope.run(() => { dialog = evaluate(source + '\nexports.testDialog = { open, guard, visible, error };', {
            vue,
            '@/stores/securityStore': { useSecurityStore: () => ({ hasPermission: () => granted.value }) },
            '@/services/importSecurity': rules,
            '@/services/Frm_Main/permissions': permissions,
            '@/services/entityImport': services,
            '@/services/productImport': services,
        }).testDialog; });
        try {
            await dialog.open(); assert.equal(dialog.visible.value, false); assert.equal(calls, 0);
            granted.value = true; await dialog.open(); assert.equal(dialog.visible.value, true); assert.equal(calls, 1);
            granted.value = false; await dialog.guard(async () => { calls++; });
            assert.equal(calls, 1); assert.match(dialog.error.value, /No tienes permiso/);
        } finally { scope.stop(); }
    });
}
