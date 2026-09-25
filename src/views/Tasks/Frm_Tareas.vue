<template>
    <main class="entities-page">
        <header class="entities-header">
            <div class="entities-title">
                <div class="entities-icon task-icon"><i class="pi pi-clipboard"></i></div>
                <div>
                    <span class="breadcrumb">Gestión / Tareas</span>
                    <h1>Tareas</h1>
                    <p>Tablero Kanban sencillo: planifica, ejecuta y archiva el trabajo facturable.</p>
                </div>
            </div>

            <nav class="header-actions" aria-label="Navegación">
                <Button label="Inicio" icon="pi pi-home" severity="secondary" text
                    @click="router.push({ name: 'Dashboard' })" />
            </nav>
        </header>

        <section class="entities-workspace">
            <Toolbar class="entities-toolbar">
                <template #start>
                    <div class="workspace-heading">
                        <span>Tablero Kanban</span>
                        <small>Arrastra una tarjeta entre columnas para cambiar su estado.</small>
                    </div>
                </template>
                <template #end>
                    <div class="toolbar-tools">
                        <IconField>
                            <InputIcon class="pi pi-search" />
                            <InputText v-model="query" placeholder="Buscar tareas..." class="w-full"
                                @update:modelValue="onSearch" />
                        </IconField>
                        <Button icon="pi pi-th-large" :severity="view === 'kanban' ? 'success' : 'secondary'"
                            :text="view !== 'kanban'" rounded title="Vista Kanban" @click="view = 'kanban'" />
                        <Button icon="pi pi-chart-bar" :severity="view === 'gantt' ? 'success' : 'secondary'"
                            :text="view !== 'gantt'" rounded title="Vista Gantt" @click="view = 'gantt'" />
                        <Button icon="pi pi-file-excel" text rounded title="Exportar imputaciones a Excel"
                            :loading="exporting" @click="exportExcel" />
                        <Button icon="pi pi-refresh" text rounded title="Refrescar" :loading="loading"
                            @click="() => load()" />
                        <Button label="Avisar vencidas" icon="pi pi-send" severity="secondary" outlined
                            size="small" title="Avisar vencidas a sus responsables" :loading="notifying"
                            @click="askNotifyOverdue" />
                        <Button v-if="securityStore.hasPermission(PERM.TASK_BILLING_PENDING)" label="Pendientes de facturar" icon="pi pi-wallet" severity="secondary" outlined
                            size="small" title="Tareas finalizadas pendientes de facturar"
                            @click="router.push({ name: 'TareasPendientes' })" />
                        <Button v-if="securityStore.hasPermission(PERM.TASK_EDIT)" class="new-document" label="Nueva tarea" icon="pi pi-plus" size="small"
                            @click="openNew()" />
                    </div>
                </template>
            </Toolbar>

            <div class="task-filters">
                <div class="task-filter">
                    <FloatLabel variant="on" class="w-full">
                        <Select v-model="filterState" :options="stateOptions" optionLabel="label"
                            optionValue="value" class="w-full" showClear @change="() => load()" />
                        <label>Estado</label>
                    </FloatLabel>
                </div>
                <div class="task-filter">
                    <FloatLabel variant="on" class="w-full">
                        <Select v-model="filterUser" :options="userOptions" optionLabel="label"
                            optionValue="value" class="w-full" filter showClear @change="() => load()" />
                        <label>Asignada a</label>
                    </FloatLabel>
                </div>
                <div class="task-filter task-filter-customer">
                    <FloatLabel variant="on">
                        <CustomerLookup v-model="filterEntitie" :label="filterEntitieLabel"
                            @selected="onFilterEntitie" @update:modelValue="onFilterEntitieInput" />
                        <label>Empresa</label>
                    </FloatLabel>
                </div>
                <div class="task-filter task-filter-sm">
                    <FloatLabel variant="on" class="w-full">
                        <Select v-model="filterPriority" :options="priorityOptions" optionLabel="label"
                            optionValue="value" class="w-full" showClear @change="() => load()" />
                        <label>Prioridad</label>
                    </FloatLabel>
                </div>
                <Button icon="pi pi-user" label="Mías" :severity="mineOnly ? 'success' : 'secondary'"
                    :text="!mineOnly" size="small" title="Solo mis tareas" @click="mineOnly = !mineOnly; load()" />
                <Button icon="pi pi-bell" label="Vencidas" :severity="overdueOnly ? 'success' : 'secondary'"
                    :text="!overdueOnly" size="small" title="Solo vencidas" @click="overdueOnly = !overdueOnly; load()" />
                <Button icon="pi pi-box" label="Archivo" :severity="archiveMode ? 'success' : 'secondary'"
                    :text="!archiveMode" size="small" title="Incluir todas las terminadas (puede ser lento)"
                    @click="archiveMode = !archiveMode; load()" />
                <Button v-if="hasFilters" icon="pi pi-filter-slash" label="Limpiar" severity="secondary" text
                    size="small" @click="clearFilters" />
                <Tag v-if="hasFilters" :value="`${tasks.length} coincidencia${tasks.length === 1 ? '' : 's'}`"
                    severity="info" rounded />
                <Tag v-if="archiveTruncated != null"
                    :value="`Archivo: mostrando ${tasks.length} de ${archiveTruncated} — afina con el buscador`"
                    severity="warn" rounded />
                <small v-else-if="!archiveMode" class="archive-hint">Hechas/descartadas recientes ({{ ARCHIVE_DAYS }} días)</small>
            </div>

            <div v-if="loading" class="kanban-loading">
                <CorporateLoader label="Cargando tareas…" />
            </div>

            <Frm_TaskGantt v-else-if="view === 'gantt'" :tasks="tasks" @edit="openEdit" />

            <div v-else class="kanban-board">
                <section v-for="col in columns" :key="col.value" class="kanban-column"
                    :class="{ 'drop-target': dropState === col.value }" @dragover.prevent="dropState = col.value"
                    @dragleave="dropState = null" @drop="onDrop(col.value)">
                    <header class="kanban-column-header">
                        <Tag :value="col.label" :severity="col.severity" rounded />
                        <span class="kanban-count">{{ tasksByState(col.value).length }}</span>
                        <Button icon="pi pi-plus" text rounded size="small" title="Nueva en esta columna"
                            @click="openNew(col.value)" />
                    </header>

                    <div class="kanban-cards">
                        <article v-for="(task, idx) in tasksByState(col.value)" :key="task.pkid ?? task.code" class="kanban-card"
                            :class="{ overdue: task.overdue, dragging: dragPkid === task.pkid, 'drop-before': isDropHint(col.value, idx, false), 'drop-after': isDropHint(col.value, idx, true) }"
                            :draggable="!isLockedState(task)" @dragstart="onDragStart(task)" @dragend="onDragEnd"
                            @dragover.prevent="onCardOver($event, col.value, idx)" @drop.stop="onCardDrop(col.value, idx)"
                            @click="openEdit(task)">
                            <div class="kanban-card-top">
                                <span class="code-with-attachments"><span class="entity-code">{{ task.code || 'Sin código' }}</span><Tag
                                    v-if="Number(task.attachmentCount || 0) > 0" :value="String(task.attachmentCount)"
                                    icon="pi pi-paperclip" severity="info" rounded title="Documentos adjuntos" /><i
                                    v-if="isLockedState(task)" class="pi pi-lock kanban-lock" title="Con factura vinculada" /></span>
                                <Tag :value="priorityOf(task).label" :severity="priorityOf(task).severity" rounded />
                            </div>
                            <h3>{{ task.name }}</h3>
                            <p v-if="task.entitieName" class="kanban-client">
                                <i class="pi pi-building"></i>{{ task.entitieName }}
                            </p>
                            <p v-if="task.userName" class="kanban-user">
                                <Avatar shape="circle" class="kanban-avatar">
                                    <img v-if="task.userPkid && !photoErrors[task.userPkid]"
                                        :src="userPhotoUrl(task.userPkid)" :alt="task.userName"
                                        @error="onPhotoError(task.userPkid)" />
                                    <span v-else>{{ initials(task.userName) }}</span>
                                </Avatar>{{ task.userName }}
                            </p>
                            <p v-if="task.contactName" class="kanban-user">
                                <Avatar shape="circle" class="kanban-avatar contact">
                                    <span>{{ initials(task.contactName) }}</span>
                                </Avatar>{{ task.contactName }}
                            </p>
                            <p v-if="task.creatorName && task.creatorName !== task.userName" class="kanban-creator">
                                Resp.: {{ task.creatorName }}
                            </p>
                            <div class="kanban-meta">
                                <span v-if="Number(task.estimatedHours || 0) > 0" class="kanban-hours"
                                    title="Horas previstas">
                                    <i class="pi pi-clock"></i>{{ task.estimatedHours }}h
                                </span>
                                <span v-if="task.dueDate" class="kanban-due" :class="{ late: task.overdue }">
                                    <i class="pi pi-calendar"></i>{{ formatTaskDate(task.dueDate) }}
                                </span>
                                <Tag v-if="task.overdue" value="Vencida" severity="danger" rounded />
                            </div>
                            <div class="kanban-progress">
                                <ProgressBar :value="Math.round(Number(task.progress ?? 0))" />
                                <span>{{ Math.round(Number(task.progress ?? 0)) }} %</span>
                            </div>
                            <footer class="kanban-card-footer">
                                <Button icon="pi pi-pencil" text rounded size="small" title="Editar"
                                    @click.stop="openEdit(task)" />
                                <Button icon="pi pi-trash" text rounded size="small" severity="danger"
                                    title="Descartar" @click.stop="askDiscard(task)" />
                            </footer>
                        </article>

                        <div v-if="!tasksByState(col.value).length" class="kanban-empty">
                            Sin tareas. Arrastra aquí o crea una nueva.
                        </div>
                    </div>
                </section>
            </div>
        </section>

        <Frm_TaskForm ref="taskFormRef" @saved="() => load()" />
        <ConfirmDialog />
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import CorporateLoader from '@/components/shared/CorporateLoader.vue';
import CustomerLookup from '@/components/shared/CustomerLookup.vue';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import ProgressBar from 'primevue/progressbar';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import { useCompanyStore } from '@/stores/companyStore';
import { useAuthStore } from '@/stores/authStore';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';
import { useMessagesStore } from '@/stores/messagesStore';
import { backendUrl } from '@/services/backendUrl';
import { loadTaskBoardPrefs, saveTaskBoardPrefs, type TaskBoardPrefs } from '@/services/Tasks/taskPrefs';
import Avatar from 'primevue/avatar';
import Frm_TaskForm from './Frm_TaskForm.vue';
import Frm_TaskGantt from './Frm_TaskGantt.vue';
import {
    TASK_PRIORITIES,
    TASK_STATES,
    deleteTask,
    exportTaskTimesToExcel,
    formatTaskDate,
    getTasksPage,
    getUsers,
    notifyOverdueTasks as notifyOverdueApi,
    priorityOf,
    saveTaskOrder,
    type TaskDTO,
    type TaskQuery,
    type TaskState
} from '@/services/Tasks/taskService';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();
const authStore = useAuthStore();
const securityStore = useSecurityStore();
const messagesStore = useMessagesStore();

