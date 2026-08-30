<template>
  <Dialog v-model:visible="visible" modal maximizable :closable="!busy && !retryRequest" :style="{width:'min(1100px,96vw)'}" :pt="{root:{class:'kiwik-dialog'},header:{class:'kiwik-dialog-header'},content:{class:'kiwik-dialog-content'},footer:{class:'kiwik-dialog-footer'}}">
    <template #header><div class="heading"><i class="pi pi-wallet"/><div><b>Cobros de la factura · {{invoice?.code}}</b><small>Historial y saldo pendiente</small></div></div></template>
    <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
    <p v-if="loading"><i class="pi pi-spin pi-spinner"/> Cargando cobros…</p>
    <template v-else-if="data">
      <div class="balances"><div><small>Total factura</small><strong>{{money(data.total)}}</strong></div><div><small>Importe cobrado</small><strong>{{money(data.collectedAmount)}}</strong></div><div><small>Saldo pendiente</small><strong>{{money(data.pendingAmount)}}</strong></div></div>
      <Message v-if="data.legacyBalance" severity="info" :closable="false">Saldo previo: esta factura ya constaba como cobrada antes del registro de movimientos. No se conoce la fecha ni el medio de cobro y no se puede revertir desde este historial.</Message>
      <h3>Historial de cobros</h3>
      <DataTable :value="data.history" dataKey="id" scrollable scrollHeight="260px" size="small">
        <template #empty>No hay movimientos registrados.</template>
        <Column header="Fecha"><template #body="{data:p}">{{formatDate(p.paymentDate)}}</template></Column>
        <Column header="Importe"><template #body="{data:p}">{{money(p.amount)}}</template></Column>
        <Column header="Medio"><template #body="{data:p}">{{methods.find(m=>m.value===p.method)?.label||p.method}}</template></Column>
        <Column field="reference" header="Referencia"/>
        <Column header="Trazabilidad"><template #body="{data:p}"><div class="audit">{{p.createdBy}} · {{formatDate(p.createdAt)}}<small v-if="p.notes">{{p.notes}}</small><small v-if="p.reversedAt">Revertido por {{p.reversedBy}} · {{formatDate(p.reversedAt)}}<br>{{p.reversalReason}}</small></div></template></Column>
        <Column header="Estado"><template #body="{data:p}"><Tag :value="p.reversedAt?'Revertido':'Registrado'" :severity="p.reversedAt?'secondary':'success'"/></template></Column>
        <Column header="Acciones"><template #body="{data:p}"><div class="actions"><Button icon="pi pi-paperclip" text title="Justificantes del cobro" aria-label="Justificantes del cobro" :disabled="busy||!!retryRequest" @click="attachmentId=p.id;attachmentsVisible=true"/><Button v-if="!p.reversedAt" icon="pi pi-undo" text severity="danger" title="Revertir cobro" aria-label="Revertir cobro" :disabled="busy||!!retryRequest" @click="reversal=p;reason=''"/></div></template></Column>
      </DataTable>
      <Message v-if="retryRequest" severity="warn" :closable="false">No se ha podido confirmar la respuesta. Pulsa «Comprobar / reintentar»: se conserva la misma operación para no duplicar el cobro.</Message>
      <fieldset v-if="data.canReceivePayment || retryRequest" :disabled="busy||!!retryRequest">
        <legend>Registrar un cobro</legend>
        <div class="form-grid"><label>Fecha<DatePicker v-model="form.date" dateFormat="dd/mm/yy" showIcon :maxDate="today"/></label><label>Importe<InputNumber v-model="form.amount" mode="currency" currency="EUR" locale="es-ES" :min="0.01" :max="Number(data.pendingAmount)" :minFractionDigits="2" :maxFractionDigits="2"/></label><label>Medio de cobro<Select v-model="form.method" :options="methods" optionLabel="label" optionValue="value" placeholder="Selecciona un medio"/></label><label>Referencia<InputText v-model="form.reference" maxlength="200"/></label><label class="wide">Observaciones<Textarea v-model="form.notes" rows="2" maxlength="1000"/></label></div>
        <small>El justificante es opcional: después de guardar, utiliza el clip del movimiento.</small>
      </fieldset>
      <p class="hint">El cobro no altera líneas, número, PDF ni estado de VeriFactu.</p>
    </template>
    <template #footer><div class="footer"><div class="kiwik-separator"/><div class="actions"><Button label="Cerrar" text severity="secondary" :disabled="busy||!!retryRequest" @click="visible=false"/><Button v-if="!data && !loading" label="Reintentar carga" @click="load"/><Button v-if="data?.canReceivePayment||retryRequest" :label="retryRequest?'Comprobar / reintentar':'Registrar cobro'" icon="pi pi-check" :loading="busy" :disabled="loading||(!retryRequest&&!valid)" @click="register"/></div></div></template>
  </Dialog>
  <Dialog :visible="!!reversal" modal header="Revertir cobro" :closable="!busy" :style="{width:'min(540px,95vw)'}" @update:visible="v=>{if(!v)reversal=null}">
    <Message v-if="error" severity="error" :closable="false">{{error}}</Message><p>Se conservará el movimiento original y se recalculará el saldo pendiente.</p><label class="reason">Motivo obligatorio<Textarea v-model="reason" rows="3" maxlength="1000" :disabled="busy"/></label>
    <template #footer><Button label="Volver" text :disabled="busy" @click="reversal=null"/><Button label="Revertir cobro" severity="danger" :loading="busy" :disabled="!reason.trim()" @click="reverse"/></template>
  </Dialog>
  <AttachmentsDialog v-model:visible="attachmentsVisible" moduleFolder="ATTACHEMENTS_SALESINVOICE_PAYMENTS" :entityId="attachmentId" :title="`Justificantes del cobro #${attachmentId}`"/>
