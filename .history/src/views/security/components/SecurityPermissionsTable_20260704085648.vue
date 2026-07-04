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