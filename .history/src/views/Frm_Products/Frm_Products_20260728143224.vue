<template>
    <div style="background-color: #f9fafb; min-height: 100vh; padding: 20px; margin-bottom: 100px;">

        <div
            style="background: white; padding: 15px 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="flex align-items-center gap-3">

                    <div class="flex flex-column">
                        <h5 class="text-primary mt-0 mb-0 flex align-items-center gap-2"
                            style="font-weight: 700; font-size: 1.25rem;">
                            <i class="pi pi-users"></i> Clientes
                        </h5>
                        <span class="text-600 font-medium" style="font-size: 0.85rem;">
                            <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
                                Gestión de directorio de la cartera de Clientes.
                            </Message>
                        </span>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
                <Button label="Volver" icon="pi pi-arrow-left" severity="secondary" text
                    @click="router.push({ name: 'Ventas' })" />

                <div style="width: 1px; height: 20px; background-color: #e5e7eb; margin: 0 5px;"></div>

                <Button label="Inicio" icon="pi pi-home" severity="info" outlined
                    @click="router.push({ name: 'Dashboard' })" />
            </div>
        </div>

        <div class="card"
            style="height: 650px; display: flex; flex-direction: column; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <Toolbar class="mb-3">
                <template #start>
                    <Button v-if="securityStore.hasPermission('ENTI_GEN_0001')" label="Nuevo Cliente" icon="pi pi-plus"
                        size="small" variant="text" outlined @click="clientFormRef.open(null)" />
                </template>
            </Toolbar>

            <GenericDataTable style="min-height: 400px;" ref="tableRef" dataKey="pkid" selectionMode="single"
                v-model:selection="clientSelected" :endpoint="apiUrl" :showPaginator="true" :filterable="true"
                @row-select="handleRowSelect" @search="handledAfterSearch" :showActions="true">
                <template #headerActions>
                    <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
                    <Menu ref="menuTable" :model="menuItemsTable" popup />
                </template>

                <Column field="code" header="Código" sortable style="width: 15%"></Column>
                <Column field="name" header="Nombre / Razón Social" sortable style="width: 35%"></Column>
                <Column field="cif" header="NIF/CIF" sortable style="width: 15%"></Column>

                <Column field="dateUp" sortable style="width: 15%">
                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>Fecha de Alta</b></span>
                            <Button :severity="fechaFilterdateUp ? 'danger' : 'secondary'" icon="pi pi-filter" rounded
                                size="small" @click.stop="openDateFilterDateUp($event)" />
                        </div>
                    </template>
                    <template #body="slotProps">
                        {{ HelperDates.formatDateNoTimeFromLocale((slotProps.data?.dateUp)) }}
                    </template>
                </Column>


                <Column field="active" header="Estado" style="width: 10%">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
                            :severity="slotProps.data.active ? 'success' : 'danger'" rounded />
                    </template>
                </Column>


                <Column field="isclient" style="width: 8%">
                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>¿Cliente?</b></span>
                            <Button :severity="isClientFilterValue !== null ? 'danger' : 'secondary'"
                                icon="pi pi-filter" rounded size="small" @click.stop="openClientFilter($event)" />
                        </div>
                    </template>
                    <template #body="slotProps">
                        <div class="flex justify-content-center">
                            <Checkbox :modelValue="slotProps.data.isclient" binary disabled />
                        </div>
                    </template>
                </Column>


                <Column field="isprove" style="width: 8%">
                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>¿Proveedor?</b></span>
                            <Button :severity="isProveFilterValue !== null ? 'danger' : 'secondary'" icon="pi pi-filter"
                                rounded size="small" @click.stop="openProveFilter($event)" />
                        </div>
                    </template>
                    <template #body="slotProps">
                        <div class="flex justify-content-center">
                            <Checkbox :modelValue="slotProps.data.isprove" binary disabled />
                        </div>
                    </template>
                </Column>



                <Column header="Acciones" style="width: 5%">
                    <template #body="slotProps">
                        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />
                    </template>
                </Column>

            </GenericDataTable>

            <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0"/>
        </div>

        <Frm_ClientForm ref="clientFormRef" @saved="refreshTable" />
        <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="refreshTable" />
        <ConfirmDialog />

        <OverlayPanel ref="FrmFilterDateUp" appendTo="body">
            <DateRangePicker v-model="fechaFilterdateUp" />
        </OverlayPanel>


        <OverlayPanel ref="FrmFilterIsClient" appendTo="body" style="width: 200px;">
            <div class="flex flex-column gap-1">
                <div class="px-3 pt-2 pb-2 font-bold text-700 border-bottom-1 surface-border">
                    <Message severity="success" icon="pi pi-filter" variant="simple">Filtrar Por Cliente.</Message>
                </div>

                <Button label="Todos" icon="pi pi-list" text size="small" :outlined="isClientFilterValue === null"
                    class="justify-content-start w-full px-3"
                    @click="isClientFilterValue = null; FrmFilterIsClient.hide()" />

                <Button label="Clientes" icon="pi pi-check-circle" text size="small"
                    :outlined="isClientFilterValue === true" class="justify-content-start w-full px-3"
                    @click="isClientFilterValue = true; FrmFilterIsClient.hide()" />

                <Button label="No Clientes" icon="pi pi-times-circle" text size="small"
                    :outlined="isClientFilterValue === false" class="justify-content-start w-full px-3"
                    @click="isClientFilterValue = false; FrmFilterIsClient.hide()" />
            </div>
        </OverlayPanel>




        <OverlayPanel ref="FrmFilterIsProve" appendTo="body" style="width: 200px;">
            <div class="flex flex-column gap-1">
                <div class="px-3 pt-2 pb-2 font-bold text-700 border-bottom-1 surface-border">
                    <Message severity="success" icon="pi pi-filter" variant="simple">Filtrar Por Proveedor.</Message>
                </div>
                <Button label="Todos" icon="pi pi-list" text size="small" :outlined="isProveFilterValue === null"
                    class="justify-content-start w-full px-3"
                    @click="isProveFilterValue = null; FrmFilterIsProve.hide()" />

                <Button label="Proveedores" icon="pi pi-check-circle" text size="small"
                    :outlined="isProveFilterValue === true" class="justify-content-start w-full px-3"
                    @click="isProveFilterValue = true; FrmFilterIsProve.hide()" />

                <Button label="No Proveedores" icon="pi pi-times-circle" text size="small"
                    :outlined="isProveFilterValue === false" class="justify-content-start w-full px-3"
                    @click="isProveFilterValue = false; FrmFilterIsProve.hide()" />
            </div>
        </OverlayPanel>

    </div>


    
