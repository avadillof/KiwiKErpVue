
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/views/TPV/tpvLineSelection.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports});
const select=exports.catalogLine;
const kitchen={id:1,preparation:{destination:'KITCHEN',note:'',modifiers:[]}};
test('Añadir desde catálogo incrementa la línea enviada a cocina sin modificadores',()=>assert.equal(select([kitchen],1),kitchen));
test('No hereda notas ni modificadores de otra consumición',()=>{
 assert.equal(select([{...kitchen,preparation:{...kitchen.preparation,note:'Sin sal'}}],1),undefined);
 assert.equal(select([{...kitchen,preparation:{...kitchen.preparation,modifiers:['Sin cebolla']}}],1),undefined);
});
test('Prefiere línea ordinaria existente y no elige arbitrariamente entre cocina y barra',()=>{
 const plain={id:1}; const bar={...kitchen,preparation:{...kitchen.preparation,destination:'BAR'}};
 assert.equal(select([kitchen,plain],1),plain);
 assert.equal(select([kitchen,bar],1),undefined);
 assert.equal(select([kitchen],2),undefined);
});

test('No mezcla suplementos con una consumición sin suplemento',()=>{
 const extra={...kitchen,supplementIds:[9]};
 assert.equal(select([extra],1),undefined);
 assert.equal(select([extra,kitchen],1),kitchen);
});
