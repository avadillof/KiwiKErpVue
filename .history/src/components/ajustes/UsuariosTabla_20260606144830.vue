<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <DataTable 
      :value="usersStore.allUsers" 
      :loading="usersStore.loading"
      scrollable 
      scrollHeight="flex" 
      stripedRows
      size="normal"
      tableStyle="min-width: 50rem"
    >
      <Column header="Usuario" field="userDsName" sortable style="min-width: 200px">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <Avatar :label="slotProps.data.userDsName.charAt(0)" style="background-color:#dee9fc; color: #1a2544" shape="circle" />
            <span class="font-bold">{{ slotProps.data.userDsName }}</span>
          </div>
        </template>
      </Column>

      <Column field="userDsEmail" header="Email" style="min-width: 200px"></Column>

      <Column field="userGroup.descriptionEs" header="Rol" sortable style="min-width: 150px">
        <template #body="slotProps">
          <Tag :value="slotProps.data.userGroup.descriptionEs" severity="info" />
        </template>
      </Column>

      <Column field="userBolEnabled" header="Estado" style="width: 100px">
        <template #body="slotProps">
          <Tag 
            :value="slotProps.data.userBolEnabled ? 'ACTIVO' : 'INACTIVO'" 
            :severity="slotProps.data.userBolEnabled ? 'success' : 'danger'" 
            rounded 
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUsersManagementStore } from '../../stores/usersManagementStore';

const usersStore = useUsersManagementStore();

onMounted(() => {
  usersStore.loadAllUsers();
});
</script>