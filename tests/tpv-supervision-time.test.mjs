import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/views/TPV/tpvSupervision.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,{exports,require:()=>({}),Intl,Date});
const { hourlySales, zoneHourlySales, timeZoneLabel }=exports;
const ticket=(time,total,zoneId,zoneName='Zona')=>({chargedAtEpoch:Date.parse(time),total,zoneId,zoneName});
test('Zones with equal names stay separate, registers in one zone sum exactly',()=>{
 const rows=[ticket('2026-10-15T10:00:00Z',0.1,1),ticket('2026-10-15T10:02:00Z',0.2,1),ticket('2026-10-15T10:00:00Z',80,2)];
 const result=zoneHourlySales(rows,'Europe/Madrid');
 assert.equal(result.datasets.length,2);assert.equal(result.datasets[0].data[0],0.3);assert.equal(result.datasets[1].data[0],80);
 assert.notEqual(result.datasets[0].label,result.datasets[1].label);
 assert.equal(hourlySales(rows,'Europe/Madrid').data[0],80.3);
});
test('Midnight and next-day sales are not squeezed into 06:00 or merged',()=>{
 const result=hourlySales([ticket('2026-10-14T23:00:00Z',10,1),ticket('2026-10-15T23:00:00Z',20,1)],'Europe/Madrid');
 assert.equal(result.data.length,97);assert.equal(result.data[0],10);assert.equal(result.data[96],20);
 assert.match(result.labels[0],/15\/10\/2026.*01:00/);assert.match(result.labels[96],/16\/10\/2026.*01:00/);
});
test('Browser timezone is explicit and changes labels, not totals',()=>{
 const rows=[ticket('2026-10-15T10:00:00Z',25,1)];
 assert.match(hourlySales(rows,'Europe/Madrid').labels[0],/12:00/);
 assert.match(hourlySales(rows,'Atlantic/Canary').labels[0],/11:00/);
 assert.match(timeZoneLabel('Europe/Madrid',new Date('2026-10-15')),/GMT\+02:00/);
});
test('Repeated DST hour remains two different buckets with their offsets',()=>{
 const result=hourlySales([ticket('2026-10-25T00:15:00Z',10,1),ticket('2026-10-25T01:15:00Z',20,1)],'Europe/Madrid');
 assert.equal(result.data.length,5);assert.notEqual(result.labels[0],result.labels[4]);
 assert.match(result.labels[0],/02:15/);assert.match(result.labels[4],/02:15/);
 assert.equal(result.data.reduce((a,b)=>a+b,0),30);
});
test('Every zone shares the total chart axis; each bucket reconciles to total',()=>{
 const rows=[ticket('2026-10-15T03:10:00Z',15.67,2),ticket('2026-10-15T21:49:00Z',12.32,1),ticket('2026-10-15T21:49:00Z',3.5,2)];
 const total=hourlySales(rows,'Europe/Madrid'),zones=zoneHourlySales(rows,'Europe/Madrid');
 assert.equal(JSON.stringify(total.labels),JSON.stringify(zones.labels));
 total.data.forEach((value,i)=>assert.equal(Math.round(zones.datasets.reduce((s,d)=>s+d.data[i],0)*100),Math.round(value*100)));
});
test('Compact daily view restores 06–23, separates zones and positions current hour',()=>{
 const rows=[ticket('2026-10-15T10:00:00Z',10,1),ticket('2026-10-15T10:00:00Z',20,2),ticket('2026-10-14T10:00:00Z',900,1)];
 const result=exports.dailySales(rows,Date.parse('2026-10-15T10:07:00Z'),'Europe/Madrid');
 assert.equal(result.labels[0],'06:00');assert.equal(result.labels.at(-1),'23:00');
 assert.equal(result.currentLabel,'12:07');assert.equal(result.currentIndex,(12*60+7-360)/15);
 assert.equal(result.data.reduce((a,b)=>a+b,0),30);assert.equal(result.datasets.length,2);
});
test('Daily view extends for night sales without moving them to 06:00',()=>{
 const result=exports.dailySales([ticket('2026-10-14T23:15:00Z',10,1)],Date.parse('2026-10-15T10:00:00Z'),'Europe/Madrid');
 assert.equal(result.labels[0],'01:15');assert.equal(result.data[0],10);
});

test('Fiscal warnings remain actionable instead of disappearing among accepted tickets',()=>{
 assert.equal(exports.fiscalGroupOf('ACCEPTED'),'ok');
 assert.equal(exports.fiscalGroupOf('ACCEPTED_WITH_ERRORS'),'attention');
 for(const status of ['ERROR','NEEDS_CORRECTION','REJECTED']) assert.equal(exports.fiscalGroupOf(status),'attention');
 for(const status of ['PENDING','PROCESSING','']) assert.equal(exports.fiscalGroupOf(status),'pending');
});
