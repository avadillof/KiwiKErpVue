<template>
  <section v-for="kind in kinds" :key="kind.id" class="quote-settings">
    <header><i :class="kind.icon"/><div><h2>{{kind.title}}</h2><p>{{kind.description}}</p></div></header>
    <div class="fields">
      <label class="toggle"><ToggleSwitch v-model="form[kind.enabled]" :aria-label="kind.title+' activado'"/><span>{{kind.id==='reminder'?'Recordatorio automático':'Cancelación automática'}}</span></label>
      <label><span>Hora (Europe/Madrid)</span><InputText type="time" v-model="form[kind.time]" :aria-label="'Hora de '+kind.title" fluid/></label>
      <label v-if="kind.id==='reminder'"><span>Días de antelación</span><InputNumber v-model="form.quoteReminderDays" aria-label="Antelación de presupuestos" :min="0" :max="365" :maxFractionDigits="0" fluid/></label>
      <label class="toggle"><ToggleSwitch v-model="form[kind.drafts]" :aria-label="'Incluir borradores en '+kind.title"/><span>Incluir borradores DRAFT</span></label>
      <template v-if="kind.id==='cancellation'">
        <label class="toggle"><ToggleSwitch v-model="form.quoteCancellationNotifyOwner" aria-label="Avisar al responsable de la cancelación"/><span>Avisar al responsable</span></label>
        <label class="toggle"><ToggleSwitch v-model="form.quoteCancellationNotifyCustomer" aria-label="Avisar al cliente de la cancelación"/><span>Avisar al contacto del cliente</span></label>
      </template>
    </div>
    <p v-if="kind.id==='reminder'">Un único correo por dirección de responsable y día, con presupuestos pendientes que vencen hoy o dentro de los días indicados. 0 incluye solo hoy. No incluye aprobados, cancelados, vencidos de días anteriores ni documentos sin fecha. El creador debe estar activo y tener correo.</p>
    <template v-else><Message severity="warn" :closable="false">La cancelación cambia el estado y bloquea el presupuesto; conserva su PDF y formaliza su código si era borrador. La validez incluye todo el día indicado: solo se cancelan fechas anteriores a hoy. No afecta a aprobados ni cancelados.</Message><p>Los avisos son independientes: uno al responsable activo y otro al contacto predeterminado activo con correo. Si ambos tienen la misma dirección se envía una sola vez. Sin destinatarios válidos o con los avisos desactivados, el presupuesto se cancela igualmente sin correo.</p></template>
    <p>Guarda antes los cambios. La ejecución manual funciona aunque el automático esté pausado. Los horarios se aplican sin reiniciar una vez instalada la versión; si la hora ya pasó, espera al siguiente día o ejecuta manualmente. El servidor debe estar en marcha a la hora programada.</p>
    <Message v-if="error" severity="error" :closable="false">{{error}}</Message>
    <Message v-if="dirty" severity="warn" :closable="false">Guarda los cambios de presupuestos antes de probar o ejecutar.</Message>
    <div class="actions"><Button label="Probar" icon="pi pi-eye" severity="secondary" :disabled="blocked" :loading="busy===kind.id+'-preview'" @click="open(kind.id,true)"/><Button :label="kind.id==='reminder'?'Enviar ahora':'Cancelar vencidos ahora'" :icon="kind.id==='reminder'?'pi pi-send':'pi pi-ban'" :severity="kind.id==='reminder'?'primary':'danger'" :disabled="blocked" :loading="busy===kind.id+'-run'" @click="open(kind.id,false)"/></div>
    <Message v-if="errors[kind.id]" severity="error" :closable="false">{{errors[kind.id]}}</Message>
    <div v-if="results[kind.id]" class="results" aria-live="polite">
      <h3>{{results[kind.id].preview?'Prueba sin cambios ni correos':'Resultado de la ejecución'}} · {{formatCalendarDate(results[kind.id].date)}}</h3>
      <template v-if="kind.id==='reminder'">
        <p>{{results[kind.id].recipients.length}} destinatarios · Antelación: {{results[kind.id].days}} días.</p>
        <p v-if="!results[kind.id].preview">Enviados: {{results[kind.id].sent}} · Omitidos: {{results[kind.id].skipped}} · Fallos: {{results[kind.id].failed}}</p>
        <details v-for="recipient in results[kind.id].recipients" :key="recipient.email"><summary>{{recipient.name}} · {{recipient.email}} · {{status(recipient.status)}}</summary><p v-if="recipient.warning">{{recipient.warning}}</p><ul><li v-for="quote in recipient.orders" :key="quote.code">{{quote.code}} · {{quote.client}} · Vence: {{formatCalendarDate(quote.validity)}} · {{quote.days}} días · {{quote.amount}}</li></ul></details>
        <p v-if="!results[kind.id].recipients.length">No hay destinatarios con presupuestos que cumplan los criterios.</p>
      </template>
      <template v-else>
        <p>{{results[kind.id].quotes.length}} presupuestos evaluados.</p>
        <p v-if="!results[kind.id].preview">Cancelados: {{results[kind.id].cancelled}} · Omitidos: {{results[kind.id].skipped}} · Fallos de cancelación: {{results[kind.id].failed}} · Correos enviados: {{results[kind.id].sent}} · Correos inciertos o fallidos: {{results[kind.id].mailFailed}}</p>
        <details v-for="quote in results[kind.id].quotes" :key="quote.id||quote.code"><summary>{{quote.code}} · {{quote.client}} · {{formatCalendarDate(quote.validity)}} · {{status(quote.status)}}</summary><p v-if="quote.warning">{{quote.warning}}</p><ul><li v-for="recipient in quote.recipients" :key="recipient.email">{{recipient.internal?'Responsable':'Cliente'}}: {{recipient.name}} · {{recipient.email}} · {{recipient.status?status(recipient.status):'Aviso previsto'}}</li></ul><p v-if="!quote.recipients.length">Sin avisos previstos a destinatarios.</p></details>
        <p v-if="!results[kind.id].quotes.length">No hay presupuestos que cumplan los criterios de cancelación.</p>
      </template>
    </div>
    <p v-if="kind.id==='reminder'">El aviso manual y el automático comparten el límite diario. Ante una respuesta incierta, consulta Probar antes de repetir; los destinatarios ya reservados no se reintentan hoy. Probar no es una comprobación de SMTP ni un historial completo.</p>
    <p v-else>Los correos se envían después de guardar la cancelación. Un fallo de correo no la deshace. Los ya cancelados no se procesan de nuevo ni se reenvían sus avisos. Si se pierde la respuesta, revisa el estado del presupuesto. Una interrupción tras cancelar puede dejar el aviso sin enviar.</p>
  </section>
  <Dialog v-model:visible="visible" modal class="kiwik-dialog" :header="preview?'Probar automatización de presupuestos':action==='reminder'?'Enviar recordatorio de presupuestos':'Cancelar presupuestos vencidos'" :style="{width:'min(680px,95vw)',maxHeight:'90vh'}" :contentStyle="{overflow:'auto'}">
    <Message :severity="preview?'info':action==='cancellation'?'warn':'info'" :closable="false">{{preview?'Solo se consultarán los documentos y destinatarios. No se enviarán correos ni se cambiarán estados.':action==='reminder'?'Se enviarán correos reales a los responsables con los presupuestos próximos a vencer.':'Se cancelarán y bloquearán TODOS los presupuestos vencidos que cumplan los parámetros guardados. Se enviarán los avisos habilitados al responsable y al cliente.'}}</Message>
    <p>Se utiliza la configuración guardada, aunque el automático esté pausado. Los documentos se recalculan al confirmar. Revisa antes Probar. Se utiliza la sesión iniciada en el portal, sin volver a pedir la contraseña.</p>
    <div class="kiwik-separator"/>
    <template #footer><Button label="Volver" severity="secondary" text @click="visible=false"/><Button :label="preview?'Ejecutar prueba':action==='reminder'?'Confirmar envío':'Confirmar cancelación'" :severity="!preview&&action==='cancellation'?'danger':'primary'" :disabled="blocked" @click="run"/></template>
  </Dialog>
