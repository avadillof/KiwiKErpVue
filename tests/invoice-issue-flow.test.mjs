import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const component = fs.readFileSync(new URL('../src/views/Ventas/Frm_Facturas/Frm_Facturas.vue', import.meta.url), 'utf8');
const guardSource = fs.readFileSync(new URL('../src/services/composables/useInvoiceIssueGuard.ts', import.meta.url), 'utf8');
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const ref = value => ({ value });
function guard(storage = new Map()) {
  const exports = {};
  vm.runInNewContext(compile(guardSource), {
    exports, require: () => ({ ref }),
    sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
  });
  return exports;
}
function scenario(post, refresh = async () => {}) {
  const invoice = { pkid: 42, code: 'DRAFT_FC_42', state: 'Borrador / Draft', verifactuStatus: null };
  const protection = guard();
  const messages = [];
  let saves = 0;
  const context = {
    ...protection, ref, computed: fn => ({ get value() { return fn(); } }),
    detail: ref({ ...invoice }), selected: ref({ ...invoice }), issuing: ref(false), detailSaving: ref(false),
    issueTarget: ref(invoice), issuePassword: ref('fake-test-secret'), issueRetry: ref(false),
    issueValidationErrors: ref([]), validatingIssue: ref(false),
    issueVisible: ref(true), detailVisible: ref(true),
    isDraft: state => !!state?.includes('Borrador'), parsed: value => value,
    axios: { post, get: async () => ({ data: { valid: true, errors: [] } }) }, saveDetail: async () => { saves++; return true; }, refresh,
    toast: { add: message => messages.push(message) },
  };
  const handlers = component.slice(component.indexOf('const validateIssueTarget ='), component.indexOf('const verifactuSeverity='))
    .replaceAll('import.meta.env.VITE_API_URL', "'http://test.invalid'");
  vm.createContext(context);
  vm.runInContext(compile(handlers + '\n globalThis.testIssue = confirmIssue; globalThis.testProtected = invoiceProtected; globalThis.testValidate = validateIssueTarget;'), context);
  return { context, messages, protection, run: () => context.testIssue(), saves: () => saves };
}

test('double click submits once and returns immediately with VeriFactu still pending', async () => {
  let resolvePost;
  let posts = 0;
  const s = scenario(() => { posts++; return new Promise(resolve => { resolvePost = resolve; }); });
  const first = s.run();
  await Promise.resolve();
  await s.run();
  assert.equal(posts, 1);
  assert.equal(s.saves(), 1);
  assert.equal(s.context.issuing.value, true);
  resolvePost({ data: { pkid: 42, code: 'FC-TEST/1', state: 'Confirmada / Confirming', verifactuStatus: 'PENDING' } });
  await first;
  assert.equal(s.context.issuing.value, false);
  assert.equal(s.context.detailVisible.value, false);
  assert.equal(s.context.issueVisible.value, false);
  assert.equal(s.context.issuePassword.value, '');
  assert.equal(s.context.testProtected(s.context.detail.value), true);
  assert.equal(s.context.testProtected({ pkid: 43, state: 'Borrador / Draft' }), false);
  s.context.issuePassword.value = 'fake-test-secret';
  await s.run();
  assert.equal(posts, 1);
});

test('lost response keeps the invoice protected and prevents another POST', async () => {
  let posts = 0;
  const s = scenario(async () => { posts++; throw new Error('Connection lost'); });
  await s.run();
  assert.equal(s.protection.isInvoiceIssuePending(42), true);
  assert.equal(s.context.issuing.value, false);
  s.context.issuePassword.value = 'fake-test-secret';
  await s.run();
  assert.equal(posts, 1);
  assert.equal(s.messages.at(-1).summary, 'Emisión pendiente de comprobar');
});

test('explicit validation rejection unlocks the draft and clears the password', async () => {
  const s = scenario(async () => { throw { response: { status: 401, data: 'Certificado incorrecto' } }; });
  await s.run();
  assert.equal(s.protection.isInvoiceIssuePending(42), false);
  assert.equal(s.context.issuePassword.value, '');
  assert.equal(s.messages.at(-1).detail, 'Certificado incorrecto');
});

