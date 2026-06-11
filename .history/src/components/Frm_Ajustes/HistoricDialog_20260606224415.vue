<template>
  <Dialog v-model:visible="visible" modal header="Historial de Conexiones" 
          :style="{ width: '550px' }" class="kiwik-dialog" :dismissableMask="true">

    <div class="reset-container">
      <div class="reset-header">
        <div class="icon-circle">
          <i class="pi pi-history"></i>
        </div>
      </div>

      <TabView>
        <TabPanel header="Resumen">
          <Timeline :value="recentEvents" align="alternate" class="mt-3">
            <template #opposite="slotProps">
              <small class="text-secondary">{{ formatSafe(slotProps.item.date) }}</small>
            </template>
            <template #content="slotProps">
              <div class="p-2 border-1 surface-border border-round">
                <strong>{{ slotProps.item.userName }}</strong>
              </div>
            </template>
          </Timeline>
        </TabPanel>

        <TabPanel header="Historial Completo">
          <GenericDataTable :key="apiUrl" :endpoint="apiUrl" scrollHeight="300px" class="mt-3">
             <Column field="date" header="Fecha y Hora">
                <template #body="slotProps">
                   <span class="text-sm font-medium">{{ slotProps.data?.date ? formatSafe(slotProps.data.date) : '' }}</span>
                </template>
             </Column>
             <Column field="userName" header="Usuario">
                <template #body="slotProps">
                   <span class="text-sm">{{ slotProps.data?.userName }}</span>
                </template>
             </Column>
          </GenericDataTable>
        </TabPanel>
      </TabView>

      <div class="kiwik-separator mt-3"></div>
      <div class="flex justify-content-end">
        <Button label="Cerrar" size="small" @click="visible = false" class="kiwik-btn-auto-right" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue'; // Ajusta la ruta a tu componente genérico
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Timeline from 'primevue/timeline';
import axios from 'axios';
const recentEvents = ref([]);
const visible = ref(false);
const apiUrl = ref('');

const open = async (userId: number) => {
    // 1. Definimos el endpoint
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;
    
    // 2. Cargamos los datos para el Timeline (solo los últimos 10)
    try {
        const response = await axios.get(apiUrl.value, { 
            params: { page: 0, size: 10 } 
        });
        recentEvents.value = response.data.content || [];
    } catch (error) {
        console.error("Error al cargar datos para el timeline:", error);
        recentEvents.value = [];
    }

    // 3. Abrimos el diálogo
    visible.value = true;
};

const formatSafe = (dateValue: string) => {
    if (!dateValue) return 'Fecha no disponible';
    if (typeof dateValue === 'string' && dateValue.includes(',')) return dateValue;
    try {
        return HelperDates.formatDateFromLocale(dateValue);
    } catch (e) {
        return dateValue;
    }
};

defineExpose({ open });
</script>

<style scoped>
/* Estas clases aseguran que el estilo sea idéntico al de tus otros diálogos */
.reset-container {
    padding: 1rem;
}

.reset-header {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.icon-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-50);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 1.5rem;
}
</style>