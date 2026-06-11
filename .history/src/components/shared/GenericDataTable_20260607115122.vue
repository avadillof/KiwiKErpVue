<template>
  <DataTable
    v-model:selection="selection"
    v-model:sortField="sortField"
    v-model:sortOrder="sortOrder"
    selectionMode="single"
    :metaKeySelection="false"
    :value="tableData"
    :totalRecords="totalRecords"
    :virtualScrollerOptions="virtualScrollerOptions"
    :loading="loading"
    lazy
    sortMode="single"
    scrollable
    scrollHeight="flex"
    dataKey="id"
    class="compact-table"
    @sort="onSort"
    @row-select="onRowSelect"
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

const emit = defineEmits(['update:selection', 'row-select', 'data-loaded']);

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isFetching = ref(false);
const loadedPages = ref<number[]>([]);

const sortField = ref<string | null>(null);
const sortOrder = ref<number | null>(null);

const selection = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
});

const onRowSelect = (event: any) => emit('row-select', event);

const onSort = (event: any) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
  loadedPages.value = [];
  tableData.value = [];
  fetchData(0, 50);
};

async function fetchData(first: number, rows: number) {
  if (typeof first !== 'number' || isNaN(first) || first < 0 || typeof rows !== 'number' || isNaN(rows) || rows <= 0) return;

  const page = Math.floor(first / rows);
  if (isFetching.value || (loadedPages.value.includes(page) && !sortField.value)) return;

  isFetching.value = true;
  loading.value = true;

  try {
    const params: any = { page, size: rows };
    if (sortField.value) {
      params.sort = sortField.value;
      params.order = sortOrder.value === 1 ? 'asc' : 'desc';
    }

    const response = await axios.get(props.endpoint, { params });
    const { totalElements, content } = response.data;

    if (totalRecords.value !== totalElements) {
      totalRecords.value = totalElements;
      tableData.value = new Array(totalElements).fill(null);
      loadedPages.value = [];
    }

    content.forEach((item: any, index: number) => {
      const position = first + index;
      if (position < tableData.value.length) tableData.value[position] = item;
    });

    loadedPages.value.push(page);
    emit('data-loaded', tableData.value, totalRecords.value);
  } catch (error) {
    console.error('Error cargando datos', error);
  } finally {
    isFetching.value = false;
    loading.value = false;
  }
}

const virtualScrollerOptions = computed(() => ({
  lazy: true,
  itemSize: 36,
  delay: 300,
  showLoader: false,
  onLazyLoad: (event: any) => fetchData(event?.first ?? 0, event?.rows ?? 50)
}));
</script>

<style scoped>
:deep(.p-datatable) { height: 100% !important; display: flex; flex-direction: column; }
:deep(.p-datatable-wrapper) { flex-grow: 1; }
:deep(.compact-table .p-datatable-tbody > tr) { height: 36px; }
</style>