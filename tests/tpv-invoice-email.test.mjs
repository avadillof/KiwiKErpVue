import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ref, computed } from 'vue';
function dialog(failure = false) {
  let open;
  const events = [], notices = [], requests = [];
  const exports = {};
  const script = fs.readFileSync(new URL('../src/views/TPV/TpvInvoiceDialog.vue', import.meta.url), 'utf8').split('<script setup lang="ts">')[1].split('</script>')[0];
  const axios = { isAxiosError: e => !!e?.response,
    get: async () => ({ data: { invoiceId: 7, customerEmail: 'cliente@example.test', verifactuStatus: 'ACCEPTED' } }),
    post: async (url, body) => { requests.push([url, body]); if (failure) throw { response: { status: 502, data: 'No se pudo enviar el correo. Revisa SMTP.' } }; return { data: { sent: true, email: body.email } }; }
  };
  vm.runInNewContext(ts.transpileModule(script + '\nexports.api = { sendEmail, emailTo, error, emailBusy };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText, {
    exports, defineProps: () => ({ visible: true, charge: { chargeId: 58 }, openingId: 4 }),
    defineEmits: () => event => events.push(event),
    require: name => ({ vue: { ref, computed, watch: (_, callback) => { open = callback; } }, axios,
      'primevue/usetoast': { useToast: () => ({ add: n => notices.push(n) }) },
      '@/services/backendUrl': { backendUrl: p => p }, '@/stores/authStore': { useAuthStore: () => ({ portalRequestConfig: () => ({}) }) },
      './tpvInvoiceQueue': { invoiceJobs: ref(new Map()) }
    })[name] || {}
  });
  return { ...exports.api, events, notices, requests, open: () => open() };
}
test('Existing invoice prefills saved email; successful send closes with success toast', async () => {
  const d = dialog(); await d.open();
  assert.equal(d.emailTo.value, 'cliente@example.test');
  await d.sendEmail();
  assert.equal(d.requests[0][1].email, 'cliente@example.test');
  assert.deepEqual(d.events, ['close']);
  assert.equal(d.notices[0].severity, 'success');
});
test('Failed send keeps dialog and edited address, displays inline error, allows retry', async () => {
  const d = dialog(true); await d.open();
  d.emailTo.value = 'otro@example.test';
  await d.sendEmail();
  assert.deepEqual(d.events, []);
  assert.equal(d.emailTo.value, 'otro@example.test');
  assert.match(d.error.value, /Revisa SMTP/);
  assert.equal(d.emailBusy.value, false);
  assert.equal(d.notices.length, 0);
});
