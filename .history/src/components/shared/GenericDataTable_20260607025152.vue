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
import { ref, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const loadedPages = ref(new Set<number>());

// Opciones optimizadas para evitar peticiones redundantes
const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 300,
  onLazyLoad: (event: any) => { 
    fetchData(event.first ?? 0, event.rows ?? 50); 
  },
};

// Reset al cambiar de fuente
watch(() => props.endpoint, () => {
    data.value = [];
    loadedPages.value.clear();
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    const page = Math.floor(first / rows);

    // Evitar peticiones solapadas
    if (loadedPages.value.has(page)) return;

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
            loadedPages.value.clear();
        }
        
        loadedPages.value.add(page);
        
        // Inserción directa basada en índice absoluto
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = item;
            }
        });
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error:", e); 
    } finally { 
        loading.value = false; 
    }
}
</script>