<template>
    <div class="card p-0 border-round-lg shadow-sm border-1 surface-border h-full flex flex-column overflow-hidden">

        <!-- HEADER -->
        <div class="p-3 border-bottom-1 surface-border bg-surface-50">
            <span class="text-sm font-bold text-700 uppercase tracking-wider">
                {{ moduleTitle }}
            </span>
        </div>

        <!-- TABLE -->
        <DataTable
            :value="permissions"
            scrollable
            scrollHeight="flex"
            class="p-datatable-sm custom-header-table kiwi-permissions-table"
        >

            <!-- PERMISO -->
            <Column field="desc" header="Permiso / Acción" />

            <!-- ESTADO -->
            <Column header="Estado" class="w-4">
                <template #body="{ data }">
                    <div class="flex align-items-center justify-content-between gap-3">

                        <ToggleSwitch v-model="data.active" />

                        <span
                            class="text-xs font-bold px-2 py-1 border-round-md transition-colors"
                            :class="data.active ? 'perm-active' : 'perm-disabled'"
                        >
                            {{ data.active ? 'HABILITADO' : 'BLOQUEADO' }}
                        </span>

                    </div>
                </template>
            </Column>

        </DataTable>

    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
    section: any,
    module?: any
}>()

const permissions = ref<any[]>([])

/**
 * Título computado para evitar lógica en template
 */
const moduleTitle = computed(() =>
    props.module?.desc || 'Seleccione una Sección'
)

/**
 * Carga de permisos (mock o backend-ready)
 */
const loadPermissions = (section: any) => {
    if (!section) {
        permissions.value = []
        return
    }

    permissions.value = [
        { desc: 'Actualizar datos', active: true },
        { desc: 'Ver nota', active: true },
        { desc: 'Imprimir', active: false },
        { desc: 'Enviar correo', active: true },
    ]
}

/**
 * Watch reactivo limpio
 */
watch(
    () => props.section,
    (s) => loadPermissions(s),
    { immediate: true }
)
</script>

/* ==========================================================
   TABLE HEADER PREMIUM KIWIK
========================================================== */

.custom-header-table .p-datatable-thead > tr > th {
    background: linear-gradient(
        to bottom,
        #d9f46d 0%,
        #c8ea4a 55%,
        #bddf39 100%
    ) !important;

    color: #5e7f05 !important;
    font-weight: 700;
    font-size: .78rem;
    letter-spacing: .04em;
    text-transform: uppercase;

    border-bottom: 2px solid #9dbc28;
    border-right: 1px solid rgba(255,255,255,.35);

    box-shadow:
        inset 0 1px 0 rgba(255,255,255,.75),
        inset 0 -1px 0 rgba(0,0,0,.08);
}

/* hover simple y barato */
.custom-header-table .p-datatable-thead > tr > th:hover {
    background: #e6f58a !important;
}

/* ==========================================================
   FILAS
========================================================== */

.custom-header-table .p-datatable-tbody > tr {
    cursor: pointer;
}

/* hover solo si no está seleccionado */
.custom-header-table .p-datatable-tbody > tr:not(.p-highlight):hover {
    background: var(--surface-100) !important;
}

/* selección estable */
.custom-header-table .p-datatable-tbody > tr.p-highlight {
    background: #eef6c2 !important;
}

/* selección siempre gana */
.custom-header-table .p-datatable-tbody > tr.p-highlight:hover {
    background: #eef6c2 !important;
}

/* ==========================================================
   BADGES ESTADO
========================================================== */

.perm-active {
    background: #dff7c2;
    color: #4f7a0c;
    border: 1px solid #b7e06a;
}

.perm-disabled {
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #e5e7eb;
}

/* ==========================================================
   CARD
========================================================== */

.card {
    border-radius: 6px;
    overflow: hidden;
}