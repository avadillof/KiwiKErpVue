<template>
  <DataTable 
    :value="data" 
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
import { ref, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const loadedPages = ref(new Set<number>());

// Opciones optimizadas para evitar peticiones redundantes
const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 300,
  onLazyLoad: (event: any) => { 
    fetchData(event.first ?? 0, event.rows ?? 50); 
  },
};

// Reset al cambiar de fuente
watch(() => props.endpoint, () => {
    data.value = [];
    loadedPages.value.clear();
    totalRecords.value = 0;
});


}
</script>