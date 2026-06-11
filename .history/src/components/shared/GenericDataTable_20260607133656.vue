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

const props = defineProps<{
  endpoint: string;
  selection?: any;
}>();

const emit = defineEmits(['update:selection', 'row-select', 'data-loaded']);

const selection = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
});

// ===================== STATE =====================
const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isFetching = ref(false);
const loadedPages = ref<number[]>([]);

const sortField = ref<string | undefined>(undefined);
const sortOrder = ref<number | undefined>(undefined);

// ===================== EVENTS =====================
const onRowSelect = (event: any) => {
  emit('row-select', event);
};

const onSort = (event: any) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;

  // RESET COMPLETO
  tableData.value = [];
  totalRecords.value = 0;
  loadedPages.value = [];
  isFetching.value = false;

  fetchData(0, 50);
};

// ===================== FETCH =====================


async function fetchData(first: number, rows: number) {

  if (
    typeof first !== 'number' ||
    isNaN(first) ||
    first < 0 ||
    typeof rows !== 'number' ||
    isNaN(rows) ||
    rows <= 0
  ) return;

  const page = Math.floor(first / rows);

  // 🔥 BLOQUEO CORRECTO
  if (isFetching.value || loadedPages.value.includes(page)) {
    return;
  }

  isFetching.value = true;
  loading.value = true;

  try {

    const response = await axios.get(props.endpoint, {
      params: {
        offset: first,   // IMPORTANTE
        limit: rows,
        sortField: sortField.value,
        sortOrder: sortOrder.value === 1 ? 'ASC' : 'DESC'
      }
    });

    const { totalElements, content } = response.data;

    if (totalRecords.value !== totalElements) {
      totalRecords.value = totalElements;
      tableData.value = [];
      loadedPages.value = [];
    }

    const safeContent = (content || []).filter(x => x);

    safeContent.forEach((item: any, index: number) => {
      tableData.value[first + index] = item;
    });

    if (!loadedPages.value.includes(page)) {
      loadedPages.value.push(page);
    }

    emit(
      'data-loaded',
      tableData.value.filter(x => x),
      totalElements
    );

  } catch (e) {
    console.error(e);
  } finally {
    isFetching.value = false;
    loading.value = false;
  }
}

// ===================== VIRTUAL SCROLL =====================
const virtualScrollerOptions = computed(() => ({
  lazy: true,
  itemSize: 36,
  delay: 250,
  showLoader: false,

  onLazyLoad: (event: any) => {

    const first = event?.first ?? 0;

    const rows =
      event?.rows ??
      (event?.last ? event.last - first : 50);

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