<template>
 <section class="payment-terms settings-card" :class="{'create-only':createOnly}">
  <div v-if="!createOnly" class="section-heading"><span><i class="pi pi-calendar"/></span><div><h2>Condiciones de pago y vencimientos</h2><p>Plazos desde la fecha de factura. El último recoge el saldo restante y los redondeos. Los días de pago del cliente se aplican después.</p></div></div>
  <Message v-if="error" severity="error" :closable="false">{{error}}</Message><Message v-if="saved" severity="success" :closable="false">Condición guardada.</Message>
  <div v-if="!createOnly" class="actions"><Select v-model="selected" :options="terms" optionLabel="descriptionEs" placeholder="Selecciona una condición" :disabled="busy" @change="edit"/><Button label="Nueva condición" icon="pi pi-plus" severity="secondary" :disabled="busy" @click="fresh"/><Button label="Recargar" icon="pi pi-refresh" text :disabled="busy" @click="load"/></div>
  <fieldset v-if="form" :disabled="busy">
   <div class="actions"><label class="description-field">Descripción <InputText v-model="form.description" maxlength="100" :disabled="busy"/></label><label v-if="!createOnly"><ToggleSwitch v-model="form.active" :disabled="busy" aria-label="Condición de pago activa"/> Activa</label></div>
   <p>Los días se cuentan desde la fecha de factura, no desde el plazo anterior. Ordénalos de menor a mayor; pueden coincidir. El último plazo recoge el saldo restante.</p>
   <div class="rules">
    <div v-for="(rule,index) in form.rules" :key="index" class="rule">
     <span>Plazo {{Number(index)+1}}</span>
     <Select v-model="rule.type" :options="types" optionLabel="label" optionValue="value" :disabled="index===form.rules.length-1" aria-label="Tipo de plazo"/>
     <InputNumber v-if="rule.type!=='BALANCE'" v-model="rule.value" :min="0.01" :maxFractionDigits="2" :suffix="rule.type==='PERCENT'?' %':''" aria-label="Porcentaje o importe"/>
     <label>Días <InputNumber v-model="rule.days" :min="0" :max="3660" :maxFractionDigits="0" :inputStyle="{width:'90px'}"/></label>
     <label><ToggleSwitch v-model="rule.endOfMonth" :disabled="busy" :aria-label="'Fin de mes del plazo '+(Number(index)+1)"/> Fin de mes</label>
     <Button v-if="Number(index)<form.rules.length-1" icon="pi pi-trash" severity="danger" text aria-label="Eliminar plazo" @click="form.rules.splice(index,1)"/>
    </div>
   </div>
   <Button label="Añadir plazo" icon="pi pi-plus" text :disabled="form.rules.length>=24" @click="add"/>
   <Message severity="info" :closable="false"><template v-if="createOnly">Se creará una condición activa en el catálogo compartido, disponible para otros clientes. Quedará seleccionada en esta ficha; guarda la entidad para confirmar su asignación.</template><template v-else>Guardar esta condición afecta a borradores y futuras emisiones; las facturas emitidas conservan su calendario. Este bloque se guarda con su propio botón.</template></Message>
   <div class="actions sample-actions"><label class="field" for="payment-term-sample-date"><span>Fecha de ejemplo</span><DatePicker inputId="payment-term-sample-date" v-model="sampleDate" dateFormat="dd/mm/yy" showIcon :disabled="busy" fluid/></label><label class="field" for="payment-term-sample-total"><span>Total de ejemplo</span><InputNumber inputId="payment-term-sample-total" v-model="sampleTotal" locale="es-ES" :useGrouping="true" :min="0" :minFractionDigits="2" :maxFractionDigits="2" :disabled="busy" fluid/></label><Button label="Probar reparto" icon="pi pi-eye" severity="secondary" :disabled="busy||!sampleDate" @click="preview"/><Button v-if="!createOnly" label="Guardar condición" icon="pi pi-save" :loading="busy" @click="save"/></div>
   <InvoiceDuesTable v-if="sample.length" :rows="sample" preview/>
  </fieldset>
 </section>
