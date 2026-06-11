<template>
  <Dialog v-model:visible="visible" modal header="Análisis de Actividad" 
    :style="{ width: '1000px', height: '600px' }" 
    class="kiwik-dialog" :dismissableMask="true">
    
    <div class="reset-container">
      <div class="main-grid">
        <div class="panel">
          <h5 class="text-center mb-3">Tendencia de Conexiones</h5>
          <div class="chart-wrapper">
            <Chart type="line" :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="panel">
          <h5 class="text-center mb-3">Historial</h5>
          <div class="table-wrapper">
            <GenericDataTable 
              :key="apiUrl" 
              :endpoint="apiUrl" 
              ref="dataTableRef" 
              scrollHeight="flex"
              @data-loaded="handleDataLoaded" 
              @lazy-load="onTableLazyLoad"
            >
              <Column field="date" header="Fecha">
                <template #body="slotProps">
                  {{ formatSafe(slotProps.data?.date) }}
                </template>
              </Column>
            </GenericDataTable>
          </div>
        </div>
      </div>

      <div class="kiwik-separator"></div>
      
      <div class="flex justify-content-end">
        <Button label="Cerrar" @click="visible = false" class="kiwik-btn-auto-right" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Respetamos tu estilo de layout principal */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 0.4fr;
  gap: 1rem;
  height: 400px;
  margin-bottom: 1rem;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  padding: 1rem;
}

.chart-wrapper, .table-wrapper {
  flex-grow: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Forzamos que la tabla llene el panel manteniendo el estilo kiwik */
:deep(.p-datatable) { height: 100% !important; }
:deep(.p-datatable-wrapper) { flex-grow: 1; }
</style>

<script setup lang="ts">
import { type Ref } from 'vue';
import { useForgotPasswordController } from '../../services/Frm_Login/Frm_ResetPasswordController.ts';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';


const visible = defineModel<boolean>('visible');


const {
  username,
  loading,
  handleRequestReset
} = useForgotPasswordController(visible as Ref<boolean>);
</script>