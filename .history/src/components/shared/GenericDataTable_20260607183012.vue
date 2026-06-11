<template>
  <div class="table-container">
    <DataTable v-model:selection="selection" selectionMode="single" :value="tableData" :loading="loading" lazy
      scrollable scrollHeight="flex" dataKey="id" class="compact-table" @row-select="onRowSelect" @sort="onSort">
      <slot />
    </DataTable>

    <Paginator class="p-paginator-sm" :first="first" :rows="rows" :totalRecords="totalRecords" :pageLinkSize="1"
      @page="onPage">
      <template #start>
    <div class="flex align-items-center gap-1">
        <label class="text-xs">Pág:</label>
        <Dropdown 
            :modelValue="currentPage" 
            :options="pageOptions" 
            @change="onPageChange" 
            class="p-inputtext-sm custom-dropdown-sm"
        />
    </div>
</template>
    </Paginator>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Paginator from 'primevue/paginator';
import Dropdown from 'primevue/dropdown'; // Importa el Dropdown

const props = defineProps<{ endpoint: string; selection?: any; }>();
const emit = defineEmits(['update:selection', 'row-select', 'data-loaded', 'sort']);

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);
const rows = ref(20);

// --- Lógica del Dropdown de Páginas ---
const currentPage = computed(() => Math.floor(first.value / rows.value) + 1);
const totalPages = computed(() => Math.ceil(totalRecords.value / rows.value) || 1);
const pageOptions = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1));

const onPageChange = (event: any) => {
  const selectedPage = event.value;
  const newFirst = (selectedPage - 1) * rows.value;

  // Ejecuta la misma lógica que el paginador nativo
  onPage({
    page: selectedPage - 1,
    first: newFirst,
    rows: rows.value
  });
};
// -------------------------------------

const selection = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
});

async function fetchData(page: number, size: number) {
  loading.value = true;
  try {
    const response = await axios.get(props.endpoint, {
      params: { page, size }
    });

    tableData.value = response.data.content;
    totalRecords.value = response.data.totalElements;

    emit('data-loaded', tableData.value, totalRecords.value);
  } catch (error) {
    console.error('Error cargando datos', error);
  } finally {
    loading.value = false;
  }
}

const onPage = (event: any) => {
  first.value = event.first;
  rows.value = event.rows;
  fetchData(event.page, event.rows);
};

const onSort = (event: any) => {
  emit('sort', event);
  first.value = 0;
  fetchData(0, rows.value);
};

const onRowSelect = (event: any) => emit('row-select', event);

onMounted(() => fetchData(0, rows.value));
</script>
<style scoped>
.table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-datatable-wrapper) {
  flex-grow: 1;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 0.45fr;
  gap: 1.5rem;
  flex-grow: 1;
  /* Esto es clave: le dice al grid que ocupe el espacio sobrante */
  min-height: 0;
  /* Vital para que el flexbox pueda calcular alturas correctamente */
  margin-bottom: 1rem;
}



.p-paginator-sm :deep(.p-paginator-page),
.p-paginator-sm :deep(.p-paginator-next),
.p-paginator-sm :deep(.p-paginator-prev) {
  padding: 0.2rem 0.4rem;
  min-width: 1.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
}


</style>