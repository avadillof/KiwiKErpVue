<template>
 <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    :rows="50"           lazy 
    :loading="loading"
    :virtualScrollerOptions="{ lazy: true, itemSize: 50 }" scrollable 
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

// En tu script setup
let lastRequestId = 0; // Variable fuera de la función

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50; 
    // Corregimos: el cálculo de página debe ser consistente
    const page = Math.floor(first / safeRows);

    console.log(`[DEBUG] Intentando cargar: First: ${first}, Página calculada: ${page}`);

    // PROTECCIÓN MEJORADA: Solo saltamos si el bloque completo está lleno
    // Si first=4, estamos dentro de la página 0 (0-49). 
    // Pero si pedimos first=50, ya es la página 1.
    if (data.value[first] !== undefined && data.value[first] !== null) {
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page: page, size: safeRows } 
        });
        
        const { totalElements, content } = response.data;
        
        if (totalRecords.value === 0) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        // Inserción de datos
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = item;
            }
        });
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("[DEBUG] Error:", e); 
    } finally { 
        loading.value = false;
    }
}

</script>