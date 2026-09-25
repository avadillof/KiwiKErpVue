<template>
    <main class="entities-page">
        <header class="entities-header">
            <div class="entities-title">
                <div class="entities-icon billing-icon"><i class="pi pi-wallet"></i></div>
                <div>
                    <span class="breadcrumb">Tareas / Facturación</span>
                    <h1>Pendientes de facturar</h1>
                    <p>Tareas finalizadas facturables con horas sin facturar. Se convierten en borrador de factura.</p>
                </div>
            </div>

            <nav class="header-actions" aria-label="Navegación">
                <Button label="Tareas" icon="pi pi-arrow-left" severity="secondary" text
                    @click="router.push({ name: 'Tareas' })" />
                <Button label="Inicio" icon="pi pi-home" severity="secondary" text
                    @click="router.push({ name: 'Dashboard' })" />
            </nav>
        </header>

        <section class="entities-workspace">
            <Toolbar class="entities-toolbar">
                <template #start>
                    <div class="workspace-heading">
                        <span>{{ pending.length }} tarea{{ pending.length === 1 ? '' : 's' }} pendiente{{ pending.length === 1 ? '' : 's' }}</span>
                        <small>{{ totalHours }} h sin facturar en total.</small>
                    </div>
                </template>
                <template #end>
                    <Button icon="pi pi-refresh" text rounded title="Refrescar" :loading="loading"
                        @click="load" />
                </template>
            </Toolbar>

            <div v-if="loading" class="kanban-loading">
                <CorporateLoader label="Cargando pendientes…" />
            </div>

            <DataTable v-else :value="pending" size="small" stripedRows class="billing-table"
                :emptyMessage="'Sin tareas pendientes de facturar.'">
                <Column field="code" header="Código" style="width:110px" />
                <Column field="name" header="Tarea" />
                <Column field="entitieName" header="Cliente" />
                <Column header="Imputadas" style="width:90px">
                    <template #body="{ data }">{{ fmtHours(imputedOf(data)) }}</template>
                </Column>
                <Column header="Facturadas" style="width:90px">
                    <template #body="{ data }">{{ fmtHours(billedOf(data)) }}</template>
                </Column>
                <Column header="Pendientes" style="width:90px">
                    <template #body="{ data }"><strong>{{ fmtHours(pendingOf(data)) }}</strong></template>
                </Column>
                <Column header="Facturas" style="min-width:140px">
                    <template #body="{ data }">
                        <Tag v-for="l in (data.links ?? [])" :key="l.pkid" :value="l.invoiceCode || `#${l.invoiceId}`"
                            severity="info" rounded class="mr-1" />
                        <span v-if="!(data.links ?? []).length" class="text-muted">—</span>
                    </template>
                </Column>
                <Column style="width:130px">
                    <template #body="{ data }">
                        <Button v-if="securityStore.hasPermission(PERM.TASK_BILL)" label="Facturar" icon="pi pi-receipt" size="small"
                            :disabled="pendingOf(data) <= 0" @click="bill(data)" />
                    </template>
                </Column>
            </DataTable>
        </section>

        <ManualInvoiceDialog ref="invoiceDialog" @saved="onInvoiceSaved" />
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import CorporateLoader from '@/components/shared/CorporateLoader.vue';
import DataTable from 'primevue/datatable';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import ManualInvoiceDialog from '@/views/Ventas/Frm_Facturas/ManualInvoiceDialog.vue';
import { useAuthStore } from '@/stores/authStore';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';
import { useCompanyStore } from '@/stores/companyStore';
import {
    getBillingPending,
    linkTaskInvoice,
    type TaskDTO
} from '@/services/Tasks/taskService';

const router = useRouter();
const toast = useToast();
const companyStore = useCompanyStore();
const authStore = useAuthStore();
const securityStore = useSecurityStore();

const loading = ref(false);
const pending = ref<TaskDTO[]>([]);
const invoiceDialog = ref<InstanceType<typeof ManualInvoiceDialog> | null>(null);
let billingTask: TaskDTO | null = null;
let billingHours = 0;

