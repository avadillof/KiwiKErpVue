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

    <DataTable v-model:selection="selectedUser" :value="usersStore.allUsers" :loading="usersStore.loading"
      :filters="filters" :globalFilterFields="['userDsCode', 'userDsName', 'userDsEmail', 'userGroup.descriptionEs']"
      selectionMode="single" dataKey="userKyId" scrollable scrollHeight="flex" stripedRows size="normal"
      tableStyle="min-width: 50rem" @row-select="onRowSelect">

      <Column field="userDsCode" header="Código" sortable style="width: 15%"></Column>

      <Column header="Usuario" field="userDsName" sortable style="width: 25%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <Avatar :label="HelperString.getInitialsFromString(slotProps.data.userDsName)"
              style="background-color:#dee9fc; color: #1a2544" shape="circle" />
            <span class="font-bold">{{ slotProps.data.userDsName }}</span>
          </div>
        </template>
      </Column>

      <Column field="userGroup.descriptionEs" header="Rol" sortable style="width: 20%">
        <template #body="slotProps">
          <Tag :severity="usersStore.getRoleDetails(slotProps.data.userGroup?.descriptionEs).severity" rounded>
            <div class="flex align-items-center gap-2">
              <i :class="usersStore.getRoleDetails(slotProps.data.userGroup?.descriptionEs).icon"></i>
              {{ usersStore.getRoleDetails(slotProps.data.userGroup?.descriptionEs).label }}
            </div>
          </Tag>
        </template>
      </Column>

      <Column field="userBolEnabled" header="Estado" style="width: 15%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.userBolEnabled ? 'ACTIVO' : 'INACTIVO'"
            :severity="slotProps.data.userBolEnabled ? 'success' : 'danger'" rounded />
        </template>
      </Column>

      <Column field="userDtLastAccess" header="Última Conexión" sortable style="width: 15%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-calendar text-primary"></i>
            {{ HelperDates.formatDateFromLocale(slotProps.data.userDtLastAccess) }}
          </div>
        </template>
      </Column>

      <Column header="Acciones" style="width: 5%">
        <template #body="slotProps">
          <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <Menu ref="menu" :model="menuItems" :popup="true" />
  </div>

</template>

<script setup lang="ts">

import Menu from 'primevue/menu';
import Toolbar from 'primevue/toolbar';
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useUsersManagementStore } from '../../stores/usersManagementStore';
import { HelperDates } from '../../libs/HelperDates';
import { HelperString } from '../../libs/HelperString';

const emit = defineEmits(['edit']);
const usersStore = useUsersManagementStore();
const menu = ref();
const selectedUser = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const menuItems = ref([
  { label: 'Editar', icon: 'pi pi-pencil', command: () => emit('edit', selectedUser.value) },
  {
    label: 'Historial Conexiones',
    icon: 'pi pi-history',
    // AQUÍ ESTABA EL FALLO: llamamos a open usando el ID del usuario seleccionado
    command: () => open(selectedUser.value.userKyId)
  },
  { separator: true },
  { label: 'Borrar', icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => console.log('Borrar', selectedUser.value) }
]);
onMounted(() => usersStore.loadAllUsers());

const openMenu = (event: Event, user: any) => {
  selectedUser.value = user;
  menu.value.toggle(event);
};


function emitEdit(user: any) { emit('edit', user); }
function onRowSelect(event: any) { console.log("Seleccionado:", event.data); }
</script>