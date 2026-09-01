<template>
  <Button label="Consultar tarifas" icon="pi pi-tags" text size="small" :disabled="!productId" @click="open"/>
  <Dialog v-model:visible="visible" modal class="kiwik-dialog" :style="{width:'42rem',maxWidth:'95vw'}">
    <template #header><span><i class="pi pi-tags"/> Precios del producto</span></template>
    <p>Consulta el precio por su unidad de venta habitual. Se utilizan el precio base y las reglas guardadas, sin impuestos.</p>
    <Select v-model="rateId" :options="rates" optionLabel="description" optionValue="id" placeholder="Selecciona una tarifa" :disabled="busy" class="w-full" @update:modelValue="result=null"/>
    <label class="flex flex-column gap-2 mt-3">Cantidad en la unidad de venta habitual<InputNumber v-model="quantity" :min="0.000001" :max="1000000000" :maxFractionDigits="6" :disabled="busy" locale="de-DE" :useGrouping="true" @update:modelValue="result=null"/></label>
    <Message v-if="error" severity="error">{{error}}</Message>
    <Message v-if="result" severity="success"><b>{{new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:6}).format(result.priceUnit)}} {{result.currencyCode}}</b> · {{result.source}}</Message>
    <template #footer><div class="w-full"><div class="kiwik-separator mb-3"/><div class="flex justify-content-end gap-2"><Button label="Cerrar" text @click="visible=false"/><Button label="Consultar precio" icon="pi pi-calculator" :loading="busy" :disabled="!rateId" @click="calculate"/></div></div></template>
  </Dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';import axios from 'axios';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';import Dialog from 'primevue/dialog';import Select from 'primevue/select';import Message from 'primevue/message';
import {useAuthStore} from '@/stores/authStore';
import {pricingErrorMessage,resolveSalesPrice} from '@/services/salesPricing';
const auth=useAuthStore();
const quantity=ref(1);
const props=defineProps<{productId:number|null}>();
const visible=ref(false),busy=ref(false),rates=ref<any[]>([]),rateId=ref<number|null>(null),error=ref(''),result=ref<any>(null);
async function open(){visible.value=true;busy.value=true;error.value='';result.value=null;try{const{data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebSalesPricingCatalog`,auth.portalRequestConfig());rates.value=data.rates;rateId.value=data.settings.defaultTarifaId}catch(e){error.value=pricingErrorMessage(e)}finally{busy.value=false}}
async function calculate(){busy.value=true;error.value='';result.value=null;try{result.value=await resolveSalesPrice(rateId.value,{productId:props.productId,priceUnit:0,quantity:quantity.value})}catch(e){error.value=pricingErrorMessage(e)}finally{busy.value=false}}
</script>
