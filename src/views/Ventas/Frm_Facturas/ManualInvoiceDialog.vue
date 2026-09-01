<template>
  <Dialog v-model:visible="visible" modal maximizable :closable="!locked" :closeOnEscape="!locked" :style="{width:'min(1500px,98vw)',height:'92vh'}" :contentStyle="{overflow:'auto'}" class="kiwik-dialog manual-invoice-dialog">
    <template #header><div class="manual-heading"><i class="pi pi-receipt"/><div><b>Nueva factura manual</b><small>Sin pedido ni albarán de origen</small></div></div></template>
    <div class="manual-content">
      <Message severity="info" :closable="false">Se guardará un borrador. No registra entregas ni modifica cantidades de pedidos. Si corresponde a un pedido existente, factura desde ese pedido o sus albaranes.</Message>
      <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
      <Message v-if="retryRequest && !saving" severity="warn" :closable="false">No se pudo confirmar el resultado. Reintenta la misma operación para recuperar el borrador sin duplicarlo.</Message>
      <div class="manual-header">
        <label class="customer"><span>Cliente *</span><CustomerLookup id="manual-invoice-customer" :modelValue="form.entityId" :label="customerLabel" :disabled="locked || pricing.busy.value" @update:modelValue="setCustomerId" @selected="selectCustomer"/></label>
        <label><span>Fecha de factura *</span><DatePicker inputId="manual-invoice-date" v-model="form.date" dateFormat="dd/mm/yy" showIcon fluid :disabled="locked || pricing.busy.value"/></label>
        <label><span>Referencia</span><InputText v-model="form.reference" maxlength="145" :disabled="locked || pricing.busy.value" fluid/></label>
        <label class="reason"><span>Motivo de la factura manual *</span><InputText v-model="form.reason" maxlength="500" :disabled="locked || pricing.busy.value" placeholder="Ej.: servicio puntual sin pedido previo" fluid/></label>
        <label><span>Tarifa *</span><Select aria-label="Tarifa" v-model="form.salesTarifaId" :options="rates" optionLabel="description" optionValue="pkid" filter :disabled="locked || profileLoading || catalogLoading || pricing.busy.value" fluid/></label>
        <label><span>Forma de pago *</span><Select aria-label="Forma de pago" v-model="form.salesTermId" :options="paymentTerms" optionLabel="description" optionValue="pkid" optionDisabled="disabled" filter :disabled="locked || profileLoading || catalogLoading || pricing.busy.value" fluid/><small v-if="defaults && !profileLoading && !form.salesTermId">El cliente no tiene forma de pago configurada. Seleccione una.</small><small v-else-if="paymentTerms.find(term=>term.pkid===form.salesTermId)?.disabled">La forma de pago del cliente está inactiva. Seleccione otra.</small></label>
        <div class="customer-rules"><i v-if="profileLoading" class="pi pi-spin pi-spinner"/><span v-if="profileLoading">Cargando condiciones del cliente...</span><span v-else-if="defaults">Moneda: {{currencyCode}}<template v-if="defaults.retentionRate"> · Retención {{defaults.retentionRate}} %</template><template v-if="defaults.fixedTax!=null"> · Impuesto fijo {{defaults.fixedTax}} %</template></span></div>
      </div>
      <div class="lines-heading"><div><b>Artículos y servicios</b><small>El precio del artículo se propone como valor inicial; revísalo antes de guardar.</small></div><Button label="Añadir línea" icon="pi pi-plus" :disabled="locked || form.lines.length>=100" @click="addLine"/></div>
      <div class="flex gap-2 align-items-center flex-wrap"><Button label="Aplicar tarifa" icon="pi pi-tags" text :disabled="pricing.busy.value" @click="pricing.request"/><small>La tarifa propone el precio neto. El descuento de línea es adicional.</small></div><Message v-if="pricing.error.value" severity="error">{{pricing.error.value}}</Message>
      <DataTable ref="linesTable" :value="form.lines" dataKey="key" stripedRows size="small" scrollable scrollHeight="340px" class="manual-lines" :tableStyle="{minWidth:'1120px',tableLayout:'fixed'}">
        <Column header="Artículo / servicio" style="width:200px"><template #body="{data}"><ProductLookup v-model="data.productId" :label="data.productLabel" :disabled="locked || pricing.busy.value" @selected="selectProduct(data,$event)" @cleared="clearProduct(data)"/></template></Column>
        <Column header="Descripción" style="min-width:350px"><template #body="{data}"><InputText v-model="data.description" maxlength="165" :disabled="locked || pricing.busy.value" fluid/></template></Column>
        <Column header="Cantidad" style="width:100px"><template #body="{data}"><InputNumber locale="es-ES" :useGrouping="true" v-model="data.quantity" @update:modelValue="pricing.quantityChanged(data,$event)" :min="0.001" :max="1000000000" :maxFractionDigits="3" :disabled="locked || pricing.busy.value" fluid/></template></Column>
        <Column header="Precio" style="width:115px"><template #body="{data}"><InputNumber locale="es-ES" :useGrouping="true" v-model="data.priceUnit" :title="data.pricingSource || 'Precio manual'" @update:modelValue="data.pricingSource='Precio manual'" :min="0" :max="1000000000" :minFractionDigits="2" :maxFractionDigits="4" :disabled="locked || pricing.busy.value" fluid/></template></Column>
        <Column header="Dto. %" style="width:80px"><template #body="{data}"><InputNumber locale="es-ES" :useGrouping="true" v-model="data.discount" :min="0" :max="100" :maxFractionDigits="2" :disabled="locked || pricing.busy.value" fluid/></template></Column>
        <Column header="IVA %" style="width:80px"><template #body="{data}"><InputNumber locale="es-ES" :useGrouping="true" v-model="data.tax" :min="0" :max="100" :maxFractionDigits="2" :disabled="locked || defaults?.fixedTax!=null" fluid/></template></Column>
        <Column header="Importe" style="width:120px;text-align:right"><template #body="{data}">{{amount(lineNet(data)*(1+Number(data.tax||0)/100))}}</template></Column>
        <Column header="" style="width:45px"><template #body="{index}"><Button icon="pi pi-trash" text rounded severity="danger" aria-label="Eliminar línea" :disabled="locked || pricing.busy.value" @click="form.lines.splice(index,1)"/></template></Column>
        <template #empty>Añade al menos una línea para crear el borrador.</template>
      </DataTable>
      <div class="manual-totals"><span>Base <b>{{amount(totals.net)}}</b></span><span>Impuestos <b>{{amount(totals.tax)}}</b></span><span v-if="totals.retention">Retención <b>−{{amount(totals.retention)}}</b></span><span>Total <b>{{amount(totals.total)}} {{currencyCode}}</b></span></div>
      <div class="manual-terms"><label><span>Condiciones generales</span><Textarea v-model="form.terms" rows="6" maxlength="1000" :disabled="locked || pricing.busy.value" fluid/></label><label><span>Condiciones particulares del cliente</span><Textarea v-model="form.customerTerms" rows="6" maxlength="10000" :disabled="locked || pricing.busy.value" fluid/></label></div>
    </div>
    <template #footer><div class="manual-footer"><div class="kiwik-separator"/><div class="actions"><Button label="Cancelar" text severity="secondary" :disabled="locked || pricing.busy.value" @click="visible=false"/><Button :label="retryRequest?'Reintentar misma operación':'Guardar borrador'" icon="pi pi-save" :loading="saving" :disabled="profileLoading || (!retryRequest && !valid)" @click="save"/></div></div></template>
  </Dialog>
  <PriceRecalculationDialog :visible="pricing.confirmVisible.value" :busy="pricing.batchBusy.value" :canKeep="pricing.canKeep.value" :error="pricing.error.value" @cancel="pricing.cancel" @keep="pricing.keep" @recalculate="pricing.recalculate"/>
