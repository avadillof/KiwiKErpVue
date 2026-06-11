<template>
    <div class="date-range-picker">


        <IftaLabel>
            <DatePicker v-model="range" showButtonBar selectionMode="range" :manualInput="false" showIcon
                dateFormat="dd/mm/yy" :placeholder="placeholder" class="w-full" />
            <label for="date">Date</label>
        </IftaLabel>


    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DatePicker from 'primevue/datepicker';

const props = defineProps<{
    modelValue: [Date | null, Date | null] | null,
    label?: string,
    placeholder?: string
}>();

const emit = defineEmits(['update:modelValue']);

// Usamos computed para sincronizar el v-model bidireccionalmente
const range = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
</script>