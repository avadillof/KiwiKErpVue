<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    v-bind="$attrs"
    dataKey="id"
    :selection="selection"
    @update:selection="(val) => emit('update:selection', val)"
  >
    <slot></slot>
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
  itemSize: 50,
  delay: 0,
  // buffer: cuántas filas extra carga fuera de la vista. 
  // Al ponerlo alto, obligamos a que cargue los datos antes de que el usuario llegue a ellos.
  buffer: 10, 
  onLazyLoad: (event: any) => { 
    // Ajuste fino: el VirtualScroller a veces manda un índice impar. 
    // Lo redondeamos a la baja para que siempre coincida con el bloque de 50.
    const startRow = Math.floor(event.first / 50) * 50;
    fetchData(startRow, event.rows); 
  },
};

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50;
    const page = Math.floor(first / safeRows);

    // 1. Verificación de seguridad
    if (data.value[first] && !data.value[first].isEmpty) return;

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content } = response.data;

        // 2. Sincronización total
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // 3. Inserción directa basada en el índice global 'first'
        // Esto ignora el 'number' del JSON y confía en el 'first' del VirtualScroller
        content.forEach((item: any, i: number) => {
            const index = first + i; // Usamos 'first' directamente
            if (index < data.value.length) {
                data.value[index] = {
                    ...item,
                    _formattedDate: formatSafe(item.date),
                    isEmpty: false
                };
            }
        });

        // 4. Limpieza: No rellenamos placeholders, dejamos que el v-if del template los gestione
        // Esto evita que IDs duplicados bloqueen el renderizado
        data.value = [...data.value];
        renderKey.value++; 
        
        await nextTick();
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error en fetchData:", e); 
    } finally { 
        loading.value = false;
    }
}

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});
</script>