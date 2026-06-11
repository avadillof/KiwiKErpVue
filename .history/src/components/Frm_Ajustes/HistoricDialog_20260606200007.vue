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
        
        // LIMITAMOS A 10 REGISTROS PARA PRUEBAS
        // Si response.data es un array, tomamos solo los 10 primeros
        const data = Array.isArray(response.data) ? response.data : [];
        history.value = data.slice(0, 10); 
        
        console.log("Mostrando solo 10 de", data.length, "registros.");
        
        visible.value = true;
    } catch (error) {
        console.error("Error al cargar:", error);
    }
};

const formatSafe = (dateValue: any) => {
    if (!dateValue) return '';
    // Si ya es string, lo devolvemos tal cual para evitar el error de librería
    if (typeof dateValue === 'string') return dateValue;

    // Si es otro tipo, intentamos formatear
    try {
        return HelperDates.formatDateFromLocale(dateValue);
    } catch (e) {
        return dateValue;
    }
};

defineExpose({ open }); // Esto permite al padre llamar a este diálogo
</script>