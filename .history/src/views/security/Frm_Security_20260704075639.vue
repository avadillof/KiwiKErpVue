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

onMounted(async () => {
    // 1. Recuperar datos: prioridad al estado de navegación, fallback a sessionStorage
    let userData = history.state.user;
    
    if (!userData) {
        const stored = sessionStorage.getItem('temp_user');
        if (stored) {
            userData = JSON.parse(stored);
        }
    }

    // 2. Validación de seguridad: ¡CRÍTICO!
    // Si no hay datos, evitamos errores y redirigimos al origen
    if (!userData || !userData.pkid) {
        console.warn("Acceso no autorizado o datos perdidos. Redirigiendo...");
        router.push('/usuarios'); // Ajusta a tu ruta de listado
        return;
    }

    // 3. Asignación con nombres de variables consistentes
    // Nota: verifica si tu objeto usa 'name' o 'userName'
    userName.value = String(userData.name || userData.userName || 'Usuario');

    try {
        // 4. Llamada API con manejo de errores
        const response = await fetch(`${import.meta.env.VITE_API_URL}/WebGetSecurityModulesUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pkid: Number(userData.pkid)
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        modules.value = await response.json();
    } catch (error) {
        console.error("Error al cargar módulos de seguridad:", error);
        // Aquí podrías añadir un toast de error si tienes uno configurado
    }
});






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