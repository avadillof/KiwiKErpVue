<template>
  <Dialog v-model:visible="visible" modal :closable="!busy" :closeOnEscape="!busy" :draggable="false"
    :style="{width:'min(1280px,97vw)',height:'90vh'}" class="kiwik-dialog"
    :pt="{headerActions:{style:{position:'absolute',right:'1.25rem',top:'50%',transform:'translateY(-50%)'}}}">
    <template #header><div class="case-header"><span><i class="pi pi-building-columns"/></span><div><b>Requerimientos y documentación AEAT</b><small>Facturación · Preparación de expedientes</small></div></div></template>
    <div class="case-content">
      <Message severity="info" :closable="false">Preparación documental, sin envío automático a la AEAT. Presenta la respuesta por el procedimiento indicado en la notificación.</Message>
      <nav class="case-nav"><Button label="Expedientes preparados" :outlined="tab!=='list'" :disabled="busy" @click="tab='list';loadCases()"/><Button label="Nuevo expediente" icon="pi pi-plus" :outlined="tab!=='new'" :disabled="busy" @click="tab='new';activeCase=null"/></nav>
      <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
      <template v-if="tab==='new'">
        <div class="case-form">
          <label class="reference"><span>Referencia del requerimiento *</span><InputText v-model="form.reference" maxlength="150" :disabled="busy" placeholder="Expediente o referencia de la notificación"/></label>
          <label><span>Facturas desde *</span><DatePicker v-model="fromDate" dateFormat="dd/mm/yy" showIcon :disabled="busy"/></label>
          <label><span>Facturas hasta *</span><DatePicker v-model="toDate" dateFormat="dd/mm/yy" showIcon :disabled="busy"/></label>
          <label><span>Plazo de respuesta</span><DatePicker v-model="deadline" dateFormat="dd/mm/yy" showIcon :disabled="busy"/></label>
          <label class="notes"><span>Alcance / observaciones</span><Textarea v-model="form.notes" rows="2" maxlength="2000" :disabled="busy" placeholder="Selecciona únicamente la documentación solicitada."/></label>
        </div>
        <div class="case-toolbar"><Button label="Buscar facturas del periodo" icon="pi pi-search" :loading="searching" :disabled="busy||!validRange" @click="searchInvoices"/><span>{{selectedInvoices.length}} seleccionadas de {{candidates.length}}</span></div>
        <DataTable :value="candidates" v-model:selection="selectedInvoices" dataKey="id" paginator :rows="10" :rowsPerPageOptions="[10,25,50]" size="small" stripedRows scrollable scrollHeight="320px" :loading="searching">
          <Column selectionMode="multiple" headerStyle="width:3rem"/>
          <Column field="code" header="Factura" sortable/>
          <Column field="date" header="Fecha" sortable><template #body="{data}">{{formatDate(data.date)}}</template></Column>
          <Column field="customer" header="Cliente" sortable/>
          <Column field="state" header="Situación"/>
          <Column field="verifactuStatus" header="VeriFactu"><template #body="{data}">{{statusLabel(data.verifactuStatus)}}</template></Column>
          <Column field="total" header="Total" bodyStyle="text-align:right"><template #body="{data}">{{money(data.total)}}</template></Column>
          <template #empty>Consulta el periodo para seleccionar las facturas que requiere el expediente.</template>
        </DataTable>
        <small>Máximo 500 facturas y 100 MB por expediente. Los borradores y registros incompletos se incluyen con advertencias, sin generar documentación fiscal nueva.</small>
      </template>
      <template v-else>
        <DataTable :value="cases" :loading="loading" size="small" stripedRows scrollable scrollHeight="250px">
          <Column field="reference" header="Referencia"/>
          <Column header="Preparado"><template #body="{data}">{{formatDate(data.createdAt,true)}}</template></Column>
          <Column header="Periodo"><template #body="{data}">{{formatDate(data.fromDate)}} — {{formatDate(data.toDate)}}</template></Column>
          <Column header="Facturas"><template #body="{data}">{{data.invoiceIds.length}}</template></Column>
          <Column header="Documentación"><template #body="{data}"><Tag :value="data.receipt?'Justificante adjunto':'Preparado · sin justificante'" :severity="data.receipt?'success':'secondary'"/></template></Column>
          <Column header=""><template #body="{data}"><Button label="Ver expediente" icon="pi pi-folder-open" text :disabled="busy" @click="activeCase=data"/></template></Column>
          <template #empty>No hay expedientes preparados.</template>
        </DataTable>
        <div class="case-toolbar"><Button icon="pi pi-chevron-left" aria-label="Página anterior" text :disabled="page===0||loading" @click="page--;loadCases()"/><span>Página {{page+1}} de {{Math.max(1,totalPages)}}</span><Button icon="pi pi-chevron-right" aria-label="Página siguiente" text :disabled="page+1>=totalPages||loading" @click="page++;loadCases()"/><Button label="Actualizar" icon="pi pi-refresh" text :disabled="loading" @click="loadCases"/></div>
        <section v-if="activeCase" class="case-detail">
          <h3>{{activeCase.reference}}</h3>
          <div class="case-toolbar"><span>Plazo: <b>{{formatDate(activeCase.deadline)}}</b></span><span>{{activeCase.invoiceIds.length}} facturas</span><Button label="Descargar expediente ZIP" icon="pi pi-download" :loading="downloading" :disabled="busy" @click="downloadArchive"/></div>
          <p v-if="activeCase.notes">{{activeCase.notes}}</p>
          <small class="checksum">SHA-256 del ZIP (no huella fiscal): {{activeCase.sha256}}</small>
          <Message v-if="warnings.length" severity="warn" :closable="false"><b>{{warnings.length}} advertencias. Revisa la documentación antes de presentarla.</b><ul class="warning-list"><li v-for="(warning,index) in warnings" :key="index">{{warning}}</li></ul></Message>
          <Message v-else severity="success" :closable="false">No se detectaron ausencias de PDF, request o response en la extracción. Esto no certifica el cumplimiento del requerimiento ni la integridad completa de la cadena.</Message>
          <div class="case-documents">
            <div><b>Notificación recibida</b><Button v-if="activeCase.notification" label="Ver notificación" icon="pi pi-file-pdf" text @click="openDocument('notification')"/><label v-else class="upload-label">Adjuntar PDF (máximo 15 MB)<input type="file" accept="application/pdf,.pdf" :disabled="busy" @change="uploadDocument($event,'notification')"/></label></div>
            <div><b>Justificante de presentación</b><template v-if="activeCase.receipt"><Button label="Ver justificante" icon="pi pi-file-pdf" text @click="openDocument('receipt')"/><small>Archivado: {{formatDate(activeCase.receiptAt,true)}}</small></template><label v-else class="upload-label">Adjuntar PDF tras presentar la respuesta<input type="file" accept="application/pdf,.pdf" :disabled="busy" @change="uploadDocument($event,'receipt')"/></label></div>
          </div>
          <small>El ZIP conserva la copia preparada. Los documentos adjuntos se guardan aparte y no se sobrescriben. Adjuntar un justificante no envía información ni verifica la presentación en la AEAT.</small>
        </section>
      </template>
    </div>
    <template #footer><div class="case-footer"><Button label="Cerrar" text severity="secondary" :disabled="busy" @click="visible=false"/><Button v-if="tab==='new'" label="Preparar y archivar expediente" icon="pi pi-folder-plus" :loading="preparing" :disabled="busy||!canPrepare" @click="prepare"/></div></template>
  </Dialog>
