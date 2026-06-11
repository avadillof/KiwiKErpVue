<template>
  <DataTable
    :value="tableData"
    :totalRecords="totalRecords"
    lazy
    scrollable
    scrollHeight="400px"
    :virtualScrollerOptions="virtualScrollerOptions"
    :loading="loading"
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
    // 1. Validación de seguridad contra NaN y valores indefinidos
    if (typeof first !== 'number' || isNaN(first) || first < 0) {
        console.warn("Intento de carga con valores inválidos, abortando.");
        return;
    }

    const page = Math.floor(first / rows);
    
    // 2. Freno de mano: si ya cargamos esta página, no hacer nada
    if (isFetching.value || loadedPages.value.includes(page)) return;

    isFetching.value = true;
    loading.value = true;
    
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // 3. Inicialización segura del array
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            tableData.value = new Array(totalElements).fill(null);
        }

        // 4. Limpieza de duplicados: evita el error de "Duplicate keys"
        const incomingIds = content.map((item: any) => item.id);
        tableData.value = tableData.value.map(item => 
            (item && incomingIds.includes(item.id)) ? null : item
        );

        // 5. Inserción directa (sin forzar re-renders innecesarios)
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < tableData.value.length) {
                tableData.value[index] = { ...item, isEmpty: false };
            }
        });

        loadedPages.value.push(page);
    } catch (e) {
        console.error("Error en fetchData:", e);
    } finally {
        isFetching.value = false;
        loading.value = false;
    }
}

// 3. Opciones del Scroller
const virtualScrollerOptions = {
    lazy: true,
    itemSize: 50,
    delay: 300,
    showLoader: true,
    onLazyLoad: (event: any) => {

        console.log("LAZY", event);

        const first = event?.first ?? 0;

        const rows =
            event?.rows ??
            (event?.last ? event.last - first : 50);

        fetchData(first, rows);
    }
};

</script>