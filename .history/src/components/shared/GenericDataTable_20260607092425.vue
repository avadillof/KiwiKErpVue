<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    scrollHeight="flex" 
    :key="renderKey" 
    dataKey="id"
    v-bind="$attrs"
>
    <slot></slot>
</DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, watch, nextTick, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);
const tableData = ref<any[]>([]);

// Exponemos data para debugging en consola
if (typeof window !== 'undefined') {
    (window as any).$data = data;
}

// Función de formateo centralizada
const formatSafe = (dateValue: string | null | undefined): string => {
  if (!dateValue) return 'Sin fecha';
  try {
    if (dateValue.includes('T')) {
      return new Date(dateValue).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return dateValue;
  } catch { return 'Sin fecha'; }
};

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const renderKey = ref(0);

const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50, // <-- CAMBIADO de 100 a 50 (debe coincidir con tu CSS de fila)
  delay: 200,   // Un poco más alto evita parpadeos en carga rápida
  numToleratedItems: 10, // CLAVE: Mantiene 10 filas cargadas extra
  showLoader: true,
  onLazyLoad: (event: any) => {
    // Alineación a página exacta
    const page = Math.floor(event.first / 50);
    fetchData(page * 50, 50);
  },
};

const isFetching = ref(false); // Bandera para bloquear peticiones concurrentes
const loadedPages = ref<number[]>([]); 

async function fetchData(first: number, rows: number) {
    const page = Math.floor(first / rows);
    
    // Si ya tenemos datos en ese índice, NO HACER NADA
    if (data.value[first] && !data.value[first].isEmpty) return;

    // Si ya pedimos esta página, NO HACER NADA
    if (isFetching.value || loadedPages.value.includes(page)) return;

    isFetching.value = true;
    
    try {
        const response = await axios.get(props.endpoint, { params: { page, size: rows } });
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // MUTACIÓN DIRECTA: Llenamos el array sin forzar re-render
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = { ...item, isEmpty: false };
            }
        });       
        loadedPages.value.push(page);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        isFetching.value = false;
    }
}

watch(() => props.endpoint, () => {
  data.value = [];
  totalRecords.value = 0;
});



</script>