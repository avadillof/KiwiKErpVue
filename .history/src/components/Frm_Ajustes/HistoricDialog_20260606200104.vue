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

const visible = ref(false);
const history = ref([]);

const open = async (userId: number) => {
    try {
        const response = await api.get(`/api/historicuser/${userId}`);
        console.log("Datos recibidos:", response.data); // MIRA ESTO EN LA CONSOLA (F12)
        history.value = response.data;
        visible.value = true;
    } catch (error) {
        console.error("Error:", error);
    }
};

const open = async (userId: number) => {
    try {
        const response = await api.get(`/api/historicuser/${userId}`);
        
        // 1. Aseguramos que sea un array
        const rawData = Array.isArray(response.data) ? response.data : [];
        
        // 2. Limpieza profunda: filtramos registros nulos y aseguramos la estructura
        history.value = rawData
            .filter(item => item !== null && typeof item === 'object')
            .map(item => ({
                id: item.id ?? Math.random(), // Si falta ID, generamos uno temporal
                date: item.date ?? '',       // Valor por defecto si es null
                userName: item.userName ?? 'Desconocido'
            }));

        console.log("Datos limpios y listos:", history.value);
        visible.value = true;
    } catch (error) {
        console.error("Error al cargar:", error);
    }
};

defineExpose({ open }); // Esto permite al padre llamar a este diálogo
</script>