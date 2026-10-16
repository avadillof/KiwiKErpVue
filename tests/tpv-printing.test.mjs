import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { webcrypto, createHash } from 'node:crypto';
import JsBarcode from 'jsbarcode';

function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(code, { exports, require: name => dependencies[name] || {}, ...globals });
  return exports;
}
const barcode = load('../src/libs/printing/ticketBarcode.ts', { jsbarcode: JsBarcode });
const { buildEscposReceipt } = load('../src/libs/printing/escposReceipt.ts', { './ticketBarcode': barcode });
test('Código de barras conserva referencia y compacta parejas numéricas ESC/POS', () => {
  assert.equal(barcode.ticketBarcodeValue('T-123'), 'T-123');
  assert.equal(barcode.ticketBarcodeValue('T-1\x1b@'), '');
  assert.ok(barcode.ticketBarcodeEscpos('T-1234').includes('{BT-{C\x0c\x22'));
  assert.ok(barcode.ticketBarcodeSvg('T-123').includes('aria-label="T-123"'));
  const html = load('../src/libs/printing/htmlReceipt.ts', { './ticketBarcode': barcode }).buildHtmlReceipt({code:'T-123'});
  assert.ok(html.indexOf('<svg') < html.indexOf('Gracias por su visita'));
});
const receipt = { code: 'T-1', currency: 'EUR', lines: [{ name: 'Café español', quantity: 1, unitGross: 12.1, total: 12.1 }], net: 10, tax: 2.1, total: 12.1, paid: 20, change: 7.9 };
const layout = { columns: 32, codePage: 19, cut: false };
test('ESC/POS mantiene importes, acentos y corte explícito sin abrir cajón', () => {
  const text = buildEscposReceipt(receipt, layout);
  assert.ok(text.includes('Café español'));
  assert.ok(text.includes('12,10 EUR'));
  assert.ok(text.includes('7,90 EUR'));
  assert.ok(text.includes('\x1bt\x13'));
  assert.ok(!text.includes('\x1bp'));
  assert.ok(!text.includes('\x1dV'));
  assert.ok(buildEscposReceipt(receipt, { ...layout, cut: true }).endsWith('\x1dV\x01'));
});
test('Datos del recibo no pueden introducir comandos de impresora', () => {
  const text = buildEscposReceipt({ ...receipt, code: '\x1bp\x00\x1dV\x01' }, layout);
  assert.ok(!text.includes('\x1bp'));
  assert.ok(!text.includes('\x1dV'));
});
test('Papel y moneda incompatibles se rechazan', () => {
  assert.throws(() => buildEscposReceipt(receipt, { ...layout, columns: 12 }));
  assert.throws(() => buildEscposReceipt(receipt, { ...layout, codePage: 200 }));
  assert.throws(() => buildEscposReceipt({ ...receipt, currency: 'USD' }, layout));
});
function settings(initial, dependencies = {}) {
  const storage = new Map(Object.entries(initial));
  const module = load('../src/services/Printing/printerService.ts', {
    vue: { ref: value => ({ value }) },
    '../../libs/printing/escposReceipt': { buildEscposReceipt },
    '../backendUrl': { backendUrl: p => 'https://test.invalid' + p },
    ...dependencies
  }, { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } });
  module.refreshPrintSettings();
  return { module, storage };
}
test('Migración conserva Zebra y su configuración original', () => {
  const legacy = JSON.stringify({ printers: [{ id: 'z', name: 'Zebra', kind: 'zebra', host: '', port: 9100, uid: 'usb-z' }], selected: 'z' });
  const { module: m, storage } = settings({ 'kiwik.labelPrinters.v1': legacy });
  assert.equal(m.printerStorageError.value, '');
  assert.equal(m.printers.value[0].uid, 'usb-z');
  assert.equal(m.printerSelections.value.labels, 'z');
  assert.equal(storage.get('kiwik.labelPrinters.v1'), legacy);
  assert.equal(storage.has('kiwik.printers.v2'), false);
});
test('Configuración dañada no se sobrescribe silenciosamente', () => {
  const { module: m, storage } = settings({ 'kiwik.printers.v2': 'invalid' });
  assert.throws(() => m.persistPrintSettings([], {}));
  assert.equal(storage.get('kiwik.printers.v2'), 'invalid');
});
test('Cada caja requiere destino propio, sin fallback a otra caja', async () => {
  const { module: m } = settings({});
  assert.notEqual(m.selectionKey('ESCPOS', '1'), m.selectionKey('ESCPOS', '2'));
  await assert.rejects(m.printConfiguredReceipt(receipt, '2'), /Selecciona una impresora/);
});
test('QZ exige nombre exacto y no reintenta un envío incierto', async () => {
  let prints = 0;
  const qz = { websocket: { isActive: () => true }, printers: { find: async () => ['Ticket'] }, configs: { create: (name, config) => { assert.equal(config.encoding, 'CP858'); return { name }; } }, print: async () => { prints++; throw new Error('lost'); } };
  const m = load('../src/services/Printing/qzTransport.ts', { 'qz-tray': qz, axios: {get: async()=>({status:204})}, '../backendUrl':{backendUrl:p=>p}, '../../stores/authStore':{useAuthStore:()=>({portalRequestConfig:()=>({})})} });
  await assert.rejects(m.sendQzRaw('ticket', 'data', 'CP858'), /no está disponible/);
  assert.equal(prints, 0);
  await assert.rejects(m.sendQzRaw('Ticket', 'data', 'CP858'), /antes de repetir/);
  assert.equal(prints, 1);
});

