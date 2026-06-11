

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