import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/views/Ventas/Frm_Pedidos/MaintenanceCompletionDialog.vue', import.meta.url), 'utf8')
  .split('<script setup lang="ts">')[1].split('</script>')[0]
  .replace(/import\s+[\s\S]*?from\s*['"][^'"]+['"];?/g, '');

function setup(post, session = () => ({ headers: { 'X-Portal-Session': 'isolated-test-token' } })) {
  const events = [];
  const context = {
    exports: {}, ref: value => ({ value }), computed: fn => ({ get value() { return fn(); } }),
    axios: { post }, backendUrl: path => path,
    useAuthStore: () => ({ user: { userDsCode: 'test' }, portalRequestConfig: session }),
    defineEmits: () => event => events.push(event), defineExpose: () => {},
  };
  vm.createContext(context);
  vm.runInContext(ts.transpileModule(source + ';globalThis.api = {save, selected, reason, date, orderId, busy, visible, error};', {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, context);
  const api = context.api;
  api.selected.value = [{ pkid: 7 }];
  api.reason.value = 'Incluido en mantenimiento anual';
  api.date.value = new Date(2026, 10, 5);
  api.orderId.value = 1;
  api.visible.value = true;
  return { api, events };
}

test('completion sends authenticated session and bounded timeout with selected date', async () => {
  let request;
  const { api, events } = setup(async (...args) => { request = args; });
  await api.save();
  assert.equal(request[0], '/WebCompleteSalesOrderMaintenance/1');
  assert.equal(request[1].performedDate, '2026-11-05');
  assert.equal(request[2].headers['X-Portal-Session'], 'isolated-test-token');
  assert.equal(request[2].timeout, 20000);
  assert.equal(api.visible.value, false);
  assert.deepEqual(events, ['saved']);
});

test('timeout releases the form and preserves inputs for a safe retry', async () => {
  const { api, events } = setup(async () => { throw new Error('timeout'); });
  await api.save();
  assert.equal(api.busy.value, false);
  assert.equal(api.visible.value, true);
  assert.equal(api.selected.value[0].pkid, 7);
  assert.equal(api.reason.value, 'Incluido en mantenimiento anual');
  assert.match(api.error.value, /reintentar/);
  assert.equal(events.length, 0);
});

test('expired session blocks submission and a double click sends only once', async () => {
  let count = 0;
  const expired = setup(async () => { count++; }, () => { throw new Error('expired'); });
  await expired.api.save();
  assert.equal(count, 0);
  assert.equal(expired.api.busy.value, false);
  let finish;
  const { api } = setup(() => { count++; return new Promise(resolve => { finish = resolve; }); });
  const first = api.save();
  await api.save();
  assert.equal(count, 1);
  finish();
  await first;
});
