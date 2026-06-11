<template>
    <Dialog v-model:visible="visible" modal header="Historial de Conexiones" :style="{ width: '400px' }">
        <DataTable :value="history" size="small" stripedRows scrollable scrollHeight="300px">
            <Column field="date" header="Fecha y Hora">
                <template #body="slotProps">
                    {{ formatSafe(slotProps.data.date) }}
                </template>
            </Column>
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