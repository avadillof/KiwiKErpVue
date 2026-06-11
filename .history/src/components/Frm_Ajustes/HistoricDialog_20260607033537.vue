<template>
    <Dialog v-model:visible="visible" modal :header="'Análisis de Actividad para ' + selectedUserName"
        :style="{ width: '1000px', height: '650px' }" class="kiwik-dialog" :dismissableMask="true">
        <div class="reset-container">

            <div class="stats-row">
                <div class="stat-card">
                    <i class="pi pi-calendar-times text-blue-500"></i>
                    <div>
                        <p>Total Registros</p>
                        <strong>{{ formattedTotalRecords }}</strong>




                    </div>
                </div>
                <div class="stat-card">
                    <i class="pi pi-chart-bar text-purple-500"></i>
                    <div>
                        <p>Media diaria</p>
                        <strong>{{ stats.dailyAverage }}</strong>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="pi pi-clock text-green-500"></i>
                    <div>
                        <p>Última Actividad</p>
                        <strong>{{ allLoadedData.length > 0 ? formatSafe(allLoadedData[0].date).split(' ')[0] : '-'
                        }}</strong>
                    </div>
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
                    <div class="table-wrapper">
                        <GenericDataTable :endpoint="apiUrl" ref="dataTableRef" dataKey="id" scrollHeight="flex"
                            v-model:selection="selectedRow" @data-loaded="handleDataLoaded" @row-select="onRowSelect">
                            <Column field="date" style="width: 100%">
                                <template #header>
                                    <div class="flex align-items-center gap-2">
                                        <i class="pi pi-calendar text-primary"></i>
                                        <span class="font-bold text-800">Fecha de Conexión</span>
                                    </div>
                                </template>
                                <template #body="slotProps">
                                    <div v-if="!slotProps.data" class="loading-placeholder">
                                        <i class="pi pi-spinner pi-spin"></i> Cargando...
                                    </div>

                                    <span v-else class="date-badge">
                                        <i class="pi pi-clock text-xs mr-1"></i>
                                        {{ formatSafe(slotProps.data.date) }}
                                    </span>
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
/* Stats Row */
.stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.stat-card i {
    font-size: 1.5rem;
    background: var(--surface-100);
    padding: 0.75rem;
    border-radius: 10px;
}

.stat-card p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
}

.stat-card strong {
    font-size: 1.1rem;
    color: var(--text-color);
}

/* Main Grid */
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.45fr;
    gap: 1.5rem;
    height: 350px;
    margin-bottom: 1rem;
}

.panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface-card);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.date-badge {
    background: var(--surface-hover);
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
}

.chart-wrapper,
.table-wrapper {
    flex-grow: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.chart-wrapper>div {
    width: 100% !important;
    height: 100% !important;
}

:deep(.p-datatable) {
    height: 100% !important;
}

:deep(.p-datatable-thead > tr > th) {
    background: var(--surface-50);
    font-weight: 700;
    font-size: 0.85rem;
}

:deep(.p-datatable-wrapper) {
    flex-grow: 1;
    border-radius: 8px;
    border: 1px solid var(--surface-border);
}
</style>

