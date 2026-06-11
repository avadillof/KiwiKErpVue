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
  delay: 0, // delay 0 ayuda a que el scroll no se "bloquee"
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    // 1. Verificación: Si la fila que intenta cargar ya tiene datos, no hagas nada
    if (data.value[first] !== undefined && data.value[first] !== null) return;

    loading.value = true;
    try {
        const page = Math.floor(first / rows);
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // 2. Inicialización única
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        // 3. ACTUALIZACIÓN SEGURA: 
        // Modificamos el array en su lugar sin cambiar su referencia (sin usar [...data.value])
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                // Asignación directa. Vue 3 detecta el cambio de índice si el array ya existe.
                data.value[index] = item;
            }
        });
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error:", e); 
    } finally { 
        loading.value = false; 
    }
}
</script>