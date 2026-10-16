import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, dependencies) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { exports, require: name => dependencies[name] || {} });
  return exports;
}
function routing(admin, loginAccess) {
  let guard;
  const auth = { user: { admin, pkid: 7 }, loginAccess, isAuthenticated: true, tpvOpenedFromErp: false };
  load('../src/router.ts', {
    'vue-router': { createWebHistory: () => ({}), createRouter: () => ({ beforeEach: fn => { guard = fn; } }) },
    './stores/authStore': { useAuthStore: () => auth },
    './stores/securityStore': { useSecurityStore: () => ({ loaded: true, hasModule: () => true, hasPermission: () => true }) },
    './services/Frm_Main/permissions': { PERM: {} }
  });
  return { auth, enter: from => guard({ name: 'TPV', matched: [{ meta: { requiresAuth: true } }], meta: {} }, from) };
}
const erp = { name: 'Dashboard', matched: [{ name: 'MainPanel' }] };
const external = { name: 'Login', matched: [] };
test('Un usuario ERP normal no puede abrir TPV, ni con permisos de ventas', async () => {
  const r = routing(false, 'erp');
  assert.equal((await r.enter(erp)).name, 'Dashboard');
  assert.equal((await r.enter(external)).name, 'Dashboard');
});
test('Un administrador que abre desde ERP conserva el retorno al ERP', async () => {
  const r = routing(true, 'erp');
  assert.equal(await r.enter(erp), true);
  assert.equal(r.auth.tpvOpenedFromErp, true);
});
for (const admin of [true, false]) {
  test(`Acceso externo ${admin ? 'administrador' : 'cajero'} muestra salida por cierre de sesión`, async () => {
    const r = routing(admin, 'tpv');
    assert.equal(await r.enter(external), true);
    assert.equal(r.auth.tpvOpenedFromErp, false);
  });
}
test('Una sesión TPV no permite al no administrador entrar desde una pantalla del ERP', async () => {
  const r = routing(false, 'tpv');
  assert.equal((await r.enter(erp)).name, 'Dashboard');
});
test('SYS_ACCESS no hace visible el TPV a un usuario no administrador', () => {
  const modules = load('../src/services/Frm_Main/modules.ts', {
    '../../stores/authStore': { useAuthStore: () => ({ user: { admin: false } }) },
    '../../stores/securityStore': { useSecurityStore: () => ({ hasModule: () => true, hasPermission: () => true }) },
    './permissions': { PERM: {} }
  });
  assert.equal(modules.visibleAppModules().some(module => module.id === 'tpv'), false);
});
