<template>
  <DataTable 
  v-model:selection="selection" 
  selectionMode="single" 
  :metaKeySelection="false" 
  :value="tableData"
    :totalRecords="totalRecords" :virtualScrollerOptions="virtualScrollerOptions" :loading="loading" 
    lazy scrollable
    scrollHeight="flex" dataKey="id" class="compact-table" @row-select="onRowSelect" sortMode="single" @sort="onSort"
    
    >
    <slot />
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, computed } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
  endpoint: string;
  selection?: any;
}>();

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isFetching = ref(false);
const loadedPages = ref<number[]>([]);

const sortField = ref<string | null>(null);
const sortOrder = ref<number | null>(null);

const emit = defineEmits(['update:selection', 'row-select', 'data-loaded', 'sort']);


const selection = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
});

const onRowSelect = (event: any) => {
  emit('row-select', event);
};

const onSort = (event: any) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;

  // 🔥 reset TOTAL correcto
  tableData.value = [];
  totalRecords.value = 0;
  loadedPages.value = [];

  isFetching.value = false; // 🔥 IMPORTANTE

  fetchData(0, 50);
};



const virtualScrollerOptions = computed(() => ({
  lazy: true,

  // Altura REAL de cada fila
  itemSize: 36,
  delay: 300,

  showLoader: false,

  onLazyLoad: (event: any) => {

    const first = event?.first ?? 0;

    const rows =
      event?.rows ??
      (event?.last
        ? event.last - first
        : 50);

    fetchData(first, rows);
  }
}));
</script>

<style scoped>
:deep(.p-datatable) {
  height: 100% !important;
  display: flex;
  flex-direction: column;
}

:deep(.p-datatable-wrapper) {
  flex-grow: 1;
}

:deep(.compact-table .p-datatable-tbody > tr) {
  height: 36px;
}

:deep(.compact-table .p-datatable-tbody > tr > td) {
  padding: 0.25rem 0.5rem;
}

:deep(.compact-table .p-datatable-thead > tr > th) {
  padding: 0.4rem 0.5rem;
}

:deep(.compact-table .p-datatable-tbody > tr > td .date-badge) {
  padding: 0.15rem 0.4rem;
  font-size: 0.8rem;
}
</style>