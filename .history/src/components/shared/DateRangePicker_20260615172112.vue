<template>
  <div class="date-range-picker">

    <Button
      icon="pi pi-calendar"
      label="Seleccionar fechas"
      @click="visible = true"
    />

    <Dialog
      v-model:visible="visible"
      modal
      header="Seleccionar intervalo de fechas"
      :style="{ width: '30rem' }"
    >
      <label v-if="label" class="block mb-2 text-sm font-medium">
        {{ label }}
      </label>

      <DatePicker
        v-model="localRange"
        showButtonBar
        selectionMode="range"
        :manualInput="false"
        showIcon
        dateFormat="dd/mm/yy"
        :placeholder="placeholder"
        inline
        class="w-full"
      />

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          @click="visible = false"
        />

        <Button
          label="Aceptar"
          @click="aceptar"
        />
      </template>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

const props = defineProps<{
  modelValue: [Date | null, Date | null] | null,
  label?: string,
  placeholder?: string
}>();

const emit = defineEmits(['update:modelValue']);

const visible = ref(false);

const localRange = ref<[Date | null, Date | null] | null>(
  props.modelValue
);

watch(
  () => props.modelValue,
  (value) => {
    localRange.value = value;
  }
);

function aceptar() {
  const value = localRange.value;

  if (value === null ||(value[0] !== null && value[1] !== null)
  ) {
    emit('update:modelValue', value);
    visible.value = false;
  }
}
</script>