import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { reactive, watch, nextTick, ref } from 'vue';

const MINUTE = 60000;
function idle(access = 'erp') {
  const timers = new Map(), events = new Map(), routes = [], notices = [];
  let now = 0, sequence = 0, logouts = 0;
  const auth = reactive({ isAuthenticated: true, loginAccess: access, logout() { logouts++; this.isAuthenticated = false; this.loginAccess = 'erp'; } });
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/services/composables/Sv_IdleLogout.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports,
    require: name => ({
      vue: { reactive, watch },
      'primevue/usetoast': { useToast: () => ({ add: n => notices.push(n) }) },
      'vue-router': { useRouter: () => ({ push: async r => { routes.push(r); } }) },
      '../../stores/authStore': { useAuthStore: () => auth },
      '../../stores/companyStore': { useCompanyStore: () => ({ companyInfo: {} }) },
    })[name],
    window: {
      setTimeout: (fn, delay) => { timers.set(++sequence, { fn, time: now + delay }); return sequence; },
      clearTimeout: id => timers.delete(id),
      addEventListener: (event, fn) => events.set(event, fn),
      removeEventListener: event => events.delete(event),
    },
  });
  exports.startIdleWatcher();
  return {
    ...exports, auth, routes, notices, logouts: () => logouts,
    activity: (event = 'mousedown') => events.get(event)?.(),
    async tick(delay) {
      await new Promise(resolve => setImmediate(resolve));
      const target = now + delay;
      while (true) {
        const due = [...timers.entries()].filter(([, t]) => t.time <= target).sort((a, b) => a[1].time - b[1].time)[0];
        if (!due) break;
        const [id, timer] = due; now = timer.time; timers.delete(id); timer.fn(); await nextTick(); await new Promise(resolve => setImmediate(resolve));
      }
      now = target; await nextTick();
    },
  };
}

test('mousedown/touchstart del botón no consume el aviso ni impide cerrar sesión ERP', async () => {
  const s = idle(); await s.tick(14 * MINUTE);
  assert.equal(s.idleSessionPrompt.visible, true);
  s.activity('mousedown'); s.activity('touchstart');
  assert.equal(s.idleSessionPrompt.visible, true);
  s.idleSessionPrompt.logout(); await nextTick();
  assert.equal(s.logouts(), 1); assert.equal(s.routes[0].name, 'Login'); assert.equal(s.routes[0].query, undefined);
});

test('Seguir trabajando renueva el plazo y no revoca la sesión', async () => {
  const s = idle(); await s.tick(14 * MINUTE);
  s.idleSessionPrompt.continueWorking(); await s.tick(MINUTE);
  assert.equal(s.logouts(), 0); assert.equal(s.idleSessionPrompt.visible, false);
  await s.tick(13 * MINUTE); assert.equal(s.idleSessionPrompt.visible, true);
});

test('Sin respuesta se cierra la sesión y conserva el acceso por PIN cuando corresponde', async () => {
  const s = idle('tpv'); await s.tick(15 * MINUTE);
  assert.equal(s.logouts(), 1); assert.equal(s.routes[0].query.access, 'tpv');
});

test('En TPV delega el cierre sin revocar antes de guardar/confirmar y elimina el handler al salir', async () => {
  const s = idle(); let requests = 0;
  const detach = s.registerTpvIdleLogout(async () => { requests++; });
  await s.tick(14 * MINUTE); s.idleSessionPrompt.logout(); await nextTick();
  assert.equal(requests, 1); assert.equal(s.logouts(), 0); assert.equal(s.routes.length, 0);
  await s.tick(15 * MINUTE); assert.equal(requests, 2); assert.equal(s.logouts(), 0);
  detach(); await s.tick(15 * MINUTE); assert.equal(s.logouts(), 1);
});

function tpvSession({ unsaved = false, pending = false, table = false, save = true, admin = false } = {}) {
  const source = fs.readFileSync(new URL('../src/views/TPV/Frm_Tpv.vue', import.meta.url), 'utf8').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1];
  const ast = ts.createSourceFile('tpv.ts', source, ts.ScriptTarget.Latest, true);
  const methods = ast.statements.filter(n => ts.isFunctionDeclaration(n) && ['requestSessionExit', 'finishSession'].includes(n.name?.text)).map(n => n.getText(ast)).join('\n');
  let saves = 0, logouts = 0;
  const routes = [], notices = [], state = {
    busy: ref(false), endingSession: ref(false), checkoutPending: ref(pending),
    isBarMode: ref(table), activeTable: ref(table ? { id: 1 } : null), unsaved: ref(unsaved),
    sessionAction: ref('logout'), sessionDialog: ref(false), lines: ref([{ name: 'Venta pendiente' }]),
    saveTable: async () => { saves++; return save; }, openOperators() {},
    auth: { user: { admin }, logout() { logouts++; } },
    router: { replace: async r => { routes.push(r); } }, toast: { add: n => notices.push(n) },
  };
  const context = { ...state };
  vm.runInNewContext(ts.transpileModule(methods + '\nglobalThis.methods={requestSessionExit,finishSession};', { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return { ...state, ...context.methods, routes, notices, saves: () => saves, logouts: () => logouts };
}

test('TPV exige confirmación del ticket pendiente y vuelve al PIN tras confirmar', async () => {
  const s = tpvSession({ unsaved: true }); await s.requestSessionExit('logout');
  assert.equal(s.sessionDialog.value, true); assert.equal(s.logouts(), 0); assert.equal(s.lines.value.length, 1);
  await s.finishSession(); assert.equal(s.logouts(), 1); assert.equal(s.routes[0].query.access, 'tpv');
});

test('Un cobro pendiente y un fallo al guardar la mesa conservan usuario y venta', async () => {
  const payment = tpvSession({ pending: true }); await payment.requestSessionExit('logout'); await payment.finishSession();
  assert.equal(payment.logouts(), 0); assert.equal(payment.lines.value.length, 1); assert.equal(payment.notices.length, 1);
  const table = tpvSession({ table: true, save: false }); await table.requestSessionExit('logout');
  assert.equal(table.saves(), 1); assert.equal(table.logouts(), 0); assert.equal(table.lines.value.length, 1);
});

test('El cierre TPV guarda la mesa y conserva el retorno ERP del administrador', async () => {
  const s = tpvSession({ table: true, admin: true }); await s.requestSessionExit('logout');
  assert.equal(s.saves(), 1); assert.equal(s.logouts(), 1); assert.equal(s.routes[0].name, 'Login'); assert.equal(s.routes[0].query, undefined);
});
