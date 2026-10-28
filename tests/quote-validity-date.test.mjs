import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const form = fs.readFileSync(new URL('../src/views/Ventas/Frm_Presupuestos/Frm_PresupuestoForm.vue', import.meta.url), 'utf8');
const helper = fs.readFileSync(new URL('../src/libs/HelperDates.ts', import.meta.url), 'utf8');
const helpers = { exports: {}, Date, console };
vm.runInNewContext(ts.transpileModule(helper, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, helpers);

async function saveDate(day, order = false) {
    const posts = [];
    const context = {
        exports: {}, Date, console, HelperDates: helpers.exports.HelperDates,
        saving: { value: false }, pricing: { invalid: { value: false } }, validate: () => true,
        quote: { value: {} }, createDate: { value: new Date(2026, 9, 28, 12) },
        validityDate: { value: helpers.exports.parseCalendarDate(day) }, isOrder: { value: order },
        saveEndpoint: { value: order ? 'WebSaveSalesOrder' : 'WebSaveSalesQuote' },
        backendUrl: value => value, axios: { post: async (url, payload) => posts.push(payload) },
        authStore: { user: { pkid: 1 } }, toast: { add() {} }, companyStore: { companyInfo: {} },
        visible: { value: true }, emit() {}, documentLabel: { value: 'Presupuesto' }
    };
    const source = form.slice(form.indexOf('const save = async'), form.indexOf('defineExpose'));
    vm.runInNewContext(ts.transpileModule(source + '\nglobalThis.save = save;', {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText, context);
    await context.save();
    return posts[0];
}

test('guardar presupuesto conserva la fecha seleccionada, incluso en cambios de hora', async () => {
    for (const day of ['2026-11-27', '2026-03-29', '2026-10-25', '2020-02-29']) {
        assert.equal((await saveDate(day)).validityDate, day);
    }
});

test('pedido conserva su contrato de fecha y hora', async () => {
    const payload = await saveDate('2026-11-27', true);
    assert.equal(payload.validityDate, helpers.exports.parseCalendarDate('2026-11-27').toISOString());
});

test('reabrir y mostrar el presupuesto conserva el día devuelto por el servidor', () => {
    const list = fs.readFileSync(new URL('../src/views/Ventas/Frm_Presupuestos/Frm_Presupuestos.vue', import.meta.url), 'utf8');
    const source = form.slice(form.indexOf('const toPickerDate ='), form.indexOf('const createDate ='))
        + '\n' + list.slice(list.indexOf('const formatDate ='), list.indexOf('const formatCurrency ='))
        + '\nglobalThis.api = { toPickerDate, formatDate };';
    const context = { exports: {}, Date, parseCalendarDate: helpers.exports.parseCalendarDate };
    vm.runInNewContext(ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText, context);
    assert.equal(helpers.exports.HelperDates.formatDateObjectNoTime(context.api.toPickerDate('2026-11-27')), '2026-11-27');
    assert.equal(context.api.formatDate('2026-11-27'), '27/11/2026');
});
