import { ref } from 'vue';

export function useDgHistoricUserConnectionsController() {
    const visible = ref(false);
    const selectedUserName = ref('');
    const apiUrl = ref('');
    const stats = ref({ totalRecords: '0', dailyAverage: '0.0' });
    const lastDate = ref('');
    const tableRef = ref<any>(null);
    const miSeleccion = ref(null);

    // Mover funciones aquí
    const open = async (userId: number, userName: string) => {
        // ... toda tu lógica de fetch y asignación
    };

    const refreshTable = () => tableRef.value?.refresh();
    
    const exportToExcel = () => tableRef.value?.exportToExcel();

    const handleDataLoaded = (data: any[], total: number) => {
        // ... lógica de updateChart
    };

    return {
        visible,
        selectedUserName,
        apiUrl,
        stats,
        lastDate,
        tableRef,
        miSeleccion,
        open,
        refreshTable,
        exportToExcel,
        handleDataLoaded
    };
}