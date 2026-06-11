<script setup lang="ts" generic="T extends object">
import { ref, watch, onUnmounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  endpoint: string;
  filters?: Record<string, any>;
}>();

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// CORRECCIÓN CLAVE: Valores seguros por defecto en la configuración
const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  delay: 200,
  onLazyLoad: (event: any) => {
    // Si event.first o rows son undefined, usamos 0 y 50
    fetchData(event.first ?? 0, event.rows ?? 50);
  },
};

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

watch(() => props.filters, () => fetchData(0, 50), { deep: true });

async function fetchData(first: number, rows: number) {
  if (!props.endpoint) return;

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    loading.value = true;
    try {
      // Cálculo seguro de página
      const safeRows = rows || 50;
      const page = Math.floor(first / safeRows);
      
      const params = { page: page, size: safeRows, ...props.filters };
      
      console.log(`DEBUG: Solicitando página ${page} (first: ${first}, rows: ${safeRows})`);
      
      const response = await axios.get(props.endpoint, { params });
      
      const total = response.data.totalElements || 0;
      const content = response.data.content || [];
      
      totalRecords.value = total;
      
      let newData = [...data.value];
      
      // Ajuste de tamaño basado en el total real
      if (newData.length !== total) {
        newData = new Array(total).fill(null);
      }
      
      for (let i = 0; i < content.length; i++) {
        const index = first + i;
        if (index >= 0 && index < newData.length) {
          newData[index] = content[i];
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