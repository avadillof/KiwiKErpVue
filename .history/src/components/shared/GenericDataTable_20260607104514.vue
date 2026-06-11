<template>
  <DataTable 
    :value="tableData" 
    :totalRecords="totalRecords" 
    lazy 
    scrollable 
    scrollHeight="400px" 
    :virtualScrollerOptions="virtualScrollerOptions"
    dataKey="id"
    v-bind="$attrs"
>
    <slot></slot>
</DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();

// 1. Declaración segura (Renombrado para evitar conflicto de nombre)
const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isFetching = ref(false); // <--- ESTA ES LA QUE FALTABA
const loadedPages = ref<number[]>([]);

// 2. Definición de la función ANTES de usarla en cualquier otro lugar
async function fetchData(first: number, rows: number) {
    const page = Math.floor(first / rows);
    
    // 1. Bloqueo para evitar peticiones redundantes
    if (isFetching.value || loadedPages.value.includes(page)) return;

    isFetching.value = true;
    
    try {
        const response = await axios.get(props.endpoint, { params: { page, size: rows } });
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            tableData.value = new Array(totalElements).fill(null);
        }

        // 2. FILTRADO: Antes de insertar, eliminamos cualquier rastro de estos IDs 
        // en el array actual para evitar el conflicto de claves.
        const incomingIds = content.map((item: any) => item.id);
        
        // Limpiamos los duplicados existentes en el array
        tableData.value = tableData.value.map(item => 
            (item && incomingIds.includes(item.id)) ? null : item
        );

        // 3. Inserción segura
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < tableData.value.length) {
                tableData.value[index] = { ...item, isEmpty: false };
            }
        });

        loadedPages.value.push(page);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        isFetching.value = false;
    }
}

// 3. Opciones del Scroller
const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  onLazyLoad: (event: any) => fetchData(event.first, event.rows),
};


</script>