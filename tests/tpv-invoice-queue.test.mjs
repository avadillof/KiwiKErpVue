import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ref, watch, reactive } from 'vue';

function queue({ get, post = async () => ({ data: { pkid: 77, code: 'FC-77', verifactuStatus: 'PENDING' } }) }) {
  const exports = {}, notices = [], calls = [], downloads = [];
  let tick;
  const auth = reactive({ portalSession: 'operator-a', portalRequestConfig() { return { headers: { 'X-Portal-Session': this.portalSession } }; } });
  const axios = { isAxiosError: e => e?.isAxiosError === true,
    get: async (url, config) => { calls.push(['GET', url, config]); if (url.endsWith('/pdf')) return { data: new Blob(['pdf']) }; return get(url, config); },
    post: async (...args) => { calls.push(['POST', ...args]); return post(...args); }
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/views/TPV/tpvInvoiceQueue.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText, {
    exports, require: name => ({ vue: { ref, watch }, axios, '@/services/backendUrl': { backendUrl: p => p }, '@/stores/authStore': { useAuthStore: () => auth } })[name] ?? (() => { throw Error(`Unexpected dependency ${name}`); })(),
    setInterval: fn => { tick = fn; return 1; }, clearInterval: () => { tick = undefined; },
    URL: { createObjectURL: () => 'blob:pdf', revokeObjectURL() {} },
    document: { createElement: () => ({ click() { downloads.push(this.download); }, remove() {} }), body: { appendChild() {} } },
    window: { setTimeout() {} }
  });
  return { ...exports, auth, calls, notices, downloads, tick: () => tick?.(), request: (id = 49) => exports.requestInvoice(id, 4, n => notices.push(n)) };
}
const draft = { invoiceId: 77, state: 'Borrador / Draft', code: 'DRAFT_TPV-49', verifactuStatus: null };
const accepted = { invoiceId: 77, state: 'Confirmada', code: 'FC-77', verifactuStatus: 'ACCEPTED' };
test('Accepted invoice downloads after reload without POST or Vue injection', async () => {
  const q = queue({ get: async () => ({ data: accepted }) });
  const job = await q.request();
  assert.equal(job.state, 'done');
  assert.equal(q.calls.filter(c => c[0] === 'POST').length, 0);
  assert.deepEqual(q.downloads, ['FC-77.pdf']);
  assert.equal(q.notices[0].severity, 'success');
});
test('Draft queues once, then polls and downloads outside component setup', async () => {
  let reads = 0;
  const q = queue({ get: async () => ({ data: reads++ ? accepted : draft }) });
  assert.equal((await q.request()).state, 'polling');
  await q.request();
  assert.equal(q.calls.filter(c => c[0] === 'POST').length, 1);
  await q.tick();
  assert.equal(q.invoiceJobs.value.get(49).state, 'done');
  assert.equal(q.downloads.length, 1);
});
test('Validation error stays actionable, an existing draft is not a queued emission', async () => {
  const q = queue({ get: async () => ({ data: draft }), post: async () => { throw { isAxiosError: true, response: { status: 400, data: { errors: [{ location: 'Contacto', message: 'Revisa el NIF' }] } } }; } });
  const job = await q.request();
  assert.equal(job.state, 'error');
  assert.match(job.error, /Revisa el NIF/);
  assert.equal(q.calls.filter(c => c[0] === 'GET').length, 1);
});
test('Polling never overlaps and long AEAT wait stays pending rather than failed', async () => {
  const q = queue({ get: async () => ({ data: { ...accepted, verifactuStatus: 'PENDING' } }) });
  await q.request();
  for (let i = 0; i < 24; i++) await q.tick();
  assert.equal(q.invoiceJobs.value.get(49).state, 'pending');
  assert.equal(q.calls.filter(c => c[0] === 'POST').length, 0);
});
test('Session change cancels UI work without downloading for another operator', async () => {
  let release;
  const q = queue({ get: () => new Promise(resolve => { release = resolve; }) });
  const work = q.request();
  q.auth.portalSession = 'operator-b';
  release({ data: accepted });
  await work;
  assert.equal(q.invoiceJobs.value.size, 0);
  assert.equal(q.downloads.length, 0);
  assert.equal(q.calls.filter(c => c[0] === 'POST').length, 0);
});
test('Accepted with errors allows existing PDF; rejected invoice is never reissued', async () => {
  const q = queue({ get: async () => ({ data: { ...accepted, verifactuStatus: 'ACCEPTED_WITH_ERRORS' } }) });
  assert.equal((await q.request()).state, 'done');
  const rejected = queue({ get: async () => ({ data: { ...accepted, verifactuStatus: 'NEEDS_CORRECTION', verifactuResponse: 'NIF inválido' } }) });
  assert.equal((await rejected.request()).state, 'error');
  assert.equal(rejected.calls.filter(c => c[0] === 'POST').length, 0);
});
test('A slow status request does not create overlapping polls', async () => {
  let reads = 0, release;
  const q = queue({ get: () => ++reads === 1 ? Promise.resolve({ data: { ...accepted, verifactuStatus: 'PENDING' } }) : new Promise(resolve => { release = resolve; }) });
  await q.request();
  const first = q.tick();
  await q.tick();
  assert.equal(reads, 2);
  release({ data: accepted });
  await first;
  assert.equal(q.downloads.length, 1);
});
test('Ambiguous POST timeout reconciles persisted state without another POST', async () => {
  let reads = 0;
  const q = queue({ get: async () => ({ data: reads++ ? accepted : draft }), post: async () => { throw { isAxiosError: true }; } });
  assert.equal((await q.request()).state, 'polling');
  await q.tick();
  assert.equal(q.invoiceJobs.value.get(49).state, 'done');
  assert.equal(q.calls.filter(c => c[0] === 'POST').length, 1);
});
