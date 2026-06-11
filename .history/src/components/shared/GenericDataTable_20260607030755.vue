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
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// Volvemos a usar cleanData porque es más estable visualmente
const cleanData = computed(() => data.value.filter((item) => item !== null));

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 0,
  onLazyLoad: (event: any) => { fetchData(event.first, event.rows); },
};

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    loading.value = true;
    try {
        const page = Math.floor(first / rows);
        const response = await axios.get(props.endpoint, { params: { page, size: rows } });
        
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        // LÓGICA DE DEDUPLICACIÓN:
        // Solo insertamos si el ID no existe ya en nuestro array 'data'
        const existingIds = new Set(data.value.filter(i => i !== null).map(i => i.id));
        
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (!existingIds.has(item.id)) {
                data.value.splice(index, 1, item);
            }
        });
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error:", e); 
    } finally { 
        loading.value = false; 
    }
}
</script>