</template>

<script setup lang="ts">
import {computed,onUnmounted,ref,watch} from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import {blockOperation,unblockOperation} from '@/services/composables/useOperationBlocker';
const base=`${import.meta.env.VITE_API_URL}/WebSalesAeatCases`;
const visible=ref(false),tab=ref('list'),error=ref(''),loading=ref(false),searching=ref(false),preparing=ref(false),uploading=ref(false),downloading=ref(false);
const cases=ref<any[]>([]),activeCase=ref<any>(null),candidates=ref<any[]>([]),selectedInvoices=ref<any[]>([]),page=ref(0),totalPages=ref(0);
const fromDate=ref<Date|null>(new Date(new Date().getFullYear(),0,1)),toDate=ref<Date|null>(new Date()),deadline=ref<Date|null>(null),form=ref({reference:'',notes:''});
const busy=computed(()=>preparing.value||uploading.value||downloading.value);
const iso=(value:Date|null)=>value?`${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`:'';
const validRange=computed(()=>!!fromDate.value&&!!toDate.value&&iso(fromDate.value)<=iso(toDate.value));
const canPrepare=computed(()=>validRange.value&&form.value.reference.trim()&&selectedInvoices.value.length>0&&!searching.value);
const warnings=computed<string[]>(()=>{try{return JSON.parse(activeCase.value?.warnings||'[]')}catch{return ['No se pudieron interpretar las advertencias del expediente.']}});
const formatDate=(value:any,time=false)=>{if(!value)return '—';const d=Array.isArray(value)?new Date(value[0],value[1]-1,value[2],value[3]||0,value[4]||0,value[5]||0):new Date(String(value).length===10?`${value}T00:00:00`:value);return Number.isNaN(d.getTime())?'—':time?d.toLocaleString('es-ES'):d.toLocaleDateString('es-ES')};
const money=(value:any)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number(value)||0);
const statusLabel=(value:string)=>({ACCEPTED:'Aceptada',ACCEPTED_WITH_ERRORS:'Aceptada con errores',PENDING:'Pendiente',PROCESSING:'En proceso',NEEDS_CORRECTION:'Requiere corrección',REJECTED:'Error técnico'}[value]||value||'No enviada');
const message=(e:any)=>typeof e.response?.data==='string'?e.response.data:e.response?.data?.message||e.response?.data?.detail||'No se pudo completar la operación. Comprueba la conexión y que el backend esté actualizado.';
watch([fromDate,toDate],()=>{candidates.value=[];selectedInvoices.value=[]});
async function loadCases(){loading.value=true;error.value='';try{const {data}=await axios.get(base,{params:{page:page.value},timeout:30000});cases.value=data.content;totalPages.value=data.totalPages;}catch(e){error.value=message(e)}finally{loading.value=false}}
async function searchInvoices(){if(!validRange.value||searching.value)return;searching.value=true;error.value='';selectedInvoices.value=[];candidates.value=[];const from=iso(fromDate.value),to=iso(toDate.value);try{const {data}=await axios.get(`${base}/invoices`,{params:{from,to},timeout:30000});if(from===iso(fromDate.value)&&to===iso(toDate.value))candidates.value=data;}catch(e){error.value=message(e)}finally{searching.value=false}}
async function prepare(){if(busy.value||!canPrepare.value)return;preparing.value=true;error.value='';blockOperation('aeat-case','Preparando expediente…','Recopilando los archivos conservados. No se enviará información a la AEAT.');try{const {data}=await axios.post(base,{...form.value,fromDate:iso(fromDate.value),toDate:iso(toDate.value),deadline:iso(deadline.value)||null,invoiceIds:selectedInvoices.value.map(i=>i.id)},{timeout:180000});activeCase.value=data;tab.value='list';page.value=0;selectedInvoices.value=[];await loadCases();}catch(e){error.value=`${message(e)} Si se perdió la respuesta, actualiza los expedientes antes de volver a prepararlo.`}finally{preparing.value=false;unblockOperation('aeat-case')}}
async function downloadArchive(){if(!activeCase.value||busy.value)return;downloading.value=true;error.value='';try{const {data}=await axios.get(`${base}/${activeCase.value.id}/download`,{responseType:'blob',timeout:120000});const url=URL.createObjectURL(data);const link=document.createElement('a');link.href=url;link.download=activeCase.value.filename;link.click();window.setTimeout(()=>URL.revokeObjectURL(url),60000);}catch(e:any){if(e.response?.data instanceof Blob){try{const body=JSON.parse(await e.response.data.text());error.value=body.message||'No se pudo recuperar el ZIP archivado.'}catch{error.value='No se pudo recuperar el ZIP archivado.'}}else error.value=message(e)}finally{downloading.value=false}}
async function uploadDocument(event:Event,kind:string){const input=event.target as HTMLInputElement,file=input.files?.[0];if(!file||!activeCase.value||busy.value)return;error.value='';if(file.size>15*1024*1024){error.value='El PDF debe ocupar como máximo 15 MB.';input.value='';return}uploading.value=true;try{const body=new FormData();body.append('file',file);const {data}=await axios.post(`${base}/${activeCase.value.id}/documents/${kind}`,body,{timeout:60000});activeCase.value=data;await loadCases();}catch(e){error.value=message(e)}finally{uploading.value=false;input.value=''}}
function openDocument(kind:string){window.open(`${base}/${activeCase.value.id}/documents/${kind}`,'_blank','noopener')}
function open(){visible.value=true;tab.value='list';loadCases()}
defineExpose({open});
onUnmounted(()=>unblockOperation('aeat-case'));
</script>

