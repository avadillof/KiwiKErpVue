<template>

    <div class="p-4" style="padding-bottom: 80px; margin-bottom: 100px;">

        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">
            Certificados Digitales
        </h1>

        <Message variant="simple" icon="pi pi-shield" severity="success" size="big">
            Gestión y mantenimiento de los certificados digitales utilizados por KiwiKERP.
        </Message>

        <div class="mb-5">
            <Button label="Volver a Ajustes" icon="pi pi-arrow-left" text @click="volver" />
        </div>

        <Toolbar class="mb-3">
            <template #start>
                <Button label="Nuevo Certificado" icon="pi pi-plus" size="small" variant="text" outlined
                    @click="certificateFormRef.open(null)" />
            </template>
        </Toolbar>

        <Splitter style="height: calc(100vh - 20px);">

            <!-- Tabla -->
            <SplitterPanel :size="75"    
            
            
            
            
            >
                <div class="certificate-panel">
                    <GenericDataTable class="h-full" ref="tableRef" dataKey="pkid" :endpoint="apiUrl"
                        :showPaginator="true" :filterable="true" :showActions="true" selectionMode="single"
                        v-model:selection="selectedCertificate" @row-select="handleRowSelect">

                        <template #headerActions>
                            <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />

                            <Menu ref="menuTable" :model="menuItemsTable" popup />
                        </template>

                        <Column field="description" header="Descripción" sortable sortField="description" style="width:30%" />

                        <Column field="type" header="Tipo" sortable sortField="type.description" style="width:70%">


                        </Column>

                        <Column header="Acciones" style="width:5%">

                            <template #body="slotProps">

                                <Button icon="pi pi-ellipsis-v" text rounded
                                    @click="openMenu($event, slotProps.data)" />

                            </template>

                        </Column>

                    </GenericDataTable>
                </div>
            </SplitterPanel>

            <!-- Panel derecho -->
            <SplitterPanel :size="25">

                <div class="certificate-panel">

                    <CertificateInfoCard :certificate="certificateInfo" />

                </div>

            </SplitterPanel>

        </Splitter>

        <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0" />

    </div>

    <Frm_CertificateForm ref="certificateFormRef" @saved="refreshTable" />

    <ConfirmDialog />

</template>


<style scoped>
.certificate-panel {
    padding: 1rem;
    height: 100%;
    box-sizing: border-box;
}
</style>

<script setup>


import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';


import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';

import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

import { useCompanyStore } from '@/stores/companyStore';
import Frm_CertificateForm from '../Frm_Certificates/Frm_CertificateForm.vue';

const toast = useToast();
const confirm = useConfirm();
const companyStore = useCompanyStore();
const certificateInfo = ref(null);

const toastLife = companyStore.companyInfo.toastDuration ?? 3000;

const apiUrl = `WebGetCertificates`;

const router = useRouter();

const tableRef = ref();
const selectedCertificate = ref();
const certificateFormRef = ref();

const menuOptionRegistro = ref();
const menuTable = ref();

const menuItemsTable = ref([
    {
        label: 'Refrescar',
        icon: 'pi pi-refresh',
        command: () => refreshTable()
    },
    {
        label: 'Exportar Excel',
        icon: 'pi pi-file-excel',
        command: () => tableRef.value.exportToExcel()
    }
]);

const menuItems = computed(() => [

    {
        label: 'Ficha del Certificado',
        icon: 'pi pi-pencil',
        command: () => certificateFormRef.value.open(selectedCertificate.value?.pkid)
        
    },

    {
        separator: true
    },

    {
        label: 'Borrar',
        icon: 'pi pi-trash',
        style: 'color: var(--red-500)',
        command: () => deleteCertificate()
    }

]);

const openMenuTable = (event) => {
    menuTable.value.toggle(event);
};

const openMenu = (event, certificate) => {
    selectedCertificate.value = certificate;
    menuOptionRegistro.value.toggle(event);
};

const refreshTable = async () => {
    await tableRef.value.refresh();
};

function volver() {
    router.push({ name: 'Frm_Ajustes' });
}


const handleRowSelect = (event) => {

    certificateInfo.value = {
        pkid: event.data.pkid,
        description: event.data.description,
        type: event.data.type
    };

};


const deleteCertificate = () => {
 if (!selectedCertificate.value) return;

    confirm.require({
        message: `¿Estás seguro de que quieres borrar el Certificado ${selectedCertificate.value.description}? Esta acción no se puede deshacer.`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancelar',
            severity: 'secondary'
        },
        acceptProps: {
            label: 'Borrar',
            severity: 'danger'
        },
        accept: async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/WebDeleteCertificate`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pkid: selectedCertificate.value.pkid
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al eliminar el usuario');
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Entidad eliminada correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                refreshTable();
            } catch (error) {
                console.error(error);

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar la  entidad',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });
            }
        }
    });
};

</script>

<style scoped></style>