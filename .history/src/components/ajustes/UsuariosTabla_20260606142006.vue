<template>
  <DataTable 
    :value="usersStore.allUsers" 
    :loading="usersStore.loading" 
    scrollable 
    scrollHeight="500px"
    stripedRows
    size="small"
    tableStyle="min-width: 50rem"
  >
    <Column field="userDsCode" header="Código" sortable></Column>
    <Column field="userDsName" header="Nombre" sortable></Column>
    <Column field="userDsEmail" header="Email"></Column>
    
    <Column header="Estado" style="width: 10%">
      <template #body="slotProps">
        <Badge 
          :value="slotProps.data.userBolEnabled ? 'Activo' : 'Inactivo'" 
          :severity="slotProps.data.USER_BOL_ENABLED ? 'success' : 'danger'" 
        />
      </template>
    </Column>

    <Column header="Acciones" style="width: 10%">
      <template #body="slotProps">
        <Button 
          icon="pi pi-pencil" 
          text 
          rounded 
          @click="$emit('edit', slotProps.data)" 
        />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUsersManagementStore } from '../../stores/usersManagementStore';

const usersStore = useUsersManagementStore();

onMounted(() => {
  usersStore.loadAllUsers();
});
</script>