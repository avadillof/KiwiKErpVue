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

    <Paginator 
      :first="first" 
      :rows="rows" 
      :totalRecords="totalRecords"
      :pageLinkSize="1"        
      :pt="{
        root: { style: 'padding: 0.25rem; font-size: 0.8rem;' },
        pagebutton: { style: 'padding: 0.2rem 0.4rem; min-width: 1.5rem; height: 1.5rem;' },
        prevbutton: { style: 'padding: 0.2rem;' },
        nextbutton: { style: 'padding: 0.2rem;' }
      }"
      @page="onPage" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Paginator from 'primevue/paginator';

const props = defineProps<{ endpoint: string; selection?: any; }>();
const emit = defineEmits(['update:selection', 'row-select', 'data-loaded', 'sort']);

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const first = ref(0);
const rows = ref(20);

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
    
    // Avisamos al padre para que actualice la gráfica
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
.table-container { height: 100%; display: flex; flex-direction: column; }
:deep(.p-datatable-wrapper) { flex-grow: 1; }

.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.45fr;
    gap: 1.5rem;
    flex-grow: 1; /* Esto es clave: le dice al grid que ocupe el espacio sobrante */
    min-height: 0; /* Vital para que el flexbox pueda calcular alturas correctamente */
    margin-bottom: 1rem;
}

</style>