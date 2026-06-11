<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useUsersManagementStore } from '../../stores/usersManagementStore';

// 1. Instanciamos el store
const usersStore = useUsersManagementStore();

// 2. Estado para selección y filtros
const selectedUser = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// 3. Carga inicial de datos al montar el componente
onMounted(() => {
  usersStore.loadAllUsers();
});

// 4. Lógica de acciones
function handleEdit(user: any) {
  console.log("Editando usuario:", user);
  // Aquí abrirás tu modal o navegación
}

function onRowSelect(event: any) {
  console.log("Fila seleccionada:", event.data);
}
</script>