<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <Toolbar class="mb-3">
      <template #start>
        <Button label="Nuevo Usuario" icon="pi pi-plus" size="small" variant="text" outlined @click="emitEdit(null)" />
      </template>
      <template #end>
        <div class="flex gap-2">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Buscar..." size="small" />
          </IconField>
          <Button icon="pi pi-refresh" text @click="usersStore.loadAllUsers()" v-tooltip.top="'Actualizar'" />
        </div>
      </template>
    </Toolbar>


    



                         <GenericDataTable style="min-height: 400px;"
                            ref="tableRef" 
                            :endpoint="apiUrl" 
                            :showPaginator="true" 
                            :filterable="true"
                            selectionMode="single" 
                            v-model:selection="miSeleccion"
                            @row-select="handleRowSelect" 
                            @data-loaded="handleDataLoaded" :showActions="true">

                           <template #headerActions>
                                <Button icon="pi pi-ellipsis-v" text rounded @click="menu.value.toggle($event)" />
                                <Menu ref="menu" :model="opcionesMenu" popup />
                            </template>


                            <Column field="userDsCode" header="Código" sortable style="width: 15%"></Column>
                            
                        </GenericDataTable>


    




    

    <Menu ref="menu" :model="menuItems" :popup="true" />
  </div>

  <HistoricDialog ref="historicDialogRef" />

</template>


<script setup lang="ts">

import Menu from 'primevue/menu';
import Toolbar from 'primevue/toolbar';
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
//import { useUsersManagementStore } from '../../stores/usersManagementStore';
import { HelperDates } from '../../libs/HelperDates';
import { HelperString } from '../../libs/HelperString';
import HistoricDialog from './Dg_HitoricUserConnections.vue';
import type { MenuItem } from 'primevue/menuitem';


const historicDialogRef = ref();
const emit = defineEmits(['edit']);
//const usersStore = useUsersManagementStore();
const menu = ref();
const selectedUser = ref();

const apiUrl = ref('WebGetUsers');
const miSeleccion = ref(null);
const tableRef = ref<any>(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const menuItems = ref([
  { label: 'Editar', icon: 'pi pi-pencil', command: () => emit('edit', selectedUser.value) },
  {
    label: 'Historial Conexiones',
    icon: 'pi pi-history',
    command: () => {
        // Accedemos al componente hijo y ejecutamos su función open
        historicDialogRef.value.open(selectedUser.value.userKyId,selectedUser.value.userDsName);
    }
  },
  { separator: true },
  { label: 'Borrar', icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => console.log('Borrar', selectedUser.value) }
]);


//onMounted(() => usersStore.loadAllUsers());

const openMenu = (event: Event, user: any) => {
  selectedUser.value = user;
  menu.value.toggle(event);
};


function emitEdit(user: any) { emit('edit', user); }
function onRowSelect(event: any) { console.log("Seleccionado:", event.data); }




const handleRowSelect = (event: any) => {
        console.log("Registro seleccionado:", event.data);
        // Aquí puedes realizar cualquier lógica adicional con el registro seleccionado
};


const handleDataLoaded = (data: any[], total: number) => {


};



const opcionesMenu = ref<MenuItem[]>([
        {
            label: 'Acciones',
            items: [
                {
                    label: 'Refrescar datos',
                    icon: 'pi pi-refresh',
                    command: () => {
                        try {
                           // refreshTable();
                        } catch (err) {
                            console.error("Error al refrescar:", err);
                        }
                    }
                },
                {
                    label: 'Exportar a Excel',
                    icon: 'pi pi-file-excel',
                    command: () => {
                        try {
                            //exportToExcel();
                        } catch (err) {
                            console.error("Error al exportar:", err);
                        }
                    }
                }
            ]
        }
    ]);



</script>