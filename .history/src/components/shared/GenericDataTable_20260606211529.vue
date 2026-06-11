<script setup lang="ts" generic="T extends object">
import { ref, watch, onUnmounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  endpoint: string;
  filters?: Record<string, any>;
}>();

const data = ref<T[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// Variable para el control del scroll rápido (Debounce)
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  delay: 200,
  onLazyLoad: (event: any) => fetchData(event.first, event.rows),
};

// Limpiar el timer al destruir el componente
onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

watch(() => props.filters, () => fetchData(0, 50), { deep: true });

async function fetchData(first: number, rows: number) {
  if (!props.endpoint) return;

  // Freno para peticiones múltiples en scroll rápido
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    loading.value = true;
    try {
      const params = { 
        page: Math.floor(first / rows), 
        size: rows, 
        ...props.filters 
      };
      
      const response = await axios.get(props.endpoint, { params });
      
      totalRecords.value = response.data.totalElements || 0;
      
      // Creamos un nuevo array basado en el tamaño total conocido
      const newData = Array.from(data.value);
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
  }, 200);
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