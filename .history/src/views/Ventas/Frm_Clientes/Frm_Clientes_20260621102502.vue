<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <!-- Barra de Herramientas -->
    <Toolbar class="mb-3">
      <template #start>
        <Button label="Nuevo Cliente" icon="pi pi-plus" size="small" variant="text" outlined
          @click="clientFormRef.visibleInputs=true; clientFormRef.open(null)" />
      </template>
      <template #end>
        <!-- Puedes añadir aquí filtros rápidos o selectores de grupo -->
      </template>
    </Toolbar>

    <!-- Tabla Genérica -->
    <GenericDataTable 
      style="min-height: 400px;" 
      ref="tableRef" 
      dataKey="pkid" 
      :endpoint="apiUrl"
      :showPaginator="true" 
      :filterable="true" 
      selectionMode="single" 
      v-model:selection="clientSelected"
      @row-select="handleRowSelect" 
      :showActions="true"
    >
      <template #headerActions>
        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
        <Menu ref="menuTable" :model="menuItemsTable" popup />
      </template>

      <!-- Columnas del Cliente -->
      <Column field="code" header="Código" sortable style="width: 15%"></Column>
      <Column field="name" header="Nombre / Razón Social" sortable style="width: 35%"></Column>
      <Column field="nif" header="NIF/CIF" sortable style="width: 15%"></Column>
      <Column field="phone" header="Teléfono" style="width: 15%"></Column>
      
      <Column field="active" header="Estado" style="width: 10%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
               :severity="slotProps.data.active ? 'success' : 'danger'" rounded />
        </template>
      </Column>

      <Column header="Acciones" style="width: 5%">
        <template #body="slotProps">
          <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />
        </template>
      </Column>
    </GenericDataTable>

    <!-- Menú de Acciones por registro -->
    <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" />
  </div>

  <!-- Componentes adicionales -->
  <Frm_ClientForm ref="clientFormRef" @saved="refreshTable" />
  <ConfirmDialog />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Toolbar from 'primevue/toolbar';
import Menu from 'primevue/menu';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from '../../../stores/companyStore.ts';
// Asegúrate de crear este componente de formulario próximamente
import Frm_ClientForm from './Frm_ClientForm.vue'; 

const tableRef = ref();
const clientFormRef = ref();
const menuTable = ref();
const menuOptionRegistro = ref();
const clientSelected = ref<any>(null);
const apiUrl = ref('WebGetClients'); // Tu endpoint de backend
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();

// Menú de acciones por registro
const menuItems = ref([
  { label: 'Editar', icon: 'pi pi-pencil', command: () => clientFormRef.value.open(clientSelected.value?.pkid) },
  { label: 'Ver Ficha', icon: 'pi pi-id-card', command: () => { /* Logica de ficha */ } },
  { separator: true },
  { label: 'Borrar', icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => deleteClient() }
]);

const menuItemsTable = ref([
  { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
  { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value.exportToExcel() }
]);

const openMenu = (event: Event, client: any) => {
  clientSelected.value = client;
  menuOptionRegistro.value.toggle(event);
};

const openMenuTable = (event: Event) => menuTable.value.toggle(event);

const refreshTable = () => tableRef.value?.refresh();

const handleRowSelect = (event: any) => {
  clientSelected.value = event.data;
};

const deleteClient = () => {
  // Aquí tu lógica de borrado usando el endpoint de WebDeleteClient
};
</script>