test('retry uses the existing record and cannot be submitted again while pending', async () => {
  const endpoints = [];
  const s = scenario(async url => {
    endpoints.push(url);
    return { data: { pkid: 42, code: 'FC-TEST/1', state: 'Confirmada', verifactuStatus: 'PENDING', canRetryVerifactu: false } };
  });
  Object.assign(s.context.issueTarget.value, { state: 'Confirmada', verifactuStatus: 'REJECTED', canRetryVerifactu: true });
  s.context.issueRetry.value = true;
  await s.run();
  assert.equal(s.saves(), 0);
  assert.equal(endpoints.length, 1);
  assert.match(endpoints[0], /WebRetrySalesInvoiceVeriFactu\/42$/);
  s.context.issuePassword.value = 'fake-test-secret';
  await s.run();
  assert.equal(endpoints.length, 1);
});

test('list refresh failure does not turn a successful issue into a failed emission', async () => {
  const s = scenario(async () => ({ data: { pkid: 42, state: 'Confirmada', verifactuStatus: 'PENDING' } }), async () => { throw Error('List unavailable'); });
  await s.run();
  await Promise.resolve();
  assert.equal(s.messages.some(m => m.summary === 'Factura emitida'), true);
  assert.equal(s.messages.some(m => m.summary === 'Actualización pendiente'), true);
  assert.equal(s.messages.some(m => m.summary === 'No se pudo completar la operación'), false);
});

test('uncertain guard survives reload; only IDs are stored', () => {
  const storage = new Map();
  const first = guard(storage);
  assert.equal(first.beginInvoiceIssue(42), true);
  assert.equal(first.beginInvoiceIssue(42), false);
  assert.equal(first.beginInvoiceIssue(-1), false);
  const reloaded = guard(storage);
  assert.equal(reloaded.isInvoiceIssuePending(42), true);
  assert.equal([...storage.values()][0], '[42]');
  reloaded.finishInvoiceIssue(42);
  assert.equal(guard(storage).isInvoiceIssuePending(42), false);
});

test('preflight lists fiscal errors and blocks emission', async () => {
  let posts = 0;
  const s = scenario(async () => { posts++; });
  s.context.axios.get = async () => ({ data: { valid: false, errors: [{ field: 'customer.nif', message: 'NIF incorrecto', location: 'Entidades' }] } });
  await s.context.testValidate();
  assert.equal(s.context.issueValidationErrors.value[0].field, 'customer.nif');
  await s.run();
  assert.equal(posts, 0);
});

test('failed preflight does not allow emission and can be checked again', async () => {
  let posts = 0;
  const s = scenario(async () => { posts++; });
  s.context.axios.get = async () => { throw Error('Server unavailable'); };
  await s.context.testValidate();
  await s.run();
  assert.equal(posts, 0);
  assert.equal(s.context.validatingIssue.value, false);
  s.context.axios.get = async () => ({ data: { valid: true, errors: [] } });
  await s.context.testValidate();
  assert.equal(s.context.issueValidationErrors.value.length, 0);
});

test('fiscal rejection at final issue stays visible and unlocks only the draft', async () => {
  const s = scenario(async () => { throw { response: { status: 400, data: { message: 'Corrige los datos.', errors: [{ field: 'company.nif', message: 'NIF obligatorio', location: 'Empresa' }] } } }; });
  await s.run();
  assert.equal(s.context.issueVisible.value, true);
  assert.equal(s.context.issueValidationErrors.value[0].field, 'company.nif');
  assert.equal(s.protection.isInvoiceIssuePending(42), false);
  assert.equal(s.context.issuePassword.value, '');
});

test('customer form accepts the supported fiscal ID formats and rejects bad controls', () => {
  const exports = {};
  vm.runInNewContext(compile(fs.readFileSync(new URL('../src/libs/HelperString.ts', import.meta.url), 'utf8')), { exports });
  for (const id of ['12345678Z', 'ES 12.345.678-Z', 'X1234567L', 'B12345674', 'K1234567A', 'FR40303265045']) {
    assert.equal(exports.HelperString.isValidCifNif(id), true, id);
  }
  for (const id of ['', '12345678A', 'X1234567A', 'B12345675', 'B1234567D', 'FR00303265045']) {
    assert.equal(exports.HelperString.isValidCifNif(id), false, id);
  }
});


test('draft state aliases are editable but issued states never count as drafts', () => {
  const source=component.slice(component.indexOf('const isDraft='),component.indexOf(',stateLabel='));
  const context={};vm.createContext(context);vm.runInContext(compile(source+';globalThis.classify=isDraft;'),context);
  for(const state of ['DRAFT','Draft','Borrador','Borrador / Draft','Para Aprobar / To Approved Invoice'])assert.equal(context.classify(state),true,state);
  for(const state of ['Confirmada / Confirming','Cancelada / Canceled','ACCEPTED','ISSUED',null,''])assert.equal(context.classify(state),false,String(state));
});
