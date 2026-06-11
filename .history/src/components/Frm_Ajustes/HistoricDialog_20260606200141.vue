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

// 1. Definimos la estructura
interface UserConnection {
    id: number;
    date: string;
    userName: string;
}

const visible = ref(false);
// 2. Aplicamos el tipo aquí
const history = ref<UserConnection[]>([]);

const open = async (userId: number) => {
    try {
        const response = await api.get(`/api/historicuser/${userId}`);
        
        // 3. TypeScript ahora sabrá que response.data debe coincidir con UserConnection[]
        history.value = (response.data as UserConnection[]).map(item => ({
            id: item.id,
            date: item.date,
            userName: item.userName
        }));

        visible.value = true;
    } catch (error) {
        console.error("Error al cargar:", error);
    }
};

// ... resto de tu código
</script>