<template>
    <div class="w-full kiwi-lookup-pro">

        <!-- INPUT PRINCIPAL -->
        <InputGroup>

            <template v-if="mode === 'dialog'">

                <InputText
                    :modelValue="displayText"
                    :placeholder="placeholder"
                    readonly
                    class="w-full"
                    @click="openDialog"
                />

                <Button icon="pi pi-search" severity="secondary" @click="openDialog" />

                <Button
                    v-if="hasValue"
                    icon="pi pi-times"
                    severity="danger"
                    text
                    @click="clearSelection"
                />

            </template>

            <template v-else>

                <AutoComplete
                    v-model="internalText"
                    :suggestions="filteredItems"
                    @complete="onSearch"
                    :field="displayField"
                    forceSelection
                    class="w-full"
                    @item-select="onSelectAutocomplete"
                />

            </template>

        </InputGroup>

        <!-- SECONDARY TEXT -->
        <small v-if="secondaryText" class="text-500 block mt-1 pl-1">
            {{ secondaryText }}
        </small>

        <!-- DIALOG -->
        <Dialog
            v-model:visible="visible"
            modal
            :style="{ width: width, height: '85vh' }"
            class="kiwik-dialog"
            :dismissableMask="true"
        >

            <template #header>
                <div class="flex align-items-center gap-2 w-full">
                    <i class="pi pi-search text-primary"></i>
                    <div>
                        <div class="font-bold text-lg">{{ title }}</div>
                        <small class="text-500">Selecciona un registro</small>
                    </div>
                </div>
            </template>

            <div class="mb-3">
                <InputText v-model="globalFilter" placeholder="Buscar..." class="w-full" />
            </div>

            <DataTable
                :value="filteredItems"
                paginator
                :rows="rows"
                selectionMode="single"
                :dataKey="dataKey"
                @row-dblclick="selectRow"
            >
                <Column
                    v-for="col in columns"
                    :key="col.field"
                    :field="col.field"
                    :header="col.header"
                    sortable
                >
                    <template #body="{ data }">
                        {{ resolveField(data, col.field) }}
                    </template>
                </Column>
            </DataTable>

            <template #footer>
                <div class="flex justify-content-between w-full">
                    <small class="text-500">{{ filteredItems.length }} registros</small>
                    <Button label="Cerrar" icon="pi pi-times" @click="visible = false" />
                </div>
            </template>

        </Dialog>

    </div>
</template>