</template>
<script setup lang="ts">
import {useAuthStore} from "@/stores/authStore";
import DatePicker from 'primevue/datepicker';
import ToggleSwitch from 'primevue/toggleswitch';
const auth=useAuthStore();
import {ref,onMounted,watch} from 'vue';import axios from 'axios';import Button from 'primevue/button';import Select from 'primevue/select';import InputNumber from 'primevue/inputnumber';import InputText from 'primevue/inputtext';import Message from 'primevue/message';import InvoiceDuesTable from '../Frm_Facturas/InvoiceDuesTable.vue';
const props=withDefaults(defineProps<{createOnly?:boolean}>(),{createOnly:false});
const emit=defineEmits<{saved:[term:any],busy:[value:boolean]}>();
const terms=ref<any[]>([]),selected=ref<any>(),form=ref<any>(),busy=ref(false),error=ref(''),saved=ref(false),sample=ref<any[]>([]),sampleDate=ref<Date|null>(new Date()),sampleTotal=ref(1000);
function sampleDay(value:Date|null){
 if(!(value instanceof Date)||Number.isNaN(value.getTime()))throw new Error('Indica una fecha de ejemplo válida.');
 return [value.getFullYear(),String(value.getMonth()+1).padStart(2,'0'),String(value.getDate()).padStart(2,'0')].join('-');
}
const types=[{label:'Porcentaje',value:'PERCENT'},{label:'Importe fijo',value:'FIXED'},{label:'Saldo restante',value:'BALANCE'}];
const api=(path:string)=>import.meta.env.VITE_API_URL+'/'+path;
const message=(e:any)=>typeof e.response?.data==='string'?e.response.data:e.message;
function edit(){const t=selected.value;if(!t)return;error.value='';saved.value=false;sample.value=[];form.value={id:t.id,description:t.descriptionEs,active:t.active,previousRules:t.dueRules??null,rules:t.dueRules?JSON.parse(t.dueRules):[{type:'BALANCE',value:0,days:t.value||0,endOfMonth:false}]};}
function fresh(){selected.value=null;sample.value=[];saved.value=false;form.value={description:'',active:true,rules:[{type:'BALANCE',value:0,days:0,endOfMonth:false}]};}
function add(){const i=form.value.rules.length-1;form.value.rules.splice(i,0,{type:'PERCENT',value:50,days:form.value.rules[i].days,endOfMonth:false});sample.value=[];}
async function load(){busy.value=true;error.value='';try{terms.value=(await axios.get(api('WebGetSalesPaymentTerms'),auth.portalRequestConfig())).data;selected.value=null;form.value=null;}catch(e){error.value=message(e)}finally{busy.value=false}}
async function preview(){busy.value=true;error.value='';sample.value=[];try{sample.value=(await axios.post(api('WebPreviewSalesInvoiceDues'),{rules:form.value.rules,total:sampleTotal.value,date:sampleDay(sampleDate.value)},auth.portalRequestConfig())).data;}catch(e){error.value=message(e)}finally{busy.value=false}}
async function save(){if(busy.value||!form.value)return;busy.value=true;error.value='';saved.value=false;try{const payload=props.createOnly?{...form.value,id:null,active:true}:form.value;const t=(await axios.post(api('WebSaveSalesPaymentTerm'),payload,auth.portalRequestConfig())).data;terms.value=terms.value.filter(v=>v.id!==t.id).concat(t);selected.value=t;edit();saved.value=true;emit('saved',t);}catch(e){error.value=message(e)}finally{busy.value=false}}
watch(busy,value=>emit('busy',value),{flush:'sync'});
onMounted(()=>{if(props.createOnly)fresh();else void load();});
defineExpose({save});
</script>
<style scoped>
.settings-card{margin-top:14px;padding:20px;border:1px solid #e1e6eb;border-radius:13px;background:#fff;box-shadow:0 3px 11px rgba(30,41,59,.04)}
.settings-card.create-only{margin:0;padding:0;border:0;box-shadow:none}
.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:20px}
.section-heading>span{display:grid;flex:0 0 37px;width:37px;height:37px;place-items:center;border-radius:9px;color:#66810a;background:#eef5dc}
.section-heading h2{margin:0;font-size:1rem}
.section-heading p{margin:3px 0 0;color:#7c8796;font-size:.82rem}
.actions,.rule{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap;margin:.8rem 0}.rules{max-height:350px;overflow:auto}.rule{padding:.5rem;border-bottom:1px solid #eee}.rule>span{min-width:65px}fieldset{border:0;padding:0;min-width:0}label{display:flex;align-items:center;gap:.4rem}
.sample-actions{align-items:flex-end;margin-top:17px}
.description-field{flex:1 1 420px;min-width:0}.description-field :deep(.p-inputtext){flex:1;min-width:0;width:100%}
.field{display:flex;min-width:0;flex-direction:column;align-items:stretch;gap:7px}
.field>span{color:#596577;font-size:.78rem;font-weight:750}
@media(max-width:620px){.sample-actions .field{width:100%}}
</style>
