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

  // Si el usuario hace scroll rápido, cancelamos la petición anterior
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
      
      // Creamos una copia local segura
      let newData = [...data.value];
      
      // Si el tamaño del array no coincide con el total, lo reiniciamos
      if (newData.length !== totalRecords.value) {
        newData = new Array(totalRecords.value).fill(null);
      }
      
      // Insertamos los nuevos datos en sus índices correspondientes
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
  }, 200); // 200ms es el tiempo ideal para una experiencia fluida
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