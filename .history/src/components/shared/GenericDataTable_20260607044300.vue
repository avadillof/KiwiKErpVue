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
import { ref, watch ,nextTick} from 'vue';
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

    // 1. PROTECCIÓN: No recargar si ya tenemos datos en ese índice
    if (data.value[first] && !data.value[first].isEmpty) {
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content, number } = response.data;

        // 2. CORRECCIÓN: Si el backend responde una página distinta, ajustamos el índice
        // Esto evita que el VirtualScroller se quede esperando en el limbo
        const actualPage = number || 0;
        const targetIndex = actualPage * safeRows;

        // 3. INICIALIZACIÓN DE ESTRUCTURA
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // 4. INSERCIÓN DE DATOS REALES
        content.forEach((item: any, i: number) => {
            const index = targetIndex + i;
            if (index < data.value.length) {
                data.value[index] = {
                    ...item,
                    _formattedDate: formatSafe(item.date)
                };
            }
        });

        // 5. RELLENADO DE HUECOS (Puntos de control)
        // Solo rellenamos los que siguen siendo null tras la inserción
        for (let i = targetIndex; i < targetIndex + safeRows; i++) {
            if (i < data.value.length && (!data.value[i] || data.value[i] === null)) {
                data.value[i] = { 
                    id: `placeholder-${i}`, 
                    isEmpty: true, 
                    _formattedDate: 'Cargando...' 
                };
            }
        }

        // 6. RE-RENDERIZADO FORZADO
        data.value = [...data.value];
        await nextTick();
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("[DEBUG] Error de carga:", e); 
    } finally { 
        loading.value = false;
    }
}
watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});
</script>