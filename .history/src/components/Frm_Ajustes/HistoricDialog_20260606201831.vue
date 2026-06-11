<template>
    <Dialog v-model:visible="visible" modal header="Historial de Conexiones" :style="{ width: '450px' }">
        <DataTable 
            :value="history" 
            size="small" 
            stripedRows 
            scrollable 
            scrollHeight="300px"
            :virtualScrollerOptions="{ itemSize: 40 }"
            dataKey="id"
        >
            <Column field="date" header="Fecha y Hora">
                <template #body="slotProps">
                    {{ formatSafe(slotProps.data.date) }}
                </template>
            </Column>
            <Column field="userName" header="Usuario"></Column>
        </DataTable>
    </Dialog>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/services/api';
import { HelperDates } from '@/libs/HelperDates';

// 1. Definimos la interfaz que garantiza la estructura de los datos
interface UserConnection {
    id: number;
    date: string;
    userName: string;
}

const visible = ref(false);

// 2. Aplicamos el tipo correcto al ref para evitar el error de TypeScript
const history = ref<UserConnection[]>([]);

const open = async (userId: number) => {
    try {
        const response = await api.get(`/api/historicuser/${userId}`);
        
        // 3. Procesamos los datos asegurando que coincidan con la interfaz
        const rawData = Array.isArray(response.data) ? response.data : [];
        
        history.value = rawData
            .filter((item: any): item is UserConnection => item !== null && typeof item === 'object')
            .map(item => ({
                id: item.id ?? Math.floor(Math.random() * 1000000),
                date: item.date ?? '',
                userName: item.userName ?? 'Desconocido'
            }));

        console.log("Datos limpios y listos:", history.value);
        visible.value = true;
    } catch (error) {
        console.error("Error al cargar:", error);
        history.value = [];
    }
};

// 4. Función de formateo seguro para evitar que el render falle
const formatSafe = (dateValue: string) => {
    if (!dateValue) return 'Fecha no disponible';
    
    // Si el valor ya viene como el string que recibimos del API, lo retornamos directo
    // para evitar que el HelperDates intente procesar un formato ya local.
    if (typeof dateValue === 'string' && dateValue.includes(',')) {
        return dateValue;
    }

    try {
        return HelperDates.formatDateFromLocale(dateValue);
    } catch (e) {
        return dateValue;
    }
};

defineExpose({ open });
</script>