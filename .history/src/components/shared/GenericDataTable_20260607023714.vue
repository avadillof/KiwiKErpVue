<template>
  <DataTable 
    :value="cleanData" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    v-bind="$attrs"
    selectionMode="single"
    :metaKeySelection="false"
    dataKey="id" 
    :selection="selection"
    @update:selection="(val) => emit('update:selection', val)"
  >
    <slot></slot>
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, computed } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);
const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

const cleanData = computed(() => data.value.filter((item) => item !== null));

const virtualScrollerOptions = {
  lazy: true, itemSize: 50, delay: 200,
  onLazyLoad: (event: any) => { emit('lazy-load', event); fetchData(event.first ?? 0, event.rows ?? 50); },
};

async function fetchData(first: number, rows: number) {
  loading.value = true;
  try {
    const response = await axios.get(props.endpoint, { params: { page: Math.floor(first / rows), size: rows } });
    const { totalElements, content } = response.data;
    
    if (totalRecords.value !== totalElements) { totalRecords.value = totalElements; data.value = new Array(totalElements).fill(null); }
    
    let newData = [...data.value];
    content.forEach((item: any, i: number) => {
        const index = first + i;
        if (newData[index] === null || newData[index]?.id !== item.id) newData[index] = item;
    });
    data.value = newData;
  } finally { loading.value = false; }
}
</script>