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
  delay: 300, // delay 0 ayuda a que el scroll no se "bloquee"
  onLazyLoad: (event: any) => { 
    fetchData(event.first, event.rows); 
  },
};

watch(() => props.endpoint, () => {
    data.value = [];
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    // 1. Si ya tenemos datos, no hacemos nada
    if (data.value[first] !== undefined && data.value[first] !== null) return;

    loading.value = true;
    try {
        const page = Math.floor(first / rows);
        const response = await axios.get(props.endpoint, { 
            params: { page, size: rows } 
        });
        
        const { totalElements, content } = response.data;
        
        // 2. Inicialización
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
        }
        
        // 3. Inserción protegida
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < data.value.length) {
                data.value[index] = item;
            }
        });

        // 4. LIMPIEZA DE HUECOS (La clave para que no se quede "Cargando")
        // Si el servidor nos devolvió menos elementos de los esperados en este bloque,
        // marcamos los huecos restantes como "vacíos" (o un objeto especial) 
        // para que no se queden en estado de carga infinito.
        const endOfBlock = Math.min(first + rows, totalElements.value);
        for (let i = first + content.length; i < endOfBlock; i++) {
            if (data.value[i] === null) {
                data.value[i] = { id: -1, isEmpty: true }; // Marcador de "no existe dato"
            }
        }
        
        emit('data-loaded', content);
    } catch (e) { 
        console.error("Error:", e); 
    } finally { 
        loading.value = false; 
    }
}

</script>