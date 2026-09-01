<template>
 <section class="invoice-reminder-settings">
  <div class="section-heading"><span><i class="pi pi-bell"/></span><div><h2>Recordatorio diario de vencimientos</h2><p>Resumen interno de vencidos, de hoy y próximos con saldo pendiente. No se envía a clientes.</p></div></div>
  <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
  <Message v-if="saved" severity="success" :closable="false">Ajustes del recordatorio guardados.</Message>
  <fieldset :disabled="busy || !loaded">
   <div class="fields"><label class="activation"><ToggleSwitch v-model="form.enabled" :disabled="busy || !loaded" aria-label="Activar recordatorio de vencimientos"/> Activar envío diario</label><label>Hora (Madrid)<InputText v-model="form.time" placeholder="08:30" maxlength="5" :disabled="busy || !loaded"/></label><label>Antelación<InputNumber v-model="form.days" :min="0" :max="365" :maxFractionDigits="0" suffix=" días" :disabled="busy || !loaded"/></label></div>
   <label class="recipients">Destinatarios internos<MultiSelect v-model="form.recipientIds" :options="users" optionValue="id" optionLabel="label" filter display="chip" placeholder="Selecciona usuarios internos" :disabled="busy || !loaded" fluid/></label>
   <p>Se incluyen todos los vencidos, los que vencen hoy y los próximos días indicados. Solo facturas aceptadas por VeriFactu, no anuladas y con importe pendiente. No se suman importes de monedas distintas.</p>
   <p>Un correo por día y dirección. Los usuarios desactivados o sin correo válido se omiten. Las ejecuciones manuales usan los ajustes guardados, aunque el envío diario esté pausado.</p>
  </fieldset>
  <div class="kiwik-separator"/>
  <div class="actions"><Button label="Recargar" icon="pi pi-refresh" severity="secondary" outlined :disabled="busy" @click="load"/><Button label="Guardar recordatorio" icon="pi pi-save" :disabled="busy || !loaded" :loading="busy" @click="save"/><SalesAutomationActions module="invoices" :disabled="busy || !loaded" @executed="loadHistory"/></div>
  <h3>Historial de envíos · últimos 100 registros</h3>
  <Message v-if="historyError" severity="warn" :closable="false">{{historyError}}</Message>
  <div class="history"><table><thead><tr><th>Fecha y hora (Madrid)</th><th>Destinatario</th><th>Usuario</th><th>Origen</th><th>Vencimientos</th><th>Resultado</th></tr></thead><tbody><tr v-for="row in history" :key="row.id"><td>{{formatDate(row.createdAt)}}</td><td>{{row.email}}</td><td>{{row.actor}}</td><td>{{row.source==='AUTOMATIC'?'Automático':'Manual'}}</td><td>{{row.documentCount}}</td><td><Tag :value="statuses[row.status]||row.status" :severity="row.status==='SENT'?'success':row.status==='FAILED'?'danger':'warn'"/><small v-if="row.warning">{{row.warning}}</small></td></tr><tr v-if="!history.length"><td colspan="6">Sin envíos registrados.</td></tr></tbody></table></div>
 </section>
</template>
<script setup lang="ts">
import {ref,onMounted} from 'vue';import axios from 'axios';import Button from 'primevue/button';import Message from 'primevue/message';import InputText from 'primevue/inputtext';import InputNumber from 'primevue/inputnumber';import MultiSelect from 'primevue/multiselect';import ToggleSwitch from 'primevue/toggleswitch';import Tag from 'primevue/tag';
import SalesAutomationActions from '../SalesAutomationActions.vue';import {useAuthStore} from '@/stores/authStore';
const auth=useAuthStore(),busy=ref(false),loaded=ref(false),saved=ref(false),error=ref(''),historyError=ref('');
const form=ref<{version:number|null,enabled:boolean,time:string,days:number|null,recipientIds:number[]}>({version:null,enabled:false,time:'08:30',days:7,recipientIds:[]}),users=ref<any[]>([]),history=ref<any[]>([]);
const statuses:Record<string,string>={SENT:'Enviado',FAILED:'Incierto o fallido',CLAIMED:'Reservado o en curso'};
const api=(path:string)=>import.meta.env.VITE_API_URL+'/'+path;
function message(e:any){return typeof e.response?.data==='string'?e.response.data:'No se pudo completar la operación. Comprueba la sesión, el backend y las migraciones V23 y V24.';}
function formatDate(v:any){if(Array.isArray(v)){const[y,m,d,h=0,min=0,s=0]=v;return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y} ${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}const match=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}:\d{2}:\d{2})/);return match?`${match[3]}/${match[2]}/${match[1]} ${match[4]}`:'—';}
async function loadHistory(){try{history.value=(await axios.get(api('WebGetInvoiceReminderHistory'),auth.portalRequestConfig())).data;historyError.value='';}catch(e){historyError.value=message(e);}}
async function load(){if(busy.value)return;busy.value=true;loaded.value=false;error.value='';saved.value=false;try{const [settings,options]=await Promise.all([axios.get(api('WebGetInvoiceReminderSettings'),auth.portalRequestConfig()),axios.get(api('WebGetInvoiceReminderRecipients'),auth.portalRequestConfig())]);form.value=settings.data;users.value=options.data.map((u:any)=>({...u,label:`${u.name} · ${u.email}`}));for(const id of form.value.recipientIds)if(!users.value.some(u=>u.id===id))users.value.push({id,label:`Usuario ${id} · no disponible (retíralo para guardar)`});loaded.value=true;await loadHistory();}catch(e){error.value=message(e);}finally{busy.value=false;}}
async function save(){if(busy.value||!loaded.value)return;busy.value=true;error.value='';saved.value=false;try{form.value=(await axios.post(api('WebSaveInvoiceReminderSettings'),form.value,auth.portalRequestConfig())).data;saved.value=true;}catch(e){error.value=message(e);}finally{busy.value=false;}}
onMounted(load);
</script>
<style scoped>
.invoice-reminder-settings{margin-top:14px;padding:20px;border:1px solid #e1e6eb;border-radius:13px;background:white;box-shadow:0 3px 11px #1e293b0a}.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:20px}.section-heading>span{display:grid;place-items:center;width:37px;height:37px;border-radius:9px;background:#eef5dc;color:#66810a;flex-shrink:0}.section-heading h2{margin:0;font-size:1rem}.section-heading p{margin:3px 0 0;color:#7c8796;font-size:.82rem}fieldset{border:0;padding:0;min-width:0}.fields,.actions{display:flex;gap:14px;flex-wrap:wrap;align-items:center}.actions{justify-content:flex-end;margin-top:14px}label{display:flex;flex-direction:column;gap:7px}.activation{flex-direction:row;align-items:center}.recipients{margin-top:16px}p{color:#64748b;font-size:.88rem}.history{max-height:300px;overflow:auto}table{width:100%;border-collapse:collapse;font-size:.85rem}th,td{text-align:left;padding:10px;border-bottom:1px solid #e2e8f0;vertical-align:top}th{position:sticky;top:0;background:white;z-index:1}td small{display:block;max-width:280px}
</style>
