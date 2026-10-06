<template>
  <Dialog v-model:visible="visible" modal maximizable :style="{width:'min(1000px,96vw)'}" :pt="{root:{class:'kiwik-dialog'},header:{class:'kiwik-dialog-header'},content:{class:'kiwik-dialog-content'},footer:{class:'kiwik-dialog-footer'}}">
    <template #header><b><i class="pi pi-calendar"/> Vencimientos · {{invoice?.code}}</b></template>
    <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
    <p v-if="loading">Calculando vencimientos…</p>
    <template v-else-if="!error">
      <Message v-if="preview||draft" severity="info" :closable="false">Calendario previsto. Se recalcula y guarda al emitir. Esta consulta no guarda cambios ni registra cobros.</Message>
      <Message v-if="rows.some(r=>r.source==='LEGACY')" severity="info" :closable="false">Vencimiento histórico conservado, sin reconstruir plazos antiguos.</Message>
      <template v-if="editable">
        <Message severity="info" :closable="false">Fracciona el total en plazos. La suma debe cuadrar con el total de la factura.</Message>
        <DataTable :value="editRows" size="small" stripedRows>
          <Column header="#" style="width:3rem"><template #body="{index}">{{index+1}}</template></Column>
          <Column header="Fecha" style="width:220px"><template #body="{data}"><DatePicker v-model="data.dueDate" dateFormat="dd/mm/yy" showIcon fluid /></template></Column>
          <Column header="Importe" style="text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{data}"><InputNumber v-model="data.amount" :min="0.01" :minFractionDigits="2" :maxFractionDigits="2" mode="currency" :currency="invoice?.currencyCode||'EUR'" locale="de-DE" fluid inputClass="text-right" /></template></Column>
          <Column style="width:3.5rem"><template #body="{data}"><Button icon="pi pi-trash" severity="danger" text rounded title="Eliminar plazo" :disabled="editRows.length<=1" @click="removeRow(data)" /></template></Column>
        </DataTable>
        <div class="dues-actions"><Button label="Añadir plazo" icon="pi pi-plus" size="small" text @click="addRow" /><span class="dues-sum" :class="{'dues-sum--error':!sumsUp}">Suma {{amount(editSum)}} / Total {{amount(editTotal)}}</span></div>
      </template>
      <InvoiceDuesTable v-else :rows="rows" :preview="preview" :currency="invoice?.currencyCode||'EUR'"/>
    </template>
    <template #footer><div style="width:100%;border-top:1px solid #9cc10a;padding-top:12px;text-align:right"><Button label="Cerrar" severity="secondary" @click="visible=false"/><Button v-if="editable" label="Guardar vencimientos" icon="pi pi-save" :disabled="!sumsUp||!editRows.length" :loading="saving" @click="save" style="margin-left:.5rem"/></div></template>
  </Dialog>
</template>
<script setup lang="ts">
import { backendUrl } from '@/services/backendUrl';
import {useAuthStore} from "@/stores/authStore";
const auth=useAuthStore();
import {computed, ref} from 'vue';import axios from 'axios';import Dialog from 'primevue/dialog';import Button from 'primevue/button';import Message from 'primevue/message';import Column from 'primevue/column';import DataTable from 'primevue/datatable';import DatePicker from 'primevue/datepicker';import InputNumber from 'primevue/inputnumber';import InvoiceDuesTable from './InvoiceDuesTable.vue';
const visible=ref(false),loading=ref(false),saving=ref(false),error=ref(''),invoice=ref<any>(),rows=ref<any[]>([]),preview=ref(false),draft=ref(false),editRows=ref<any[]>([]);
const editable=computed(()=>draft.value&&!preview.value);
const amount=(v:any)=>new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2,useGrouping:true}).format(Number(v)||0);
const editTotal=computed(()=>Number(invoice.value?.totalTotal||0));
const editSum=computed(()=>editRows.value.reduce((t,r)=>t+Number(r.amount||0),0));
const sumsUp=computed(()=>editRows.value.length>0&&editRows.value.every(r=>r.dueDate instanceof Date&&Number(r.amount)>0)&&Math.abs(editSum.value-editTotal.value)<0.015);
const localDay=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const toDate=(v:any):Date|null=>{if(!v)return null;if(v instanceof Date)return v;const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));if(m)return new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));const d=new Date(String(v));return Number.isNaN(d.getTime())?null:d;};
const addRow=()=>{const remaining=editTotal.value-editSum.value;editRows.value.push({dueDate:new Date(),amount:Math.max(0,Math.round(remaining*100)/100)});};
const removeRow=(row:any)=>{editRows.value=editRows.value.filter(r=>r!==row);};
async function open(item:any,unsaved=false,total?:number){
 invoice.value=item;rows.value=[];error.value='';visible.value=true;loading.value=true;
 preview.value=unsaved&&!item?.pkid;
 try{
  if(preview.value){
   if(item.dueDateOverride){rows.value=[{position:1,dueDate:localDay(item.toPayDate),amount:Math.round(Number(total)*100)/100,source:'MANUAL'}];}
   else rows.value=(await axios.post(backendUrl('/WebPreviewSalesInvoiceDues'),{invoiceId:item.pkid,termId:item.salesTermId,date:localDay(item.createDate),total:Math.round(Number(total)*100)/100},auth.portalRequestConfig())).data;
  }else{const data=(await axios.get(backendUrl('/WebGetSalesInvoiceDues/' + item.pkid),auth.portalRequestConfig())).data;rows.value=data.dues;draft.value=data.draft;editRows.value=(data.dues||[]).map((r:any)=>({dueDate:toDate(r.dueDate),amount:Number(r.amount||0)}));if(!editRows.value.length)editRows.value=[{dueDate:new Date(),amount:Math.round(Number(item.totalTotal||total||0)*100)/100}];}
 }catch(e:any){error.value=typeof e.response?.data==='string'?e.response.data:e.message||'No se pudieron consultar los vencimientos.'}finally{loading.value=false}
}
async function save(){
 if(!sumsUp.value||saving.value)return;saving.value=true;error.value='';
 try{
  await axios.post(backendUrl('/WebSaveSalesInvoiceManualDues'),{invoiceId:invoice.value.pkid,dues:editRows.value.map(r=>({due:localDay(r.dueDate),amount:Math.round(Number(r.amount)*100)/100}))},auth.portalRequestConfig());
  const {data}=(await axios.get(backendUrl('/WebGetSalesInvoiceDues/' + invoice.value.pkid),auth.portalRequestConfig()));
  rows.value=data.dues;draft.value=data.draft;editRows.value=(data.dues||[]).map((r:any)=>({dueDate:toDate(r.dueDate),amount:Number(r.amount||0)}));
 }catch(e:any){error.value=typeof e.response?.data==='string'?e.response.data:e.message||'No se pudieron guardar los vencimientos.'}finally{saving.value=false}
}
defineExpose({open});
</script>

<style scoped>
.dues-actions{display:flex;align-items:center;justify-content:space-between;margin-top:.7rem}
.dues-sum{font-weight:700}
.dues-sum--error{color:#b93a3a}
:deep(th.text-right .p-datatable-column-header-content){justify-content:flex-end}
</style>
