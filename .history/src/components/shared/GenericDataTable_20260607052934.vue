<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    scrollHeight="flex" 
    v-bind="$attrs"
    dataKey="id"
  >
    <slot></slot>
    
    <template #loading>
       <div class="p-datatable-loading-overlay">
         <i class="pi pi-spinner pi-spin" style="font-size: 2rem"></i>
       </div>
    </template>
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, watch, nextTick } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

// Función de formateo centralizada
const formatSafe = (dateValue: string | null | undefined): string => {
    if (!dateValue) return 'Sin fecha';
    try {
        if (dateValue.includes('T')) {
            return new Date(dateValue).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
        return dateValue;
    } catch { return 'Sin fecha'; }
};

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const renderKey = ref(0);

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, // <-- CAMBIADO de 100 a 50 (debe coincidir con tu CSS de fila)
  delay: 200,   // Un poco más alto evita parpadeos en carga rápida
  numToleratedItems: 10, // CLAVE: Mantiene 10 filas cargadas extra
  showLoader: true,
  onLazyLoad: (event: any) => { 
    // Alineación a página exacta
    const page = Math.floor(event.first / 50);
    fetchData(page * 50, 50); 
  },
};

async function fetchData(first: number, rows: number) {
    if (data.value[first] && !data.value[first]?.isEmpty) return;

    loading.value = true;
    try {
        const page = Math.floor(first / 50);
        const response = await axios.get(props.endpoint, { params: { page, size: 50 } });
        
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // Inserción directa
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = { ...item, _formattedDate: formatSafe(item.date), isEmpty: false };
            }
        });

        data.value = [...data.value];
        await nextTick();
    } catch (e) { console.error(e); } 
    finally { loading.value = false; }
}

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});
</script>