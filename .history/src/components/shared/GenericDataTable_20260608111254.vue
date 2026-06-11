<template>
  <div class="table-container">
    <div class="datatable-wrapper">
      <DataTable v-model:selection="selection" :selectionMode="props.selectionMode" :value="tableData"
        :loading="loading" lazy scrollable scrollHeight="flex" dataKey="id" class="compact-table"
        @row-select="onRowSelect" @sort="onSort">
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

        <Message v-if="selectionCount > 0" variant="simple" icon="pi pi-check-circle" severity="success" size="small">
          {{ selectionCount }} seleccionado{{ selectionCount > 1 ? 's' : '' }}
        </Message>
      </div>

      <Paginator v-if="showPaginator !== false" class="p-paginator-sm" :first="first" :rows="rows"
        :totalRecords="totalRecords" :pageLinkSize="0" @page="onPage">
        <template #start>
          <div class="flex align-items-center gap-2">
            <label class="text-xs font-semibold text-gray-500">Ir a:</label>
            <Select :modelValue="currentPage" :options="pageOptions" @change="onPageChange"
              class="p-inputtext-sm custom-select-sm" />
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
import { HelperString } from '@/libs/HelperString';

const props = defineProps<
  {
    endpoint: string;
    selection?: any;
    initialRows?: number;
    showPaginator?: boolean;
    selectionMode?: 'single' | 'multiple';
  }>();


const emit = defineEmits(['update:selection', 'row-select', 'row-unselect', 'data-loaded', 'sort']);


const onRowSelect = (event: any) => emit('row-select', event);
const onRowUnselect = (event: any) => emit('row-unselect', event);

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);

const sortField = ref<string | null>(null);
const sortOrder = ref<number | null>(null);

const rows = ref(props.showPaginator === false ? 999999999 : (props.initialRows || 500));

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

    const params: any = { page, size };
    // CORRECCIÓN: Accede a .value y comprueba que no sea null
    if (sortField.value && sortOrder.value !== null) {
      const direction = sortOrder.value === 1 ? 'asc' : 'desc';
      // CORRECCIÓN: Accede a .value para obtener el string real
      params.sort = `${sortField.value},${direction}`;
    }

    const response = await axios.get(props.endpoint, { params });
    tableData.value = response.data.content;
    totalRecords.value = response.data.totalElements;
    emit('data-loaded', tableData.value, totalRecords.value);
  } catch (error) {
    console.error('Error cargando datos:', error);
  } finally {
    loading.value = false;
  }
}


const onPage = (event: any) => {
  first.value = event.first;
  rows.value = event.rows;
  // Al cambiar de página, volvemos a llamar a fetchData
  // fetchData ya lee los valores actuales de sortField y sortOrder
  fetchData(event.page, event.rows);
};

const onSort = (event: any) => {
  // Guardamos los valores en los refs
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;

  first.value = 0;

  // Llamamos a fetchData, que ahora sí leerá los .value correctos
  fetchData(0, rows.value);

  emit('sort', event);
};


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

.info-bar {
  padding: 0.25rem 1rem;
  font-size: 0.75rem;
  color: #666;
  background: #ffffff;
}

.p-paginator-sm {
  padding: 0.5rem 1rem !important;
  background: #f9fafb !important;
}

.custom-select-sm {
  height: 1.5rem !important;
  min-width: 4rem !important;
  display: flex;
  align-items: center;
  border-radius: 4px !important;
}
</style>