<template>
  <DataTable :value="data" :totalRecords="totalRecords" lazy :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions" scrollable v-bind="$attrs" dataKey="id" :selection="selection"
    @update:selection="(val) => emit('update:selection', val)">
    <slot></slot>
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

// 1. DEFINICIONES DE PROPS Y EMITS
const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

// 2. FUNCIONES DE UTILIDAD (Deben ir arriba para que sean accesibles)
const formatSafe = (dateValue: string | null | undefined): string => {
    if (!dateValue) return 'Sin fecha';
    try {
        if (dateValue.includes('T')) {
            return new Date(dateValue).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
        return dateValue;
    } catch { return 'Sin fecha'; }
};

// 3. VARIABLES DE ESTADO
const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// 4. AHORA SÍ: Tu función fetchData ya puede usar formatSafe
async function fetchData(first: number, rows: number) {
    // ... tu código que usa formatSafe(item.date) ...
    // Ejemplo:
    // _formattedDate: formatSafe(item.date) 
}

// ... resto de tu código ...
</script>