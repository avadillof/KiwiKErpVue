<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    v-bind="$attrs"
    dataKey="id"
    :selection="selection"
    @update:selection="(val) => emit('update:selection', val)"
  >
    <slot></slot>
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 200,
  onLazyLoad: (event: any) => { 
    // Solo pedimos si el evento tiene un first válido
    fetchData(event.first, event.rows); 
  },
};

// Reset limpio al cambiar endpoint
watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    // Si ya tenemos datos en la posición, ignoramos para evitar bucles
    if (data.value[first] !== undefined && data.value[first] !== null) return;

    loading.value = true;
    try {
        const page = Math.floor(first / rows);
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // Solo inicializamos si es el comienzo
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            // Creamos una vez y no volvemos a tocar el array completo
            const newArray = new Array(totalElements).fill(null);
            data.value = newArray;
        }
        
        // Inserción puntual sin resetear todo el array
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = item;
            }
        });
        
        // Forzamos un pequeño trigger de reactividad para que la tabla pinte los nuevos registros
        data.value = [...data.value]; 
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error:", e); 
    } finally { 
        loading.value = false; 
    }
}
</script>