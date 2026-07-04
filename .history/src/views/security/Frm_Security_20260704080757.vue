<template>
    <div class="p-3 h-screen flex flex-column gap-3 surface-ground" style="margin-bottom: 50px;">
        
        <div class="flex align-items-center justify-content-between p-3 surface-card border-round-md shadow-sm border-1 surface-border">
            <div class="flex align-items-center gap-3">
                <Button icon="pi pi-arrow-left" text rounded @click="volverAlDashboard" />
                <div>                    
                    <h2 class="m-0 text-xl font-bold text-900">Seguridad de {{ userName }}</h2>
                    <span class="text-sm text-500">Configuración detallada de accesos y permisos</span>
                </div>
            </div>
            
        </div>

        <Splitter class="flex-grow-1 border-none surface-ground" style="height: 100%;">
            
            <SplitterPanel :size="50" class="p-2">
                <div class="h-full surface-card border-round-md shadow-sm border-1 surface-border p-2">
                    <h5 class="m-0 p-2 text-primary font-bold"><i class="pi pi-th-large mr-2"></i>Módulos</h5>
                    <SecurityModulesTable class="h-full" :modules="modules" v-model:selected="selectedModule" @select="onModuleSelected" />
                </div>
            </SplitterPanel>

            <SplitterPanel :size="25" class="p-2">
                <div class="h-full surface-card border-round-md shadow-sm border-1 surface-border p-2">
                    <h5 class="m-0 p-2 text-primary font-bold"><i class="pi pi-folder mr-2"></i>Secciones</h5>
                    <SecuritySectionsTable class="h-full" :module="selectedModule" @select="onSectionSelected" />
                </div>
            </SplitterPanel>

            <SplitterPanel :size="25" class="p-2">
                <div class="h-full surface-card border-round-md shadow-sm border-1 surface-border p-2">
                    <h5 class="m-0 p-2 text-primary font-bold"><i class="pi pi-lock mr-2"></i>Permisos</h5>
                    <SecurityPermissionsTable class="h-full" :section="selectedSection" />
                </div>
            </SplitterPanel>

        </Splitter>
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
:deep(.p-splitter) {
    background: transparent !important;
}

:deep(.p-splitter-panel) {
    background: transparent !important;
}

/* Para que las tablas siempre ocupen el 100% de la columna */
.h-full {
    display: flex;
    flex-direction: column;
}
</style>