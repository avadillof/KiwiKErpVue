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
import { ref, computed, nextTick, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

/* ---------------- PROPS ---------------- */

const props = defineProps<{
  endpoint: string;
  selection?: any;
}>();

const emit = defineEmits(['update:selection', 'row-select', 'data-loaded', 'sort']);

/* ---------------- STATE ---------------- */

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

const loadedRanges = new Set<string>();

const sortField = ref<string | null>(null);
const sortOrder = ref<number | null>(null);

/* ---------------- SELECTION ---------------- */

const selection = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
});

/* ---------------- INIT SIMPLE ---------------- */

// 🔥 ESTE ES EL FIX CLAVE: carga inicial SIEMPRE
onMounted(async () => {
  await nextTick();
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
  loadedRanges.clear();
}

/* ---------------- FETCH ---------------- */

async function fetchData(first: number, rows: number) {

  const safeFirst = Number(first ?? 0);
  const safeRows = Number(rows ?? 20);

  const key = `${safeFirst}-${safeRows}`;

  if (loadedRanges.has(key)) return;
  loadedRanges.add(key);

  loading.value = true;

  try {

    const { data } = await axios.get(props.endpoint, {
      params: {
        offset: safeFirst,
        limit: safeRows,
        sortField: sortField.value,
        sortOrder: sortOrder.value
      }
    });

    const { totalElements, content } = data;

    if (totalRecords.value !== totalElements) {
      totalRecords.value = totalElements;
      tableData.value = Array(totalElements).fill(null);
      loadedRanges.clear();
    }

    const safeContent = (content || []).filter(Boolean);

    safeContent.forEach((item: any, i: number) => {
      tableData.value[safeFirst + i] = item;
    });

    emit('data-loaded', tableData.value, totalElements);

  } catch (e) {
    console.error('fetch error', e);
  } finally {
    loading.value = false;
  }
}

/* ---------------- VIRTUAL SCROLLER ---------------- */

const virtualScrollerOptions = computed(() => ({
  lazy: true,
  itemSize: 36,
  delay: 150,
  showLoader: false,

  onLazyLoad: (e: any) => {
    fetchData(Number(e.first ?? 0), Number(e.rows ?? 20));
  }
}));
</script>