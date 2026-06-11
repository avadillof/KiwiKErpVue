<template>
  <div class="card">
    <DataTable 
      :value="usersStore.allUsers" 
      :loading="usersStore.loading"
      stripedRows
      paginator 
      :rows="10"
      dataKey="userKyId"
      size="normal"
      tableStyle="min-width: 50rem"
    >
      <Column header="Usuario" field="userDsName" sortable>
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <Avatar :label="slotProps.data.userDsName.charAt(0)" style="background-color:#dee9fc; color: #1a2544" shape="circle" />
            <span class="font-bold">{{ slotProps.data.userDsName }}</span>
          </div>
        </template>
      </Column>

      <Column field="userDsEmail" header="Email"></Column>

      <Column field="userGroup.descriptionEs" header="Rol" sortable>
        <template #body="slotProps">
          <Tag :value="slotProps.data.userGroup.descriptionEs" severity="info" />
        </template>
      </Column>

      <Column field="userBolEnabled" header="Estado">
        <template #body="slotProps">
          <Tag 
            :value="slotProps.data.userBolEnabled ? 'ACTIVO' : 'INACTIVO'" 
            :severity="slotProps.data.userBolEnabled ? 'success' : 'danger'" 
            rounded 
          />
        </template>
      </Column>

      <Column header="Acciones" style="text-align: center">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" severity="secondary" text rounded @click="$emit('edit', slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

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