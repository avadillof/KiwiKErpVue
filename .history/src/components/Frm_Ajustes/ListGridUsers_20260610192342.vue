<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <Toolbar class="mb-3">
      <template #start>
        <Button label="Nuevo Usuario" icon="pi pi-plus" size="small" variant="text" outlined @click="emitEdit(null)" />
      </template>
      <template #end>

      </template>
    </Toolbar>






    <GenericDataTable style="min-height: 400px;" ref="tableRef" :endpoint="apiUrl" :showPaginator="true"
      :filterable="true" selectionMode="single" v-model:selection="miSeleccion" @row-select="handleRowSelect"
      @data-loaded="handleDataLoaded" :showActions="true">

      <template #headerActions>
        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
        <Menu ref="menuTable" :model="menuItemsTable" popup />
      </template>

      <template #panelOptions>
        <DateRangePicker v-model="fechaFiltro" placeholder="Rango de fecha" style="width: 250px;" />
      </template>


      <Column field="userDsCode" header="Código" sortable style="width: 15%"></Column>


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


      <Column field="lastConexion" header="Última Conexión" sortable style="width: 15%">
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
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { HelperDates } from '../../libs/HelperDates';
import { HelperString } from '../../libs/HelperString';
import HistoricDialog from './Dg_HitoricUserConnections.vue';
import type { MenuItem } from 'primevue/menuitem';
import DateRangePicker from '../shared/DateRangePicker.vue';
import {  watch } from 'vue';


const fechaFiltro = ref<[Date | null, Date | null] | null>(null);
const historicDialogRef = ref();
const emit = defineEmits(['edit']);

const menuTable = ref();
const menuOptionRegistro = ref();

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
      historicDialogRef.value.open(selectedUser.value.userKyId, selectedUser.value.userDsName);
    }
  },
  { separator: true },
  { label: 'Borrar', icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => console.log('Borrar', selectedUser.value) }
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
  selectedUser.value = user;
  menuOptionRegistro.value.toggle(event);
};




const openMenuTable = (event: Event) => {
  menuTable.value.toggle(event);
};


function emitEdit(user: any) { emit('edit', user); }
function onRowSelect(event: any) { console.log("Seleccionado:", event.data); }




const handleRowSelect = (event: any) => {
  console.log("Registro seleccionado:", event.data);
  // Aquí puedes realizar cualquier lógica adicional con el registro seleccionado
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

    console.info(fechaFiltro[0].)
    tableRef.value.refreshFilter(fechaFiltro.value);
  }
};



const exportToExcel = () => {
  if (tableRef.value) {
    tableRef.value.exportToExcel();
  }
};








watch(fechaFiltro, (nuevoValor) => {
  console.log('Fechas seleccionadas:', nuevoValor);

  if (nuevoValor?.[0] && nuevoValor?.[1]) {
    console.info(nuevoValor?.[0] && nuevoValor?.[1]);
    refreshTable();
  }
});



</script>