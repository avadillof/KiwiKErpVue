<script setup lang="ts" generic="T extends object">
import { ref, watch, onUnmounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  endpoint: string;
  filters?: Record<string, any>;
}>();

// Usamos any[] para evitar conflictos de tipado con los valores 'null' del VirtualScroller
const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// Variable de control para el debounce (freno de scroll)
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  delay: 200,
  onLazyLoad: (event: any) => fetchData(event.first, event.rows),
};

// Limpiar el timer al destruir el componente para evitar fugas de memoria
onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

// Recarga al cambiar filtros
watch(() => props.filters, () => fetchData(0, 50), { deep: true });

async function fetchData(first: number, rows: number) {
  if (!props.endpoint) return;

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    loading.value = true;
    try {
      const params = { page: Math.floor(first / rows), size: rows, ...props.filters };
      const response = await axios.get(props.endpoint, { params });
      
      const newTotal = response.data.totalElements || 0;
      
      // 1. Si el total cambia, debemos resetear el array
      if (totalRecords.value !== newTotal) {
        totalRecords.value = newTotal;
        data.value = new Array(newTotal).fill(null);
      }
      
      // 2. Copia segura
      const newData = [...data.value];
      const content = response.data.content as T[];
      
      // 3. Guardia: Solo insertar si el índice está dentro del rango
      for (let i = 0; i < content.length; i++) {
        const index = first + i;
        if (index < newData.length) {
          newData[index] = content[i];
        }
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