const requester = computed(() => (authStore.user?.admin === true ? null : (authStore.user?.pkid ?? null)));
const totalHours = computed(() => pending.value.reduce((acc, t) => acc + pendingOf(t), 0));

function billedOf(t: TaskDTO): number {
    return (t.links ?? []).reduce((acc, l) => acc + Number(l.hoursBilled ?? 0), 0);
}

function pendingOf(t: TaskDTO): number {
    return Number(t.pendingHours ?? 0);
}

function imputedOf(t: TaskDTO): number {
    return pendingOf(t) + billedOf(t);
}

function fmtHours(v: number): string {
    return `${Math.round(v * 100) / 100} h`;
}

async function load() {
    loading.value = true;
    try {
        pending.value = await getBillingPending(requester.value);
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: e.response?.data?.message ?? 'No se pudieron cargar los pendientes',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } finally {
        loading.value = false;
    }
}

function bill(task: TaskDTO) {
    const hours = Math.round(pendingOf(task) * 100) / 100;
    if (!task.pkid || hours <= 0) return;
    billingTask = task;
    billingHours = hours;
    invoiceDialog.value?.open({
        customer: task.entitiePkid ? { pkid: task.entitiePkid, code: task.entitieCode ?? '', name: task.entitieName ?? '' } : null,
        reference: task.code,
        reason: `Facturación tarea ${task.code}`,
        lines: [{ description: `${task.code} · ${task.name}`, quantity: hours }]
    });
}

async function onInvoiceSaved(invoice: any) {
    if (!billingTask?.pkid) {
        void load();
        return;
    }
    const invoiceId = Number(invoice?.pkid ?? invoice?.id);
    const invoiceCode = String(invoice?.code ?? '');
    try {
        await linkTaskInvoice(billingTask.pkid, invoiceId, billingHours);
        toast.add({
            severity: 'success',
            summary: `Tarea vinculada a ${invoiceCode || 'la factura'}`,
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Factura creada pero no vinculada',
            detail: `${e.response?.data?.message ?? 'Error al vincular'} (factura ${invoiceCode || invoiceId})`,
            life: 6000
        });
    } finally {
        billingTask = null;
        billingHours = 0;
        void load();
    }
}

onMounted(() => void load());
</script>

<style scoped>
.entities-page {
    --kiwi: #9cc10a;
    --kiwi-dark: #648506;
    color: #243044;
    background: rgba(247, 248, 250, 0.58);
    padding: 18px 16px 72px;
}
.entities-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 15px;
    padding: 16px 18px;
    position: relative;
    overflow: hidden;
}
.entities-header::after {
    content: '';
    position: absolute;
    right: -40px;
    top: -40px;
    width: 220px;
    height: 220px;
    background: url('/logos/logo512.png') no-repeat center / contain;
    opacity: 0.075;
    pointer-events: none;
}
.entities-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}
.entities-icon {
    display: grid;
    place-items: center;
    width: 50px;
    height: 50px;
    border-radius: 13px;
    font-size: 1.4rem;
    color: #fff;
}
.billing-icon {
    background: linear-gradient(135deg, #e46e8e, #b74267);
}
.breadcrumb {
    color: #7d8797;
    font-size: 0.78rem;
}
.entities-title h1 {
    margin: 0;
    font-size: 1.5rem;
}
.entities-title p {
    margin: 0.15rem 0 0;
    color: #687386;
    font-size: 0.85rem;
}
.entities-workspace {
    margin-top: 14px;
}
.entities-toolbar {
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    background: #fff;
}
.workspace-heading span {
    display: block;
    font-weight: 700;
}
.workspace-heading small {
    color: #788071;
}
.kanban-loading {
    margin-top: 14px;
    display: flex;
    justify-content: center;
    padding: 3rem;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
}
.billing-table {
    margin-top: 14px;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    overflow: hidden;
}
.text-muted {
    color: #9aa0ad;
}
</style>
