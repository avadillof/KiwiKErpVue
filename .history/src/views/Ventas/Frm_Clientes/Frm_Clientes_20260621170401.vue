

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from '../../../stores/companyStore';
//import Frm_ClientForm from './Frm_ClientForm.vue';

const router = useRouter();
const tableRef = ref();
const clientFormRef = ref();
const menuTable = ref();
const menuOptionRegistro = ref();
const clientSelected = ref<any>(null);
const apiUrl = ref('WebGetClients');
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();

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
const handleRowSelect = (event: any) => { clientSelected.value = event.data; };

const deleteClient = () => {
    // Implementar lógica de borrado con confirmación
};
</script>