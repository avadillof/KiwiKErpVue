<template>
    <div class="kiwik-permissions-card card p-0 border-round-lg shadow-sm border-1 surface-border flex flex-column overflow-hidden">

        <!-- HEADER -->
        <div class="kiwik-permissions-header p-3 border-bottom-1 surface-border">
            <span class="text-sm font-bold text-700 uppercase tracking-wider">
                {{ props.module?.desc || 'Seleccione una Sección' }}
            </span>
        </div>

        <!-- TABLE -->
        <DataTable
            :value="permissions"
            scrollable
            scrollHeight="flex"
            class="p-datatable-sm custom-header-table kiwik-permissions-table"
        >
            <Column field="desc" header="Permiso / Acción" />

            <Column header="Estado" class="w-4">
                <template #body="slotProps">
                    <div class="flex align-items-center justify-content-between gap-3">

                        <ToggleSwitch v-model="slotProps.data.active" />

                        <span
                            class="text-xs font-bold px-2 py-1 border-round-md transition-colors"
                            :class="slotProps.data.active
                                ? 'kiwik-badge-active'
                                : 'kiwik-badge-disabled'"
                        >
                            {{ slotProps.data.active ? 'HABILITADO' : 'BLOQUEADO' }}
                        </span>

                    </div>
                </template>
            </Column>

        </DataTable>
    </div>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue'



const props = defineProps<{
    section: Object,
    module?: any
}>()


const permissions = ref<any[]>([])

watch(() => props.section, (s) => {

    if (!s) {
        permissions.value = []
        return
    }

    permissions.value = [
        { desc: 'Actualizar datos', active: true },
        { desc: 'Ver nota', active: true },
        { desc: 'Imprimir', active: false },
        { desc: 'Enviar correo', active: true },
    ]

})

</script>