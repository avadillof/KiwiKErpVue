<template>
  <div class="card" style="height: 400px; display: flex; flex-direction: column;">
    <div class="flex justify-content-end mb-3">
      <div class="flex justify-content-end mb-3">
  <IconField>
    <InputIcon class="pi pi-search" />
    <InputText 
      v-model="filters['global'].value" 
      placeholder="Buscar usuario..." 
      variant="filled" 
      style="width: 300px; padding-left: 2.5rem;" 
    />
  </IconField>
</div>
    </div>

    <DataTable 
      v-model:selection="selectedUser"
      :value="usersStore.allUsers" 
      :loading="usersStore.loading"
      :filters="filters"
      :globalFilterFields="['userDsCode', 'userDsName', 'userDsEmail', 'userGroup.descriptionEs']"
      selectionMode="single"
      dataKey="userKyId"
      scrollable 
      scrollHeight="flex" 
      stripedRows
      size="normal"
      tableStyle="min-width: 50rem"
      @row-select="onRowSelect"
    >
      <Column field="userDsCode" header="Código" sortable style="width: 20%"></Column>
      
      <Column header="Usuario" field="userDsName" sortable style="width: 25%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <Avatar :label="slotProps.data.userDsName.charAt(0)" style="background-color:#dee9fc; color: #1a2544" shape="circle" />
            <span class="font-bold">{{ slotProps.data.userDsName }}</span>
          </div>
        </template>
      </Column>

      <Column field="userGroup.descriptionEs" header="Rol" sortable style="width: 20%"></Column>

      <Column field="userBolEnabled" header="Estado" style="width: 15%">
        <template #body="slotProps">
          <Tag 
            :value="slotProps.data.userBolEnabled ? 'ACTIVO' : 'INACTIVO'" 
            :severity="slotProps.data.userBolEnabled ? 'success' : 'danger'" 
            rounded 
          />
        </template>
      </Column>

      <Column header="Acciones" style="width: 10%; text-align: center;">
        <template #body="slotProps">
          <Button 
            icon="pi pi-pencil" 
            severity="info" 
            text 
            rounded 
            @click.stop="emitEdit(slotProps.data)" 
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useUsersManagementStore } from '../../stores/usersManagementStore';

// Definición de eventos para que el padre lo reciba
const emit = defineEmits(['edit']);

const usersStore = useUsersManagementStore();
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
</script>