const loading = ref(false);
const notifying = ref(false);
const exporting = ref(false);
const view = ref<'kanban' | 'gantt'>('kanban');
const query = ref('');
const tasks = ref<TaskDTO[]>([]);
const dragPkid = ref<number | null>(null);
const dropState = ref<TaskState | null>(null);
const dropIndex = ref<number | null>(null);
const dropAfter = ref(false);
const taskFormRef = ref<InstanceType<typeof Frm_TaskForm> | null>(null);
const filterState = ref<string | null>(null);
const filterUser = ref<number | null>(null);
const filterEntitie = ref<number | null>(null);
const filterEntitieLabel = ref('');
const filterPriority = ref<string | null>(null);
const mineOnly = ref(false);
const overdueOnly = ref(false);
const archiveMode = ref(false);
const archiveTruncated = ref<number | null>(null);
const photoErrors = ref<Record<number, boolean>>({});
const userOptions = ref<{ label: string; value: number }[]>([]);
let autoTimer: number | null = null;

const ARCHIVE_DAYS = 60;

let searchTimer: ReturnType<typeof setTimeout> | undefined;

const columns = computed(() => TASK_STATES);
const stateOptions = computed(() => TASK_STATES.map((s) => ({ label: s.label, value: s.value })));
const priorityOptions = computed(() => TASK_PRIORITIES.map((p) => ({ label: p.label, value: p.value })));
const currentUserPkid = computed(() => authStore.user?.pkid ?? null);
const isAdmin = computed(() => authStore.user?.admin === true);
const requesterPkid = computed(() => (isAdmin.value ? null : currentUserPkid.value));
const hasFilters = computed(() =>
    !!query.value || !!filterState.value || filterUser.value != null || filterEntitie.value != null
    || !!filterPriority.value || mineOnly.value || overdueOnly.value || archiveMode.value
);

