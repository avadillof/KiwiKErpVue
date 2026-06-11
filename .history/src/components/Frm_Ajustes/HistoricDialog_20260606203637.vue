<template>
    <Dialog v-model:visible="visible" modal header="Historial de Conexiones" 
            :style="{ width: '450px' }" class="kiwik-dialog" :dismissableMask="true">
        
            <div class="reset-container"> 
            <div class="reset-header">            
            </div>

            <DataTable 
                :value="history" 
                size="small" 
                stripedRows 
                scrollable 
                scrollHeight="300px"
                :virtualScrollerOptions="{ itemSize: 40 }"
                dataKey="id"
                class="mt-3"
            >
                <Column field="date" header="Fecha y Hora">
                    <template #body="slotProps">
                        <span class="text-sm font-medium">{{ formatSafe(slotProps.data.date) }}</span>
                    </template>
                </Column>
                <Column field="userName" header="Usuario">
                    <template #body="slotProps">
                        <span class="text-sm">{{ slotProps.data.userName }}</span>
                    </template>
                </Column>
            </DataTable>

            <div class="kiwik-separator mt-3"></div>
            
            <div class="flex justify-content-end">
                <Button label="Cerrar" text size="small" @click="visible = false" class="kiwik-btn-auto-right"/>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/services/api';
import { HelperDates } from '@/libs/HelperDates';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';


interface UserConnection {
    id: number;
    date: string;
    userName: string;
}

const visible = ref(false);
const history = ref<UserConnection[]>([]);

const open = async (userId: number) => {
    try {
        const response = await api.get(`/api/historicuser/${userId}`);
        const rawData = Array.isArray(response.data) ? response.data : [];
        
        history.value = rawData
            .filter((item: any): item is UserConnection => item !== null && typeof item === 'object')
            .map(item => ({
                id: item.id ?? Math.floor(Math.random() * 1000000),
                date: item.date ?? '',
                userName: item.userName ?? 'Desconocido'
            }));

        visible.value = true;
    } catch (error) {
        console.error("Error al cargar:", error);
    }
};

const formatSafe = (dateValue: string) => {
    if (!dateValue) return 'Fecha no disponible';
    if (typeof dateValue === 'string' && dateValue.includes(',')) return dateValue;
    try {
        return HelperDates.formatDateFromLocale(dateValue);
    } catch (e) {
        return dateValue;
    }
};

defineExpose({ open });
</script>

