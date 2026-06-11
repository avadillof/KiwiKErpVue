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

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

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

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 150, // Pequeño delay para mejorar la experiencia visual
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50;
    const page = Math.floor(first / safeRows);

    // Protección: no pedir datos ya presentes
    if (data.value[first] !== undefined && data.value[first] !== null && !data.value[first].isEmpty) {
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content, number } = response.data;

        if (totalRecords.value === 0) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // Inserción de datos
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = {
                    ...item,
                    _formattedDate: formatSafe(item.date)
                };
            }
        });

        // Rellenar huecos con IDs únicos para evitar conflicto en el DOM
        for (let i = first; i < first + safeRows; i++) {
            if (i < data.value.length && data.value[i] === null) {
                data.value[i] = { 
                    id: `placeholder-${i}`, 
                    isEmpty: true, 
                    _formattedDate: 'Cargando...' 
                };
            }
        }

        // Forzar reactividad
        data.value = [...data.value];
        emit('data-loaded', content);
        await nextTick();
    } catch (e) { 
        console.error("[DEBUG] Error en carga:", e); 
    } finally { 
        loading.value = false;
    }
}

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});
</script>