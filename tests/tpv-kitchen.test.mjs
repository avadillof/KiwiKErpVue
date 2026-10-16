
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/libs/printing/kitchenOrder.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,Date});
const order={id:42,tableName:'Terraza <3>',destination:'KITCHEN',createdAt:0,items:[{name:'Hamburguesa',quantity:2,action:'REMOVE',modifiers:['Sin cebolla'],note:'<script>test</script>\x1bp',destination:'KITCHEN'}]};
test('Comanda muestra anulaciones, cantidades y modificadores',()=>{
 const text=exports.kitchenText(order);
 assert.match(text,/ANULAR 2 x Hamburguesa/);
 assert.match(text,/Sin cebolla/);
 assert.ok(!text.includes('\x1b'));
});
test('HTML escapa contenido del cliente',()=>{
 const html=exports.kitchenHtml(order);
 assert.ok(!html.includes('<script>'));
 assert.match(html,/&lt;script&gt;/);
});
test('Copia visible, sin apertura de cajón ni QR fiscal',()=>{
 const raw=exports.kitchenEscpos({...order,copy:true},19,true);
 assert.match(raw,/COPIA/);
 assert.ok(!raw.includes('\x1bp'));
 assert.ok(!raw.includes('\x1d(k'));
 assert.ok(raw.endsWith('\x1dV\x00'));
});
