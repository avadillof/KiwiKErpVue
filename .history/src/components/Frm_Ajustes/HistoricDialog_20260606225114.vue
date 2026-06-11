<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad y Conexiones" 
            :style="{ width: '800px' }" class="kiwik-dialog">

        <div class="reset-container">
            <div class="activity-chart mb-4">
                <h5 class="text-center">Actividad mensual del usuario</h5>
                <div style="height: 150px;">
                    <Chart type="bar" :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="kiwik-separator mb-3"></div>

            <GenericDataTable :key="apiUrl" :endpoint="apiUrl" scrollHeight="300px">
                <Column field="date" header="Fecha y Hora">
                    <template #body="slotProps">
                        <span class="text-sm font-medium">{{ formatSafe(slotProps.data?.date) }}</span>
                    </template>
                </Column>
                <Column field="userName" header="Usuario">
                    <template #body="slotProps">
                        <span class="text-sm">{{ slotProps.data?.userName }}</span>
                    </template>
                </Column>
            </GenericDataTable>

            <div class="flex justify-content-end mt-3">
                <Button label="Cerrar" size="small" @click="visible = false" />
            </div>
        </div>
    </Dialog>
</template>



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