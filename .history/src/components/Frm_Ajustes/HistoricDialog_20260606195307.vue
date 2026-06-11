<template>
    <Dialog v-model:visible="visible" modal header="Historial de Conexiones" :style="{ width: '400px' }">
        <DataTable :value="history" size="small" stripedRows scrollable scrollHeight="300px">
            <Column field="date" header="Fecha y Hora">
  <template #body="slotProps">
    <span v-if="slotProps.data && slotProps.data.date">
      {{ HelperDates.formatDateFromLocale(slotProps.data.date) }}
    </span>
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
defineExpose({ open }); // Esto permite al padre llamar a este diálogo
</script>