<style scoped>
.case-content{display:flex;flex-direction:column;gap:1rem;min-height:0}.case-header{display:flex;align-items:center;gap:.7rem}.case-header>span{display:grid;width:36px;height:36px;place-items:center;background:#eaf2d2;color:#648506;border-radius:9px}.case-header b,.case-header small{display:block}.case-header small{margin-top:.15rem;color:#7d8797;font-size:.72rem}.case-nav,.case-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:.75rem}.case-form{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:.8rem;padding:1rem;border:1px solid #e5ecd0;background:#f8faef;border-radius:9px}.case-form label{display:flex;min-width:0;flex-direction:column;gap:.3rem}.case-form :deep(input){width:100%;min-width:0}.case-form span{font-size:.8rem;color:#596579}.notes{grid-column:1/-1}.case-footer{display:flex;width:100%;justify-content:flex-end;flex-wrap:wrap;gap:.5rem;padding-top:.8rem;border-top:1px solid #9cc10a}.case-detail{padding:1rem;border:1px solid #e5ecd0;border-radius:9px;display:flex;flex-direction:column;gap:.8rem}.case-detail h3,.case-detail p{margin:0}.case-detail p{white-space:pre-wrap}.case-documents{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.case-documents>div{display:flex;flex-direction:column;align-items:flex-start;gap:.5rem;padding:.75rem;background:#f8faef;border-radius:8px}.upload-label{display:flex;flex-direction:column;gap:.5rem;font-size:.8rem}.upload-label input{max-width:100%}.checksum{overflow-wrap:anywhere;color:#667085}.warning-list{margin:.5rem 0 0;padding-left:1.2rem;max-height:150px;overflow:auto}@media(max-width:900px){.case-form{grid-template-columns:1fr 1fr}.reference,.notes{grid-column:1/-1}.case-documents{grid-template-columns:1fr}}
</style>
