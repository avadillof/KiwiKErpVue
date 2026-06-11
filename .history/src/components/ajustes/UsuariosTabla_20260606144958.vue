<template>
  <div class="card" style="height: 550px; display: flex; flex-direction: column;">
    <div class="flex justify-content-between align-items-center mb-3">
      <InputText 
        v-model="filters['global'].value" 
        placeholder="Buscar en todo el sistema..." 
        style="width: 300px;" 
      />
    </div>

    <DataTable 
      v-model:selection="selectedUser"
      :value="usersStore.allUsers" 
      :loading="usersStore.loading"
      :filters="filters"
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
            v-tooltip.top="'Editar usuario'"
            @click.stop="handleEdit(slotProps.data)" 
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api'; // Ajusta según tu versión de PrimeVue
import { useUsersManagementStore } from '../../stores/usersManagementStore';

const usersStore = useUsersManagementStore();
const selectedUser = ref(); // Aquí se guarda el usuario seleccionado

// Configuración de filtros
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

function handleEdit(user: any) {
  console.log("Editando usuario:", user);
  // Aquí disparas tu modal o navegación de edición
}

function onRowSelect(event: any) {
  console.log("Fila seleccionada:", event.data);
}
</script>