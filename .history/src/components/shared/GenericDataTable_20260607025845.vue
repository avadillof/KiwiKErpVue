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
import { nextTick } from 'vue'; // Importa nextTick

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
    
    // Bloqueo de página para evitar peticiones redundantes
    if (loadedPages.value.has(page)) return;

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // 1. Reset si el total cambia
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
            loadedPages.value.clear();
        }
        
        // 2. Marcamos página como cargada
        loadedPages.value.add(page);
        
        // 3. Inserción con detección de reactividad
        // Usamos un bucle para actualizar el array original de forma que Vue lo note
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                // SPLICE fuerza la reactividad en el índice específico
                data.value.splice(index, 1, item);
            }
        });
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error en carga:", e);
        // Si falla, permitimos reintentar borrando del Set
        loadedPages.value.delete(page);
    } finally { 
        loading.value = false; 
    }
}
</script>