</template>

















<template>

 <div style="background-color: #f9fafb; min-height: 100vh; padding: 20px; margin-bottom: 100px;">

    <div class="flex justify-content-between align-items-center mb-3">

        <h2>
            Productos
        </h2>


        <Button
            icon="pi pi-plus"
            label="Nuevo"
            @click="newProduct"
        />

    </div>



    <GenericDataTable
        :key="tableKey"
        endpoint="WebGetProducts"
        :columns="columns"
        :showPaginator="true"
        :filterable="true"
        :showActions="true"

        @edit="editProduct"
        @delete="deleteProduct"

    >


        <template #active="{data}">

            <Tag
                :severity="data.active ? 'success':'danger'"
                :value="data.active ? 'ACTIVO':'INACTIVO'"
            />

        </template>



        <template #salePrice="{data}">

            {{ 
                data.salePrice?.toLocaleString(
                    'es-ES',
                    {
                        minimumFractionDigits:2
                    }
                )
            }}

        </template>



        <template #purchasePrice="{data}">

            {{
                data.purchasePrice?.toLocaleString(
                    'es-ES',
                    {
                        minimumFractionDigits:2
                    }
                )
            }}

        </template>


    </GenericDataTable>


</div>

</template>


<script setup>

import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

import GenericDataTable from '@/components/shared/GenericDataTable.vue';


const toast = useToast();


const tableKey = ref(0);


const products = ref([]);



const columns = [
    {
        field: 'code',
        header: 'Código',
        sortable: true
    },
    {
        field: 'description',
        header: 'Descripción',
        sortable: true
    },
    {
        field: 'category',
        header: 'Categoría',
        sortable: true
    },
    {
        field: 'family',
        header: 'Familia',
        sortable: true
    },
    {
        field: 'uom',
        header: 'U.M.',
        sortable: true
    },
    {
        field: 'salePrice',
        header: 'Precio Venta',
        sortable: true
    },
    {
        field: 'purchasePrice',
        header: 'Precio Compra',
        sortable: true
    },
    {
        field: 'active',
        header: 'Activo',
        sortable: true
    }
];



function newProduct(){

    toast.add({
        severity:'info',
        summary:'Nuevo producto',
        detail:'Pendiente de implementar',
        life:3000
    });

}



function editProduct(product){

    toast.add({
        severity:'info',
        summary:'Editar producto',
        detail:`Producto ${product.code}`,
        life:3000
    });

}



function deleteProduct(product){

    toast.add({
        severity:'warn',
        summary:'Eliminar producto',
        detail:`Producto ${product.code}`,
        life:3000
    });

}



</script>


