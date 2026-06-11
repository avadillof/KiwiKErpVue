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
    
    // Aseguramos que sea array y limpiamos posibles nulos
    const data = Array.isArray(response.data) ? response.data : [];
    
    history.value = data.map(item => ({
      ...item,
      // Forzamos un string seguro para evitar fallos de formato
      date: item.date ? String(item.date) : "Fecha no disponible",
      userName: item.userName || "Usuario desconocido"
    }));
      
    visible.value = true;
  } catch (error) {
    console.error("Error al cargar historial:", error);
    history.value = [];
  }
};
defineExpose({ open }); // Esto permite al padre llamar a este diálogo
</script>