<template>
 <Dialog v-model:visible="visible" modal maximizable :closable="!busy" :closeOnEscape="!busy"
  :style="{width:'min(1100px,96vw)',height:'85vh',maxHeight:'94vh'}"
  :pt="{root:{class:'kiwik-dialog payment-term-create-dialog'},header:{class:'kiwik-dialog-header'},content:{class:'kiwik-dialog-content'},footer:{class:'kiwik-dialog-footer'}}">
  <template #header><div class="heading"><span><i class="pi pi-calendar-plus"/></span><div><b>Nueva condición de pago</b><small>Catálogo compartido · {{clientName||'Ficha del cliente'}}</small></div></div></template>
  <PaymentTermsSettings v-if="visible" ref="editor" create-only @busy="busy=$event" @saved="created"/>
  <template #footer><div class="footer"><div class="kiwik-separator"/><div class="buttons"><Button label="Cancelar" severity="secondary" text :disabled="busy" @click="visible=false"/><Button label="Guardar y seleccionar" icon="pi pi-check" :loading="busy" :disabled="busy" @click="editor?.save()"/></div></div></template>
 </Dialog>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import Dialog from 'primevue/dialog';import Button from 'primevue/button';
import PaymentTermsSettings from './PaymentTermsSettings.vue';
const emit=defineEmits<{created:[term:any]}>();
const visible=ref(false),busy=ref(false),clientName=ref(''),editor=ref<InstanceType<typeof PaymentTermsSettings>>();
function open(name=''){if(busy.value)return;clientName.value=name;visible.value=true;}
function created(term:any){emit('created',term);visible.value=false;}
defineExpose({open});
</script>
<style scoped>
.heading{display:flex;align-items:center;gap:11px}.heading>span{display:grid;place-items:center;width:37px;height:37px;border-radius:9px;background:#eef5dc;color:#66810a}.heading small{display:block;margin-top:4px;color:#7c8796}.footer{width:100%}.buttons{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;flex-wrap:wrap}
:global(.payment-term-create-dialog.kiwik-dialog .p-dialog-content){display:block!important;height:auto!important;min-height:0!important;overflow:auto!important;flex:1 1 auto!important}
:global(.payment-term-create-dialog.kiwik-dialog .p-dialog-header),:global(.payment-term-create-dialog.kiwik-dialog .p-dialog-footer){flex:0 0 auto!important}
</style>
