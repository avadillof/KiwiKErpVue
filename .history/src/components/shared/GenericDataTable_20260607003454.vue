<script setup lang="ts" generic="T extends object">
import { ref, watch, onUnmounted, computed } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  endpoint: string;
  filters?: Record<string, any>;
}>();


const emit = defineEmits(['data-loaded', 'lazy-load']); // Añadimos 'lazy-load'
const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isInitialLoad = ref(true);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Protección para el renderizado: filtramos los nulos para que el DataTable
// no intente pintar filas vacías mientras se hace scroll
const cleanData = computed(() => data.value.filter((item) => item !== null));

const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  delay: 200,
  onLazyLoad: (event: any) => {
    fetchData(event.first ?? 0, event.rows ?? 50);
  },
};

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

watch(() => props.filters, () => {
  isInitialLoad.value = true;
  fetchData(0, 50);
}, { deep: true });

async function fetchData(first: number, rows: number) {
  if (!props.endpoint) return;

  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    if (isInitialLoad.value && data.value.length > 0 && first !== 0) return;

    loading.value = true;
    try {
      const safeRows = rows || 50;
      const page = Math.floor(first / safeRows);
      
      const params = { page, size: safeRows, ...props.filters };
      const response = await axios.get(props.endpoint, { params });
      
      const total = response.data.totalElements || 0;
      const content = response.data.content || [];
      
      if (totalRecords.value !== total) {
        totalRecords.value = total;
        data.value = new Array(total).fill(null);
      }
      
      let newData = [...data.value];
      for (let i = 0; i < content.length; i++) {
        const index = first + i;
        if (index >= 0 && index < newData.length) {
          newData[index] = content[i];
        }
      }
      
      data.value = newData;
      isInitialLoad.value = false;
      emit('data-loaded', response.data.content);
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
    :value="cleanData" 
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