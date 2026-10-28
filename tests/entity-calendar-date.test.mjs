import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/libs/HelperDates.ts', import.meta.url), 'utf8');
const context = { exports: {}, Date, console };
vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
}).outputText, context);
const { parseCalendarDate, HelperDates } = context.exports;

test('fecha seleccionada conserva el día al cargar, mostrar y guardar', () => {
    for (const value of ['2026-10-28', '2026-03-29', '2026-10-25', '2020-02-29', '2021-02-15']) {
        const date = parseCalendarDate(value);
        assert.equal(HelperDates.formatDateObjectNoTime(date), value);
        assert.equal(HelperDates.formatDateNoTimeFromLocale(value), value.split('-').reverse().join('-'));
    }
});

test('fecha ausente o inválida no se sustituye por hoy', () => {
    for (const value of [null, undefined, '', '2026-02-30', 'incorrecta']) {
        assert.equal(parseCalendarDate(value), null);
    }
});
