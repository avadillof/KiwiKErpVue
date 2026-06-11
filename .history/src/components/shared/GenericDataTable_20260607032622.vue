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

// En tu script setup
let lastRequestId = 0; // Variable fuera de la función

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50; 
    const page = Math.floor(first / safeRows);

    console.log(`[DEBUG] Solicitando -> Pág: ${page}, First: ${first}, Size: ${safeRows}`);

    // Si ya tenemos datos, no hacemos nada
    if (data.value[first] !== undefined && data.value[first] !== null) {
        console.log(`[DEBUG] Datos presentes en índice ${first}. Saltando.`);
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page: page, size: safeRows } 
        });
        
        const { totalElements, content } = response.data;
        
        console.log(`[DEBUG] Respuesta recibida -> Total: ${totalElements}, Recibidos: ${content.length}`);

        // PROTECCIÓN: Solo inicializamos si es la primera carga (totalRecords es 0)
        // Esto evita que el backend cambie el tamaño del array inesperadamente.
        if (totalRecords.value === 0) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
            console.log(`[DEBUG] Array inicializado con ${totalElements} elementos. Tamaño fijo.`);
        } else {
            console.log(`[DEBUG] Ignorando cambio de totalElements (ya inicializado: ${totalRecords.value}).`);
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
        console.error("[DEBUG] Error crítico en fetchData:", e); 
    } finally { 
        loading.value = false;
        console.log(`[DEBUG] Finalizada carga de pág ${page}.`);
    }
}
</script>