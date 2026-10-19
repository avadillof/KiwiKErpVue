import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ref, computed, watch, nextTick } from 'vue';

async function dialog(post) {
  const source = fs.readFileSync(new URL('../src/views/Ventas/Frm_Facturas/AeatCasesDialog.vue', import.meta.url), 'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const calls = [], context = {
    exports: {}, defineExpose() {},
    require: name => ({
      vue: { ref, computed, watch, onUnmounted() {} },
      axios: { post: async (...args) => { calls.push(args); return post(...args); }, get: async () => ({ data: { content: [], totalPages: 0 } }) },
      '@/services/backendUrl': { backendUrl: p => p },
      '@/services/composables/useOperationBlocker': { blockOperation() {}, unblockOperation() {} },
    })[name],
  };
  vm.runInNewContext(ts.transpileModule(source + '\nglobalThis.subject={selectedInvoices,includeRelated,previewRows,previewSelection,prepare,canPrepare,form,fromDate,toDate,caseDocuments};', { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, context);
  const subject = context.subject;
  subject.form.value.reference = 'REQ-1'; subject.fromDate.value = new Date(2026, 9, 1); subject.toDate.value = new Date(2026, 9, 31);
  await nextTick();
  subject.selectedInvoices.value = [{ key: 'REFUND:7', id: 7 }];
  return { ...subject, calls };
}

test('Expediente envía claves por origen y exige revisar antes de preparar', async () => {
  const d = await dialog(async url => url.endsWith('/preview') ? { data: [{ key: 'REFUND:7' }, { key: 'TICKET:7', selection: 'RELATED' }] } : { data: { id: 1 } });
  await nextTick();
  assert.equal(d.canPrepare.value, false);
  await d.previewSelection();
  assert.equal(d.canPrepare.value, true);
  assert.equal(d.previewRows.value.length, 2);
  await d.prepare();
  const payload = d.calls.find(([url]) => url === '/WebSalesAeatCases')[1];
  assert.equal(JSON.stringify(payload.documentKeys), '["REFUND:7"]');
  assert.equal(payload.includeRelated, true);
  assert.equal(payload.invoiceIds, undefined);
});

test('Descarta una vista previa si cambia la selección mientras carga', async () => {
  let finish;
  const d = await dialog(() => new Promise(resolve => { finish = resolve; }));
  await nextTick();
  const pending = d.previewSelection();
  d.selectedInvoices.value = [{ key: 'INVOICE:7' }];
  await nextTick(); finish({ data: [{ key: 'REFUND:7' }] }); await pending;
  assert.equal(d.previewRows.value.length, 0);
  assert.equal(d.canPrepare.value, false);
});

test('Cambiar inclusión de relacionados invalida la revisión y admite expedientes antiguos', async () => {
  const d = await dialog(async () => ({ data: [{ key: 'REFUND:7' }] }));
  await nextTick(); await d.previewSelection();
  d.includeRelated.value = false; await nextTick();
  assert.equal(d.canPrepare.value, false);
  assert.equal(d.caseDocuments({ invoiceIds: [7] }).length, 0);
  assert.equal(d.caseDocuments({ documentSnapshot: '[{"key":"TICKET:7"}]' })[0].key, 'TICKET:7');
});
