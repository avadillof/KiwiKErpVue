import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { ref, watch, nextTick } from 'vue';

// Execute the actual form script and helpers. HTTP and UI services are isolated;
// these checks do not mount PrimeVue or exercise a database.
function helper(path, name) {
    const context = { exports: {} };
    vm.createContext(context);
    vm.runInContext(ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
    }).outputText, context);
    return context.exports[name];
}
const HelperString = helper('../src/libs/HelperString.ts', 'HelperString');
const HelperDates = helper('../src/libs/HelperDates.ts', 'HelperDates');
const source = fs.readFileSync(new URL('../src/views/Ventas/Frm_Clientes/Frm_ClientForm.vue', import.meta.url), 'utf8')
    .split('<script setup lang="ts">')[1].split('</script>')[0]
    .replace(/^import .*?;\r?$/gm, '')
    .replaceAll('import.meta.env.VITE_API_URL', "'https://test.invalid'");

function setup(overrides = {}) {
    const posts = [], messages = [], events = [], stops = [];
    const context = {
        ref, nextTick, watch: (...args) => { const stop = watch(...args); stops.push(stop); return stop; },
        HelperString, HelperDates,
        axios: { get: async () => ({ data: {} }), post: async (...args) => { posts.push(args); }, ...overrides },
        useToast: () => ({ add: message => messages.push(message) }),
        useFormValidator: () => ({ setRef() {}, scrollToError: async () => {} }),
        useCompanyStore: () => ({ companyInfo: {} }),
        useSecurityStore: () => ({ hasPermission: () => true }),
        defineEmits: () => event => events.push(event), defineExpose() {},
        window: { open() {}, location: {} }
    };
    vm.createContext(context);
    vm.runInContext(ts.transpileModule(source + '\nglobalThis.api = { entity, errors, visible, entityReady, activeTab, validate, save, open, loadEntity, generateCode, paymentTermCreated, terms };', {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
    }).outputText, context);
    const api = context.api;
    Object.assign(api.entity.value, { code: 'QA-ENTITY', name: 'Entidad de prueba', cif: '12345678Z' });
    return { ...api, posts, messages, events, dispose: () => stops.forEach(stop => stop()) };
}
function scenario(name, run, options = {}) {
    test(name, options, async t => {
        const api = setup(); t.after(api.dispose); await run(api);
    });
}

scenario('valid general entity without commercial roles', async a => assert.equal(await a.validate(), true));
for (const field of ['code', 'name', 'cif']) {
    scenario(`required ${field} rejects whitespace`, async a => {
        a.entity.value[field] = '   '; assert.equal(await a.validate(), false); assert.ok(a.errors.value[field]);
    });
}
scenario('invalid fiscal check digit is rejected', async a => {
    a.entity.value.cif = '12345678A'; assert.equal(await a.validate(), false);
});
scenario('missing registration date is rejected', async a => {
    a.entity.value.dateUp = null; assert.equal(await a.validate(), false);
});
for (const [field, value, error] of [['web', 'incorrecta', 'web'], ['email', 'sin-arroba', 'mail']]) {
    scenario(`invalid ${field} is rejected`, async a => {
        a.entity.value[field] = value; assert.equal(await a.validate(), false); assert.ok(a.errors.value[error]);
    });
}
scenario('client requires payment term but allows no price list', async a => {
    a.entity.value.isclient = true; assert.equal(await a.validate(), false);
    a.entity.value.salesAttributes.salesTermId = 1; assert.equal(await a.validate(), true);
});
scenario('supplier requires payment term and price list', async a => {
    a.entity.value.isprove = true; assert.equal(await a.validate(), false);
    a.entity.value.purchasesAttributes.purchasesTermId = 1; assert.equal(await a.validate(), false);
    a.entity.value.purchasesAttributes.purchasesTarifaId = 1; assert.equal(await a.validate(), true);
});
for (const [role, attributes] of [['isclient', 'salesAttributes'], ['isprove', 'purchasesAttributes']]) {
    for (const field of ['sepa', 'sepa1']) {
        scenario(`${role} ${field} validates BIC`, async a => {
            a.entity.value[role] = true;
            Object.assign(a.entity.value[attributes], { salesTermId: 1, purchasesTermId: 1, purchasesTarifaId: 1 });
            a.entity.value[attributes][field] = 'INVALID'; assert.equal(await a.validate(), false);
            a.entity.value[attributes][field] = 'CAIXESBBXXX'; assert.equal(await a.validate(), true);
        });
    }
}
scenario('switching commercial roles selects the available tab', async a => {
    a.entity.value.isprove = true; await nextTick(); assert.equal(a.activeTab.value, '1');
    a.entity.value.isclient = true; await nextTick(); assert.equal(a.activeTab.value, '0');
});
scenario('invalid form never sends a save request', async a => {
    a.entity.value.name = ''; await a.save(); assert.equal(a.posts.length, 0);
});
scenario('successful save emits saved and closes dialog', async a => {
    a.visible.value = true; await a.save(); assert.equal(a.posts.length, 1);
    assert.equal(a.events[0], 'saved'); assert.equal(a.visible.value, false);
});
test('server conflict preserves form and displays server message', async t => {
    const a = setup({ post: async () => { throw { response: { data: { message: 'El código ya existe' } } }; } });
    t.after(a.dispose); a.visible.value = true; await a.save();
    assert.equal(a.visible.value, true); assert.equal(a.events.length, 0);
    assert.equal(a.messages[0].detail, 'El código ya existe');
});
test('loading legacy entity supplies missing nested attributes', async t => {
    const a = setup({ get: async () => ({ data: { pkid: 7, name: 'Anterior', salesAttributes: null } }) });
    t.after(a.dispose); await a.loadEntity(7);
    assert.equal(a.entity.value.salesAttributes.salesTermId, null);
    assert.equal(a.entity.value.purchasesAttributes.dayPago1, 0);
});

// Desired behavior: failures intentionally remain visible during this audit.
scenario('invalid Date object must be rejected', async a => {
    a.entity.value.dateUp = new Date('invalid'); assert.equal(await a.validate(), false);
});
test('double save must produce only one HTTP request', async t => {
    let count = 0, release;
    const pending = new Promise(resolve => { release = resolve; });
    const a = setup({ post: async () => { count++; await pending; } }); t.after(a.dispose);
    const first = a.save(), second = a.save(); await nextTick(); await nextTick();
    release(); await Promise.all([first, second]); assert.equal(count, 1);
});
test('late entity response must not replace more recent selection', async t => {
    let release;
    const a = setup({ get: async (_url, config) => config.params.pkid === 1
        ? new Promise(resolve => { release = resolve; }) : { data: { pkid: 2, name: 'Segunda' } } });
    t.after(a.dispose); const first = a.loadEntity(1); await a.loadEntity(2);
    release({ data: { pkid: 1, name: 'Primera' } }); await first;
    assert.equal(a.entity.value.pkid, 2);
});
