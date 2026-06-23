<template>
  <div class="table-container">

    <div class="datatable-wrapper">

      <div v-if="filterable || showActions" class="search-bar flex align-items-center justify-content-between gap-2">

        <IconField v-if="filterable" class="flex-1">
          <InputIcon class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Buscar registros..." @input="onSearch" class="w-full" />
        </IconField>


        <div class="flex align-items-center gap-2">
          <slot name="panelOptions"></slot>
        </div>
        <div v-if="showActions" class="flex align-items-center">
          <slot name="headerActions"></slot>
        </div>

      </div>

      <DataTable v-model:selection="selection" :selectionMode="props.selectionMode" :value="tableData"
        :loading="loading" lazy scrollable scrollHeight="flex" class="compact-table" @row-select="onRowSelect"
        @sort="onSort">
        <slot />
        <template #empty>
          <div class="p-4 text-center text-gray-500">No se encontraron registros</div>
        </template>
      </DataTable>
    </div>

    <div class="footer-container">
      <div class="info-bar">
        <Message variant="simple" icon="pi pi-database" severity="info" size="small">
          Total: {{ HelperString.formatThousands(totalRecords) }}
        </Message>

        <div v-if="fechaFiltros != null" class="info-right-group">
          <span class="separator"></span>
          <Message variant="simple" icon="pi pi-check-circle" severity="error" size="small">
            Filtro Activo
          </Message>
        </div>

        <div v-if="selectionCount > 0" class="info-right-group">
          <span class="separator"></span>
          <Message variant="simple" icon="pi pi-check-circle" severity="success" size="small">
            {{ selectionCount }} seleccionado{{ selectionCount > 1 ? 's' : '' }}
          </Message>
        </div>
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
import * as XLSX from 'xlsx';
import { useCompanyStore } from '../../stores/companyStore';


const companyStore = useCompanyStore();

const props = defineProps<
  {
    endpoint: string;
    selection?: any;
    showPaginator?: boolean;
    selectionMode?: 'single' | 'multiple';
    filterable?: boolean;
    showActions?: boolean;
  }>();


const searchQuery = ref('');
const fechaFiltros = ref<[Date | null, Date | null] | null>(null);

const emit = defineEmits(['update:selection', 'row-select', 'row-unselect', 'data-loaded', 'sort', 'search', 'filterdate']);


const onRowSelect = (event: any) => emit('row-select', event);
const onRowUnselect = (event: any) => emit('row-unselect', event);

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);

const sortField = ref<string | null>(null);
const sortOrder = ref<number | null>(null);

const rows = ref(props.showPaginator === false ? 999999999 : (companyStore.companyInfo.paginationTable || 500));

const currentPage = computed(() => Math.floor(first.value / rows.value) + 1);
const totalPages = computed(() => Math.ceil(totalRecords.value / rows.value) || 1);
const pageOptions = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1));

const onPageChange = (event: any) => {
  const selectedPage = event.value;
  onPage({ page: selectedPage - 1, first: (selectedPage - 1) * rows.value, rows: rows.value });
};



const selection = computed({
  get: () => props.selection,
  set: (value) => {
    emit('update:selection', value);
  }
});


async function fetchData(page: number, size: number) {
  loading.value = true;
  try {
    // 1. Crear params base
    const params: any = { page, size };

    // 2. Si hay filtro, lo añadimos codificado directamente
    if (props.filterable && searchQuery.value) {
      params.query = encodeURIComponent(searchQuery.value);
    }

    // 3. Sorting
    if (sortField.value && sortOrder.value !== null) {
      const direction = sortOrder.value === 1 ? 'asc' : 'desc';
      params.sort = `${sortField.value},${direction}`;
    }


    const baseUrl = import.meta.env.VITE_API_URL;
    const response = await axios.get(baseUrl + '/' + props.endpoint, { params });

    tableData.value = response.data.content;
    totalRecords.value = response.data.totalElements;
    emit('data-loaded', tableData.value, totalRecords.value);
  } catch (error) {
    console.error('Error cargando datos:', error);
  } finally {
    loading.value = false;
  }
}



async function fetchDataDateField(page: number, size: number, field: string, fechaFiltro: [Date | null, Date | null] | null) {
  loading.value = true;

  try {

    fechaFiltros.value = fechaFiltro;
    searchQuery.value = '';

    const params: any = { page, size };
    if (fechaFiltro?.[0] && fechaFiltro?.[1]) {
      const [inicio, fin] = fechaFiltro;
      params.query = `[${field}],[${inicio.toISOString()}],[${fin.toISOString()}]`;
    }

    if (sortField.value && sortOrder.value !== null) {
      const direction = sortOrder.value === 1 ? 'asc' : 'desc';
      params.sort = `${sortField.value},${direction}`;
    }

    const baseUrl = import.meta.env.VITE_API_URL;

    const response = await axios.get(
      `${baseUrl}/${props.endpoint}`,
      { params }
    );

    tableData.value = response.data.content;
    totalRecords.value = response.data.totalElements;

    emit('data-loaded', tableData.value, totalRecords.value);
  }
  catch (error) {
    console.error('Error cargando datos:', error);
  }
  finally {
    loading.value = false;
  }
}


const selectionCount = computed(() => {
  if (!selection.value) return 0; // Usamos el computed 'selection' de arriba
  return Array.isArray(selection.value) ? selection.value.length : 1;
});

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

let debounceTimer: any;

const onSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    first.value = 0;
    fetchData(0, rows.value);
    emit('filterdate');


  }, 500); // Espera 500ms después de que el usuario deje de escribir
};



defineExpose({



  refresh: () => {
    fechaFiltros.value = null;
    const currentPageIndex = Math.floor(first.value / rows.value);
    fetchData(currentPageIndex, rows.value);
  },

  refreshDataField: (field: string, fechaFiltro: [Date | null, Date | null]) => {

    const currentPageIndex = Math.floor(first.value / rows.value);
    fetchDataDateField(currentPageIndex, rows.value, field, fechaFiltro);
  },


  exportToExcel: () => {
    // 1. Preparamos los datos (si necesitas formatearlos)
    const worksheet = XLSX.utils.json_to_sheet(tableData.value);

    // 2. Creamos un nuevo libro de trabajo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");


    const now = new Date();
    const timestamp = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') + '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');

    const fileName = `export_${timestamp}.xlsx`;

    // 3. Exportamos el archivo
    XLSX.writeFile(workbook, fileName);
  }
});

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
  display: flex;
  align-items: center;
  /* Centra verticalmente los elementos */
  justify-content: space-between;
  /* Empuja el primer mensaje a la izq y el segundo a la der */
  padding: 0.25rem 1rem;
  font-size: 0.75rem;
  background: #ffffff;
  min-height: 2rem;
  /* Asegura altura suficiente */
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


.info-right-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.separator {
  width: 1px;
  height: 1rem;
  background-color: #d1d5db;
  margin: 0 0.5rem;
  /* Margen horizontal para despegar la barrita */
}


.search-bar {
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}
</style>