</template>
<script setup lang="ts">
import {computed,reactive,ref,onUnmounted,nextTick} from 'vue';
import axios from 'axios';
import PriceRecalculationDialog from '@/components/shared/PriceRecalculationDialog.vue';
import {useSalesPricing} from '@/services/salesPricing';

import Select from 'primevue/select';
import Button from 'primevue/button';import Column from 'primevue/column';import DataTable from 'primevue/datatable';import DatePicker from 'primevue/datepicker';import Dialog from 'primevue/dialog';import InputNumber from 'primevue/inputnumber';import InputText from 'primevue/inputtext';import Message from 'primevue/message';import Textarea from 'primevue/textarea';
import CustomerLookup from '@/components/shared/CustomerLookup.vue';import ProductLookup from '@/components/shared/ProductLookup.vue';
import {useAuthStore} from '@/stores/authStore';
const emit=defineEmits<{saved:[invoice:any]}>(),auth=useAuthStore();
const visible=ref(false),saving=ref(false),profileLoading=ref(false),error=ref(''),selectedCustomer=ref<any>(),defaults=ref<any>(),retryRequest=ref<any>(null);
const linesTable=ref<any>();
const catalogId=(value:any):number|null=>value!=null&&value!==''&&Number.isInteger(Number(value))&&Number(value)>0?Number(value):null;
const rates=ref<any[]>([]),paymentTerms=ref<any[]>([]),catalogLoading=ref(false);
const currencyCode=computed(()=>rates.value.find(rate=>rate.pkid===form.salesTarifaId)?.currencyCode||defaults.value?.currencyCode||'EUR');
async function loadCatalog(){catalogLoading.value=true;try{const{data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebLoadSalesQuoteCatalog`);rates.value=(data.rates||[]).map((rate:any)=>({...rate,pkid:catalogId(rate.pkid)}));paymentTerms.value=(data.terms||[]).map((term:any)=>({...term,pkid:catalogId(term.pkid),disabled:term.active===false}))}catch(e){error.value=errorMessage(e)}finally{catalogLoading.value=false}}
let profileVersion=0,lineKey=0;
const newLine=()=>({key:++lineKey,productId:null as number|null,productLabel:'',description:'',quantity:1 as number|null,priceUnit:0 as number|null,discount:0 as number|null,tax:0 as number|null,productTax:0,pricingSource:'',pricingError:'',pricingPending:false});
type ManualLine=ReturnType<typeof newLine>;
const form=reactive({entityId:null as number|null,salesTarifaId:null as number|null,salesTermId:null as number|null,date:new Date(),reference:'',reason:'',notes:'',terms:'',customerTerms:'',lines:[newLine()]});
const pricing=useSalesPricing({lines:()=>form.lines,tarifa:computed({get:()=>form.salesTarifaId,set:(v)=>{form.salesTarifaId=v}}),enabled:()=>visible.value&&!profileLoading.value&&!saving.value&&!retryRequest.value,currency:(id)=>rates.value.find(r=>r.pkid===id)?.currencyCode});
const locked=computed(()=>saving.value||!!retryRequest.value);
const customerLabel=computed(()=>selectedCustomer.value?`${selectedCustomer.value.code||''} — ${selectedCustomer.value.name}`:'');
const round=(v:number)=>Math.round((v+Number.EPSILON)*100)/100,amount=(v:number)=>new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2,useGrouping:true}).format(v);
const lineNet=(line:ManualLine)=>Number(line.quantity||0)*Number(line.priceUnit||0)*(1-Number(line.discount||0)/100);
const totals=computed(()=>{const net=form.lines.reduce((sum,line)=>sum+lineNet(line),0),tax=form.lines.reduce((sum,line)=>sum+lineNet(line)*Number(line.tax||0)/100,0),retention=round(net*Number(defaults.value?.retentionRate||0)/100);return{net:round(net),tax:round(tax),retention,total:round(net+tax-retention)}});
const numeric=(v:number|null,min:number,max:number)=>v!=null&&Number.isFinite(v)&&v>=min&&v<=max;
const valid=computed(()=>!pricing.invalid.value&&!!form.entityId&&!!form.salesTarifaId&&!!form.salesTermId&&!paymentTerms.value.find(term=>term.pkid===form.salesTermId)?.disabled&&!catalogLoading.value&&!!defaults.value&&!profileLoading.value&&form.date instanceof Date&&!isNaN(form.date.getTime())&&!!form.reason.trim()&&form.lines.length>0&&form.lines.length<=100&&totals.value.total>0&&totals.value.total<=1e12&&form.lines.every(l=>!!l.productId&&!!l.description.trim()&&numeric(l.quantity,.001,1e9)&&numeric(l.priceUnit,0,1e9)&&numeric(l.discount,0,100)&&numeric(l.tax,0,100)));
const errorMessage=(e:any)=>typeof e.response?.data==='string'?e.response.data:e.response?.data?.message||e.message||'No se pudo completar la operación.';
function open(){if(locked.value){visible.value=true;return}pricing.cancel();profileVersion++;selectedCustomer.value=null;defaults.value=null;profileLoading.value=false;error.value='';Object.assign(form,{entityId:null,salesTarifaId:null,salesTermId:null,date:new Date(),reference:'',reason:'',notes:'',terms:'',customerTerms:'',lines:[newLine()]});visible.value=true;void loadCatalog();}
function setCustomerId(id:number|null){form.entityId=id;if(id==null){profileVersion++;selectedCustomer.value=null;defaults.value=null;profileLoading.value=false;form.salesTarifaId=null;form.salesTermId=null;form.terms='';form.customerTerms='';}}
async function selectCustomer(customer:any){
  const oldRate=form.salesTarifaId;profileLoading.value=true;selectedCustomer.value=customer;form.entityId=customer.pkid;defaults.value=null;form.salesTarifaId=null;form.salesTermId=null;profileLoading.value=true;error.value='';const version=++profileVersion;
  try{const {data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebGetManualSalesInvoiceCustomer/${customer.pkid}`);if(version!==profileVersion)return;defaults.value=data;form.salesTarifaId=catalogId(data.salesTarifaId);form.salesTermId=catalogId(data.salesTermId===undefined?customer.salesTermId:data.salesTermId);form.terms=data.terms||'';form.customerTerms=data.customerTerms||'';form.lines.forEach(l=>{l.tax=data.fixedTax??l.productTax})}
  catch(e){if(version===profileVersion)error.value=errorMessage(e)}finally{if(version===profileVersion){profileLoading.value=false;pricing.changed(oldRate);}}
}
async function addLine(){
  if(locked.value||form.lines.length>=100)return;
  form.lines.push(newLine());
  await nextTick();
  const rows=linesTable.value?.$el?.querySelectorAll('tbody tr') as NodeListOf<HTMLElement>|undefined;
  const row=rows?.[rows.length-1];
  const input=row?.querySelector('input') as HTMLInputElement|null;
  row?.scrollIntoView({block:'nearest',inline:'start',behavior:'smooth'});
  input?.focus({preventScroll:true});
}
function selectProduct(line:ManualLine,product:any){line.productId=product.pkid;line.productLabel=product.code||product.description;line.description=product.description||'';line.priceUnit=Number(product.salePrice||0);line.productTax=Number(product.taxValue||0);line.tax=defaults.value?.fixedTax??line.productTax;line.discount=0;void pricing.apply(line); }
function clearProduct(line:ManualLine){pricing.clear(line);Object.assign(line,newLine())}
async function save(){
  if(saving.value||(!retryRequest.value&&!valid.value))return;
  const userCode=auth.user?.userDsCode?.trim();if(!auth.isAuthenticated||!userCode){error.value='No se ha identificado al usuario conectado. Vuelve a iniciar sesión.';return}
  const request=retryRequest.value||{operationKey:crypto.randomUUID(),userCode,entityId:form.entityId,salesTarifaId:form.salesTarifaId,salesTermId:form.salesTermId,createDate:form.date.toISOString(),reference:form.reference.trim(),reason:form.reason.trim(),notes:form.notes,terms:form.terms,customerTerms:form.customerTerms,lines:form.lines.map(l=>({productId:l.productId,description:l.description.trim(),quantity:l.quantity,priceUnit:l.priceUnit,discount:l.discount,tax:l.tax}))};
  retryRequest.value=request;saving.value=true;error.value='';
  try{const {data}=await axios.post(`${import.meta.env.VITE_API_URL}/WebCreateManualSalesInvoice`,request,{timeout:20000});retryRequest.value=null;visible.value=false;emit('saved',data)}
  catch(e:any){error.value=errorMessage(e);if(e.response?.status>=400&&e.response?.status<500)retryRequest.value=null}
  finally{saving.value=false}
}
const protectRetry=(event:BeforeUnloadEvent)=>{if(retryRequest.value){event.preventDefault();event.returnValue=''}};
window.addEventListener('beforeunload',protectRetry);onUnmounted(()=>window.removeEventListener('beforeunload',protectRetry));
defineExpose({open});
</script>
<style scoped>
.manual-heading{display:flex;align-items:center;gap:.8rem}.manual-heading>i{font-size:1.5rem;color:#789b19}.manual-heading small,.lines-heading small{display:block;color:#77806e;margin-top:.2rem}.manual-content{display:flex;flex-direction:column;min-height:0;flex:0 0 auto;gap:.8rem}.manual-header{display:grid;grid-template-columns:2fr 1fr 1fr;gap:.8rem}.manual-header label,.manual-terms label{display:flex;flex-direction:column;gap:.3rem}.manual-header label>span,.manual-terms label>span{font-size:.8rem;color:#55604d}.reason{grid-column:1/3}.customer-rules{align-self:end;font-size:.8rem;color:#66715d;padding:.5rem}.lines-heading{display:flex;justify-content:space-between;align-items:center}.manual-lines{flex:0 0 auto;min-height:160px;border:1px solid #e5e7eb;border-radius:8px}.manual-lines :deep(.p-inputnumber-input){width:100%;min-width:0}.manual-totals{display:flex;justify-content:flex-end;gap:1.4rem;flex-wrap:wrap;padding:.7rem;background:#f7faef;border-radius:6px}.manual-totals b{margin-left:.5rem}.manual-terms{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.manual-footer{width:100%}.actions{display:flex;justify-content:flex-end;gap:.5rem;margin-top:.8rem}@media(max-width:800px){.manual-header,.manual-terms{grid-template-columns:1fr}.reason{grid-column:auto}.manual-totals{justify-content:flex-start}.lines-heading{gap:.5rem}}
.manual-content> *{flex-shrink:0}.manual-terms :deep(textarea){min-height:150px;resize:vertical}.manual-header label{min-width:0}
:global(.manual-invoice-dialog.kiwik-dialog .p-dialog-content){overflow-y:auto!important;min-height:0!important;height:auto!important;padding:1rem!important}
</style>