</template>
<script setup lang="ts">
import { formatCalendarDate } from '@/libs/HelperDates';
import {computed,reactive,ref,watch} from 'vue';
import {useAuthStore} from '../../../stores/authStore';
import axios from 'axios';
import Button from 'primevue/button';import Dialog from 'primevue/dialog';import InputText from 'primevue/inputtext';import InputNumber from 'primevue/inputnumber';import ToggleSwitch from 'primevue/toggleswitch';import Message from 'primevue/message';
const props=defineProps<{form:any;saved:string;disabled:boolean;error:string}>();const emit=defineEmits<{busy:[boolean]}>();const auth=useAuthStore();
const kinds=[{id:'reminder',title:'Recordatorio de vencimiento de presupuestos',description:'Seguimiento comercial interno antes de finalizar la validez.',icon:'pi pi-bell',enabled:'quoteReminderEnabled',time:'quoteReminderTime',drafts:'quoteReminderIncludeDrafts'},{id:'cancellation',title:'Cancelación de presupuestos vencidos',description:'Cambio de estado y avisos por finalización de la validez.',icon:'pi pi-calendar-times',enabled:'quoteCancellationEnabled',time:'quoteCancellationTime',drafts:'quoteCancellationIncludeDrafts'}];
const snapshot=()=>JSON.stringify(Object.keys(props.form).filter(k=>k.startsWith('quote')).sort().map(k=>[k,props.form[k]]));
const dirty=computed(()=>snapshot()!==props.saved);const busy=ref(''),visible=ref(false),preview=ref(true),action=ref('reminder');const results=reactive<any>({}),errors=reactive<any>({});
watch(()=>props.saved,()=>{for(const kind of kinds){results[kind.id]=null;errors[kind.id]='';}});
const blocked=computed(()=>props.disabled||!!busy.value||dirty.value||!!props.error);
const status=(value:string)=>({READY:'Disponible',SENT:'Enviado',CLAIMED:'Reservado o en curso',FAILED:'Resultado incierto o fallido',SKIPPED:'Omitido: ya procesado o no elegible',ERROR:'No se pudo confirmar la operación',CANCELLED:'Cancelado'}[value]||value);
function open(kind:string,test:boolean){if(blocked.value)return;action.value=kind;preview.value=test;if(test){void run();return;}visible.value=true;}
async function run(){
 if(blocked.value)return;
 const kind=action.value,test=preview.value;
 visible.value=false;busy.value=kind+(test?'-preview':'-run');emit('busy',true);errors[kind]='';results[kind]=null;
 try{const config=auth.portalRequestConfig();const url=`${import.meta.env.VITE_API_URL}/${test?'WebPreviewSalesQuoteAutomation':'WebRunSalesQuoteAutomation'}/${kind}`;results[kind]=(test?await axios.get(url,config):await axios.post(url,{confirmed:true},config)).data;}
 catch(e:any){errors[kind]=e.response?.status===401||!auth.portalSession?'La sesión ha caducado o es anterior a esta actualización. Vuelve a iniciar sesión en el portal.':test?'No se pudo obtener la prueba. Comprueba el backend y la migración.':'Resultado no confirmado. Puede haber cambios y correos enviados. Revisa los estados y utiliza Probar antes de repetir.';}
 finally{busy.value='';emit('busy',false);}
}
</script>
<style scoped>
.quote-settings{margin-top:14px;padding:20px;border:1px solid #e1e6eb;border-radius:13px;background:white;color:#273244}.quote-settings header{display:flex;gap:12px;align-items:center}.quote-settings header i{color:#66810a;background:#eef5dc;padding:12px;border-radius:9px}.quote-settings h2{font-size:1rem;margin:0}.quote-settings p{color:#657084;font-size:.85rem;line-height:1.6}.fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:18px 0}.fields label{display:flex;flex-direction:column;gap:8px;font-size:.85rem}.fields .toggle{flex-direction:row;align-items:center;gap:12px}.actions{display:flex;justify-content:flex-end;gap:10px;margin:16px 0}.results{padding:15px;border:1px solid #dfe8d0;border-radius:10px;background:#f8faf5;overflow-wrap:anywhere}.results details{padding:10px 0;border-top:1px solid #e0e5da}.results summary{cursor:pointer}.results li{margin:6px 0}@media(max-width:850px){.fields{grid-template-columns:1fr}.actions{flex-wrap:wrap}}
</style>
