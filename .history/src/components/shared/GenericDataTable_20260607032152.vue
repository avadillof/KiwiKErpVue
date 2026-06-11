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
    const page = Math.floor(first / rows);
    
    // LOG 1: Saber qué está pidiendo exactamente el componente
    console.log(`[DEBUG] Solicitando -> Pág: ${page}, First: ${first}, Size: ${rows}`);

    if (data.value[first] !== undefined && data.value[first] !== null) {
        console.log(`[DEBUG] Datos ya presentes en índice ${first}. Saltando.`);
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // LOG 2: Verificar la respuesta del servidor
        console.log(`[DEBUG] Respuesta recibida -> Total: ${totalElements}, Recibidos: ${content.length}`);
        
        if (totalElements === 0) {
            console.warn("[DEBUG] ¡Advertencia! El backend dice que hay 0 registros.");
        }

        if (totalRecords.value !== totalElements) {
            console.log(`[DEBUG] Ajustando totalRecords a ${totalElements}`);
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = item;
            } else {
                console.error(`[DEBUG] ¡ERROR! Índice ${index} fuera de rango (Max: ${data.value.length})`);
            }
        });
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("[DEBUG] Error en axios:", e); 
    } finally { 
        loading.value = false;
        console.log(`[DEBUG] Finalizada carga de pág ${page}. Estado actual de data[first]:`, data.value[first]);
    }
}

</script>