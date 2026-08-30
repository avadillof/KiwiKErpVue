<template>
  <Dialog v-model:visible="visible" modal maximizable :closable="!busy && !retryRequest" :closeOnEscape="!busy && !retryRequest" :style="{width:'min(1200px,96vw)'}" class="kiwik-dialog">
    <template #header><div class="heading"><i class="pi pi-receipt"/><div><b>Facturar desde pedido · {{code}}</b><small>Por cantidades pedidas o sin albarán</small></div></div></template>
    <Message severity="info" :closable="false">El borrador reserva las cantidades seleccionadas. La entrega se controla por separado; las líneas por cantidades entregadas se facturan desde sus albaranes.</Message>
    <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
    <Message v-if="retryRequest" severity="warn" :closable="false">No se pudo confirmar el resultado. Reintenta la misma operación para recuperar la factura sin duplicarla.</Message>
    <div v-if="loading" class="loading"><i class="pi pi-spin pi-spinner"/> Consultando cantidades disponibles...</div>
    <DataTable v-else :value="lines" dataKey="id" scrollable scrollHeight="45vh" stripedRows size="small" :tableStyle="{minWidth:'850px'}">
      <Column field="description" header="Artículo / servicio"/>
      <Column header="Política"><template #body="{data}"><Tag :value="!data.requireDelivery?'Sin albarán':data.direct?'Cantidades pedidas':'Desde albarán'" :severity="data.direct?'info':'secondary'"/></template></Column>
      <Column field="quantity" header="Pedidas"/>
      <Column field="delivered" header="Entregadas"/>
      <Column field="invoiced" header="Facturadas"/>
      <Column field="reserved" header="Comprometidas"/>
      <Column field="available" header="Disponibles"/>
      <Column header="A facturar"><template #body="{data}"><InputNumber v-if="data.direct" v-model="data.selectedQuantity" :min="0" :max="data.available" :maxFractionDigits="3" :disabled="busy || !!retryRequest || data.available<=0" :inputStyle="{width:'110px'}"/><span v-else>Desde albarán</span></template></Column>
    </DataTable>
    <small>Comprometidas incluye borradores y facturas emitidas no anuladas. Usa cero para excluir una línea.</small>
    <template #footer><div class="footer"><div class="kiwik-separator"/><div class="actions"><Button label="Cerrar" severity="secondary" text :disabled="busy || !!retryRequest" @click="visible=false"/><Button :label="retryRequest?'Reintentar misma operación':'Crear borrador'" icon="pi pi-receipt" :loading="busy" :disabled="loading || (!retryRequest && !valid)" @click="save"/></div></div></template>
  </Dialog>
</template>
<script setup lang="ts">
import {computed,ref} from 'vue';
import axios from 'axios';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import {useAuthStore} from '@/stores/authStore';
const emit=defineEmits<{generated:[invoice:any]}>();
const auth=useAuthStore(),visible=ref(false),loading=ref(false),busy=ref(false),error=ref(''),code=ref(''),orderId=ref<number>(),lines=ref<any[]>([]),retryRequest=ref<any>(null);
const selected=computed(()=>lines.value.filter(l=>l.direct&&Number(l.selectedQuantity)>0));
const valid=computed(()=>selected.value.length>0&&selected.value.every(l=>Number.isFinite(l.selectedQuantity)&&l.selectedQuantity<=l.available));
const message=(e:any)=>typeof e.response?.data==='string'?e.response.data:e.response?.data?.message||e.message||'No se pudo completar la operación.';
async function open(id:number){
  if(retryRequest.value){visible.value=true;return}
  orderId.value=id;lines.value=[];code.value='';error.value='';visible.value=true;loading.value=true;
  try{const {data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebPrepareSalesOrderInvoice/${id}`);code.value=data.code;lines.value=data.lines.map((l:any)=>({...l,selectedQuantity:l.direct?l.available:0}));}catch(e){error.value=message(e)}finally{loading.value=false}
}
async function save(){
  if(busy.value||(!retryRequest.value&&!valid.value))return;
  const userCode=auth.user?.userDsCode?.trim();
  if(!auth.isAuthenticated||!userCode){error.value='Vuelve a iniciar sesión antes de facturar.';return}
  const request=retryRequest.value||{operationKey:crypto.randomUUID(),userCode,lines:selected.value.map(l=>({id:l.id,quantity:l.selectedQuantity}))};
  retryRequest.value=request;busy.value=true;error.value='';
  try{const {data}=await axios.post(`${import.meta.env.VITE_API_URL}/WebCreateSalesOrderInvoice/${orderId.value}`,request,{timeout:20000});retryRequest.value=null;visible.value=false;emit('generated',data)}
  catch(e:any){error.value=message(e);if(e.response?.status>=400&&e.response?.status<500){retryRequest.value=null;const savedError=error.value;await open(orderId.value!);error.value=savedError}}
  finally{busy.value=false}
}
defineExpose({open});
</script>
<style scoped>
.heading{display:flex;align-items:center;gap:.8rem}.heading>i{font-size:1.5rem;color:#789b19}.heading small{display:block;color:#6b7280;margin-top:.25rem}.loading{padding:2rem;text-align:center}.footer{width:100%}.actions{display:flex;justify-content:flex-end;gap:.5rem;margin-top:1rem}
</style>
