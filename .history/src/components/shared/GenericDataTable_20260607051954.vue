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
import { ref, watch, nextTick } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

// Función de formateo centralizada
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

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const renderKey = ref(0);

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 150, 
  delay: 150,
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 150;
    const page = Math.floor(first / safeRows);

    // 1. Protección: Solo pedimos si el índice está realmente vacío
    if (data.value[first] && !data.value[first].isEmpty) return;

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content, number } = response.data;
        const targetIndex = (number || 0) * safeRows;

        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // 2. Inserción: Sincronización exacta
        content.forEach((item: any, i: number) => {
            const index = targetIndex + i;
            if (index < data.value.length) {
                data.value[index] = {
                    ...item,
                    _formattedDate: formatSafe(item.date)
                };
            }
        });

        // 3. Rellenado estricto
        const contentEndIndex = targetIndex + content.length;
        const limit = Math.min(targetIndex + safeRows, totalElements);
        for (let i = targetIndex; i < limit; i++) {
            if (i >= contentEndIndex && (!data.value[i] || data.value[i] === null)) {
                data.value[i] = { id: `ph-${i}`, isEmpty: true, _formattedDate: 'Cargando...' };
            }
        }

        // 4. EL TRUCO PARA EL "SCROLL QUE SE ARREGLA":
        // Forzamos al DOM a notar el cambio de array y el cambio de estado.
        data.value = [...data.value]; 
        
        // Un breve retraso permite que Vue termine de renderizar los datos
        // antes de que el VirtualScroller intente recalcular el scroll
        await nextTick();
        
        // Disparamos un evento para que si hay algo escuchando fuera, se entere
        emit('data-loaded', content);
        
    } catch (e) { 
        console.error("[DEBUG] Error de sincronización:", e); 
    } finally { 
        loading.value = false;
    }
}

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});
</script>