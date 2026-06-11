<template>
  <Dialog v-model:visible="visible" modal :header="'Análisis de Actividad para ' + selectedUserName"
    :style="{ width: '1000px', height: '650px' }" class="kiwik-dialog" :dismissableMask="true">
    <div class="reset-container">

      <div class="stats-row">
        <div class="stat-card">
          <i class="pi pi-calendar-times text-blue-500"></i>
          <div><p>Total Registros</p><strong>{{ stats.totalRecords }}</strong></div>
        </div>
        <div class="stat-card">
          <i class="pi pi-chart-bar text-purple-500"></i>
          <div><p>Media diaria</p><strong>{{ stats.dailyAverage }}</strong></div>
        </div>
        <div class="stat-card">
          <i class="pi pi-clock text-green-500"></i>
          <div><p>Última Actividad</p><strong>{{ lastDate }}</strong></div>
        </div>
      </div>

      <div class="main-grid">
        <div class="panel glass-effect">
          <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
            <i class="pi pi-chart-line"></i> Tendencia de Conexiones
          </h4>
          <div class="chart-wrapper">
            <Chart type="line" :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="panel glass-effect">
          <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
            <i class="pi pi-history"></i> Historial Reciente
          </h4>
          <div class="table-container-wrapper">
            <GenericDataTable :endpoint="apiUrl" @data-loaded="handleDataLoaded">
              <Column field="date" header="Fecha de Conexión" sortable>
                <template #body="slotProps">
                  <span class="date-badge">{{ formatSafe(slotProps.data?.date) }}</span>
                </template>
              </Column>
            </GenericDataTable>
          </div>
        </div>
      </div>

      <div class="kiwik-separator"></div>
      <div class="flex justify-content-end">
        <Button label="Cerrar" @click="visible = false" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.reset-container { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.main-grid { 
  display: grid; grid-template-columns: 1fr 0.45fr; gap: 1.5rem; 
  flex: 1; min-height: 0; margin-bottom: 1rem; 
}
.panel { display: flex; flex-direction: column; overflow: hidden; background: var(--surface-card); border-radius: 16px; padding: 1.25rem; }
.table-container-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.chart-wrapper { width: 100%; height: 100%; }
</style>