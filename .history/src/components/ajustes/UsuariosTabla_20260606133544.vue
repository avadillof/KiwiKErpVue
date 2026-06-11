<template>
  <DataTable :value="usersStore.allUsers" :loading="usersStore.loading" paginator rows="10">
    <Column field="USER_DS_CODE" header="Código"></Column>
    <Column field="USER_DS_NAME" header="Nombre"></Column>
    <Column field="USER_DS_EMAIL" header="Email"></Column>
    <Column header="Estado">
      <template #body="slotProps">
        <Badge :value="slotProps.data.USER_BOL_ENABLED ? 'Activo' : 'Inactivo'" 
               :severity="slotProps.data.USER_BOL_ENABLED ? 'success' : 'danger'" />
      </template>
    </Column>
    <Column header="Acciones">
      <template #body="slotProps">
        <Button icon="pi pi-pencil" text @click="$emit('edit', slotProps.data)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { useUsersManagementStore } from '..';
const usersStore = useUsersManagementStore();
</script>