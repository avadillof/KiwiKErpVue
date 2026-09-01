<template>
  <Dialog :visible="visible" modal :closable="false" class="kiwik-dialog" :style="{width:'42rem',maxWidth:'95vw'}">
    <template #header><span><i class="pi pi-tags"/> Aplicar tarifa a las líneas</span></template>
    <p>Recalcular sustituirá los precios de todas las líneas y pondrá sus descuentos adicionales a cero. Incluye los importes modificados manualmente.</p>
    <p v-if="canKeep">Puedes conservar los importes acordados. La tarifa elegida se utilizará en las nuevas líneas.</p>
    <Message v-else severity="warn">La moneda cambia. Debes recalcular o cancelar el cambio; no se convierten divisas automáticamente.</Message>
    <Message v-if="error" severity="error">{{ error }}</Message>
    <template #footer><div class="w-full"><div class="kiwik-separator mb-3"/><div class="flex justify-content-end gap-2 flex-wrap">
      <Button label="Cancelar" severity="secondary" text :disabled="busy" @click="$emit('cancel')"/>
      <Button v-if="canKeep" label="Conservar importes" severity="secondary" :disabled="busy" @click="$emit('keep')"/>
      <Button label="Recalcular precios" icon="pi pi-refresh" :loading="busy" @click="$emit('recalculate')"/>
    </div></div></template>
  </Dialog>
</template>
<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Message from 'primevue/message';
defineProps<{visible:boolean;busy:boolean;canKeep:boolean;error:string}>();
defineEmits<{cancel:[];keep:[];recalculate:[]}>();
</script>
