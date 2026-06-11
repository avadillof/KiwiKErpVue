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
import { ref, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import { HelperDates } from '../../libs/HelperDates.ts';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

const virtualScrollerOptions = {
  lazy: true, 
  itemSize: 50, 
  delay: 0, // delay 0 ayuda a que el scroll no se "bloquee"
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});

// En tu script setup
let lastRequestId = 0; // Variable fuera de la función

async function fetchData(first: number, rows: number) {
    const safeRows = rows || 50;
    const page = Math.floor(first / safeRows);

    // 1. PROTECCIÓN: Verificar si ya estamos cargando este rango
    if (data.value[first] !== undefined && data.value[first] !== null) {
        return;
    }

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { 
            params: { page, size: safeRows } 
        });
        
        const { totalElements, content, number } = response.data;

        // 2. CONSISTENCIA: Si el backend devuelve una página distinta a la pedida, abortar
        if (number !== page) {
            console.warn(`[DEBUG] Desfase: Pedí pág ${page} pero llegó ${number}`);
            return; 
        }

        // 3. INICIALIZACIÓN ÚNICA: Solo si es el primer grupo de datos
        if (totalRecords.value === 0) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }

        // 4. INSERCIÓN Y BLINDAJE DE FECHAS
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                // AQUÍ BLINDAMOS: Aseguramos que 'date' siempre sea procesable
                data.value[index] = {
                    ...item,
                    _formattedDate: item.date ? formatSafe(item.date) : 'Sin fecha'
                };
            }
        });

        // 5. MARCAR HUECOS VACÍOS: Evita el "Cargando..." infinito
        const end = Math.min(first + content.length, totalRecords.value);
        for (let i = first; i < end; i++) {
            if (data.value[i] === null) {
                data.value[i] = { id: -1, isEmpty: true, _formattedDate: 'Sin fecha' };
            }
        }
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("[DEBUG] Error en axios:", e); 
    } finally { 
        loading.value = false;
    }
}
</script>