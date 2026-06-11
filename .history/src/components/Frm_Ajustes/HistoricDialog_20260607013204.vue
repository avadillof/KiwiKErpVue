<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad para el Usaurio " :style="{ width: '1000px', height: '600px' }"
        class="kiwik-dialog" :dismissableMask="true">

        <div class="reset-container">
            <div class="main-grid">
                <div class="panel glass-effect">
                    <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                        <i class="pi pi-chart-line"></i>
                        Tendencia de Conexiones
                        <span class="text-700 font-bold"></span>
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

                        <GenericDataTable :key="apiUrl" :endpoint="apiUrl" ref="dataTableRef" scrollHeight="flex"
                            v-model:selection="selectedRow" @data-loaded="handleDataLoaded" @lazy-load="onTableLazyLoad"
                            @row-select="onRowSelect">
                            <Column field="date" style="width: 30%">
                                <template #header>
                                    <div class="flex align-items-center gap-2">
                                        <i class="pi pi-calendar text-primary"></i>
                                        <span class="font-bold text-800">Fecha de Conexión</span>
                                    </div>
                                </template>

                                <template #body="slotProps">
                                    <span class="date-badge">
                                        <i class="pi pi-clock text-xs mr-1"></i>
                                        {{ formatSafe(slotProps.data?.date) }}
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
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.45fr;
    gap: 1.5rem;
    height: 420px;
    margin-bottom: 1rem;
}

.panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface-card);
    /* Borde elegante y sombra suave */
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
}

.panel-title {
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

/* Ajustes finos para PrimeVue DataTable */
:deep(.p-datatable) {
    height: 100% !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
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



<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';
import { onMounted } from 'vue';

// Estado principal
const selectedUserName = ref('');
const selectedRow = ref();
const visible = ref(false);
const apiUrl = ref('');
const allLoadedData = ref<ConnectionLog[]>([]);
const dataTableRef = ref();

const onRowSelect = (event: any) => {
    console.log("Fila seleccionada:", event.data);
};

interface ConnectionLog {
    id: number;
    date: string;
    userName: string;
}

// Helpers y Lógica de Gráficos (Mantenida igual para consistencia)
const parseToDateKey = (dateStr: string): string => {
    try {
        const parts = dateStr.split(' ');
        const mesStr = parts[0].replace('.', '').toLowerCase();
        const diaStr = parts[1].replace(',', '').padStart(2, '0');
        const anioStr = parts[2];
        const meses: Record<string, string> = {
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
            'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
        };
        return `${anioStr}-${meses[mesStr] || '01'}-${diaStr}`;
    } catch (e) { return ''; }
};

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, decimation: { enabled: true, algorithm: 'lttb', samples: 100 } },
    scales: { x: { ticks: { autoSkip: true, maxRotation: 45 } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } }
});

const chartData = ref({
    labels: [] as string[],
    datasets: [{
        label: 'Conexiones',
        data: [] as number[],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        tension: 0.3,
        fill: true
    }]
});

const updateChart = (data: ConnectionLog[], fechaReferencia: Date) => {
    if (!data || data.length === 0) return;

    const startWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
    const endWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 2, 0);

    const countsMap: Record<string, number> = {};
    data.forEach((item) => {
        const dateKey = parseToDateKey(item.date);
        if (dateKey) {
            const [y, m, d] = dateKey.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            if (dateObj >= startWindow && dateObj <= endWindow) {
                countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
            }
        }
    });

    const finalLabels: string[] = [];
    const finalData: number[] = [];
    let current = new Date(startWindow);

    while (current <= endWindow) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        finalLabels.push(`${d}/${m}`);
        finalData.push(countsMap[key] || 0);
        current.setDate(current.getDate() + 1);
    }

    nextTick(() => {
        chartData.value = {
            labels: finalLabels,
            datasets: [{ ...chartData.value.datasets[0], data: finalData }]
        };
    });
};

const handleDataLoaded = (data: ConnectionLog[]) => {

    allLoadedData.value = [...allLoadedData.value, ...data];
    // Solo inicializa la primera vez si el gráfico está vacío
    if (chartData.value.labels.length === 0 && allLoadedData.value.length > 0) {
        updateChart(allLoadedData.value, new Date(parseToDateKey(allLoadedData.value[0].date)));
    }
};



const onTableLazyLoad = (event: any) => {
    const index = event.first; // Este es el índice del primer elemento visible al hacer scroll

    // Verificamos que el dato exista (a veces viene null por el lazy loading)
    if (allLoadedData.value[index]) {
        const refDate = new Date(parseToDateKey(allLoadedData.value[index].date));
        console.log("Actualizando gráfico con fecha (LazyLoad):", refDate);
        updateChart(allLoadedData.value, refDate);
    }
};

const open = (userId: number, userName: string) => {
    selectedUserName.value = userName;
    allLoadedData.value = [];
    chartData.value.labels = [];
    chartData.value.datasets[0].data = [];
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;
    visible.value = true;
};

const formatSafe = (dateValue: string) => {
    try { return HelperDates.formatDateFromLocale(dateValue); }
    catch (e) { return dateValue || 'Fecha no disponible'; }
};


defineExpose({ open });
</script>
