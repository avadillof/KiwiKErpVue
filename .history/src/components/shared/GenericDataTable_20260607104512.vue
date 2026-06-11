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
    // 1. VALIDACIÓN ANTIPÁNICO
    if (typeof first !== 'number' || isNaN(first)) {
        console.warn("fetchData recibió un valor no numérico, abortando.");
        return;
    }

    const page = Math.floor(first / rows);
    
    // Si ya cargamos esta página, no hacer nada
    if (isFetching.value || loadedPages.value.includes(page)) return;

    isFetching.value = true;
    loading.value = true;
    
    // ... resto de tu lógica ...
}

// 3. Opciones del Scroller
const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  onLazyLoad: (event: any) => fetchData(event.first, event.rows),
};


</script>