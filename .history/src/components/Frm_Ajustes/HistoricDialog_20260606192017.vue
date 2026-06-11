<template>
  <Dialog v-model:visible="visible" modal header="Historial de Conexiones" :style="{ width: '400px' }">
    <DataTable :value="history" size="small" stripedRows scrollable scrollHeight="300px">
      <Column field="date" header="Fecha y Hora">
        <template #body="slotProps">
          {{ HelperDates.formatDateFromLocale(slotProps.data.date) }}
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
  const response = await api.get(`/api/historic/${userId}`);
  history.value = response.data;
  visible.value = true;
};

defineExpose({ open }); // Esto permite al padre llamar a este diálogo
</script>