</template>

<script setup lang="ts">
import {computed,ref} from 'vue';

import {useAuthStore} from '@/stores/authStore';
import axios from 'axios';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
const emit=defineEmits<{saved:[]}>();
const visible=ref(false),loading=ref(false),busy=ref(false),error=ref(''),invoice=ref<any>(),data=ref<any>(),reversal=ref<any>(),reason=ref('');
const retryRequest=ref<any>(null),attachmentsVisible=ref(false),attachmentId=ref<number>(0);
const authStore=useAuthStore();
const connectedUserCode=()=>{
  const code=authStore.user?.userDsCode?.trim();
  if(!authStore.isAuthenticated||!code)throw new Error('No se ha identificado al usuario conectado. Vuelve a iniciar sesión.');
  return code;
};
const today=new Date();
const methods=[{label:'Cheque',value:'CHEQUE'},{label:'Domiciliación',value:'DIRECT_DEBIT'},{label:'Efectivo',value:'CASH'},{label:'Otro',value:'OTHER'},{label:'Tarjeta',value:'CARD'},{label:'Transferencia',value:'TRANSFER'}];
const form=ref({date:new Date(),amount:null as number|null,method:'TRANSFER',reference:'',notes:''});
const money=(v:any)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(v)||0);
const dateString=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const formatDate=(v:any)=>{if(!v)return '—';const s=Array.isArray(v)?`${v[0]}-${String(v[1]).padStart(2,'0')}-${String(v[2]).padStart(2,'0')}`:String(v);return s.slice(0,10).split('-').reverse().join('/')};
const valid=computed(()=>form.value.date instanceof Date && !isNaN(form.value.date.getTime()) && Number(form.value.amount)>0 && Number(form.value.amount)<=Number(data.value?.pendingAmount) && !!form.value.method);
const api=(path:string)=>`${import.meta.env.VITE_API_URL}/${path}/${invoice.value.pkid}`;
const message=(e:any)=>typeof e.response?.data==='string'?e.response.data:e.response?.data?.message||e.response?.data?.detail||e.message||'No se pudo completar la operación. Comprueba la conexión.';
async function load(){loading.value=true;error.value='';try{data.value=(await axios.get(api('WebGetSalesInvoicePayments'),{params:{userCode:connectedUserCode()}})).data;}catch(e){error.value=message(e)}finally{loading.value=false}}
async function open(item:any){if(retryRequest.value){visible.value=true;return}invoice.value=item;data.value=null;error.value='';reversal.value=null;form.value={date:new Date(),amount:null,method:'TRANSFER',reference:'',notes:''};visible.value=true;await load()}
async function register(){
  if(busy.value||(!retryRequest.value&&!valid.value))return;
  try{connectedUserCode()}catch(e){error.value=message(e);return}
  const request=retryRequest.value||{operationKey:crypto.randomUUID(),paymentDate:dateString(form.value.date),amount:form.value.amount,method:form.value.method,reference:form.value.reference,notes:form.value.notes};
  retryRequest.value=request;busy.value=true;error.value='';
  try{data.value=(await axios.post(api('WebRegisterSalesInvoicePayment'),{...request,userCode:connectedUserCode()},{timeout:20000})).data;retryRequest.value=null;form.value.amount=null;form.value.reference='';form.value.notes='';emit('saved')}
  catch(e:any){error.value=message(e);if(e.response?.status>=400&&e.response.status<500){retryRequest.value=null;await load();error.value=message(e)}}finally{busy.value=false}
}
async function reverse(){if(busy.value||!reason.value.trim())return;busy.value=true;error.value='';try{data.value=(await axios.post(`${api('WebReverseSalesInvoicePayment')}/${reversal.value.id}`,{reason:reason.value,userCode:connectedUserCode()},{timeout:20000})).data;reversal.value=null;emit('saved')}catch(e){error.value=message(e)}finally{busy.value=false}}
defineExpose({open});
</script>

<style scoped>
.heading,.actions{display:flex;align-items:center;gap:.65rem}.heading>i{padding:.8rem;border-radius:10px;background:#eaf2d2;color:#648506}.heading small,.balances small,.audit small{display:block;color:#697586;margin-top:.25rem}.balances{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.2rem}.balances>div{padding:1rem;background:#f6f9ee;border:1px solid #dce7c2;border-radius:9px}.balances strong{display:block;font-size:1.3rem;margin-top:.4rem}fieldset{margin-top:1.3rem;border:1px solid #dce7c2;border-radius:8px;padding:1rem}legend{font-weight:700}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem}.form-grid label,.reason{display:flex;flex-direction:column;gap:.4rem}.wide{grid-column:1/-1}fieldset>small,.hint{display:block;margin-top:.7rem;color:#697586}.audit{max-width:260px;white-space:normal;overflow-wrap:anywhere}.footer{width:100%}.footer .actions{justify-content:flex-end}.kiwik-separator{height:1px;background:#9cc10a;margin-bottom:.8rem}@media(max-width:650px){.balances,.form-grid{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
