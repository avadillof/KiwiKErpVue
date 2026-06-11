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
import { ref, nextTick } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string }>();
const emit = defineEmits(['data-loaded']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const renderKey = ref(0);

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 0,
  showLoader: true,
  onLazyLoad: (event: any) => {
    // Alineamos siempre al inicio de página (0, 50, 100...)
    const startRow = Math.floor(event.first / 50) * 50;
    fetchData(startRow, event.rows);
  }
};

async function fetchData(first: number, rows: number) {
    // Si ya tenemos datos, no hacemos nada (protección)
    if (data.value[first] && !data.value[first].isEmpty) return;

    loading.value = true;
    try {
        const page = Math.floor(first / 50);
        const response = await axios.get(props.endpoint, { params: { page, size: 50 } });
        const { totalElements, content } = response.data;

        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // Inserción directa
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = { ...item, _formattedDate: '...', isEmpty: false };
            }
        });

        // Forzar refresco visual
        data.value = [...data.value];
        renderKey.value++;
        
        await nextTick();
        emit('data-loaded', content);
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}
</script>