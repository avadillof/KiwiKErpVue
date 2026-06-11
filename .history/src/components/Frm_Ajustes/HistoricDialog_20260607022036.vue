

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

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';

const stats = ref({ totalRecords: 0, dailyAverage: '0.0' });
const selectedUserName = ref('');
const selectedRow = ref();
const visible = ref(false);
const apiUrl = ref('');
const allLoadedData = ref<any[]>([]);
const totalRecordsFromAPI = ref(0);

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
});

const chartData = ref({
    labels: [] as string[],
    datasets: [{ label: 'Conexiones', data: [] as number[], borderColor: '#3B82F6', tension: 0.3, fill: true }]
});

const onRowSelect = (event: any) => console.log("Fila:", event.data);

const parseToDateObj = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    try {
        const parts = dateStr.split(' ');
        const mesMap: Record<string, number> = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
        const y = parseInt(parts[2]);
        const m = mesMap[parts[0].replace('.', '').toLowerCase()] || 0;
        const d = parseInt(parts[1].replace(',', ''));
        return new Date(y, m, d);
    } catch { return new Date(); }
};

const parseToDateKey = (dateStr: string): string => {
    const d = parseToDateObj(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const updateChart = (data: any[]) => {
    if (!data || data.length === 0) return;

    const dates = data.map(i => parseToDateObj(i.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const counts: Record<string, number> = {};
    data.forEach(item => {
        const key = parseToDateKey(item.date);
        if (key) counts[key] = (counts[key] || 0) + 1;
    });

    const labels: string[] = [];
    const values: number[] = [];
    let curr = new Date(minDate);

    while (curr <= maxDate) {
        const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
        labels.push(`${String(curr.getDate()).padStart(2, '0')}/${String(curr.getMonth() + 1).padStart(2, '0')}`);
        values.push(counts[key] || 0);
        curr.setDate(curr.getDate() + 1);
    }

    nextTick(() => {
        chartData.value = {
            labels,
            datasets: [{ ...chartData.value.datasets[0], data: values }]
        };
    });
};

// Se corrige el manejo de parámetros para evitar undefined
// Cambia esto en tu script
const handleDataLoaded = (data: any[], total: number) => {
    // 1. Asignación simple: La tabla solo muestra la página actual.
    // Esto elimina el parpadeo del DOM.
    allLoadedData.value = data;

    // 2. Usamos el total que nos da el servidor (que es fijo)
    totalRecordsFromAPI.value = total;

    // 3. Si necesitas la gráfica de TODO el histórico, 
    // lo ideal es que el total sea la base del cálculo.
    updateChart(allLoadedData.value);
};



const onTableLazyLoad = (_event: any) => {
    if (allLoadedData.value.length > 0) updateChart(allLoadedData.value);
};

const open = async (userId: number, userName: string) => {
    selectedUserName.value = userName;
    visible.value = true;
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;

    // 1. Llamada a estadísticas (Media y Total)
    try {
        const resStats = await fetch(`https://localhost:8083/api/historicuser/${userId}/stats`);
        stats.value = await resStats.json(); // Esperamos { totalRecords: 50, dailyAverage: 2.2 }
    } catch (e) { console.error("Error stats", e); }

    // 2. Llamada a datos de la gráfica
    try {
        const resChart = await fetch(`https://localhost:8083/api/historicuser/${userId}/chart-data`);
        const data = await resChart.json(); // Esperamos [{ date: '2026-06-07', count: 11 }, ...]

        chartData.value = {
            labels: data.map((d: any) => d.date),
            datasets: [{ ...chartData.value.datasets[0], data: data.map((d: any) => d.count) }]
        };
    } catch (e) { console.error("Error chart", e); }
};

const formatSafe = (dateValue: string) => {
    try { return HelperDates.formatDateFromLocale(dateValue); }
    catch { return dateValue || 'N/A'; }
};

const calculateDailyAverage = () => {
    // 1. Verificación básica
    if (totalRecordsFromAPI.value === 0 || allLoadedData.value.length === 0) return '0.0';

    // 2. Extracción y depuración de fechas
    const fechas = allLoadedData.value
        .map(item => parseToDateKey(item.date))
        .filter(key => key !== '' && key !== 'NaN-NaN-NaN');

    const uniqueDays = new Set(fechas);
    const activeDays = uniqueDays.size;

    // 3. Debugging: Si ves esto en consola, sabremos por qué da 0 o NaN
    console.log("Registros totales:", totalRecordsFromAPI.value);
    console.log("Fechas extraídas:", fechas);
    console.log("Días únicos detectados:", activeDays);

    // 4. Cálculo seguro
    if (activeDays === 0) return '0.0';

    const media = totalRecordsFromAPI.value / activeDays;
    return media.toFixed(1);
};

defineExpose({ open });
</script>