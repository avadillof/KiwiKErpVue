<script setup lang="ts" generic="T extends object">
import { ref, nextTick } from 'vue';
import axios from 'axios';

const props = defineProps<{ endpoint: string }>();
const emit = defineEmits(['data-loaded']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const renderKey = ref(0); // Clave para refresco forzado

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 0,
  onLazyLoad: (event: any) => {
    // Forzamos el múltiplo de 50 para evitar desfases (como tu problema del 63)
    const page = Math.floor(event.first / 50);
    fetchData(page);
  }
};

async function fetchData(page: number) {
    const firstIndex = page * 50;
    
    // Protección: no pedir si ya tenemos el dato en ese índice
    if (data.value[firstIndex] && !data.value[firstIndex].isEmpty) return;

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { params: { page, size: 50 } });
        const { totalElements, content } = response.data;

        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // Inserción directa
        content.forEach((item: any, i: number) => {
            const index = firstIndex + i;
            if (index < data.value.length) {
                data.value[index] = { ...item, isEmpty: false };
            }
        });

        // Refresco de reactividad
        data.value = [...data.value];
        renderKey.value++; 
        
        await nextTick();
        emit('data-loaded', content);
    } catch (e) { console.error(e); } 
    finally { loading.value = false; }
}
</script>

<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    scrollHeight="flex"
    :key="renderKey"
    dataKey="id"
  >
    <slot></slot>
  </DataTable>
</template>