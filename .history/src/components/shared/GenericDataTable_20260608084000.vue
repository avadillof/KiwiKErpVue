<template>
  <div class="table-container">
    <div class="datatable-wrapper">
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
        <template #empty>
          <div class="p-4 text-center text-gray-500">No se encontraron registros</div>
        </template>
      </DataTable>
    </div>

    <div class="footer-container">
      <div class="info-bar">
          <Message variant="simple" icon="pi pi-database" severity="info" size="small">
            Total de registros: {{ HelperString.formatThousands(totalRecords) }}
          </Message>
      </div>
      <Paginator 
        class="p-paginator-sm" 
        :first="first" 
        :rows="rows" 
        :totalRecords="totalRecords" 
        :pageLinkSize="0"
        @page="onPage"
      >
        <template #start>
          <div class="flex align-items-center gap-2">
            <label class="text-xs font-semibold text-gray-500">Ir a:</label>
            <Select 
              :modelValue="currentPage" 
              :options="pageOptions" 
              @change="onPageChange" 
              class="p-inputtext-sm custom-select-sm"
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
import Select from 'primevue/select'; // Importación correcta v4
import Message from 'primevue/message';
import { HelperString  } from '@/libs/HelperString';

const props = defineProps<
{ endpoint: string; selection?: any; initialRows?: number; }>();
const emit = defineEmits(['update:selection', 'row-select', 'data-loaded', 'sort']);

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);
const rows = ref(props.initialRows || 500);

const currentPage = computed(() => Math.floor(first.value / rows.value) + 1);
const totalPages = computed(() => Math.ceil(totalRecords.value / rows.value) || 1);
const pageOptions = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1));

const onPageChange = (event: any) => {
  const selectedPage = event.value;
  onPage({ page: selectedPage - 1, first: (selectedPage - 1) * rows.value, rows: rows.value });
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
    console.error('Error cargando datos:', error);
  } finally {
    loading.value = false;
  }
}

const onPage = (event: any) => { first.value = event.first; rows.value = event.rows; fetchData(event.page, event.rows); };
const onSort = (event: any) => { emit('sort', event); first.value = 0; fetchData(0, rows.value); };
const onRowSelect = (event: any) => emit('row-select', event);

onMounted(() => fetchData(0, rows.value));
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.datatable-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.p-datatable) { 
  flex: 1; 
  min-height: 0; 
  display: flex; 
  flex-direction: column;
}

.footer-container {
  flex-shrink: 0;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.info-bar { padding: 0.25rem 1rem; font-size: 0.75rem; color: #666; background: #ffffff; }

.p-paginator-sm { padding: 0.5rem 1rem !important; background: #f9fafb !important; }

.custom-select-sm {
  height: 1.5rem !important;
  min-width: 4rem !important;
  display: flex;
  align-items: center;
  border-radius: 4px !important;
}
</style>