<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    v-bind="$attrs"
    selectionMode="single"
    :metaKeySelection="false"
    dataKey="id" 
    :selection="selection"
    @update:selection="(val) => emit('update:selection', val)"
  >
    <slot></slot>
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const loadedPages = ref(new Set<number>());

const cleanData = computed(() => data.value.filter((item) => item !== null));

// Aumentamos el delay a 300ms para evitar múltiples peticiones por scroll rápido
const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 300,
  onLazyLoad: (event: any) => { 
    emit('lazy-load', event); 
    fetchData(event.first ?? 0, event.rows ?? 50); 
  },
};

// Reset total al cambiar de endpoint
watch(() => props.endpoint, () => {
    data.value = [];
    loadedPages.value.clear();
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50;
    const page = Math.floor(first / safeRows);

    // BLOQUEO CRÍTICO: Si la página ya fue procesada, detenemos la ejecución
    if (loadedPages.value.has(page)) return;

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content } = response.data;
        
        // Inicialización de la estructura si es la primera carga o cambia el total
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
            loadedPages.value.clear();
        }
        
        // Marcamos como cargada ANTES de procesar los datos para evitar re-entradas
        loadedPages.value.add(page);
        
        let newData = [...data.value];
        content.forEach((item: any, i: number) => {
            const index = first + i;
            // VALIDACIÓN: Solo insertamos si la posición está libre o el ID es nuevo
            if (index < newData.length) {
                if (!newData[index] || newData[index].id !== item.id) {
                    newData[index] = item;
                }
            }
        });
        
        data.value = newData;
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error en carga lazy:", e); 
    } finally { 
        loading.value = false; 
    }
}
</script>