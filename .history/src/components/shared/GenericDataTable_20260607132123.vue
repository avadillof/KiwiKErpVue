<template>
  <DataTable
    v-model:selection="selection"
    selectionMode="single"
    :metaKeySelection="false"
    :value="tableData"
    :totalRecords="totalRecords"
    :virtualScrollerOptions="virtualScrollerOptions"
    :loading="loading"
    lazy
    scrollable
    scrollHeight="flex"
    dataKey="id"
    class="compact-table"
    @row-select="onRowSelect"
    sortMode="single"
    :sortField="sortField"
    :sortOrder="sortOrder"
    @sort="onSort"
  >
    <slot />
  </DataTable>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

type RowItem = {
  id: number;
  date?: string;
  [key: string]: any;
};

const props = defineProps<{
  endpoint: string;
  selection?: RowItem | null;
}>();

const emit = defineEmits<{
  (e: 'update:selection', value: RowItem | null): void;
  (e: 'row-select', value: any): void;
  (e: 'data-loaded', data: RowItem[], total: number): void;
}>();

// ================= STATE =================
const tableData = ref<RowItem[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isFetching = ref(false);
const loadedPages = ref<number[]>([]);

const sortField = ref<string | undefined>(undefined);
const sortOrder = ref<number | undefined>(undefined);

// ================= SELECTION =================
const selection = computed({
  get: () => props.selection ?? null,
  set: (value) => emit('update:selection', value)
});

// ================= EVENTS =================
const onRowSelect = (event: any) => {
  emit('row-select', event);
};

// ================= SORT =================
const onSort = (event: any) => {

  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;

  tableData.value = [];
  totalRecords.value = 0;
  loadedPages.value = [];
  isFetching.value = false;

  fetchData(0, 50);
};

// ================= FETCH DATA =================
async function fetchData(first: number, rows: number) {

  if (isFetching.value) return;

  isFetching.value = true;
  loading.value = true;

  try {

    const response = await axios.get(props.endpoint, {
      params: {
        offset: first,
        limit: rows,
        sortOrder: sortOrder.value
      }
    });

    const content = response.data;

    if (first === 0) {
      tableData.value = content;
    } else {
      tableData.value = [...tableData.value, ...content];
    }

  } catch (e) {
    console.error(e);
  } finally {
    isFetching.value = false;
    loading.value = false;
  }
}

// ================= VIRTUAL SCROLL =================
const virtualScrollerOptions = computed(() => ({
  lazy: true,
  itemSize: 36,
  delay: 250,
  showLoader: false,

  onLazyLoad: (event: any) => {

    const first = event?.first ?? 0;
    const rows = event?.rows ?? (event?.last ? event.last - first : 50);

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
</style>