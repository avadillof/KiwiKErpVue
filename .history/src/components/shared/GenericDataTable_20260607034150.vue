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
    // 1. FORZAR VALORES POR DEFECTO para evitar el NaN que veíamos en los logs
    const safeRows = rows || 50; 
    const page = Math.floor(first / safeRows);

    // 2. DIAGNÓSTICO: Log claro de qué está pasando
    console.log(`[DEBUG] Solicitando -> Pág: ${page}, First: ${first}, Size: ${safeRows}`);

    // 3. PROTECCIÓN: Si el valor ya existe en el array (no es null), no pedimos nada
    if (data.value[first] !== undefined && data.value[first] !== null) {
        console.log(`[DEBUG] Datos presentes en índice ${first}. Saltando.`);
        return;
    }

    loading.value = true;
    try {
        // 4. PETICIÓN: Aseguramos que page y size sean correctos
        const response = await axios.get(props.endpoint, { 
            params: { page: page, size: safeRows } 
        });
        
        const { totalElements, content } = response.data;
        
        console.log(`[DEBUG] Respuesta recibida -> Total: ${totalElements}, Recibidos: ${content.length}`);

        // 5. INICIALIZACIÓN: Solo ocurre la primera vez
        if (totalRecords.value !== totalElements) {
            console.log(`[DEBUG] Ajustando totalRecords a ${totalElements}`);
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        // 6. INSERCIÓN: Actualización directa de los índices
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = item;
            }
        });

        // 7. SEGURIDAD: Si recibimos menos elementos de los esperados, 
        // marcamos el resto como vacío para evitar el "Cargando..." infinito
        if (content.length < safeRows) {
            const end = Math.min(first + safeRows, totalRecords.value);
            for (let i = first + content.length; i < end; i++) {
                if (data.value[i] === null) {
                    data.value[i] = { id: -1, isEmpty: true }; 
                }
            }
        }
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("[DEBUG] Error en axios:", e); 
    } finally { 
        loading.value = false;
        console.log(`[DEBUG] Finalizada carga de pág ${page}.`);
    }
}

</script>