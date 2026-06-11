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
    
    // Si ya tenemos datos, no hacemos NADA.
    if (isFetching.value || loadedPages.value.includes(page)) return;

    isFetching.value = true;
    
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // 1. Inicialización de tamaño (Solo una vez)
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // 2. MUTACIÓN DIRECTA: No creamos copias ni usamos splice si no es necesario.
        // Simplemente llenamos los huecos del array existente.
        content.forEach((item: any, i: number) => {
            const index = first + i;
            data.value[index] = { 
                ...item, 
                _formattedDate: formatSafe(item.date), 
                isEmpty: false 
            };
        });

        // 3. Marcamos página como cargada
        loadedPages.value.push(page);
        
        // ¡IMPORTANTE!: NO hagas renderKey.value++. 
        // Si el VirtualScroller está bien configurado, verá el cambio en data.value[index]
        // y lo pintará solo.
        
    } catch (e) {
        console.error("Error en fetchData:", e);
    } finally {
        isFetching.value = false;
    }
}

watch(() => props.endpoint, () => {
  data.value = [];
  totalRecords.value = 0;
});


onMounted(() => {
  // Forzamos la primera carga si el array está vacío
  if (data.value.length === 0) {
    fetchData(0, 50);
  }
});
</script>