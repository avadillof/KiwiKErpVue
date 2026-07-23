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
                    <Button v-if="securityStore.hasPermission('ENTI_GEN_0001')" label="Nuevo Cliente" icon="pi pi-plus" size="small" variant="text" outlined
                        @click="clientFormRef.open(null)" />
                </template>
            </Toolbar>

            <GenericDataTable 
                style="min-height: 400px;" 
                ref="tableRef" 
                dataKey="pkid" 
                selectionMode="single" 
                v-model:selection="clientSelected"
                :endpoint="apiUrl"
                :showPaginator="true" 
                :filterable="true"                                 
                @row-select="handleRowSelect" 
                @search="handledAfterSearch"
                :showActions="true">
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
                            <Button :severity="isProveFilterValue !== null ? 'danger' : 'secondary'"
                                icon="pi pi-filter" rounded size="small" @click.stop="openProveFilter($event)" />
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

            <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" />
        </div>

        <Frm_ClientForm ref="clientFormRef" @saved="refreshTable" />
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

<script setup lang="ts">

import { ref, watch, reactive, nextTick ,computed} from 'vue';
import { useRouter } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from '../../../stores/companyStore';
import { HelperDates } from '../../../libs/HelperDates.ts';
import Frm_ClientForm from './Frm_ClientForm.vue';
import { useSecurityStore } from '../../../stores/securityStore.ts';

const securityStore = useSecurityStore();
const clientFormRef = ref();
const router = useRouter();
const tableRef = ref();
const menuTable = ref();
const menuOptionRegistro = ref();
const clientSelected = ref<any>(null);
const apiUrl = ref('WebGetClients');
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();

const fechaFilterdateUp = ref<[Date | null, Date | null] | null>(null);
const isClientFilterValue = ref<boolean | null>(null);
const isProveFilterValue = ref<boolean | null>(null);

const FrmFilterDateUp = ref();
const FrmFilterIsClient = ref();
const FrmFilterIsProve = ref();

const menuItems = computed(() => {

    const items: any[] = [];

    
    items.push({
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => clientFormRef.value.open(clientSelected.value?.pkid)
    });
    


    if (securityStore.hasPermission('ENTI_GEN_0001')) {
        if (items.length > 0) {
            items.push({
                separator: true
            });
        }

        items.push({
            label: 'Borrar',
            icon: 'pi pi-trash',
            style: 'color: var(--red-500)',
            command: () => deleteClient()
        });
    };


    if (securityStore.hasPermission('ENTI_GEN_0001')) {
        if (items.length > 0) {
            items.push({
                separator: true
            });
        }

        items.push({
            label: 'Notas',
            icon: 'pi pi-trash',
            style: 'color: var(--red-500)',
            command: () => openNotes()
        });
    }



    return items;
});






const menuItemsTable = ref([
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value.exportToExcel() }
]);



const openMenu = (event: Event, client: any) => {
    clientSelected.value = client;
    menuOptionRegistro.value.toggle(event);
};

const openMenuTable = (event: Event) => menuTable.value.toggle(event);
const refreshTable = () => tableRef.value?.refresh();
const handleRowSelect = (event: any) => { clientSelected.value = event.data; };

const handledAfterSearch = (event: any) => {
    fechaFilterdateUp.value = null;
    isClientFilterValue.value = null;
    isProveFilterValue.value = null;
};

const deleteClient = () => {
  if (!clientSelected.value) return;

  confirm.require({
    message: `¿Estás seguro de que quieres borrar la entidad usuario ${clientSelected.value.name}? Esta acción no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancelar',
      severity: 'secondary'
    },
    acceptProps: {
      label: 'Borrar',
      severity: 'danger'
    },
    accept: async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/WebDeleteEntitie`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pkid: clientSelected.value!.pkid
            })
          }
        );

        if (!response.ok) {
          throw new Error('Error al eliminar el usuario');
        }

        toast.add({
          severity: 'success',
          summary: 'Borrado',
          detail: 'Entidad eliminada correctamente',
          life: companyStore.companyInfo.toastDuration ?? 3000
        });

        refreshTable();
      } catch (error) {
        console.error(error);

        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la  entidad',
          life: companyStore.companyInfo.toastDuration ?? 3000
        });
      }
    }
  });
};



const deleteClient = () => {
  if (!clientSelected.value) return;

  confirm.require({
    message: `¿Estás seguro de que quieres borrar la entidad usuario ${clientSelected.value.name}? Esta acción no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancelar',
      severity: 'secondary'
    },
    acceptProps: {
      label: 'Borrar',
      severity: 'danger'
    },
    accept: async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/WebDeleteEntitie`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pkid: clientSelected.value!.pkid
            })
          }
        );

        if (!response.ok) {
          throw new Error('Error al eliminar el usuario');
        }

        toast.add({
          severity: 'success',
          summary: 'Borrado',
          detail: 'Entidad eliminada correctamente',
          life: companyStore.companyInfo.toastDuration ?? 3000
        });

        refreshTable();
      } catch (error) {
        console.error(error);

        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la  entidad',
          life: companyStore.companyInfo.toastDuration ?? 3000
        });
      }
    }
  });
};




watch([fechaFilterdateUp, isClientFilterValue,isProveFilterValue], () => {
    applyAllFilters();
});

const openDateFilterDateUp = (event: any) => {
    FrmFilterDateUp.value?.toggle(event);
};


const openClientFilter = (event: any) => {
    FrmFilterIsClient.value?.toggle(event);
};

const openProveFilter = (event: any) => {
    FrmFilterIsProve.value?.toggle(event);
};


const applyAllFilters = () => {
    const queryParts: string[] = [];

    // Construir filtro de Fecha
    if (fechaFilterdateUp.value?.[0] && fechaFilterdateUp.value?.[1]) {
        
        const [inicio, fin] = fechaFilterdateUp.value;
        queryParts.push(`[dateUp],[${inicio.toISOString()}],[${fin.toISOString()}]`);
    }

    // Construir filtro de Booleano
    if (isClientFilterValue.value !== null) {
        queryParts.push(`[entitieBolClient],${isClientFilterValue.value}`);
    }

    if (isProveFilterValue.value !== null) {
        queryParts.push(`[entitieBolProve],${isProveFilterValue.value}`);
    }


    // Unir todo con un separador (ej: ";")
    const finalQuery = queryParts.join(';');
    
    // Llamar al refresh de la tabla enviando la query compuesta
    tableRef.value.refreshWithQuery(finalQuery);
};



</script>