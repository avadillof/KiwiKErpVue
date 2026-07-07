<template>

    <div class="security-card">

        <!-- CABECERA -->
        <div class="section-header">

            <div class="text-xs text-500 uppercase font-semibold">
                Secciones del módulo
            </div>

            <div class="text-lg font-bold text-900">
                {{ props.module?.description || 'Seleccione un módulo' }}
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
                Active el acceso al módulo para poder configurar
                sus secciones.
            </div>

        </div>

        <!-- SIN MÓDULO -->
        <div v-else-if="!props.module"
            class="flex flex-column justify-content-center align-items-center flex-1 text-center p-5">

            <i class="pi pi-folder-open text-6xl mb-4 text-primary"></i>

            <div class="text-xl font-bold text-700">
                Seleccione un módulo
            </div>

            <div class="text-500 mt-2">
                Elija un módulo para visualizar sus secciones.
            </div>

        </div>

        <!-- TABLA -->
        <DataTable v-else :value="sections" v-model:selection="selected" selectionMode="single" @rowSelect="onSelect"
            scrollable scrollHeight="flex" class="custom-header-table flex-1">

            <Column header="Secciones disponibles">

                <template #body="{ data }">

                    <div class="section-row">

                        <div class="section-circle">

                            <i :class="data.icon"></i>

                        </div>

                        <div class="flex flex-column">

                            <span class="font-semibold text-900">
                                {{ data.name }}
                            </span>

                            <small class="text-500">
                                Configuración de seguridad
                            </small>

                        </div>

                    </div>

                </template>

            </Column>

        </DataTable>

    </div>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
    module: Object,
    disabled: Boolean
})

const emit = defineEmits(['select'])

const selected = ref()
const sections = ref<any[]>([])

watch(
    () => props.module,
    async (m) => {

        selected.value = null

        if (!m) {
            sections.value = []
            return
        }

        const user = JSON.parse(sessionStorage.getItem("temp_user")!)

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebGetSecurityCategoriesUser`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userPk: user.pkid,
                    securityPk: m.securityPk
                })
            }
        )

        sections.value = await response.json()

    },
    {
        immediate: true
    }
)

const onSelect = (e: any) => {
    emit('select', e.data)
}
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

.section-row {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.section-circle {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--primary-50);
    color: var(--primary-color);

    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;
}

:deep(.p-datatable-wrapper) {
    height: 100%;
}
</style>