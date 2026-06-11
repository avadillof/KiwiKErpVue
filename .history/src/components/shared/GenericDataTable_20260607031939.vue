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

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 0, // delay 0 ayuda a que el scroll no se "bloquee"
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});

// En tu script setup
let lastRequestId = 0; // Variable fuera de la función

async function fetchData(first: number, rows: number) {
    const requestId = ++lastRequestId; // Cada petición tiene un ID único
    
    // Si ya tenemos datos, no hacemos nada
    if (data.value[first] !== undefined && data.value[first] !== null) return;

    loading.value = true;
    try {
        const page = Math.floor(first / rows);
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        // ¡IMPORTANTE! Si esta respuesta es más antigua que la última que pedimos, la ignoramos.
        if (requestId !== lastRequestId) return; 
        
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = item;
            }
        });
        
    } catch (e) { 
        console.error("Error:", e); 
    } finally { 
        // Solo quitamos el loading si es la petición más reciente
        if (requestId === lastRequestId) loading.value = false;
    }
}

</script>