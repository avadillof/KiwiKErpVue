<template>
  <Dialog v-model:visible="visible" modal maximizable class="kiwik-dialog" :header="mode==='history'?'Historial de envíos de factura':isResend?'Reenviar factura por correo':'Enviar factura por correo'" :closable="!sending" :closeOnEscape="!sending" :style="{width:'min(1200px,96vw)',maxHeight:'94vh'}" :contentStyle="{overflow:'auto'}">
    <div class="mail-heading"><i :class="mode==='history'?'pi pi-history':'pi pi-envelope'" aria-hidden="true"/><div><b>{{ invoice?.code }}</b><small>{{ data.customerName || 'Correo de factura' }}</small></div></div>
    <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
    <Button v-if="error&&!loaded" label="Reintentar carga" severity="secondary" :disabled="sending||loading" @click="load(0,true)"/>
    <Message v-if="notice" :severity="noticeSeverity" :closable="false">{{notice}}</Message>
    <p v-if="loading" role="status"><i class="pi pi-spin pi-spinner"/> Cargando contactos y envíos…</p>
    <template v-if="loaded">
      <Message v-if="!data.canSend" severity="warn" :closable="false">Sólo se pueden enviar facturas emitidas, no anuladas y aceptadas por VeriFactu. El historial sigue disponible.</Message>
      <Message v-else-if="!data.pdfAvailable" severity="warn" :closable="false">Falta el PDF fiscal archivado. No se generará ni adjuntará otro documento en su lugar.</Message>
      <Message v-if="hasClaimed" severity="warn" :closable="false">Hay un envío en curso o sin confirmación de resultado. Actualiza el historial. Si persiste, solicita revisión; no se permite iniciar otro envío mientras siga pendiente.</Message>
      <Message v-if="uncertain" severity="warn" :closable="false">La respuesta anterior no está confirmada. El correo puede haberse enviado. Consulta el historial antes de preparar otro envío.</Message>
      <Message v-else-if="data.history?.some((row:any)=>row.status==='UNCERTAIN')" severity="warn" :closable="false">Hay envíos con resultado incierto en el historial. Pueden haber llegado al cliente; revísalos antes de confirmar un reenvío.</Message>
      <section v-if="mode==='compose'" class="mail-form">
        <label><span>Contactos activos del cliente</span><MultiSelect v-model="selectedIds" :options="data.contacts" optionLabel="label" optionValue="pkid" display="chip" :maxSelectedLabels="3" :selectionLimit="10" filter placeholder="Selecciona destinatarios" :disabled="sending||uncertain||loading" fluid>
          <template #option="{option}"><div><b>{{option.name||'Sin nombre'}}</b> · {{option.email}} <Tag v-if="option.defaultContact" value="Principal" severity="success"/></div></template>
        </MultiSelect><small>Se propone el contacto principal si está activo y tiene correo válido. Puedes seleccionar hasta 10 contactos.</small></label>
        <Message v-if="!data.contacts?.length" severity="warn" :closable="false">El cliente no tiene contactos activos con correo válido. Actualiza su ficha antes de enviar.</Message>
        <label><span>Asunto</span><InputText v-model="subject" maxlength="200" :disabled="sending||uncertain||loading" fluid/></label>
        <label><span>Mensaje</span><Textarea v-model="message" rows="5" maxlength="4000" :disabled="sending||uncertain||loading" fluid/></label>
        <div class="attachment"><i class="pi pi-file-pdf"/><div><b>PDF fiscal adjunto</b><small>{{data.pdfFilename}}</small></div><Button label="Ver PDF fiscal" icon="pi pi-external-link" severity="secondary" text :disabled="!data.pdfAvailable||!data.canSend" @click="viewPdf"/></div>
        <p v-if="source">Reenvío del registro #{{source.id}}. Se utilizarán los contactos y correos actuales que confirmes, conservando el registro anterior.</p>
        <p>Se envía un único correo con las direcciones seleccionadas visibles entre sí. Las direcciones repetidas se incluyen una sola vez. El PDF adjunto es la copia fiscal archivada, sin regenerarla.</p>
        <div class="form-actions"><Button label="Actualizar contactos e historial" icon="pi pi-refresh" severity="secondary" outlined :disabled="sending||loading" @click="load(0,false)"/><Button v-if="uncertain" label="Reintentar la misma solicitud" icon="pi pi-refresh" severity="secondary" :disabled="sending" @click="retrySameRequest"/><Button :label="isResend?'Preparar reenvío':'Preparar envío'" icon="pi pi-send" :disabled="!canCompose" @click="confirmVisible=true"/></div>
        <p v-if="uncertain">Reintentar la misma solicitud conserva lo ya confirmado: no vuelve a enviar si está registrada; si todavía no llegó al servidor, podrá iniciar ese envío.</p>
      </section>
      <template v-if="mode==='history'">
      <div class="history-toolbar"><h3>Envíos registrados</h3><Button label="Actualizar historial" icon="pi pi-refresh" severity="secondary" outlined :disabled="sending||loading" @click="load(page,false)"/></div>
      <p>Enviado significa que el servidor de correo aceptó el mensaje, no que el cliente lo recibió o leyó. Fechas en Europe/Madrid.</p>
      <p v-if="data.lastSentAt">Último envío confirmado: {{ dateTime(data.lastSentAt) }}.</p>
      <DataTable :value="data.history" dataKey="id" stripedRows scrollable scrollHeight="360px" size="small" class="mail-history-table">
        <template #empty>No hay registros de correo en esta página. Las fechas anteriores no reconstruyen destinatarios ni usuarios históricos.</template>
        <Column field="id" header="#"/>
        <Column header="Fecha solicitud / resultado"><template #body="{data:row}">{{dateTime(row.createdAt)}}<small class="block" v-if="row.completedAt">{{dateTime(row.completedAt)}}</small></template></Column>
        <Column field="actor" header="Usuario"/>
        <Column header="Destinatarios"><template #body="{data:row}"><div v-for="recipient in recipients(row)" :key="recipient.email">{{recipient.name}} · {{recipient.email}}</div></template></Column>
        <Column field="subject" header="Asunto"/>
        <Column header="Operación"><template #body="{data:row}">{{row.operation==='RESEND'?'Reenvío':'Envío'}}<small v-if="row.resendOfId" class="block">Origen #{{row.resendOfId}}</small></template></Column>
        <Column header="Resultado"><template #body="{data:row}"><Tag :value="statusLabel(row.status)" :severity="row.status==='SENT'?'success':'warn'"/></template></Column>
        <Column header="Acciones"><template #body="{data:row}"><Button label="Reenviar" icon="pi pi-replay" severity="secondary" text :disabled="sending||loading||uncertain||hasClaimed||row.status==='CLAIMED'||!data.canSend||!data.pdfAvailable" @click="prepareResend(row)"/></template></Column>
      </DataTable>
      <div class="history-actions"><span>Página {{page+1}}</span><Button label="Anterior" text severity="secondary" :disabled="page===0||sending||loading" @click="load(page-1,false)"/><Button label="Siguiente" text severity="secondary" :disabled="!data.hasMore||sending||loading" @click="load(page+1,false)"/></div>
      </template>
    </template>
    <template #footer><div class="mail-footer"><div class="kiwik-separator"/><div class="form-actions"><Button v-if="loaded&&mode==='compose'" label="Ver historial" icon="pi pi-history" severity="secondary" text :disabled="sending||loading" @click="mode='history'"/><Button v-if="loaded&&mode==='history'&&hasDraft" label="Volver al formulario" icon="pi pi-envelope" severity="secondary" text :disabled="sending||loading" @click="mode='compose'"/><Button label="Cerrar" severity="secondary" :disabled="sending" @click="visible=false"/></div></div></template>
  </Dialog>
  <Dialog v-model:visible="confirmVisible" modal class="kiwik-dialog" :header="isResend?'Confirmar reenvío de factura':'Confirmar envío de factura'" :closable="!sending" :closeOnEscape="!sending" :style="{width:'min(700px,95vw)'}">
    <Message severity="warn" :closable="false">Se enviará un correo real con el PDF fiscal adjunto. {{source?.status==='UNCERTAIN'?'El envío anterior pudo llegar; el reenvío puede duplicarlo.':''}}</Message>
    <p><b>Destinatarios:</b></p><ul><li v-for="contact in selectedContacts" :key="contact.pkid">{{contact.name}} · {{contact.email}}</li></ul>
    <p><b>Asunto:</b> {{subject}}</p><p><b>Adjunto:</b> {{data.pdfFilename}}</p><p class="confirmation-message">{{message}}</p>
    <div class="kiwik-separator"/>
    <template #footer><Button label="Volver" severity="secondary" text :disabled="sending" @click="confirmVisible=false"/><Button :label="isResend?'Confirmar reenvío':'Confirmar envío'" icon="pi pi-send" :loading="sending" :disabled="sending||!canCompose" @click="send"/></template>
  </Dialog>
