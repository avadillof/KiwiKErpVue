<template>
  <div style="background-color: #f9fafb; min-height: 100vh; padding: 20px;">
    
    <div style="background: white; padding: 15px 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="background-color: #e0f2fe; color: #0ea5e9; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="pi pi-users" style="font-size: 1.25rem;"></i>
            </div>
            <div>
                <h2 style="margin: 0; color: #1f2937; font-size: 1.25rem; font-weight: 700;">Clientes</h2>
                <p style="margin: 0; color: #6b7280; font-size: 0.85rem;">Gestión de directorio y condiciones</p>
            </div>
        </div>

        <Button 
            label="Volver al Panel de Ventas" 
            icon="pi pi-arrow-left" 
            severity="secondary" 
            text 
            @click="router.push({ name: 'Ventas' })" 
        />
    </div>

    <div class="card" style="padding: 20px;">
        <Toolbar class="mb-3">
            </Toolbar>
        
        <GenericDataTable ... >
            </GenericDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Toolbar from 'primevue/toolbar';
import Menu from 'primevue/menu';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from '../../../stores/companyStore.ts';
// Asegúrate de crear este componente de formulario próximamente
//import Frm_ClientForm from './Frm_ClientForm.vue'; 

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