function tasksByState(state: TaskState): TaskDTO[] {
    return tasks.value
        .filter((t) => t.state === state)
        .sort((a, b) => Number(a.position ?? Number.MAX_SAFE_INTEGER) - Number(b.position ?? Number.MAX_SAFE_INTEGER));
}

function onSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => void load(), 350);
}

function recentSince(): string {
    const d = new Date();
    d.setDate(d.getDate() - ARCHIVE_DAYS);
    return d.toISOString().slice(0, 10);
}

async function load(quiet = false) {
    if (!quiet) loading.value = true;
    archiveTruncated.value = null;
    try {
        const common: TaskQuery = {
            query: query.value,
            userPkid: mineOnly.value ? currentUserPkid.value : filterUser.value,
            entitiePkid: filterEntitie.value,
            priority: filterPriority.value ?? '',
            overdue: overdueOnly.value || undefined,
            requesterPkid: requesterPkid.value
        };
        if (filterState.value) {
            const terminal = filterState.value === 'FINALIZADA' || filterState.value === 'DESCARTADA';
            const res = await getTasksPage({
                ...common,
                state: filterState.value,
                updatedSince: terminal && !archiveMode.value ? recentSince() : undefined,
                size: 2000
            });
            tasks.value = res.items;
            if (terminal && res.total > res.items.length) archiveTruncated.value = res.total;
        } else {
            const [open, done] = await Promise.all([
                getTasksPage({ ...common, states: 'PLANIFICADA,EN_CURSO', size: 2000 }),
                archiveMode.value
                    ? getTasksPage({ ...common, states: 'FINALIZADA,DESCARTADA', size: 2000 })
                    : getTasksPage({ ...common, states: 'FINALIZADA,DESCARTADA', updatedSince: recentSince(), size: 500 })
            ]);
            tasks.value = [...open.items, ...done.items];
            if (done.total > done.items.length) archiveTruncated.value = done.total;
        }
    } catch (e: any) {
        if (!quiet) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: e.response?.data?.message ?? 'No se pudieron cargar las tareas',
                life: companyStore.companyInfo.toastDuration ?? 3000
            });
        }
    } finally {
        if (!quiet) loading.value = false;
    }
}

