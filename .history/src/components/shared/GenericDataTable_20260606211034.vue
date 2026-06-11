<script setup lang="ts" generic="T extends object">
import { ref, watch, nextTick } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  endpoint: string;
  filters?: Record<string, any>;
}>();

const data = ref<T[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// 1. Corregido: Objeto de opciones limpio
const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  delay: 200,
  onLazyLoad: (event: any) => fetchData(event.first, event.rows),
};

watch(() => props.filters, () => fetchData(0, 50), { deep: true });

async function fetchData(first: number, rows: number) {
  // 2. Blindaje: Evitar peticiones si no hay endpoint
  if (!props.endpoint) return;

  loading.value = true;
  try {
    const params = { page: Math.floor(first / rows), size: rows, ...props.filters };
    const response = await axios.get(props.endpoint, { params });
    
    totalRecords.value = response.data.totalElements || 0;
    
    // 3. Optimización: Clonar array de forma segura
    const newData = [...data.value];
    // Asegurar que el array tenga el tamaño total (si es la primera carga)
    if (newData.length !== totalRecords.value) {
      newData.length = totalRecords.value;
    }
    
    const content = response.data.content as T[];
    for (let i = 0; i < content.length; i++) {
      newData[first + i] = content[i];
    }
    
    data.value = newData;
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
    v-bind="$attrs"
    selectionMode="single"
  >
    <template #header>
      <slot name="header"></slot>
    </template>
    
    <slot></slot>
  </DataTable>
</template>