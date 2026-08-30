<template>

    <div class="certificate-page">
        <header class="page-header"><div class="page-heading"><div class="page-icon"><i class="pi pi-shield"></i></div><div><span class="breadcrumb">Configuración / Datos maestros</span><h1>Certificados digitales</h1><p>Firma electrónica, integraciones tributarias y usuarios autorizados.</p></div></div><nav class="header-actions"><Button label="Ajustes" icon="pi pi-arrow-left" severity="secondary" text @click="volver" /><Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" /></nav></header>
        <div class="card certificate-card"><Toolbar class="list-toolbar">
            <template #start><div class="workspace-heading"><span>Certificados registrados</span><small>Selecciona un certificado para consultar sus datos y autorizaciones.</small></div></template>
            <template #end><Button label="Nuevo certificado" icon="pi pi-plus" size="small" @click="certificateFormRef.open(null)" /></template>
        </Toolbar>

        <Splitter class="certificate-splitter">

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

                <div class="certificate-panel certificate-detail-panel">

                    <CertificateInfoCard :certificate="certificateInfo" />

                </div>

            </SplitterPanel>

        </Splitter></div>

        <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0" />

    </div>

    <Frm_CertificateForm ref="certificateFormRef" @saved="refreshTable" />
    
    <Frm_CertificateUsersDialog ref="certificateUsersDialogRef" />
    <ConfirmDialog />

</template>


<style scoped>
.certificate-page { --kiwi:#9cc10a; --kiwi-dark:#648506; width:100%; min-height:calc(100dvh - 66px); padding:18px 16px 72px; box-sizing:border-box; background:#f7f8fa; }
.page-header{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:18px;padding:15px 20px;border:1px solid #e3e8d2;border-radius:15px;background:#fff;box-shadow:0 6px 18px rgba(31,41,55,.055)}.page-header::after{content:"";position:absolute;z-index:0;width:300px;height:300px;right:20px;top:50%;transform:translateY(-50%);background:url('/logos/logo512.png') center/contain no-repeat;filter:grayscale(1);opacity:.075;pointer-events:none}.page-header>*{position:relative;z-index:1}.page-heading{display:flex;align-items:center;gap:14px}.page-icon{display:grid;width:50px;height:50px;flex:0 0 auto;place-items:center;border-radius:13px;color:#fff;background:linear-gradient(135deg,#38a4d8,#2875b6);box-shadow:0 7px 15px rgba(40,117,182,.22)}.page-icon i{font-size:1.3rem}.breadcrumb{color:#8791a0;font-size:.8rem;font-weight:700}.page-heading h1{margin:3px 0 2px;color:#202939;font-size:1.38rem}.page-heading p{margin:0;color:#7a8494;font-size:.92rem}.header-actions{display:flex;align-items:center;gap:3px}
.certificate-card{height:clamp(560px,calc(100dvh - 270px),800px);min-height:0;padding:0;border:1px solid #dfe4ea;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 5px 18px rgba(30,41,59,.055);display:flex;flex-direction:column}.list-toolbar{padding:13px 17px;border:0;border-bottom:1px solid #e8ecf0;border-radius:0;background:#fff}.workspace-heading{display:flex;flex-direction:column;gap:3px}.workspace-heading span{color:#344054;font-size:1rem;font-weight:800}.workspace-heading small{color:#8a93a2;font-size:.82rem}.list-toolbar :deep(.p-button){border-color:var(--kiwi-dark);background:var(--kiwi-dark)}.certificate-splitter{flex:1 1 auto;min-height:0;border:0}.certificate-panel{padding:1rem;height:100%;min-height:0;box-sizing:border-box}.certificate-detail-panel{overflow:hidden}.certificate-panel :deep(.p-datatable){height:100%}@media(max-width:700px){.certificate-page{padding:12px 10px 66px}.page-header{padding:12px;align-items:flex-start}.page-heading p,.workspace-heading small,.header-actions :deep(.p-button-label){display:none}.certificate-card{height:600px}}
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
import Frm_CertificateUsersDialog from '../Frm_Certificates/Frm_CertificateUsersDialog.vue';

const toast = useToast();
const confirm = useConfirm();
const companyStore = useCompanyStore();
const certificateInfo = ref(null);
const certificateUsersDialogRef = ref();

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


const openCertificateUsers = () => {

    if (!selectedCertificate.value) {
        return;
    }

    const id = selectedCertificate.value.pkid;

    console.log('Abriendo usuarios del certificado:', id);

    certificateUsersDialogRef.value.open(id);
};

const menuItems = computed(() => [

    {
        label: 'Ficha del Certificado',
        icon: 'pi pi-pencil',
        command: () => {
            certificateFormRef.value.open(
                selectedCertificate.value?.pkid
            );
        }
    },

    {
        separator: true
    },

    {
        label: 'Borrar',
        icon: 'pi pi-trash',
        style: 'color: var(--red-500)',
        command: () => {
            deleteCertificate();
        }
    },

    {
        label: 'Usuarios autorizados',
        icon: 'pi pi-users',
        command: openCertificateUsers
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
    router.push({ name: 'Frm_Ajustes', query: { tab: '3' } });
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
                    `${import.meta.env.VITE_API_URL}/WebDeleteCertificate`, {
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
                    throw new Error('Error al eliminar el Certificado');
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Certificado eliminado correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                refreshTable();
            } catch (error) {
                console.error(error);

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar el Certifiado ',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });
            }
        }
    });
};




</script>

<style scoped></style>