function canAutoRefresh(): boolean {
    if (document.hidden) return false;
    if (dragPkid.value != null) return false;
    const form: any = taskFormRef.value;
    if (form && form.visible) return false;
    return true;
}

function openNew(state?: TaskState) {
    taskFormRef.value?.open(null, state);
}

function openEdit(task: TaskDTO) {
    if (task.pkid) taskFormRef.value?.open(task.pkid);
}

function onDragStart(task: TaskDTO) {
    dragPkid.value = task.pkid;
}

function onDragEnd() {
    dragPkid.value = null;
    dropState.value = null;
    dropIndex.value = null;
}

function clearDropHints() {
    dropState.value = null;
    dropIndex.value = null;
}

function isDropHint(state: TaskState, idx: number, after: boolean): boolean {
    return dragPkid.value != null && dropState.value === state && dropIndex.value === idx && dropAfter.value === after;
}

function onCardOver(e: DragEvent, state: TaskState, idx: number) {
    if (dragPkid.value == null) return;
    const el = e.currentTarget as HTMLElement | null;
    const rect = el?.getBoundingClientRect();
    dropAfter.value = !!rect && e.clientY > rect.top + rect.height / 2;
    dropState.value = state;
    dropIndex.value = idx;
}

async function onCardDrop(state: TaskState, idx: number) {
    const pkid = dragPkid.value;
    clearDropHints();
    if (pkid == null) return;
    const task = tasks.value.find((t) => t.pkid === pkid);
    dragPkid.value = null;
    if (!task) return;

    if (state === 'DESCARTADA' && task.state !== 'DESCARTADA') {
        askDiscard(task);
        return;
    }

    if (isLockedState(task)) {
        lockedToast(task);
        return;
    }

    const fromState = task.state;
    const target = tasksByState(state).filter((t) => t.pkid !== pkid);
    let insert = idx + (dropAfter.value ? 1 : 0);
    const current = tasksByState(state);
    const fromIdx = current.findIndex((t) => t.pkid === pkid);
    if (fromState === state && fromIdx !== -1 && fromIdx < idx) insert--;
    insert = Math.max(0, Math.min(insert, target.length));

    if (fromState === state) {
        const idsBefore = current.map((t) => t.pkid);
        const idsAfter = [...target.slice(0, insert), pkid, ...target.slice(insert)];
        if (idsBefore.length === idsAfter.length && idsBefore.every((id, i) => id === idsAfter[i])) return;
    }

    await moveTaskTo(task, fromState, state, target, insert);
}

