<template>
  <Dialog v-model:visible="visible" modal maximizable class="kiwik-dialog" :style="{width:'min(1200px,96vw)',maxHeight:'90vh'}" :contentStyle="{overflow:'auto'}">
    <template #header><div class="audit-heading"><i class="pi pi-history"/><div><b>Auditoría · {{ invoice?.code }}</b><small>Emisión, reintentos, subsanaciones y resultados VeriFactu</small></div></div></template>
    <section v-if="!error && checkedAt" class="current-status" aria-live="polite"><b>Estado actual de VeriFactu</b><Tag :value="currentStatusLabel" :severity="statusSeverity(currentStatus)"/><small>Consultado: {{ dateTime(checkedAt) }} · Pulse Actualizar para volver a comprobar.</small></section>
    <Message severity="info" :closable="false">Cada fila describe lo ocurrido en su fecha, no el estado actual. «Envío encolado» indica que se preparó el envío en ese momento; no significa que siga pendiente. El HTTP de emisión corresponde al ERP, no a la aceptación de VeriFactu.</Message>
    <p>Fechas en Europe/Madrid. El operador y el usuario del certificado pueden ser distintos. Las respuestas automáticas figuran como «Sistema · VeriFactu». Sólo se registran resultados desde la instalación de esta funcionalidad, sin reconstruir fechas ni eventos anteriores.</p>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <DataTable :value="rows" :loading="loading" dataKey="id" stripedRows scrollable size="small">
      <template #empty>{{ error ? 'Historial no disponible.' : loading ? 'Cargando historial…' : 'No hay operaciones registradas en esta página.' }}</template>
      <Column header="Fecha y hora"><template #body="{data}">{{ dateTime(data.createdAt) }}</template></Column>
      <Column header="Usuario de la operación"><template #body="{data}">{{ data.operation==='VERIFACTU_RESULT' && data.actor==='SYSTEM:VERIFACTU' ? 'Sistema · VeriFactu' : data.actor }}</template></Column>
      <Column field="certificateUser" header="Usuario del certificado"/>
      <Column header="Operación"><template #body="{data}">{{ operations[data.operation] || data.operation }}</template></Column>
      <Column header="Resultado de la operación"><template #body="{data}"><Tag :value="resultLabel(data)" :severity="statusSeverity(data.result)"/></template></Column>
      <Column header="HTTP ERP / integración"><template #body="{data}">{{ data.httpStatus || '—' }}</template></Column>
      <Column field="invoiceCode" header="Código al registrar"/>
    </DataTable>
    <p v-if="rows.some(row=>row.result==='FAILED')">Un fallo no acredita un envío fiscal. Comprueba el estado actual y el histórico VeriFactu antes de repetir.</p>
    <div class="kiwik-separator"/>
    <template #footer><div class="audit-footer"><span>Página {{page+1}}</span><Button label="Anterior" severity="secondary" text :disabled="loading||page===0" @click="load(page-1)"/><Button label="Siguiente" severity="secondary" text :disabled="loading||!hasMore" @click="load(page+1)"/><Button label="Actualizar" icon="pi pi-refresh" severity="secondary" outlined :disabled="loading" @click="load(0)"/><Button label="Cerrar" severity="secondary" @click="visible=false"/></div></template>
  </Dialog>
</template>
<script setup lang="ts">
import {computed,ref} from 'vue';
import axios from 'axios';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Message from 'primevue/message';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import {useAuthStore} from '@/stores/authStore';
const auth=useAuthStore();
const visible=ref(false),loading=ref(false),error=ref(''),invoice=ref<any>(),rows=ref<any[]>([]),page=ref(0),hasMore=ref(false);
const currentStatus=ref(''),checkedAt=ref('');
const operations:Record<string,string>={ISSUE:'Emisión',RETRY:'Reintento VeriFactu',CORRECTION:'Subsanación',VERIFACTU_RESULT:'Resultado VeriFactu'};
const statuses:Record<string,string>={ACCEPTED:'Aceptada por VeriFactu',ACCEPTED_WITH_ERRORS:'Aceptada con errores por VeriFactu',NEEDS_CORRECTION:'Requiere corrección',REJECTED:'Envío detenido / requiere revisión',PENDING:'Pendiente de envío',PROCESSING:'En procesamiento',RETRY_SCHEDULED:'Reintento automático programado'};
const currentStatusLabel=computed(()=>statuses[currentStatus.value]||currentStatus.value||'Sin envío registrado');
const resultLabel=(row:any)=>row.result==='QUEUED'?`${row.operation==='ISSUE'?'Emisión confirmada':row.operation==='CORRECTION'?'Subsanación preparada':'Reintento preparado'} · envío encolado`:row.operation==='VERIFACTU_RESULT'?(statuses[row.result]||row.result):row.result==='REJECTED'?'Operación rechazada':row.result==='FAILED'?'Fallida / revisar estado':row.result;
const statusSeverity=(status:string)=>status==='ACCEPTED'?'success':['ACCEPTED_WITH_ERRORS','NEEDS_CORRECTION','REJECTED','RETRY_SCHEDULED'].includes(status)?'warn':status==='FAILED'?'danger':['QUEUED','PENDING','PROCESSING'].includes(status)?'info':'secondary';
const dateTime=(value:string)=>{if(!value)return '—';const date=new Date(value.endsWith('Z')?value:value+'Z');return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Europe/Madrid'}).format(date);};
let requestId=0;
async function load(target:number){
  const current=++requestId;loading.value=true;error.value='';rows.value=[];hasMore.value=false;checkedAt.value='';currentStatus.value='';
  try{const {data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesInvoiceAudit/${invoice.value.pkid}`,{...auth.portalRequestConfig(),params:{page:target}});if(current!==requestId)return;rows.value=data.items;page.value=data.page;hasMore.value=data.hasMore;currentStatus.value=data.currentVeriFactuStatus||'';checkedAt.value=data.statusCheckedAt||'';}
  catch(e:any){if(current!==requestId)return;error.value=e.response?.status===401||!auth.portalSession?'Vuelve a iniciar sesión en el portal.':'No se pudo cargar la auditoría. Comprueba el backend y la migración V20.';}
  finally{if(current===requestId)loading.value=false;}
}
function open(item:any){if(!item?.pkid)return;invoice.value=item;page.value=0;visible.value=true;void load(0);}
defineExpose({open});
</script>
<style scoped>
.audit-heading{display:flex;align-items:center;gap:12px}.audit-heading>i{padding:12px;border-radius:9px;color:#648506;background:#eef5dc}.audit-heading small{display:block;margin-top:4px;color:#657084}.audit-footer{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:8px}p{color:#657084;font-size:.9rem;line-height:1.5}
.current-status{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;padding:14px;border:1px solid #dfe8d0;border-radius:10px;background:#f8faf5}.current-status small{width:100%;color:#657084}
</style>
