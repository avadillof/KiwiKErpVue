<template>

    <Dialog v-model:visible="visible" header="Usuarios autorizados" :modal="true" :closable="true" :draggable="false"
        :style="{ width: '900px', height: '1000px' }" class="kiwik-dialog" :dismissableMask="true">

        <Message severity="info" :closable="false" class="mb-3">
            Seleccione los usuarios autorizados para utilizar este certificado.
        </Message>

        <GenericDataTable ref="tableRef" dataKey="pkid" :endpoint="apiUrl" :showPaginator="true" :filterable="true"
            :showActions="false" @data-loaded="handleDataLoaded">

            <Column field="code" header="Usuario" sortable sortField="userDsCode" />

            <Column field="name" header="Nombre" sortable sortField="userDsName" />

            <Column field="email" header="Email" sortable sortField="userDsEmail" />

            <Column header="Autorizado" style="width: 120px; text-align:center">

                <template #body="slotProps">

                    <Checkbox v-model="slotProps.data.assigned" binary />

                </template>

            </Column>

        </GenericDataTable>

        <template #footer>

            <Button label="Cancelar" icon="pi pi-times" text @click="close" />

            <Button label="Guardar" icon="pi pi-save" @click="save" />

        </template>

    </Dialog>

</template>

