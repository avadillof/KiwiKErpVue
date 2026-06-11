<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad" 
        :style="{ width: '1000px', height: '600px' }" 
        :contentStyle="{ padding: '0' }"
        class="kiwik-dialog">

        <div class="main-grid">
            
            <div class="panel chart-panel">
                <h5 class="text-center mb-3">Tendencia de Conexiones</h5>
                <div class="chart-wrapper">
                    <Chart type="line" :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="panel table-panel">
                <h5 class="text-center mb-3">Historial</h5>
                <div class="table-wrapper">
                    <GenericDataTable :key="apiUrl" :endpoint="apiUrl" scrollHeight="flex" 
                        @data-loaded="handleDataLoaded" 
                        @page="onTablePageChange">
                        <Column field="date" header="Fecha">
                            <template #body="slotProps">
                                <span class="text-sm">{{ formatSafe(slotProps.data?.date) }}</span>
                            </template>
                        </Column>
                    </GenericDataTable>
                </div>
            </div>
        </div>

        <div class="flex justify-content-end p-3">
            <Button label="Cerrar" size="small" @click="visible = false" />
        </div>
    </Dialog>
</template>

<style scoped>
/* Grid Layout estricto */
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.4fr; /* 70% - 30% aprox */
    gap: 1rem;
    padding: 1rem;
    height: 480px;
    box-sizing: border-box;
}

/* Bordes bonitos y estilo */
.panel {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chart-wrapper {
    flex-grow: 1;
    min-height: 0;
}

.table-wrapper {
    flex-grow: 1;
    min-height: 0;
    overflow: hidden; /* Esto evita que la tabla empuje el contenedor */
}

/* Forzar que la tabla se mantenga dentro */
:deep(.p-datatable) {
    height: 100% !important;
    width: 100% !important;
}

:deep(.p-datatable-wrapper) {
    height: 100% !important;
}


