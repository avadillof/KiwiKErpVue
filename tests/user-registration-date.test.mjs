import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ref, computed } from 'vue';

const source = fs.readFileSync(new URL('../src/views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue', import.meta.url), 'utf8')
    .split('<script setup lang="ts">')[1].split('</script>')[0]
    .replace(/^import [^\r\n]+/gm, '');

function setup(date) {
    const posts = [];
    const context = {
        exports: {}, ref, computed, console, Date, Tooltip: {},
        backendUrl: path => path,
        storeToRefs: () => ({}),
        useCompanyStore: () => ({ companyInfo: {} }),
        useAuthStore: () => ({ user: { pkid: 999 } }),
        useToast: () => ({ add() {} }),
        HelperString: { isValidEmail: () => true },
        defineEmits: () => () => {}, defineExpose() {},
        axios: {
            get: async url => ({ data: url.includes('Groups') ? [] : {
                pkid: 12, userDsCode: 'QA', name: 'Usuario QA', email: 'qa@example.test',
                groupKyId: 1, active: true, userDtDateUp: date
            } }),
            post: async (url, data) => posts.push(data)
        }
    };
    vm.createContext(context);
    vm.runInContext(ts.transpileModule(source + '\nglobalThis.api = { open, save, formData };', {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
    }).outputText, context);
    return { ...context.api, posts };
}

test('editar y guardar conserva la fecha original, incluida su hora', async () => {
    const date = '2021-02-15T00:00:00';
    const a = setup(date);
    await a.open(12);
    assert.equal(a.formData.value.userDtDateUp.getFullYear(), 2021);
    assert.equal(a.formData.value.userDtDateUp.getDate(), 15);
    a.formData.value.name = 'Nombre actualizado';
    await a.save();
    assert.equal(a.posts[0].userDtDateUp, date);
});

test('una fecha ausente no se sustituye por hoy al editar ni al guardar', async () => {
    const a = setup(null);
    await a.open(12);
    assert.equal(a.formData.value.userDtDateUp, null);
    await a.save();
    assert.equal(a.posts[0].userDtDateUp, null);
});

test('un alta conserva el día seleccionado sin convertirlo a UTC', async () => {
    const a = setup('2021-02-15T00:00:00');
    await a.open(12);
    await a.open();
    Object.assign(a.formData.value, {
        userDsCode: 'NEW', name: 'Nuevo', email: 'qa@example.test', groupKyId: 1,
        userDtDateUp: new Date(2020, 6, 3)
    });
    await a.save();
    assert.equal(a.posts[0].userDtDateUp, '2020-07-03T00:00:00');
});
