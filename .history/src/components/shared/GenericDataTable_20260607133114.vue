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
    @sort="onSort"
  >
    <slot />
  </DataTable>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

/* ---------------- PROPS ---------------- */

const props = defineProps<{
  endpoint: string;
  selection?: any;
}>();

const emit = defineEmits([
  'update:selection',
  'row-select',
  'data-loaded',
  'sort'
]);

/* ---------------- STATE ---------------- */

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isFetching = ref(false);

const loadedRanges = ref<Set<string>>(new Set());

const sortField = ref<string | null>(null);
const sortOrder = ref<number | null>(null);

/* ---------------- SELECTION ---------------- */

const selection = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
});

/* ---------------- INIT ---------------- */

onMounted(() => {
  fetchData(0, 20);
});

/* ---------------- EVENTS ---------------- */

const onRowSelect = (event: any) => {
  emit('row-select', event);
};

const onSort = (event: any) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;

  reset();
  fetchData(0, 20);
};

/* ---------------- RESET ---------------- */

function reset() {
  tableData.value = [];
  totalRecords.value = 0;
  loadedRanges.value.clear();
  isFetching.value = false;
}

/* ---------------- FETCH ---------------- */

async function fetchData(first: number, rows: number) {

  const safeFirst = Number(first ?? 0);
  const safeRows = Number(rows ?? 20);

  if (safeRows <= 0 || safeFirst < 0) return;

  const key = `${safeFirst}-${safeRows}`;

  if (loadedRanges.value.has(key)) return;

  loadedRanges.value.add(key);

  try {

    const response = await axios.get(props.endpoint, {
      params: {
        offset: safeFirst,
        limit: safeRows,
        sortField: sortField.value,
        sortOrder: sortOrder.value
      }
    });

    const { totalElements, content } = response.data;

    // 🔥 INIT SOLO UNA VEZ
    if (!initialLoadDone) {
      totalRecords.value = totalElements;
      tableData.value = Array(totalElements).fill(null);
      initialLoadDone = true;
    }

    const safeContent = (content || []).filter((x: any) => x != null);

    safeContent.forEach((item: any, index: number) => {
      tableData.value[safeFirst + index] = item;
    });

    emit('data-loaded', tableData.value, totalElements);

  } catch (e) {
    console.error(e);
  }
}
/* ---------------- VIRTUAL SCROLLER ---------------- */

const virtualScrollerOptions = computed(() => ({
  lazy: true,
  itemSize: 36,
  delay: 150,
  showLoader: false,

  onLazyLoad: (event: any) => {

    const first = Number(event?.first ?? 0);
    const rows = Number(event?.rows ?? 20);

    if (rows <= 0 || first < 0) return;

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