</template>
<script setup lang="ts">
import {computed,ref} from 'vue';
import axios from 'axios';
import Dialog from 'primevue/dialog';import Button from 'primevue/button';import Message from 'primevue/message';import MultiSelect from 'primevue/multiselect';import InputText from 'primevue/inputtext';import Textarea from 'primevue/textarea';import DataTable from 'primevue/datatable';import Column from 'primevue/column';import Tag from 'primevue/tag';
import {useAuthStore} from '@/stores/authStore';
const emit=defineEmits<{sent:[]}>(),auth=useAuthStore();
const mode=ref<'compose'|'history'>('compose'),hasDraft=ref(false);
const visible=ref(false),loading=ref(false),loaded=ref(false),sending=ref(false),confirmVisible=ref(false),error=ref(''),notice=ref(''),noticeSeverity=ref<'success'|'warn'>('success');
const invoice=ref<any>(),data=ref<any>({contacts:[],history:[]}),selectedIds=ref<number[]>([]),subject=ref(''),message=ref(''),page=ref(0),source=ref<any>(null),uncertain=ref(false),pendingRequest=ref<any>(null);
const hasClaimed=computed(()=>!!data.value.hasInProgress);
const isResend=computed(()=>!!source.value||!!data.value.lastSentAt);
const selectedContacts=computed<any[]>(()=>data.value.contacts.filter((c:any)=>selectedIds.value.includes(c.pkid)));
const canCompose=computed(()=>loaded.value&&!loading.value&&!sending.value&&!uncertain.value&&!hasClaimed.value&&data.value.canSend&&data.value.pdfAvailable&&selectedContacts.value.length>0&&selectedContacts.value.length<=10&&!!subject.value.trim()&&!!message.value.trim());
const recipients=(row:any):any[]=>{try{return JSON.parse(row.recipientsJson)}catch{return []}};
const dateTime=(value:string)=>{if(!value)return '—';const date=new Date(value.endsWith('Z')?value:value+'Z');return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Europe/Madrid'}).format(date);};
const statusLabel=(status:string)=>({SENT:'Enviado',CLAIMED:'En curso / sin confirmación',UNCERTAIN:'Incierto / puede haberse enviado'}[status]||status);
let revision=0;
async function load(target:number,initial:boolean){
  const request=++revision;loading.value=true;error.value='';
  try{const response=await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesInvoiceEmail/${invoice.value.pkid}`,{...auth.portalRequestConfig(),params:{page:target}});if(request!==revision)return;data.value=response.data;data.value.contacts=(data.value.contacts||[]).map((c:any)=>({...c,label:`${c.name||'Sin nombre'} · ${c.email}${c.defaultContact?' (Principal)':''}`}));page.value=data.value.page;loaded.value=true;
    if(initial){const primary=data.value.contacts.find((c:any)=>c.defaultContact);selectedIds.value=primary?[primary.pkid]:[];subject.value=data.value.subject;message.value=data.value.message;}
    else selectedIds.value=selectedIds.value.filter(id=>data.value.contacts.some((c:any)=>c.pkid===id));
  }catch(e:any){if(request!==revision)return;loaded.value=false;error.value=!auth.portalSession||e.response?.status===401?'Vuelve a iniciar sesión en el portal.':typeof e.response?.data==='string'?e.response.data:'No se pudo cargar el correo de factura. Comprueba el backend y la migración V21.';}
  finally{if(request===revision)loading.value=false;}
}
function open(item:any,view:'compose'|'history'='compose'){if(!item?.pkid||sending.value)return;mode.value=view;hasDraft.value=view==='compose';invoice.value=item;source.value=null;pendingRequest.value=null;uncertain.value=false;notice.value='';loaded.value=false;confirmVisible.value=false;visible.value=true;void load(0,true);}
function prepareResend(row:any){mode.value='compose';hasDraft.value=true;source.value=row;uncertain.value=false;pendingRequest.value=null;subject.value=row.subject;message.value=row.message;const old=recipients(row);selectedIds.value=data.value.contacts.filter((c:any)=>old.some(r=>r.pkid===c.pkid)).map((c:any)=>c.pkid);noticeSeverity.value='warn';notice.value='Reenvío preparado. Revisa los contactos y correos actuales, el asunto y el mensaje antes de confirmar.';}
function viewPdf(){window.open(`${import.meta.env.VITE_API_URL}/WebGetSalesInvoicePdf/${invoice.value.pkid}`,'_blank','noopener');}
async function send(){if(!canCompose.value)return;pendingRequest.value={operationKey:crypto.randomUUID(),contactIds:[...selectedIds.value],expectedEmails:Object.fromEntries(selectedContacts.value.map(c=>[c.pkid,c.email])),subject:subject.value,message:message.value,resendOfId:source.value?.id??null,confirmed:true};await dispatch();}
async function retrySameRequest(){if(!pendingRequest.value||sending.value)return;await dispatch();}
async function dispatch(){
  sending.value=true;error.value='';notice.value='';
  try{const response=await axios.post(`${import.meta.env.VITE_API_URL}/WebSendSalesInvoiceEmail/${invoice.value.pkid}`,pendingRequest.value,auth.portalRequestConfig());const row=response.data;uncertain.value=row.status==='CLAIMED';noticeSeverity.value=row.status==='SENT'?'success':'warn';notice.value=row.status==='SENT'?'El servidor de correo ha aceptado el envío.':row.status==='CLAIMED'?'La solicitud sigue en curso o sin confirmar. No se ha repetido el envío.':'Resultado incierto: el correo puede haberse enviado. No se reintentará automáticamente.';confirmVisible.value=false;source.value=row;await load(0,false);emit('sent');}
  catch(e:any){confirmVisible.value=false;const rejected=[400,401,403,404,409,422].includes(e.response?.status)||!auth.portalSession;uncertain.value=!rejected;error.value=!auth.portalSession?'Vuelve a iniciar sesión en el portal.':rejected&&typeof e.response?.data==='string'?e.response.data:'Resultado no confirmado. Actualiza el historial o reintenta la misma solicitud antes de preparar otro envío. No cambies los datos ni repitas el envío a ciegas.';}
  finally{sending.value=false;}
}
defineExpose({open});
</script>
<style scoped>
.mail-footer{width:100%}.mail-footer .kiwik-separator{margin:0 0 14px}
.history-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px}.history-toolbar h3{margin:0;color:#344054;font-size:1rem}
.mail-heading{margin-bottom:16px;padding:12px 14px;border:1px solid #e3e8d2;border-radius:10px;background:#f7faf5}.mail-heading b{color:#344054;font-size:1rem}
.mail-history-table{border:1px solid #e1e6eb;border-radius:10px;overflow:hidden}.mail-history-table :deep(.p-datatable-thead>tr>th){background:#f5f7f9;color:#596579;font-size:.85rem}.mail-history-table :deep(.p-datatable-tbody>tr>td){font-size:.85rem;padding-block:.8rem}
.mail-history-table{flex:0 0 auto;min-height:360px}
.mail-history-table :deep(.p-datatable-table-container){height:360px;overflow:auto}
.mail-heading{display:flex;align-items:center;gap:12px}.mail-heading>i{padding:12px;background:#eef5dc;border-radius:9px;color:#648506}.mail-heading small,.attachment small,.block{display:block;color:#657084;margin-top:4px}.mail-form{display:grid;gap:14px;margin-top:16px}.mail-form label{display:grid;gap:7px}.mail-form label>span{font-weight:600}.mail-form small,p{font-size:.88rem;color:#657084;line-height:1.5}.attachment{display:flex;align-items:center;gap:12px;padding:12px;background:#f8faf5;border:1px solid #dfe8d0;border-radius:9px}.attachment>i{color:#b03d3d;font-size:1.4rem}.attachment>div{flex:1;overflow-wrap:anywhere}.form-actions,.history-actions{display:flex;justify-content:flex-end;gap:8px;align-items:center;flex-wrap:wrap}.history-actions{margin-top:14px}.confirmation-message{white-space:pre-wrap;overflow-wrap:anywhere}
</style>
