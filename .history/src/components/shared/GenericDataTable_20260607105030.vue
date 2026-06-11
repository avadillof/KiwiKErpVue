<template>
  <DataTable 
    :value="tableData" 
    :totalRecords="totalRecords" 
    lazy 
    scrollable 
    scrollHeight="400px" 
    :virtualScrollerOptions="virtualScrollerOptions"
    dataKey="id"
    v-if="tableData.length > 0 || totalRecords > 0" 
    v-bind="$attrs"
>
    <slot></slot>
</DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps<{ endpoint: string; selection?: any }>();

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const isFetching = ref(false);
const loadedPages = ref<number[]>([]);

async function fetchData(first: number, rows: number) {
    console.log("Intentando fetch en:", first); // LOG DE CONTROL
    
    if (isFetching.value) return;
    isFetching.value = true;
    
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page: Math.floor(first / rows), size: rows } 
        });
        
        const { totalElements, content } = response.data;
        totalRecords.value = totalElements;
        
        if (tableData.value.length !== totalElements) {
            tableData.value = new Array(totalElements).fill(null);
        }

        content.forEach((item: any, i: number) => {
            tableData.value[first + i] = { ...item, isEmpty: false };
        });
    } catch (e) {
        console.error("Error crítico en fetch:", e);
    } finally {
        isFetching.value = false;
    }
}

// LANZAMIENTO INMEDIATO
onMounted(() => {
    console.log("Componente montado, disparando fetch inicial...");
    fetchData(0, 50);
});
</script>