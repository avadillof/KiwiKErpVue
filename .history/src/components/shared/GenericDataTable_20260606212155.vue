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
      const page = Math.floor(first / rows);
      const params = { page: page, size: rows, ...props.filters };
      
      console.log(`DEBUG: Solicitando página ${page} (first: ${first}, rows: ${rows})`);
      
      const response = await axios.get(props.endpoint, { params });
      
      const total = response.data.totalElements || 0;
      const content = response.data.content || [];
      
      console.log(`DEBUG: Recibido: Total registros=${total}, Elementos en página=${content.length}`);
      
      totalRecords.value = total;
      
      let newData = [...data.value];
      
      if (newData.length !== total) {
        console.log(`DEBUG: Ajustando tamaño del array de ${newData.length} a ${total}`);
        newData = new Array(total).fill(null);
      }
      
      for (let i = 0; i < content.length; i++) {
        const index = first + i;
        if (index < newData.length) {
          newData[index] = content[i];
        } else {
          console.warn(`DEBUG: Intento de insertar fuera de rango. Índice: ${index}, Total: ${newData.length}`);
        }
      }
      
      data.value = newData;
      console.log(`DEBUG: Array actualizado. Longitud actual: ${data.value.length}`);
      
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