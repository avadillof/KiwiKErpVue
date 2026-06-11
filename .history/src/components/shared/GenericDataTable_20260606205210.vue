<script setup lang="ts" generic="T extends object">
import { ref, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  endpoint: string;
  filters?: Record<string, any>;
}>();

// Estado del componente
const data = ref<T[]>([] as T[]);
const totalRecords = ref(0);
const loading = ref(false);

const virtualScrollerOptions = {
  lazy: true,
  onLazyLoad: (event: any) => fetchData(event.first, event.rows),
  itemSize: 50,
  delay: 200,
  
};

// Observa cambios en los filtros para recargar desde la página 0
watch(() => props.filters, () => fetchData(0, 150), { deep: true });

async function fetchData(first: number, rows: number) {
  loading.value = true;
  try {
    const params = { page: Math.floor(first / rows), size: rows, ...props.filters };
    const response = await axios.get(props.endpoint, { params });
    
    totalRecords.value = response.data.totalElements || 0;
    
    // Inicialización del array para el VirtualScroller
    const newData = new Array(totalRecords.value).fill(null);
    const content = response.data.content as T[];
    
    for (let i = 0; i < content.length; i++) {
      newData[first + i] = content[i];
    }
    
    data.value = newData as T[];
  } catch (error) {
    console.error("Error al cargar datos:", error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    scrollHeight="flex"
    v-bind="$attrs"
    selectionMode="single"
>
    </DataTable>
</template>