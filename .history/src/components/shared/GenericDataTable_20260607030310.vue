<template>
  <DataTable :value="data" :totalRecords="totalRecords" lazy :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions" scrollable v-bind="$attrs" selectionMode="single"
    :metaKeySelection="false" dataKey="id" :selection="selection"
    @update:selection="(val) => emit('update:selection', val)">
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
  delay: 0, // Ponlo en 0 para que la petición sea inmediata al hacer scroll
  onLazyLoad: (event: any) => {
    // Si el evento es muy pequeño, ignóralo para no saturar
    if (event.rows === 0) return;
    fetchData(event.first, event.rows);
  },
};
// Reset al cambiar de fuente
watch(() => props.endpoint, () => {
  data.value = [];
  loadedPages.value.clear();
  totalRecords.value = 0;
});


async function fetchData(first: number, rows: number) {
    loading.value = true;
    try {
        const page = Math.floor(first / rows);
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // Reset solo si es necesario
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        // Actualización inteligente: solo sobrescribimos si es null
        // Esto permite que si una petición falló, la siguiente la rellene.
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                // Solo insertamos si no hay datos o si el ID es diferente
                if (data.value[index] === null || data.value[index]?.id !== item.id) {
                    data.value.splice(index, 1, item);
                }
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