<template>
    <div class="w-full kiwi-lookup-pro">

        <!-- INPUT -->
        <InputGroup>
            <InputText
                :modelValue="displayText"
                :placeholder="placeholder"
                readonly
                class="w-full"
                @click="openDialog"
            />

            <Button icon="pi pi-search" severity="secondary" @click="openDialog" />
            <Button icon="pi pi-times" severity="danger" text @click="clearSelection" />
        </InputGroup>

        <slot name="secondary" :item="selectedItem">
            <small v-if="secondaryText" class="text-500 block mt-1 pl-1 ml-3">
                {{ secondaryText }}
            </small>
        </slot>

        <!-- DIALOG -->
        <Dialog
            v-model:visible="visible"
            modal
            :style="{ width: width, height: '85vh' }"
            class="kiwik-dialog"
        >
            <template #header>
                <div class="w-full flex align-items-center justify-content-between gap-3">
                    <div class="flex align-items-center gap-2 w-full">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                             style="width: 36px; height: 36px;">
                            <i class="pi pi-search text-primary"></i>
                        </div>

                        <div class="flex flex-column flex-1">
                            <span class="font-bold text-lg">{{ title }}</span>
                            <small class="text-500">Selecciona un registro de la lista</small>
                        </div>
                    </div>
                </div>
            </template>

            <div class="kiwi-lookup-body">

                <!-- SEARCH -->
                <div class="lookup-search">
                    <InputGroup>
                        <InputText
                            v-model="search"
                            :placeholder="placeholder"
                            class="w-full"
                        />
                    </InputGroup>
                </div>

                <!-- TABLE -->
                <div class="lookup-table">
                    <DataTable
                        :value="filteredItems"
                        paginator
                        :rows="rows"
                        selectionMode="single"
                        v-model:selection="selectedRow"
                        :dataKey="dataKey"
                        @row-dblclick="selectRow"
                        scrollable
                        scrollHeight="flex"
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
                </div>
            </div>

            <template #footer>
                <div class="flex justify-content-between align-items-center w-full">
                    <small class="text-500">{{ filteredItems.length }} registros</small>

                    <Button label="Cerrar" icon="pi pi-check" @click="visible = false" />
                </div>
            </template>

        </Dialog>
    </div>
</template>