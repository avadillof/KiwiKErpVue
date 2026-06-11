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

async function fetchData(first: number, rows: number) {
  loading.value = true;

  // 1. Calculamos la página según el índice 'first'
  const page = Math.floor(first / rows);

  try {
    const response = await axios.get(props.endpoint, {
      params: { page, size: rows }
    });

    const { totalElements, content } = response.data;

    // 2. Si el total cambió, reiniciamos el array (solo al inicio)
    if (totalRecords.value !== totalElements) {
      totalRecords.value = totalElements;
      data.value = Array.from({ length: totalElements }); // Array de huecos vacíos
    }

    // 3. LA CLAVE: El uso de splice para insertar datos en huecos exactos
    // Creamos una copia del array actual
    let _newData = [...data.value];

    // Insertamos los datos recibidos exactamente donde tocan
    // Los parámetros son: [índice, cantidad a borrar, ...nuevos elementos]
    _newData.splice(first, content.length, ...content.map((item: any) => ({
      ...item,
      _formattedDate: formatSafe(item.date),
      isEmpty: false
    })));

    data.value = _newData; 

// 2. Incrementar el key (para obligar al VirtualScroller a repintar el DOM)
renderKey.value++; 

console.log("Estado actual:", data.value[0]);

  } catch (e) {
    console.error("Error en carga lazy:", e);
  } finally {
    loading.value = false;
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