async function onDrop(state: TaskState) {
    const pkid = dragPkid.value;
    clearDropHints();
    if (pkid == null) return;
    const task = tasks.value.find((t) => t.pkid === pkid);
    dragPkid.value = null;
    if (!task) return;

    if (state === 'DESCARTADA' && task.state !== 'DESCARTADA') {
        askDiscard(task);
        return;
    }

    if (isLockedState(task)) {
        lockedToast(task);
        return;
    }

    const fromState = task.state;
    const target = tasksByState(state).filter((t) => t.pkid !== pkid);
    if (fromState === state && target.length === tasksByState(state).length - 1
        && tasksByState(state)[tasksByState(state).length - 1]?.pkid === pkid) return;

    await moveTaskTo(task, fromState, state, target, target.length);
}

async function moveTaskTo(task: TaskDTO, fromState: TaskState, toState: TaskState, target: TaskDTO[], insert: number) {
    const previousState = task.state;
    const ordered = [...target];
    ordered.splice(insert, 0, task);
    task.state = toState;
    if (toState !== 'DESCARTADA') task.discardReason = '';

    const states = [...new Set([fromState, toState])];
    const order: { pkid: number | null; state: string; position: number }[] = [];
    for (const s of states) {
        const list = s === toState ? ordered : tasksByState(s);
        list.forEach((t, i) => {
            t.position = (i + 1) * 1024;
            order.push({ pkid: t.pkid, state: s, position: (i + 1) * 1024 });
        });
    }

    try {
        await saveTaskOrder(order, currentUserPkid.value);
        if (fromState !== toState) {
            toast.add({
                severity: 'success',
                summary: `Tarea movida a ${labelOf(toState)}`,
                life: companyStore.companyInfo.toastDuration ?? 3000
            });
        }
    } catch (e: any) {
        task.state = previousState;
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: e.response?.data?.message ?? 'No se pudo mover la tarea',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
        void load();
    }
}

function labelOf(state: TaskState): string {
    return TASK_STATES.find((s) => s.value === state)?.label ?? state;
}

function isLockedState(task: TaskDTO): boolean {
    return task.billingState === 'FACTURADA' || task.billingState === 'PARCIAL';
}

function lockedToast(task: TaskDTO) {
    toast.add({
        severity: 'warn',
        summary: 'Tarea bloqueada',
        detail: `${task.code} tiene factura vinculada y no se puede mover`,
        life: companyStore.companyInfo.toastDuration ?? 3000
    });
}

function askDiscard(task: TaskDTO) {
    confirm.require({
        message: `¿Descartar la tarea "${task.name}"? Podrás indicar el motivo en la ficha.`,
        header: 'Descartar tarea',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Descartar',
        rejectLabel: 'Cancelar',
        accept: () => openEdit(task),
        reject: () => void load()
    });
}

