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

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 200,
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    // Si ya tenemos los datos en esa posición, no hacemos nada
    if (data.value[first] && data.value[first + rows - 1]) return;

    loading.value = true;
    try {
        const page = Math.floor(first / rows);
        const response = await axios.get(props.endpoint, { params: { page, size: rows } });
        
        const { totalElements, content } = response.data;
        
        // Inicializar array completo para que el scroll sepa que hay más datos
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        // Insertamos los datos recibidos
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value.splice(index, 1, item);
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