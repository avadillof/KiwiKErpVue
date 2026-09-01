import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {parse} from '@vue/compiler-sfc';
const root='src/views/Ventas/Frm_Facturas/';
function component(name){const text=fs.readFileSync(root+name+'.vue','utf8');return {...parse(text).descriptor,text};}
function expression(component,name){const tree=ts.createSourceFile('test.ts',component.scriptSetup.content,ts.ScriptTarget.Latest,true);for(const statement of tree.statements){if(ts.isVariableStatement(statement)){for(const declaration of statement.declarationList.declarations)if(declaration.name.getText(tree)===name)return declaration.initializer.getText(tree);}if(ts.isFunctionDeclaration(statement)&&statement.name?.text===name)return statement.getText(tree);}throw Error('Missing '+name);}
function bind(component,name,context){const body=ts.transpileModule('const fn='+expression(component,name)+';', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;return new Function(...Object.keys(context),body+';return fn;')(...Object.values(context));}
const invoice=component('Frm_Facturas'),queuePanel=component('VeriFactuQueuePanel'),chain=component('VeriFactuChainPanel'),email=component('InvoiceEmailDialog');
let checks=0;const check=(value)=>{assert.ok(value);checks++;};
for(const success of [true,false,undefined]){const detailVisible={value:true};await bind(invoice,'saveDraftAndClose',{detailVisible,saveDetail:async()=>success})();check(detailVisible.value===!success);}
let refreshed=0,reopened=0;await bind(invoice,'onManualInvoiceCreated',{toast:{add(){}},refresh:async()=>refreshed++,openDetail:async()=>reopened++})({code:'DRAFT-TEST'});check(refreshed===1&&reopened===0);
const queue={value:null},loading={value:false};const data={accepted:Array.from({length:20},(_,pkid)=>({pkid})),errors:[{pkid:40}],pending:[{pkid:50}],acceptedLimit:20};
const queueLoad=expression(queuePanel,'load').replaceAll('import.meta.env.VITE_API_URL',"'fixture'");const run=ts.transpileModule('const fn='+queueLoad+';', {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
await new Function('loading','queue','axios','setTimeout','decorateTable',run+';return fn;')(loading,queue,{get:async()=>({data})},()=>{},()=>{})();
check(queue.value.accepted.length===20);check(queue.value.pending.length===1&&queue.value.errors.length===1);check(loading.value===false);
const chainRows={value:[]};const chainLoad=expression(chain,'load').replaceAll('import.meta.env.VITE_API_URL',"'fixture'");const chainRun=ts.transpileModule('const fn='+chainLoad+';', {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
await new Function('loading','rows','axios','dateFrom','dateTo','isoDay',chainRun+';return fn;')(loading,chainRows,{get:async()=>({data:data.accepted})},{value:null},{value:null},()=>undefined)();check(chainRows.value.length===8&&chainRows.value.at(-1).pkid===7);
const pad=v=>String(v).padStart(2,'0'),stamp={year:2026,monthValue:8,dayOfMonth:30,hour:19,minute:10};
const chainDate=bind(chain,'dateTime',{pad});check(chainDate(stamp)==='30/08/2026 19:10');check(chainDate(null)==='');check(chainDate('invalid')==='');check(chainDate([2026,8,30,19,10])==='30/08/2026 19:10');
const parseQueue=bind(queuePanel,'parsed',{});check(parseQueue(stamp).getFullYear()===2026);check(parseQueue('invalid')===null);
const model={mode:{value:'compose'},hasDraft:{value:false},sending:{value:false},invoice:{value:null},source:{value:null},pendingRequest:{value:null},uncertain:{value:false},notice:{value:''},loaded:{value:false},confirmVisible:{value:false},visible:{value:false},load:async()=>{}};
bind(email,'open',model)({pkid:42},'history');check(model.mode.value==='history'&&!model.hasDraft.value&&model.visible.value);
const selectedIds={value:[]},subject={value:''},message={value:''};bind(email,'prepareResend',{...model,selectedIds,subject,message,data:{value:{contacts:[{pkid:1},{pkid:2}]}},recipients:row=>JSON.parse(row.recipientsJson),noticeSeverity:{value:'success'}})({id:7,subject:'Old subject',message:'Old message',recipientsJson:'[{"pkid":2}]'});
check(model.mode.value==='compose'&&model.hasDraft.value);check(subject.value==='Old subject'&&message.value==='Old message');check(selectedIds.value.length===1&&selectedIds.value[0]===2);
check(invoice.template.content.includes('class="code-indicators"'));check(invoice.template.content.includes('@click="saveDraftAndClose"'));check(email.template.content.includes('v-if="mode===\'history\'"'));check(email.template.content.includes('v-if="mode===\'compose\'"'));check(email.template.content.includes('scrollHeight="360px"'));
console.log(`PASS: ${checks} isolated invoice UI checks. No server, database, SMTP or fiscal calls.`);
let filterArgs;const selected={value:{pkid:42}},selectedEmailStatus={value:'NOT_SENT'},selectedDueStatus={value:'OVERDUE'};
const applyFilter=bind(invoice,'filter',{selected,selectedEmailStatus,selectedDueStatus,selectedStatus:{value:'ISSUED'},selectedVerifactuStatus:{value:'ACCEPTED'},tableRef:{value:{searchQuery:'Cliente',refreshWithQuery:(...args)=>filterArgs=args}}});
applyFilter();assert.equal(filterArgs[1].emailStatus,'NOT_SENT');assert.equal(filterArgs[1].verifactuStatus,'ACCEPTED');assert.equal(filterArgs[1].status,'ISSUED');assert.equal(filterArgs[2],true);assert.equal(selected.value,null);
selectedEmailStatus.value=null;applyFilter();assert.equal(filterArgs[1].emailStatus,undefined);
assert.ok(invoice.template.content.includes('emailStatus:selectedEmailStatus||undefined'));
console.log('PASS: 7 isolated email filter UI checks. No API calls.');
const dueSeverity=bind(invoice,'dueFilterSeverity',{});
for(const [status,color] of [['OVERDUE','danger'],['TODAY','warn'],['UPCOMING','warn'],['LATER','info'],['UNKNOWN','secondary'],[null,'secondary']]){
 selectedDueStatus.value=status;applyFilter();assert.equal(filterArgs[1].dueStatus,status||undefined);assert.equal(dueSeverity(status),color);assert.equal(filterArgs[2],true);
}
assert.ok(invoice.template.content.includes('dueStatus:selectedDueStatus||undefined'));
assert.ok(invoice.text.includes('selectedEmailStatus,selectedDueStatus],filter)'));
console.log('PASS: 20 isolated due-filter UI checks: parameters, colors, clearing and pagination reset.');
const helperExports={};new Function('exports',ts.transpileModule(fs.readFileSync('src/libs/HelperDates.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText)(helperExports);
const invoiceParsed=bind(invoice,'parsed',{parseLocalizedServerDate:helperExports.parseLocalizedServerDate});
const invoiceDate=bind(invoice,'date',{parsed:invoiceParsed,pad}),invoiceDateTime=bind(invoice,'dateTime',{parsed:invoiceParsed,pad,date:invoiceDate});
for(const [input,expected] of [
 ['ago 30, 2026 07:45:23 p. m.','30/08/2026 19:45:23'],
 ['ago. 30, 2026 07:45:23 p.\u00a0m.','30/08/2026 19:45:23'],
 ['Aug 30, 2026 07:45:23 PM','30/08/2026 19:45:23'],
 ['ago 30, 2026 12:00:01 a. m.','30/08/2026 00:00:01'],
 ['ago 30, 2026 12:00:01 p. m.','30/08/2026 12:00:01'],
 ['2026-08-30T19:45:23','30/08/2026 19:45:23'],
 [null,'-'],['invalid','-']
])assert.equal(invoiceDateTime(input),expected);
assert.equal(helperExports.parseLocalizedServerDate('feb 30, 2026 07:45:23 p. m.'),null);
console.log('PASS: 9 invoice date/time regression checks (localized dates, ISO and missing values).');
const canOpenPayments=bind(invoice,'canOpenPayments',{isDraft:bind(invoice,'isDraft',{}),invoiceProtected:item=>!!item.protected});
for(const status of [null,'','PENDING','PROCESSING','REJECTED','NEEDS_CORRECTION','ACCEPTED_WITH_ERRORS'])assert.equal(canOpenPayments({state:'Confirmada / Confirming',verifactuStatus:status}),false);
for(const state of ['Borrador / Draft','Cancelada / Canceled','Anulada','Para Aprobar / To Approved Invoice'])assert.equal(canOpenPayments({state,verifactuStatus:'ACCEPTED'}),false);
assert.equal(canOpenPayments({state:'Confirmada / Confirming',verifactuStatus:'ACCEPTED',canReceivePayment:false}),true);
assert.equal(canOpenPayments({state:'Confirmada / Confirming',verifactuStatus:'ACCEPTED',canManagePayments:false}),false);
assert.equal(canOpenPayments({state:'Confirmada / Confirming',verifactuStatus:'ACCEPTED',protected:true}),false);
console.log('PASS: 14 payment menu eligibility checks. Fully paid eligible invoices retain history access.');
