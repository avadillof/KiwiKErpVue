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
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();

// 1. Declaración segura (Renombrado para evitar conflicto de nombre)
const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// 2. Definición de la función ANTES de usarla en cualquier otro lugar
async function fetchData(first: number, rows: number) {
    const page = Math.floor(first / rows);
    
    // Bloqueo de seguridad
    if (loading.value) return;
    loading.value = true;
    
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            // Inicializamos el array solo una vez
            tableData.value = new Array(totalElements).fill(null);
        }

        // Mutación directa y segura
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < tableData.value.length) {
                tableData.value[index] = { ...item, isEmpty: false };
            }
        });
    } catch (e) {
        console.error("Error en fetchData:", e);
    } finally {
        loading.value = false;
    }
}

// 3. Opciones del Scroller
const virtualScrollerOptions = {
  lazy: true,
  itemSize: 50,
  onLazyLoad: (event: any) => fetchData(event.first, event.rows),
};

onMounted(() => {
    fetchData(0, 50);
});
</script>

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