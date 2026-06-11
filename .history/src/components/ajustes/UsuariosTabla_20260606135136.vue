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
    <Column field="USER_DS_CODE" header="Código" sortable></Column>
    <Column field="USER_DS_NAME" header="Nombre" sortable></Column>
    <Column field="USER_DS_EMAIL" header="Email"></Column>
    
    <Column header="Estado" style="width: 10%">
      <template #body="slotProps">
        <Badge 
          :value="slotProps.data.USER_BOL_ENABLED ? 'Activo' : 'Inactivo'" 
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