test('Precuenta never prints fiscal or payment confirmation even if supplied by caller', () => {
 const prebill = {...receipt,documentKind:'PREBILL',fiscalCode:'FISCAL-SECRET',qrUrl:'https://example.invalid/fiscal',qrPng:'QUJD',payments:[{method:'CASH',amount:20}]};
 const html=load('../src/libs/printing/htmlReceipt.ts',{'./ticketBarcode':barcode}).buildHtmlReceipt(prebill);
 const raw=buildEscposReceipt(prebill,layout);
 for(const output of [html,raw]) {
   assert.match(output,/PRECUENTA/);assert.match(output,/PENDIENTE DE COBRO/);
   assert.ok(!output.includes('FISCAL-SECRET'));assert.ok(!output.includes('Entregado'));assert.ok(!output.includes('Cambio'));
   assert.ok(!output.includes('Verifica en AEAT'));assert.ok(!output.includes('Ticket T-1'));
 }
 assert.ok(!html.includes('<svg'));assert.ok(!html.includes('data:image/png'));
 assert.ok(!raw.includes('\x1d(k'));assert.ok(!raw.includes('\x1bp'));
 assert.equal(prebill.fiscalCode,'FISCAL-SECRET');
});


test('Última impresora aislada por tickets, cocina, barra y zona, conservada al recargar', () => {
  const {module:m}=settings({});
  const profile=(id)=>({id,name:id,language:'ESCPOS',transport:'qz',queue:id,host:'',port:9100,uid:'',columns:48,codePage:19,cut:true});
  const sale=m.selectionKey('ESCPOS','1'), kitchen=m.kitchenSelectionKey(7,'KITCHEN'),bar=m.kitchenSelectionKey(7,'BAR');
  assert.notEqual(sale,kitchen);assert.notEqual(kitchen,bar);assert.notEqual(kitchen,m.kitchenSelectionKey(8,'KITCHEN'));
  m.persistPrintSettings([profile('venta'),profile('cocina'),profile('barra')],{[sale]:'venta',[kitchen]:'cocina',[bar]:'barra'});
  m.persistPrintSettings(m.printers.value,{...m.printerSelections.value,[kitchen]:'barra'});
  m.refreshPrintSettings();
  assert.equal(m.printerSelections.value[sale],'venta');
  assert.equal(m.printerSelections.value[kitchen],'barra');
  assert.equal(m.printerSelections.value[bar],'barra');
  assert.equal(m.printerSelections.value[m.kitchenSelectionKey(8,'KITCHEN')],undefined);
});

