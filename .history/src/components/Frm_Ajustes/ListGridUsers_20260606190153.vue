<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <Toolbar class="mb-3">
      <template #start>
        <Button label="Nuevo Usuario" icon="pi pi-plus" class="mr-2" @click="emitEdit(null)" />
      </template>
      
      <template #end>
        <div class="flex gap-2 align-items-center">
          <IconField>
            <InputIcon class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
          </IconField>
          <Button icon="pi pi-refresh" outlined @click="usersStore.loadAllUsers()" v-tooltip.top="'Actualizar'" />
        </div>
      </template>
    </Toolbar>

    <DataTable v-model:selection="selectedUser" :value="usersStore.allUsers" :loading="usersStore.loading"
      :filters="filters" :globalFilterFields="['userDsCode', 'userDsName', 'userDsEmail', 'userGroup.descriptionEs']"
      selectionMode="single" dataKey="userKyId" scrollable scrollHeight="flex" stripedRows size="normal"
      tableStyle="min-width: 50rem" @row-select="onRowSelect">
      
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
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useUsersManagementStore } from '../../stores/usersManagementStore';
import { HelperDates } from '../../libs/HelperDates';
import { HelperString } from '../../libs/HelperString';

// Definición de eventos para que el padre lo reciba
const emit = defineEmits(['edit']);

const usersStore = useUsersManagementStore();

const menu = ref();
const selectedUser = ref();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(() => {
  usersStore.loadAllUsers();
});

function emitEdit(user: any) {
  emit('edit', user);
}

function onRowSelect(event: any) {
  console.log("Seleccionado:", event.data);
}


const menuItems = ref([
  {
    label: 'Editar',
    icon: 'pi pi-pencil',
    command: () => emitEdit(selectedUser.value)
  },
  {
    label: 'Historial',
    icon: 'pi pi-history',
    command: () => console.log('Historial de:', selectedUser.value)
  },
  { separator: true },
  {
    label: 'Borrar',
    icon: 'pi pi-trash',
    style: 'color: var(--red-500)',
    command: () => console.log('Borrar', selectedUser.value)
  }
]);

// Función para abrir el menú pasando el evento y el usuario
const openMenu = (event: Event, user: any) => {
  selectedUser.value = user;
  menu.value.toggle(event);
};



</script>