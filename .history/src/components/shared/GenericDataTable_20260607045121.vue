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
  delay: 150,
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50;
    const page = Math.floor(first / safeRows);

    // 1. PROTECCIÓN: No recargar si el dato ya está presente y no es un placeholder
    if (data.value[first] && !data.value[first].isEmpty) {
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content, number } = response.data;
        const targetIndex = (number || 0) * safeRows;

        // 2. INICIALIZACIÓN ESTRICTA: Solo una vez o si el total cambia
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // 3. INSERCIÓN DE DATOS: Sobreescribimos cualquier placeholder previo
        content.forEach((item: any, i: number) => {
            const index = targetIndex + i;
            if (index < data.value.length) {
                data.value[index] = {
                    ...item,
                    _formattedDate: formatSafe(item.date)
                };
            }
        });

        // 4. RELLENADO ESTRICTO DE HUECOS:
        // Evitamos crear placeholders fuera de los límites reales de la API (totalElements)
        const contentEndIndex = targetIndex + content.length;
        const limit = Math.min(targetIndex + safeRows, totalElements);

        for (let i = targetIndex; i < limit; i++) {
            // Solo insertamos placeholder si la posición está nula y es un índice válido
            if (i >= contentEndIndex && i < data.value.length && (!data.value[i] || data.value[i] === null)) {
                data.value[i] = { 
                    id: `placeholder-${i}`, 
                    isEmpty: true, 
                    _formattedDate: 'Cargando...' 
                };
            }
        }

        // 5. REACTIVIDAD FORZADA:
        // Actualizamos la referencia y forzamos el ciclo de vida de Vue
        data.value = [...data.value];
        renderKey.value++; // Si usas una key en el DataTable, esto dispara el refresco
        
        await nextTick();
        emit('data-loaded', content);
    } catch (e) { 
        console.error("[DEBUG] Error en carga:", e); 
    } finally { 
        loading.value = false;
    }
}

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});
</script>