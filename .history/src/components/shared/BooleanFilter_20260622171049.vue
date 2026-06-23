<template>
  <div class="boolean-filter">
    <Button
      icon="pi pi-filter"
      :severity="currentValue !== null ? 'danger' : 'secondary'"
      rounded
      size="small"
      @click="visible = true"
    />

    <Dialog
      v-model:visible="visible"
      modal
      header="Filtrar por estado"
      :style="{ width: '20rem' }"
    >
      <div class="flex flex-column gap-3">
        <label class="block text-sm font-medium">Seleccione el estado:</label>
        
        <SelectButton
          v-model="localValue"
          :options="options"
          optionLabel="label"
          optionValue="value"
          aria-labelledby="basic"
          class="w-full"
        />
      </div>

      <template #footer>
        <Button label="Limpiar" severity="secondary" @click="limpiar" />
        <Button label="Aceptar" @click="aceptar" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';

const props = defineProps<{
  modelValue: boolean | null // null = Todos, true = Activo, false = Inactivo
}>();

const emit = defineEmits(['update:modelValue']);

const visible = ref(false);
const localValue = ref<boolean | null>(props.modelValue);

const options = [
  { label: 'Todos', value: null },
  { label: 'Activo', value: true },
  { label: 'Inactivo', value: false }
];

watch(() => props.modelValue, (val) => {
  localValue.value = val;
});

function aceptar() {
  emit('update:modelValue', localValue.value);
  visible.value = false;
}

function limpiar() {
  localValue.value = null;
  emit('update:modelValue', null);
  visible.value = false;
}
</script>