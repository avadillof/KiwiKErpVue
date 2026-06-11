<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    v-bind="$attrs"
    dataKey="id"
    :selection="selection"
    @update:selection="(val) => emit('update:selection', val)"
  >
    <slot></slot>
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

// 1. Props y Emits
const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

// 2. Función de formateo (Definida primero para evitar ReferenceError)
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

// 3. Estado
const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 0,
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

// 4. Lógica de carga
async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50;
    const page = Math.floor(first / safeRows);

    if (data.value[first] !== undefined && data.value[first] !== null) {
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content, number } = response.data;

        // Validación de consistencia
        if (number !== page) return;

        // Inicialización única
        if (totalRecords.value === 0) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // Inserción con blindaje de fecha
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = {
                    ...item,
                    _formattedDate: formatSafe(item.date)
                };
            }
        });

        // Rellenar huecos para evitar el "Cargando..." infinito
        const end = Math.min(first + content.length, totalRecords.value);
        for (let i = first; i < end; i++) {
            if (data.value[i] === null) {
                data.value[i] = { id: -1, isEmpty: true, _formattedDate: 'Sin fecha' };
            }
        }
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("[DEBUG] Error en axios:", e); 
    } finally { 
        loading.value = false;
    }
}

// 5. Watcher para limpiar si cambia el endpoint
watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});
</script>