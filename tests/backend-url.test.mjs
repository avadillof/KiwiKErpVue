import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import axios from 'axios';

const source = fs.readFileSync(new URL('../src/services/backendUrl.ts', import.meta.url), 'utf8');
function helper(base) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source.replace('import.meta.env.VITE_API_URL', JSON.stringify(base)), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { exports });
  return exports.backendUrl;
}

for (const base of ['', '/api', '/api/', 'http://servidor:8083', 'https://localhost:8083/', 'https://host/erp', 'https://host/erp/api/']) {
  test(`URLs legacy y nativas con base ${JSON.stringify(base)}`, () => {
    const url = helper(base);
    const root = base.replace(/\/+$/, '');
    for (const endpoint of ['loadSalesCatalog', 'WebGetClient', 'WebSaveClient', 'WebGenerateEntitieCode', 'gestdoc/users/1/photoPerfil.jpg']) {
      assert.equal(url(endpoint), `${root}/${endpoint}`);
      assert.equal(url('/' + endpoint), `${root}/${endpoint}`);
    }
    for (const endpoint of ['api/installation/status', 'api/notes/load', 'api/notes/save', 'api/gestdoc/list']) {
      const expected = root + '/' + endpoint;
      assert.equal(url(endpoint), expected);
      assert.equal(url('/' + endpoint), expected);
      // El proxy elimina la base; el endpoint nativo conserva su propio /api.
    }
    assert.equal(url('/WebGetClient?name=A%2FB&pkid=42#detail'), `${root}/WebGetClient?name=A%2FB&pkid=42#detail`);
    for (const external of ['https://other/file.pdf', '//other/file.pdf', 'blob:https://host/id', 'data:image/png;base64,abc']) assert.equal(url(external), external);
  });
}

test('Docker retira solo el prefijo público y conserva las rutas Spring', () => {
  const url = helper('/api');
  for (const endpoint of ['/api/gestdoc/list', '/api/gestdoc/upload', '/api/gestdoc/preview', '/api/gestdoc/download', '/api/gestdoc/delete', '/gestdoc/users/28/photoPerfil.jpg', '/WebBankAccounts']) {
    assert.equal(url(endpoint).replace(/^\/api/, ''), endpoint);
  }
});

test('axios común resuelve URLs sin duplicar base ni modificar la petición', async () => {
  const apiSource = fs.readFileSync(new URL('../src/services/api.ts', import.meta.url), 'utf8').replace(/^import .*;\r?\n/gm, '').replace('export { api };', 'globalThis.api = api;');
  for (const base of ['/api', 'http://servidor:8083', '']) {
    const context = { axios, backendUrl: helper(base) };
    vm.runInNewContext(apiSource, context);
    for (const endpoint of ['/WebGetClient', '/api/notes/load']) {
      const response = await context.api.post(endpoint, { pkid: 42 }, {
        params: { page: 2 }, headers: { 'X-Portal-Session': 'test-token' },
        adapter: async config => ({ data: config, status: 200, statusText: 'OK', headers: {}, config })
      });
      assert.equal(axios.getUri(response.data), helper(base)(endpoint) + '?page=2');
      assert.equal(response.data.data, '{"pkid":42}');
      assert.equal(response.data.headers['X-Portal-Session'], 'test-token');
    }
  }
});

test('fetch del instalador conserva rutas nativas y el tratamiento de errores', async () => {
  const installationSource = fs.readFileSync(new URL('../src/services/Installation/installationService.ts', import.meta.url), 'utf8')
    .replace(/^import .*;\r?\n/gm, '');
  for (const base of ['/api', 'http://servidor:8083', '']) {
    const exports = {};
    const calls = [];
    let status = 200;
    vm.runInNewContext(ts.transpileModule(installationSource, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText, {
      exports, backendUrl: helper(base),
      fetch: async (url, options) => {
        calls.push({ url, options });
        return { status, ok: status === 200, json: async () => ({ status: 'COMPLETED' }) };
      }
    });
    assert.equal((await exports.getInstallationState()).status, 'COMPLETED');
    assert.equal(calls[0].url, helper(base)('/api/installation/status'));
    assert.equal(calls[0].options.headers.Accept, 'application/json');
    await exports.initialiseDatabase();
    assert.equal(calls[1].url, helper(base)('/api/installation/database'));
    assert.equal(calls[1].options.method, 'POST');
    status = 404;
    assert.equal((await exports.getInstallationState()).status, 'ERROR');
  }
});
