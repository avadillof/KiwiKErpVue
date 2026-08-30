import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/views/Ventas/Frm_Facturas/ManualInvoiceDialog.vue',import.meta.url),'utf8').split('<script setup lang="ts">')[1].split('</script>')[0].replace(/import\s+[\s\S]*?from\s*['"][^'"]+['"];?/g,'').replaceAll('import.meta.env.VITE_API_URL',"'test.invalid'");
function setup(get){
 const context={axios:{get},ref:value=>({value}),reactive:value=>value,computed:fn=>({get value(){return fn()}}),nextTick:async()=>{},onUnmounted:()=>{},defineEmits:()=>()=>{},defineExpose:()=>{},useAuthStore:()=>({}),window:{addEventListener:()=>{},removeEventListener:()=>{}}};
 vm.createContext(context);vm.runInContext(ts.transpileModule(source+';globalThis.api={form,selectCustomer,setCustomerId,loadCatalog,paymentTerms,addLine,linesTable,retryRequest};',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,context);return context.api;
}
test('customer payment ID is inherited when older defaults response omits it',async()=>{
 const api=setup(async()=>({data:{salesTarifaId:'1',paymentTermDescription:'60 días'}}));
 await api.selectCustomer({pkid:8,salesTermId:'2'});assert.equal(api.form.salesTermId,2);assert.equal(api.form.salesTarifaId,1);
});
test('explicit defaults override lookup, including an unconfigured customer',async()=>{
 const api=setup(async()=>({data:{salesTarifaId:1,salesTermId:null}}));
 await api.selectCustomer({pkid:8,salesTermId:2});assert.equal(api.form.salesTermId,null);
 api.form.salesTermId=2;api.setCustomerId(null);assert.equal(api.form.salesTermId,null);assert.equal(api.form.salesTarifaId,null);
});
test('late previous customer response cannot overwrite latest selection',async()=>{
 let resolveFirst;const api=setup(url=>url.endsWith('/1')?new Promise(resolve=>{resolveFirst=resolve}):Promise.resolve({data:{salesTarifaId:2,salesTermId:3}}));
 const first=api.selectCustomer({pkid:1,salesTermId:1});await api.selectCustomer({pkid:2,salesTermId:2});resolveFirst({data:{salesTarifaId:1,salesTermId:1}});await first;assert.equal(api.form.salesTermId,3);assert.equal(api.form.entityId,2);
});
test('inactive customer payment stays labelled but unavailable for selection',async()=>{
 const api=setup(async()=>({data:{rates:[],terms:[{pkid:'2',description:'Antigua',active:false}]}}));await api.loadCatalog();assert.equal(api.paymentTerms.value[0].pkid,2);assert.equal(api.paymentTerms.value[0].disabled,true);
});
test('new row receives focus and scroll after rendering, retry cannot add rows',async()=>{
 const api=setup();let scrolled=false,focused=false;
 const input={scrollIntoView:options=>{assert.equal(options.block,'nearest');scrolled=true},focus:options=>{assert.equal(options.preventScroll,true);focused=true}};
 api.linesTable.value={$el:{querySelectorAll:()=>[{querySelector:()=>input,scrollIntoView:input.scrollIntoView}]}};
 await api.addLine();assert.equal(api.form.lines.length,2);assert.equal(scrolled,true);assert.equal(focused,true);
 api.retryRequest.value={};await api.addLine();assert.equal(api.form.lines.length,2);
});
