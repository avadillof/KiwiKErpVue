<template>
  <div class="table-container">
    <DataTable 
      v-model:selection="selection" 
      selectionMode="single" 
      :value="tableData" 
      :loading="loading" 
      lazy
      scrollable 
      scrollHeight="flex" 
      dataKey="id" 
      class="compact-table" 
      @row-select="onRowSelect" 
      @sort="onSort"
    >
      <slot />
    </DataTable>

    <div class="footer-container">
      <div class="info-bar">
        Total de registros: {{ totalRecords }}
      </div>
      
      <Paginator 
        class="p-paginator-sm" 
        :first="first" 
        :rows="rows" 
        :totalRecords="totalRecords" 
        :pageLinkSize="1"
        @page="onPage"
      >
        <template #start>
          <div class="flex align-items-center gap-2">
            <label class="text-xs font-semibold text-gray-500">Ir a:</label>
            <Dropdown 
              :modelValue="currentPage" 
              :options="pageOptions" 
              @change="onPageChange" 
              class="p-inputtext-sm custom-dropdown-sm"
            />
            <span class="text-xs text-gray-400">de {{ totalPages }}</span>
          </div>
        </template>
      </Paginator>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Paginator from 'primevue/paginator';
import Dropdown from 'primevue/dropdown';

const props = defineProps<{ endpoint: string; selection?: any; }>();
const emit = defineEmits(['update:selection', 'row-select', 'data-loaded', 'sort']);

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);
const rows = ref(20);

// Lógica de navegación
const currentPage = computed(() => Math.floor(first.value / rows.value) + 1);
const totalPages = computed(() => Math.ceil(totalRecords.value / rows.value) || 1);
const pageOptions = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1));

const onPageChange = (event: any) => {
  const selectedPage = event.value;
  onPage({
    page: selectedPage - 1,
    first: (selectedPage - 1) * rows.value,
    rows: rows.value
  });
};

const selection = computed({
  get: () => props.selection,
  set: (value) => emit('update:selection', value)
});

async function fetchData(page: number, size: number) {
  loading.value = true;
  try {
    const response = await axios.get(props.endpoint, { params: { page, size } });
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


/* La tabla ocupa el espacio flexible */
:deep(.p-datatable) { 
  flex: 1; 
  min-height: 0; 
}

/* El footer se mantiene abajo */
.footer-container {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.info-bar {
  padding: 0.25rem 1rem;
  font-size: 0.75rem;
  color: #666;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;
}

.p-paginator-sm {
  padding: 0.5rem 1rem !important;
  background: #f9fafb !important;
}

.p-paginator-sm :deep(.p-paginator-page),
.p-paginator-sm :deep(.p-paginator-next),
.p-paginator-sm :deep(.p-paginator-prev) {
  padding: 0.2rem 0.4rem;
  min-width: 1.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  border-radius: 4px;
}

.custom-dropdown-sm {
  height: 1.5rem !important;
  min-width: 4rem !important;
  display: flex;
  align-items: center;
  border-radius: 4px !important;
  border: 1px solid #d1d5db !important;
}

.custom-dropdown-sm :deep(.p-dropdown-label) {
  padding: 0 0.5rem !important;
  font-size: 0.8rem;
  line-height: 1.5rem;
  color: #374151;
}

.custom-dropdown-sm :deep(.p-dropdown-trigger) {
  width: 1.5rem !important;
  color: #6b7280;
}

.custom-dropdown-sm:hover { border-color: #3b82f6 !important; }
</style>