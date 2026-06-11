<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <div class="flex justify-content-end mb-3">
      <div class="flex justify-content-end mb-3">
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters['global'].value" placeholder="Buscar usuario..."
            class="w-full bg-white border-1 surface-border" style="width: 300px; padding-left: 2.5rem;" />
        </IconField>
      </div>
    </div>

    <DataTable v-model:selection="selectedUser" :value="usersStore.allUsers" :loading="usersStore.loading"
      :filters="filters" :globalFilterFields="['userDsCode', 'userDsName', 'userDsEmail', 'userGroup.descriptionEs']"
      selectionMode="single" dataKey="userKyId" scrollable scrollHeight="flex" stripedRows size="normal"
      tableStyle="min-width: 50rem" @row-select="onRowSelect">
      <Column field="userDsCode" header="Código" sortable style="width: 20%"></Column>

      <Column header="Usuario" field="userDsName" sortable style="width: 25%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <Avatar :label="slotProps.data.userDsName.charAt(0)" style="background-color:#dee9fc; color: #1a2544"
              shape="circle" />
            <span class="font-bold">{{ slotProps.data.userDsName }}</span>
          </div>
        </template>
      </Column>

      <Column field="userGroup.descriptionEs" header="Rol" sortable style="width: 20%">
        <template #body="slotProps">
          <Tag :severity="usersStore.getRoleDetails(slotProps.data.userGroup?.descriptionEs).severity" rounded>
            <div class="flex align-items-center gap-2">
              <i :class="usersStore.getRoleDetails(slotProps.data.userGroup?.descriptionEs).icon"></i>
              <span class="font-bold">
                {{ usersStore.getRoleDetails(slotProps.data.userGroup?.descriptionEs).label }}
              </span>
            </div>
          </Tag>
        </template>
      </Column>




      <Column field="userBolEnabled" header="Estado" style="width: 15%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.userBolEnabled ? 'ACTIVO' : 'INACTIVO'"
            :severity="slotProps.data.userBolEnabled ? 'success' : 'danger'" rounded />
        </template>
      </Column>

      <Column field="userDtLastAccess" header="Última Conexión" sortable style="width: 20%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-calendar text-primary"></i>
            <span>{{ formatDate(slotProps.data.userDtLastAccess) }}</span>
          </div>
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

function formatDate(dateString: string | null) {
  if (!dateString) return 'Nunca';
  
  const date = new Date(dateString);
  // Formato local (ej: 6/6/2026, 18:06)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

</script>