<template>
    <div class="p-4 h-screen flex flex-column" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Securización</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" class="mb-4">
            Configure la securización y accesos para el Usuario seleccionado.
        </Message>

        <div class="mb-4">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>

        <div class="flex-grow-1 border-1 surface-border border-round-lg overflow-hidden shadow-sm" style="margin-bottom: 50px;min-height: 400px;">
            
            <Splitter layout="vertical" class="h-full mt-2 md-2 ml-2 mr-2">
                
                <SplitterPanel :size="40" class="flex flex-column mt-2 md-2 ml-2 mr-2">
                    <SecurityModulesTable @select="onModuleSelected" />
                </SplitterPanel>
                
                <SplitterPanel :size="60" class="flex flex-column mt-2 md-2 ml-2 mr-2">
                    <Splitter layout="horizontal" class="h-full">
                        <SplitterPanel :size="20" class="flex flex-column mt-2 md-2 ml-2 mr-2">
                            <SecuritySectionsTable :module="selectedModule" @select="onSectionSelected" />
                        </SplitterPanel>
                        <SplitterPanel :size="80" class="flex flex-column mt-2 md-2 ml-2 mr-2">
                            <SecurityPermissionsTable :section="selectedSection" />
                        </SplitterPanel>
                    </Splitter>
                </SplitterPanel>
                
            </Splitter>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';

// Componentes
import SecurityModulesTable from './components/SecurityModulesTable.vue'
import SecuritySectionsTable from './components/SecuritySectionsTable.vue'
import SecurityPermissionsTable from './components/SecurityPermissionsTable.vue'

const router = useRouter();
const route = useRoute();

const userName = ref<string>('');
const selectedModule = ref<any>(null);
const selectedSection = ref<any>(null);

onMounted(function(): void {
    userName.value = String(route.query.userName || '');
});

const onModuleSelected = function(m: any): void {
    selectedModule.value = m;
    selectedSection.value = null; // Reset al cambiar de módulo
}

const onSectionSelected = function(s: any): void {
    selectedSection.value = s;
}

const volverAlDashboard = function(): void {
    router.push({ name: 'Frm_Ajustes', query: { tab: '2' } });
}
</script>

<style scoped>
/* Asegura que los componentes internos ocupen el 100% del panel */
:deep(.h-full) {
    height: 100% !important;
}
</style>