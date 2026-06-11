<template>
    <Dialog v-model:visible="visible" modal header="Historial de Conexiones" :style="{ width: '450px' }">
        <DataTable 
            :value="history" 
            size="small" 
            stripedRows 
            scrollable 
            scrollHeight="300px"
            :virtualScrollerOptions="{ itemSize: 40 }"
            dataKey="id"
        >
            <Column field="date" header="Fecha y Hora">
                <template #body="slotProps">
                    {{ formatSafe(slotProps.data.date) }}
                </template>
            </Column>
            <Column field="userName" header="Usuario"></Column>
        </DataTable>
    </Dialog>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/services/api';
import { HelperDates } from '@/libs/HelperDates';

// 1. Definimos la interfaz que garantiza la estructura de los datos
interface UserConnection {
    id: number;
    date: string;
    userName: string;
}

const visible = ref(false);

// 2. Aplicamos el tipo correcto al ref para evitar el error de TypeScript
const history = ref<UserConnection[]>([]);

import { ref, nextTick } from 'vue'; // 1. Importa nextTick

const open = async (userId: number) => {
  visible.value = true;
  loading.value = true;
  
  try {
    const response = await api.get(`/api/historicuser/${userId}`);
    
    // Asignamos los datos primero
    history.value = response.data;
    
    // 2. Usamos nextTick para que Vue termine de procesar el renderizado 
    // de los datos ANTES de apagar el loading.
    await nextTick();
    loading.value = false;
    
  } catch (error) {
    console.error("Error al cargar:", error);
    loading.value = false; // Aseguramos apagar el loading si falla
  }
};
// 4. Función de formateo seguro para evitar que el render falle
const formatSafe = (dateValue: string) => {
    if (!dateValue) return 'Fecha no disponible';
    
    // Si el valor ya viene como el string que recibimos del API, lo retornamos directo
    // para evitar que el HelperDates intente procesar un formato ya local.
    if (typeof dateValue === 'string' && dateValue.includes(',')) {
        return dateValue;
    }

    try {
        return HelperDates.formatDateFromLocale(dateValue);
    } catch (e) {
        return dateValue;
    }
};

defineExpose({ open });
</script>