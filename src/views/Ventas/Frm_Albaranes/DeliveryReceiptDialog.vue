<template>
  <Dialog v-model:visible="visible" modal :header="`Registrar recogida · ${delivery?.code || ''}`" :style="{ width:'min(780px,94vw)' }" :closable="!saving" class="kiwik-dialog">
    <div v-if="loading" class="receipt-loading"><i class="pi pi-spin pi-spinner"></i> Cargando datos de recogida...</div>
    <div v-else class="receipt-form">
      <Message severity="info" :closable="false">Registra quién retira la mercancía del almacén. El documento firmado por el transportista debe adjuntarse en <b>Fotografías y justificantes</b>.</Message>
      <div class="receipt-fields">
        <label><span>Fecha y hora de recogida</span><DatePicker v-model="deliveryDate" dateFormat="dd/mm/yy" showIcon iconDisplay="input" showTime showSeconds hourFormat="24" :maxDate="new Date()" fluid /></label>
        <label><span>Recogido por / transportista</span><InputText v-model.trim="receiverName" maxlength="180" placeholder="Nombre o empresa transportista" fluid /></label>
      </div>
      <Message v-if="signatureExists" severity="secondary" :closable="false"><i class="pi pi-info-circle mr-2"></i>Este albarán conserva una firma manuscrita registrada anteriormente.</Message>
    </div>
    <template #footer><div class="dialog-footer"><div class="kiwik-separator receipt-separator"></div><div class="receipt-actions"><Button label="Cancelar" severity="secondary" text :disabled="saving" @click="visible=false" /><Button label="Guardar recogida" icon="pi pi-check-circle" :loading="saving" :disabled="loading" @click="save" /></div></div></template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';

const emit=defineEmits<{saved:[value:any]}>(); const toast=useToast();
const visible=ref(false),loading=ref(false),saving=ref(false),delivery=ref<any>(null),deliveryDate=ref<Date|null>(null),receiverName=ref(''),signatureExists=ref(false);
const parseDate=(value:any)=>{if(!value)return null;const direct=new Date(value);if(!Number.isNaN(direct.getTime()))return direct;const text=String(value).replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();const sql=/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?$/.exec(text);if(sql)return new Date(Number(sql[1]),Number(sql[2])-1,Number(sql[3]),Number(sql[4]||0),Number(sql[5]||0),Number(sql[6]||0));const localized=/^([a-záéíóú]+)\.?\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+([ap])\.\s*m\.$/i.exec(text);if(!localized)return null;const months:Record<string,number>={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sept:8,sep:8,oct:9,nov:10,dic:11};const month=months[localized[1].toLowerCase()];if(month===undefined)return null;let hour=Number(localized[4]);if(localized[7].toLowerCase()==='p'&&hour<12)hour+=12;if(localized[7].toLowerCase()==='a'&&hour===12)hour=0;return new Date(Number(localized[3]),month,Number(localized[2]),hour,Number(localized[5]),Number(localized[6]));};
const open=async(item:any)=>{if(!item?.pkid)return;visible.value=true;loading.value=true;delivery.value=item;try{const{data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesDelivery/${item.pkid}`);delivery.value=data;deliveryDate.value=parseDate(data.deliveryDate)||new Date();receiverName.value=data.receiverName||'';signatureExists.value=Boolean(data.signatureExists);}catch(e:any){visible.value=false;toast.add({severity:'error',summary:'No se pudo abrir la recogida',detail:e.response?.data||'Inténtalo de nuevo.',life:4000});}finally{loading.value=false;}};
const save=async()=>{if(!deliveryDate.value){toast.add({severity:'warn',summary:'Fecha obligatoria',life:3000});return;}if(!receiverName.value.trim()){toast.add({severity:'warn',summary:'Transportista obligatorio',detail:'Indica quién o qué empresa retira la mercancía.',life:3500});return;}saving.value=true;try{const{data}=await axios.put(`${import.meta.env.VITE_API_URL}/WebRegisterSalesDeliveryReceipt/${delivery.value.pkid}`,{deliveryDate:deliveryDate.value.toISOString(),receiverName:receiverName.value.trim(),signatureDataUrl:null});visible.value=false;emit('saved',data);toast.add({severity:'success',summary:'Recogida registrada',detail:'Se han guardado la fecha y el transportista que retiró la mercancía.',life:4000});}catch(e:any){toast.add({severity:'error',summary:'No se pudo registrar la recogida',detail:e.response?.data||'Revisa los datos indicados.',life:5000});}finally{saving.value=false;}};
defineExpose({open});
</script>

<style scoped>
.receipt-loading{min-height:220px;display:flex;align-items:center;justify-content:center;gap:.6rem}.receipt-form{display:flex;flex-direction:column;gap:1rem}.receipt-fields{display:grid;grid-template-columns:minmax(310px,1fr) minmax(320px,1.25fr);gap:1rem}.receipt-fields label{display:block;min-width:0}.receipt-fields label>span{display:block;margin-bottom:.4rem;color:#596554;font-size:.85rem;font-weight:700}.receipt-fields :deep(.p-datepicker),.receipt-fields :deep(.p-datepicker-input),.receipt-fields :deep(.p-inputtext){width:100%}.dialog-footer{display:block;width:100%}.receipt-separator{display:block;width:100%;min-height:1px;margin:0 0 .75rem;border-top:1px solid #9cc10a}.receipt-actions{display:flex;width:100%;justify-content:flex-end;gap:.5rem}@media(max-width:700px){.receipt-fields{grid-template-columns:1fr}}
</style>
