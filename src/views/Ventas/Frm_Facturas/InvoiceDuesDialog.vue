<template>
  <Dialog v-model:visible="visible" modal maximizable :style="{width:'min(1000px,96vw)'}" :pt="{root:{class:'kiwik-dialog'},header:{class:'kiwik-dialog-header'},content:{class:'kiwik-dialog-content'},footer:{class:'kiwik-dialog-footer'}}">
    <template #header><b><i class="pi pi-calendar"/> Vencimientos · {{invoice?.code}}</b></template>
    <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
    <p v-if="loading">Calculando vencimientos…</p>
    <template v-else-if="!error">
      <Message v-if="preview||draft" severity="info" :closable="false">Calendario previsto. Se recalcula y guarda al emitir. Esta consulta no guarda cambios ni registra cobros.</Message>
      <Message v-if="rows.some(r=>r.source==='LEGACY')" severity="info" :closable="false">Vencimiento histórico conservado, sin reconstruir plazos antiguos.</Message>
      <InvoiceDuesTable :rows="rows" :preview="preview" :currency="invoice?.currencyCode||'EUR'"/>
    </template>
    <template #footer><div style="width:100%;border-top:1px solid #9cc10a;padding-top:12px;text-align:right"><Button label="Cerrar" severity="secondary" @click="visible=false"/></div></template>
  </Dialog>
</template>
<script setup lang="ts">
import {useAuthStore} from "@/stores/authStore";
const auth=useAuthStore();
import {ref} from 'vue';import axios from 'axios';import Dialog from 'primevue/dialog';import Button from 'primevue/button';import Message from 'primevue/message';import InvoiceDuesTable from './InvoiceDuesTable.vue';
const visible=ref(false),loading=ref(false),error=ref(''),invoice=ref<any>(),rows=ref<any[]>([]),preview=ref(false),draft=ref(false);
const localDay=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
async function open(item:any,unsaved=false,total?:number){
 invoice.value=item;preview.value=unsaved;rows.value=[];error.value='';visible.value=true;loading.value=true;
 try{
  if(unsaved){
   if(item.dueDateOverride){rows.value=[{position:1,dueDate:localDay(item.toPayDate),amount:Math.round(Number(total)*100)/100,source:'MANUAL'}];}
   else rows.value=(await axios.post(import.meta.env.VITE_API_URL+'/WebPreviewSalesInvoiceDues',{invoiceId:item.pkid,termId:item.salesTermId,date:localDay(item.createDate),total:Math.round(Number(total)*100)/100},auth.portalRequestConfig())).data;
  }else{const data=(await axios.get(import.meta.env.VITE_API_URL+'/WebGetSalesInvoiceDues/'+item.pkid,auth.portalRequestConfig())).data;rows.value=data.dues;draft.value=data.draft;}
 }catch(e:any){error.value=typeof e.response?.data==='string'?e.response.data:e.message||'No se pudieron consultar los vencimientos.'}finally{loading.value=false}
}
defineExpose({open});
</script>
