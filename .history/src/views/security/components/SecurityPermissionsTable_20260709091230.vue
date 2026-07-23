<template>
    <div class="security-card">

        <!-- CABECERA -->
        <div class="section-header">

            <div class="text-xs text-500 uppercase font-semibold">
                Permisos para la sección seleccionada
            </div>

            <div class="text-lg font-bold text-900">
                {{ props.section?.description || 'Seleccione una sección' }}
            </div>

        </div>

        <!-- MÓDULO BLOQUEADO -->
        <div v-if="props.disabled"
            class="flex flex-column justify-content-center align-items-center flex-1 text-center p-5">

            <i class="pi pi-lock text-6xl mb-4" style="color:#bdbdbd"></i>

            <div class="text-xl font-bold text-700">
                Módulo bloqueado
            </div>

            <div class="text-500 mt-2" style="max-width:320px">
                Active el acceso al módulo para poder configurar las
                secciones y los permisos disponibles.
            </div>

        </div>

        <!-- SIN SECCIÓN -->
        <div v-else-if="!props.section"
            class="flex flex-column justify-content-center align-items-center flex-1 text-center p-5">

            <i class="pi pi-hand-pointer text-6xl mb-4 text-primary"></i>

            <div class="text-xl font-bold text-700">
                Seleccione una sección
            </div>

            <div class="text-500 mt-2">
                Elija primero una sección para visualizar sus permisos.
            </div>

        </div>

        <!-- TABLA -->
        <DataTable v-else :value="permissions" scrollable scrollHeight="flex"
            class="p-datatable-sm custom-header-table kiwi-permissions-table">



            
            <Column field="description" header="Permiso / Acción" />

            <Column header="Estado" style="width:220px">

                <template #body="{ data }">

                    <div class="flex align-items-center justify-content-between gap-3">

                        <ToggleSwitch v-model="data.active" />

                        <span class="text-xs font-bold px-2 py-1 border-round-md"
                            :class="data.active ? 'perm-active' : 'perm-disabled'">
                            {{ data.active ? 'HABILITADO' : 'BLOQUEADO' }}
                        </span>

                    </div>

                </template>

            </Column>

        </DataTable>

    </div>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue'
import { getSecurityAttributesUser } from '@/services/Frm_Security/SecurityService'

const props = defineProps<{

    section: any
    disabled?: boolean
    userPk: number

}>()

const permissions = ref<any[]>([])

const loadPermissions = async (section: any) => {

    if (!section) {

        permissions.value = []

        return

    }

    try {

        permissions.value =
            await getSecurityAttributesUser(

                props.userPk,

                section.categoryPk

            )

    }
    catch (e) {

        console.error(e)

        permissions.value = []

    }

}

watch(

    () => props.section,

    (section) => {

        loadPermissions(section)

    },

    {

        immediate: true

    }

)

</script>

<style scoped>
.security-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface-card);
}

.section-header {
    padding: 1rem;
    border-bottom: 1px solid var(--surface-border);
    background: var(--surface-50);
    flex-shrink: 0;
}

.perm-active {
    background: #e9f8dc;
    color: #4d7c0f;
}

.perm-disabled {
    background: #fdeaea;
    color: #b42318;
}

:deep(.kiwi-permissions-table) {
    flex: 1;
}

:deep(.kiwi-permissions-table .p-datatable-wrapper) {
    height: 100%;
}
</style>