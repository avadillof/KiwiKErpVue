<template>
    <div class="p-4 h-screen flex flex-column" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Securización</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" class="mb-4">
            Configure la securización y accesos para el Usuario seleccionado.
        </Message>

        <div class="mb-4">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>

        <div class="flex-grow-1 border-4 surface-border border-round-lg overflow-auto shadow-sm "
            style="margin-bottom: 250px;min-height: 450px;">


            <!-- MÓDULOS -->
            <div class="panel-section modules-panel">
                <SecurityModulesTable :modules="modules" v-model:selected="selectedModule" @select="onModuleSelected" />
            </div>

            <!-- DETALLE -->
            <div class="panel-section detail-panel">

                <!-- SECCIONES -->
                <div class="panel-inner">
                    <SecuritySectionsTable :module="selectedModule" @select="onSectionSelected" />
                </div>

                <!-- PERMISOS -->
                <div class="panel-inner">
                    <SecurityPermissionsTable :section="selectedSection" />
                </div>

            </div>

        </div>

    </div>
</template>


<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import SecurityModulesTable from './components/SecurityModulesTable.vue'
import SecuritySectionsTable from './components/SecuritySectionsTable.vue'
import SecurityPermissionsTable from './components/SecurityPermissionsTable.vue'

const router = useRouter()
const route = useRoute()

const userName = ref('')
const selectedModule = ref<any>(null)
const selectedSection = ref<any>(null)

const modules = ref<any[]>([])



const onModuleSelected = (m: any) => {
    selectedModule.value = m
    selectedSection.value = null
}

const onSectionSelected = (s: any) => {
    selectedSection.value = s
}

const volverAlDashboard = () => {
    router.push({ name: 'Frm_Ajustes', query: { tab: '2' } })
}

</script>


<style scoped>
.security-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    background: var(--surface-ground);
}

/* HEADER LIMPIO */
.security-header {
    background: var(--surface-card);
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--surface-border);
}

.title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 6px;
}

.actions {
    margin-top: 8px;
}

/* BODY */
.security-body {
    flex: 1;
    min-height: 0;
}

/* SPLITTER */
.security-splitter {
    height: calc(100vh - 140px);
    /* ajusta según header */
    min-height: 0;
}
</style>