async function discardNow(task: TaskDTO) {
    if (!task.pkid) return;
    try {
        await deleteTask(task.pkid);
        await load();
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: e.response?.data?.message ?? 'No se pudo descartar',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
}

function onFilterEntitie(customer: any) {
    filterEntitieLabel.value = customer?.name ?? '';
    void load();
}

function onFilterEntitieInput(value: number | null) {
    if (value == null && filterEntitie.value == null) {
        filterEntitieLabel.value = '';
        void load();
    }
}

const userPhotoUrl = (userPkid: number) => backendUrl(`/gestdoc/users/${userPkid}/photoPerfil.jpg`);
const onPhotoError = (userPkid: number) => {
    photoErrors.value[userPkid] = true;
};
const initials = (name?: string) =>
    (name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');

function clearFilters() {
    query.value = '';
    filterState.value = null;
    filterUser.value = null;
    filterEntitie.value = null;
    filterEntitieLabel.value = '';
    filterPriority.value = null;
    mineOnly.value = false;
    overdueOnly.value = false;
    archiveMode.value = false;
    void load();
}

function askNotifyOverdue() {
    const overdue = tasks.value.filter((t) => t.overdue);
    if (!overdue.length) {
        toast.add({
            severity: 'info',
            summary: 'Sin vencidas',
            detail: 'No hay tareas vencidas en la vista actual',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
        return;
    }
    const people = [...new Set(overdue.map((t) => t.userName || t.contactName || '—'))];
    confirm.require({
        header: 'Avisar tareas vencidas',
        message: `Hay ${overdue.length} vencida${overdue.length === 1 ? '' : 's'} en la vista actual (${people.slice(0, 5).join(', ')}${people.length > 5 ? '…' : ''}). Se enviará un aviso a la campana de cada responsable. No se contacta con el cliente.`,
        icon: 'pi pi-bell',
        acceptLabel: 'Enviar avisos',
        rejectLabel: 'Volver',
        accept: () => void notifyOverdue()
    });
}

async function notifyOverdue() {
    notifying.value = true;
    try {
        const target = filterUser.value ?? (mineOnly.value ? currentUserPkid.value : null);
        const res = await notifyOverdueApi(target);
        toast.add({
            severity: 'success',
            summary: res.notified ? `Avisadas ${res.notified} de ${res.overdue} vencidas` : 'Sin avisos nuevos (ya notificadas hoy)',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: e.response?.data?.message ?? 'No se pudieron enviar los avisos',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } finally {
        notifying.value = false;
    }
}

async function exportExcel() {
    exporting.value = true;
    try {
        const n = await exportTaskTimesToExcel(
            tasks.value,
            companyStore.companyInfo.nameCompany,
            requesterPkid.value
        );
        toast.add({
            severity: 'success',
            summary: `Excel generado con ${n} filas`,
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } catch {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo generar el Excel',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } finally {
        exporting.value = false;
    }
}

async function loadUsers() {
    try {
        const users = await getUsers();
        userOptions.value = users.map((u: any) => ({
            label: u.userDsName || u.name || u.userDsCode || `Usuario ${u.pkid ?? u.userKyId}`,
            value: Number(u.pkid ?? u.userKyId ?? u.id)
        })).filter((o) => !isNaN(o.value));
    } catch {
        userOptions.value = [];
    }
}

function prefsSnapshot(): TaskBoardPrefs {
    return {
        query: query.value,
        filterState: filterState.value,
        filterUser: filterUser.value,
        filterEntitie: filterEntitie.value,
        filterEntitieLabel: filterEntitieLabel.value,
        filterPriority: filterPriority.value,
        mineOnly: mineOnly.value,
        overdueOnly: overdueOnly.value,
        archiveMode: archiveMode.value,
        view: view.value
    };
}

function applyPrefs(p: TaskBoardPrefs | null) {
    if (!p) return;
    query.value = p.query ?? '';
    filterState.value = p.filterState ?? null;
    filterUser.value = p.filterUser ?? null;
    filterEntitie.value = p.filterEntitie ?? null;
    filterEntitieLabel.value = p.filterEntitieLabel ?? '';
    filterPriority.value = p.filterPriority ?? null;
    mineOnly.value = !!p.mineOnly;
    overdueOnly.value = !!p.overdueOnly;
    archiveMode.value = !!p.archiveMode;
    if (p.view === 'kanban' || p.view === 'gantt') view.value = p.view;
}

let prefsTimer: ReturnType<typeof setTimeout> | undefined;
watch(
    [query, filterState, filterUser, filterEntitie, filterEntitieLabel, filterPriority, mineOnly, overdueOnly, archiveMode, view],
    () => {
        clearTimeout(prefsTimer);
        prefsTimer = setTimeout(() => void saveTaskBoardPrefs(prefsSnapshot()), 600);
    }
);

onMounted(async () => {
    void loadUsers();
    applyPrefs(await loadTaskBoardPrefs());
    void load();
    autoTimer = window.setInterval(() => {
        if (canAutoRefresh()) void load(true);
    }, 45000);
    window.addEventListener('focus', onWindowFocus);
});

onUnmounted(() => {
    if (autoTimer != null) {
        window.clearInterval(autoTimer);
        autoTimer = null;
    }
    window.removeEventListener('focus', onWindowFocus);
});

function onWindowFocus() {
    if (canAutoRefresh()) void load(true);
}

// Refresca el tablero cuando llegan avisos nuevos, salvo arrastre o ficha abierta.
watch(
    () => messagesStore.feedVersion,
    () => {
        if (canAutoRefresh()) void load(true);
    }
);
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
.task-icon {
    background: linear-gradient(135deg, #9cc10a, #648506);
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
.toolbar-tools {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}
.new-document {
    background: var(--kiwi);
    border-color: var(--kiwi);
    color: #253000;
}
.new-document:hover {
    background: #8bad09;
    border-color: #8bad09;
}
.task-filters {
    margin-top: 10px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.7rem;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    padding: 0.8rem 1rem;
}
.task-filter {
    min-width: 200px;
}
.task-filter-sm {
    min-width: 150px;
}
.task-filter-customer {
    min-width: 260px;
    flex: 1;
}
.archive-hint {
    color: #9aa0ad;
    font-size: 0.72rem;
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
.kanban-board {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.8rem;
}
.kanban-column {
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    padding: 0.7rem;
    min-height: 320px;
    transition: border-color 0.15s, box-shadow 0.15s;
}
.kanban-column.drop-target {
    border-color: var(--kiwi);
    box-shadow: 0 0 0 2px rgba(156, 193, 10, 0.35);
}
.kanban-column-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.2rem 0.2rem 0.6rem;
}
.kanban-count {
    font-weight: 800;
    color: #687386;
    font-size: 0.85rem;
}
.kanban-cards {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    min-height: 120px;
    max-height: calc(100vh - 430px);
    overflow-y: auto;
    padding-right: 2px;
    scrollbar-width: thin;
}
.kanban-card {
    border: 1px solid #e7eadf;
    border-radius: 10px;
    background: #fbfcfa;
    padding: 0.7rem;
    cursor: grab;
}
.kanban-card:hover {
    border-color: var(--kiwi);
}
.kanban-card.dragging {
    opacity: 0.5;
}
.kanban-card.drop-before {
    box-shadow: 0 -3px 0 0 var(--kiwi);
}
.kanban-card.drop-after {
    box-shadow: 0 3px 0 0 var(--kiwi);
}
.kanban-card.overdue {
    border-color: #e57373;
    background: #fff7f7;
}
.kanban-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.35rem;
}
.kanban-due {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #687386;
    font-weight: 700;
}
.kanban-due.late {
    color: #c53030;
}
.kanban-card h3 {
    margin: 0.3rem 0;
    font-size: 0.95rem;
    color: #303b32;
}
.kanban-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.entity-code {
    font-size: 0.78rem;
    color: #687386;
    font-weight: 700;
}
.code-with-attachments {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
}
.kanban-hours {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #648506;
    font-weight: 700;
}
.kanban-client,
.kanban-user {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0.15rem 0;
    font-size: 0.78rem;
    color: #687386;
}
.kanban-avatar {
    width: 22px;
    height: 22px;
    font-size: 0.6rem;
    font-weight: 800;
    background: #eef4d8;
    color: #648506;
    flex: 0 0 auto;
}
.kanban-avatar.contact {
    background: #eef1f5;
    color: #667085;
}
.kanban-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.kanban-creator {
    margin: 0.1rem 0 0;
    font-size: 0.7rem;
    color: #9aa0ad;
}
.kanban-card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.2rem;
    margin-top: 0.3rem;
}
.kanban-lock {
    color: #b7791f;
    font-size: 0.75rem;
}
.kanban-progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.45rem;
}
.kanban-progress :deep(.p-progressbar) {
    flex: 1;
    height: 14px;
}
.kanban-progress span {
    font-size: 0.72rem;
    font-weight: 800;
    color: #648506;
    min-width: 34px;
    text-align: right;
}
.kanban-empty {
    border: 1px dashed #dfe4ea;
    border-radius: 10px;
    padding: 1.2rem 0.8rem;
    text-align: center;
    color: #899184;
    font-size: 0.8rem;
}
@media (max-width: 1100px) {
    .kanban-board {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 640px) {
    .kanban-board {
        grid-template-columns: 1fr;
    }
}
</style>