test('Recupera selección anterior de cocina sin copiar la de ventas a barra', () => {
  const profile={id:'k',name:'Cocina',language:'ESCPOS',transport:'qz',queue:'Cocina',host:'',port:9100,uid:'',columns:48,codePage:19,cut:true};
  const {module:m}=settings({'kiwik.printers.v2':JSON.stringify({printers:[profile],selections:{'receipt:1':'k'}}),'kiwik.kitchen.printer:7:KITCHEN':'k'});
  m.restoreKitchenSelection(7,'KITCHEN');m.restoreKitchenSelection(7,'BAR');
  assert.equal(m.printerSelections.value[m.kitchenSelectionKey(7,'KITCHEN')],'k');
  assert.equal(m.printerSelections.value[m.kitchenSelectionKey(7,'BAR')],undefined);
});


test('Cajón independiente: efectivo una vez por operación, incluso tras fallo incierto y recarga', async () => {
  let pulses = [];
  const profile = {id:'sale',name:'Sale',language:'ESCPOS',transport:'qz',queue:'Sale',host:'',port:9100,uid:'',columns:48,codePage:19,cut:true};
  const initial = {'kiwik.printers.v2':JSON.stringify({printers:[profile],selections:{'receipt:1':'sale'}})};
  const dependencies = {'./qzTransport':{sendQzRaw:async(queue,data)=>{pulses.push(data);throw Error('uncertain');}}};
  const {module:m,storage} = settings(initial,dependencies);
  const cash = {...receipt,chargeId:101,payments:[{method:'CASH',amount:12.1}]};
  await assert.rejects(m.openCashDrawerOnce(cash,'1'),/uncertain/);
  await m.openCashDrawerOnce(cash,'1');
  await settings(Object.fromEntries(storage),dependencies).module.openCashDrawerOnce(cash,'1');
  assert.deepEqual(pulses,['\x1bp\x00\x19\x64']);
  await m.openCashDrawerOnce({...cash,chargeId:102,payments:[{method:'CARD',amount:12.1}]},'1');
  await m.openCashDrawerOnce({...cash,chargeId:102,documentKind:'PREBILL'},'1');
  await m.openCashDrawerOnce({...cash,chargeId:102,payments:[{method:'CASH',amount:0}]},'1');
  assert.equal(pulses.length,1);
  await assert.rejects(m.openCashDrawerOnce({refundId:101,total:5,method:'CASH'},'1'),/uncertain/);
  assert.equal(pulses.length,2); // Same numeric ID in a refund is a different operation.
  m.persistPrintSettings([{...profile,drawerEnabled:false}],{'receipt:1':'sale'});
  await m.openCashDrawerOnce({...cash,chargeId:103},'1');
  assert.equal(pulses.length,2);
  m.persistPrintSettings([{...profile,drawerPin:1}],{'receipt:1':'sale'});
  await assert.rejects(m.openCashDrawerOnce({...cash,chargeId:104},'1'),/uncertain/);
  assert.equal(pulses[2],'\x1bp\x01\x19\x64');
  assert.ok(!buildEscposReceipt(cash,layout,true).includes('\x1bp'));
});


test('QZ configura certificado antes de conectar y firma texto exacto con sesión actual', async () => {
  let certificateCallback, signatureCallback, hashCallback, connected=false, token='session1';
  const message='{"call":"printers.find","timestamp":123}';
  const qz={api:{setSha256Type:f=>hashCallback=f},security:{setCertificatePromise:f=>certificateCallback=f,setSignatureAlgorithm:a=>assert.equal(a,'SHA512'),setSignaturePromise:f=>signatureCallback=f},websocket:{isActive:()=>connected,connect:async()=>{assert.ok(certificateCallback);connected=true;}}};
  const m=load('../src/services/Printing/qzTransport.ts',{'qz-tray':qz,axios:{get:async()=>({status:200,data:'-----BEGIN CERTIFICATE-----test'}),post:async(url,body,config)=>{assert.equal(body,message);assert.equal(config.headers['X-Portal-Session'],'session2');return {data:'signature'};}},'../backendUrl':{backendUrl:p=>p},'../../stores/authStore':{useAuthStore:()=>({portalRequestConfig:()=>({headers:{'X-Portal-Session':token}})})}}, {crypto:webcrypto,TextEncoder});
  await m.connectQz();
  assert.equal(await new Promise(certificateCallback),'-----BEGIN CERTIFICATE-----test');
  token='session2';
  const digest=await hashCallback(message);
  assert.equal(digest,createHash('sha256').update(message).digest('hex'));
  assert.equal(await new Promise(signatureCallback(digest)),'signature');
});
