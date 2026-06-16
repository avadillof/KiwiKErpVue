<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <Toolbar class="mb-3">
      <template #start>
        <Button label="Nuevo Usuario" icon="pi pi-plus" size="small" variant="text" outlined @click="emitEdit(null)" />
      </template>
      <template #end>

      </template>
    </Toolbar>






    <GenericDataTable style="min-height: 400px;" ref="tableRef" dataKey="userKyId" :endpoint="apiUrl"
      :showPaginator="true" :filterable="true" selectionMode="single" v-model:selection="userSelected"
      @row-select="handleRowSelect" @data-loaded="handleDataLoaded" :showActions="true">

      <template #headerActions>
        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
        <Menu ref="menuTable" :model="menuItemsTable" popup />
      </template>



      <Column field="userDsCode" header="Código" sortable style="width: 15%">

      </Column>


      <Column header="Usuario" field="name" sortable style="width: 25%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <Avatar :label="HelperString.getInitialsFromString(slotProps.data.name)"
              style="background-color:#dee9fc; color: #1a2544" shape="circle" />
            <span class="font-bold">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>


      <Column field="groupName" header="Rol" sortable style="width: 20%">
        <template #body="slotProps">
          <Tag :severity="getRoleDetails(slotProps.data.groupName).severity" rounded>
            <div class="flex align-items-center gap-2">
              <i :class="getRoleDetails(slotProps.data.groupName).icon"></i>
              {{ getRoleDetails(slotProps.data.groupName).label }}
            </div>
          </Tag>
        </template>
      </Column>



      <Column field="active" header="Estado" style="width: 15%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
            :severity="slotProps.data.active ? 'success' : 'danger'" rounded />
        </template>
      </Column>


      <Column field="lastConexion" header="Última Conexión" style="width: 15%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-calendar text-primary"></i>
            {{ HelperDates.formatDateFromLocale(slotProps.data.lastConexion) }}
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

  <HistoricDialog ref="historicDialogRef" />

</template>


<script setup lang="ts">

import Menu from 'primevue/menu';
import Toolbar from 'primevue/toolbar';
import { ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { HelperDates } from '../../libs/HelperDates';
import { HelperString } from '../../libs/HelperString';
import HistoricDialog from './Dg_HitoricUserConnections.vue';
import type { MenuItem } from 'primevue/menuitem';
import Frm_UserForm from '../../views/

const userSelected = ref<User | null>(null);
const historicDialogRef = ref();
const emit = defineEmits(['edit']);
const menuTable = ref();
const menuOptionRegistro = ref();
const apiUrl = ref('WebGetUsers');

const tableRef = ref<any>(null);


type User = {
  pkid: number;
  userDsCode: string;
  name: string;
  email?: string;
};



const menuItems = ref([
  { label: 'Editar', icon: 'pi pi-pencil', command: () => emit('edit', userSelected.value) },
  {
    label: 'Historial Conexiones',
    icon: 'pi pi-history',
    command: () => {
      
      if (!userSelected.value) {
        console.error("No hay usuario seleccionado");
        return;
      }

      historicDialogRef.value.open(
       userSelected.value.pkid,
       userSelected.value.name
      );
    }
  },
  { separator: true },
  { label: 'Borrar', icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => console.log('Borrar', userSelected.value) }
]);


const menuItemsTable = ref<MenuItem[]>([
  {
    label: 'Acciones',
    items: [
      {
        label: 'Refrescar datos',
        icon: 'pi pi-refresh',
        command: () => {
          try {
            refreshTable();
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
            exportToExcel();
          } catch (err) {
            console.error("Error al exportar:", err);
          }
        }
      }
    ]
  }
]);



const openMenu = (event: Event, user: any) => {
  userSelected.value = user;
  menuOptionRegistro.value.toggle(event);
};




const openMenuTable = (event: Event) => {
  menuTable.value.toggle(event);
};


function emitEdit(user: any) { emit('edit', user); }



const handleRowSelect = (event: any) => {
   userSelected.value = event.data;
};


const handleDataLoaded = (data: any[], total: number) => {


};


function getRoleDetails(roleName: string) {
  const name = roleName?.toLowerCase() || '';
  if (name.includes('administrador') || name.includes('administrator')) {
    return { severity: 'danger', icon: 'pi pi-shield', label: 'Administrador' };
  }
  if (name.includes('tpv')) {
    return { severity: 'warn', icon: 'pi pi-desktop', label: 'Usuario TPV' };
  }
  return { severity: 'info', icon: 'pi pi-user', label: 'Usuario' };
}



const refreshTable = () => {
  if (tableRef.value) {
    tableRef.value.refresh();
  }
};

const exportToExcel = () => {
  if (tableRef.value) {
    tableRef.value.exportToExcel();
  }
};



</script>