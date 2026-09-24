<template>
    <main class="entities-page">
        <header class="entities-header">
            <div class="entities-title">
                <div class="entities-icon task-icon"><i class="pi pi-clipboard"></i></div>
                <div>
                    <span class="breadcrumb">Portal / Tareas</span>
                    <h1>Tareas</h1>
                    <p>Tablero Kanban de tus tareas asignadas: pulsa una tarjeta para ver el detalle y comentar.</p>
                </div>
            </div>
        </header>

        <section class="entities-workspace">
            <Toolbar class="entities-toolbar">
                <template #start>
                    <div class="workspace-heading">
                        <span>{{ view === 'kanban' ? 'Tablero Kanban' : 'Diagrama Gantt' }}</span>
                        <small v-if="view === 'kanban'">Arrastra tus tareas entre columnas para cambiar su estado. Pulsa una tarjeta para ver el detalle.</small>
                        <small v-else>Consulta la planificación y pulsa una tarea para ver el detalle.</small>
                    </div>
                </template>
                <template #end>
                    <div class="toolbar-tools">
                        <IconField>
                            <InputIcon class="pi pi-search" />
                            <InputText ref="searchInput" v-model="query" placeholder="Buscar tareas..." class="w-full" />
                        </IconField>
                        <Button icon="pi pi-th-large" :severity="view === 'kanban' ? 'success' : 'secondary'"
                            :text="view !== 'kanban'" rounded title="Vista Kanban" aria-label="Vista Kanban"
                            :aria-pressed="view === 'kanban'" @click="view = 'kanban'" />
                        <Button icon="pi pi-chart-bar" :severity="view === 'gantt' ? 'success' : 'secondary'"
                            :text="view !== 'gantt'" rounded title="Vista Gantt" aria-label="Vista Gantt"
                            :aria-pressed="view === 'gantt'" @click="view = 'gantt'" />
                        <Button icon="pi pi-file-excel" text rounded title="Exportar tareas filtradas a Excel"
                            aria-label="Exportar tareas filtradas a Excel" :loading="exporting"
                            :disabled="loading || !visibleTasks.length" @click="exportExcel" />
                        <Button icon="pi pi-refresh" text rounded title="Refrescar" aria-label="Refrescar" :loading="loading"
                            @click="emit('reload')" />
                        <Button class="new-document" label="Nueva tarea" icon="pi pi-plus" size="small"
                            @click="showCreate = true" />
                    </div>
                </template>
            </Toolbar>

            <div class="task-filters">
                <div class="task-filter">
                    <FloatLabel variant="on" class="w-full">
                        <Select v-model="filterState" :options="stateOptions" optionLabel="label"
                            optionValue="value" class="w-full" showClear />
                        <label>Estado</label>
                    </FloatLabel>
                </div>
                <div class="task-filter task-filter-sm">
                    <FloatLabel variant="on" class="w-full">
                        <Select v-model="filterPriority" :options="priorityOptions" optionLabel="label"
                            optionValue="value" class="w-full" showClear />
                        <label>Prioridad</label>
                    </FloatLabel>
                </div>
                <Button icon="pi pi-bell" label="Vencidas" :severity="overdueOnly ? 'success' : 'secondary'"
                    :text="!overdueOnly" size="small" title="Solo vencidas" @click="overdueOnly = !overdueOnly" />
                <Button icon="pi pi-box" label="Archivo" :severity="archiveMode ? 'success' : 'secondary'"
                    :text="!archiveMode" size="small" title="Incluir todas las terminadas"
                    @click="archiveMode = !archiveMode" />
                <Button v-if="hasFilters" icon="pi pi-filter-slash" label="Limpiar" severity="secondary" text
                    size="small" @click="clearFilters" />
                <Tag v-if="hasFilters" :value="`${visibleTasks.length} coincidencia${visibleTasks.length === 1 ? '' : 's'}`"
                    severity="info" rounded />
                <small v-if="!archiveMode" class="archive-hint">Hechas/descartadas recientes ({{ ARCHIVE_DAYS }} días)</small>
                <span v-if="hasPrivate" class="private-legend"><i></i>Entre contactos</span>
            </div>

            <div v-if="loading" class="kanban-loading">
                <CorporateLoader label="Cargando tareas…" />
            </div>

            <Frm_TaskGantt v-else-if="view === 'gantt'" :tasks="visibleTasks" @edit="openTask" />

            <div v-else class="kanban-board">
                <section v-for="col in columns" :key="col.value" class="kanban-column"
                    :class="{ 'drop-target': dropState === col.value }" @dragover.prevent="dropState = col.value"
                    @dragleave="dropState = null" @drop="onDrop(col.value)">
                    <header class="kanban-column-header">
                        <Tag :value="col.label" :severity="col.severity" rounded />
                        <span class="kanban-count">{{ tasksByState(col.value).length }}</span>
                    </header>

                    <div class="kanban-cards">
                        <article v-for="task in tasksByState(col.value)" :key="task.pkid ?? task.code"
                            class="kanban-card"
                            :class="{ private: isPrivateTask(task), overdue: task.overdue, dragging: dragPkid === task.pkid, 'not-mine': !canDrag(task) }"
                            :draggable="canDrag(task)" @dragstart="onDragStart(task)" @dragend="onDragEnd"
                            @click="openTask(task)">
                            <div class="kanban-card-top">
                                <span class="code-with-attachments"><span class="entity-code">{{ task.code || 'Sin código' }}</span><Tag
                                    v-if="Number(task.attachmentCount || 0) > 0" :value="String(task.attachmentCount)"
                                    icon="pi pi-paperclip" severity="info" rounded title="Documentos adjuntos" /><i
                                    v-if="isLockedTask(task)" class="pi pi-lock kanban-lock" title="Con factura vinculada" /></span>
                                <Tag :value="priorityOf(task).label" :severity="priorityOf(task).severity" rounded />
                            </div>
                            <h3>{{ task.name }}</h3>
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
                        </article>

                        <div v-if="!tasksByState(col.value).length" class="kanban-empty">
                            Sin tareas en esta columna.
                        </div>
                    </div>
                </section>
            </div>
        </section>

        <Dialog v-model:visible="showDetail" modal class="kiwik-dialog" :header="selected?.code || 'Tarea'"
            :style="{ width: 'min(720px, 95vw)' }">
            <div v-if="selected" class="task-detail">
                <h3>{{ selected.name }}</h3>
                <p class="task-desc">{{ selected.memo || 'Sin descripción.' }}</p>
                <div class="task-detail-meta">
                    <Tag :value="columnLabel(selected.state)" :severity="columnSeverity(selected.state)" rounded />
                    <Tag :value="priorityOf(selected).label" :severity="priorityOf(selected).severity" rounded />
                    <span v-if="selected.dueDate">Vence: {{ formatTaskDate(selected.dueDate) }}</span>
                    <span>{{ Math.round(Number(selected.progress ?? 0)) }} % hecho</span>
                </div>
                <div v-if="isAuthor && !isLocked" class="task-state-row">
                    <label for="portal-task-state">Estado</label>
                    <Select id="portal-task-state" v-model="stateDraft" :options="stateOptions" optionLabel="label"
                        optionValue="value" size="small" :loading="changingState" @change="changeState" />
                </div>
                <p v-else-if="isAuthor && isLocked" class="task-locked">
                    <i class="pi pi-lock"></i> Con factura vinculada: el estado no se puede cambiar.
                </p>

                <Panel class="detail-panel">
                    <template #header>
                        <div class="detail-panel-head">
                            <span class="detail-panel-icon"><i class="pi pi-comments"></i></span>
                            <span class="font-bold">Comentarios</span>
                            <Tag :value="`${comments.length}`" severity="info" rounded />
                        </div>
                    </template>
                    <div ref="threadRef" class="thread" aria-live="polite">
                        <p v-if="!comments.length" class="thread-empty">Sin comentarios. Escribe el primero abajo.</p>
                        <article v-for="(c, i) in comments" :key="c.pkid ?? `n${i}`" class="bubble"
                            :class="c.userPkid == null ? 'bubble-other' : 'bubble-user'">
                            <span class="bubble-author">{{ c.userName || 'Usuario' }}</span>
                            <p>{{ c.text }}</p>
                            <span class="bubble-time">{{ fmtTime(c.createdAt) }}</span>
                        </article>
                    </div>
                    <div class="chat-input">
                        <Textarea v-model="newComment" rows="2" maxlength="2000" autoResize class="w-full"
                            placeholder="Escribe un comentario… (Enter para enviar)"
                            @keydown.enter.exact.prevent="sendComment" />
                        <div class="chat-actions">
                            <small>Enter envía · Mayús+Enter salto de línea</small>
                            <Button label="Enviar" icon="pi pi-send" size="small"
                                :disabled="!newComment.trim() || sendingComment" :loading="sendingComment"
                                @click="sendComment" />
                        </div>
                    </div>
                </Panel>

                <Panel class="detail-panel">
                    <template #header>
                        <div class="detail-panel-head">
                            <span class="detail-panel-icon"><i class="pi pi-paperclip"></i></span>
                            <span class="font-bold">Documentación</span>
                            <Tag :value="`${docs.length}`" severity="info" rounded />
                        </div>
                    </template>
                    <p class="doc-hint">PDF, imágenes, Excel, Word… se guardan en el repositorio documental de la tarea.</p>
                    <div v-if="docsLoading" class="docs-loading">Cargando documentos…</div>
                    <ul v-else-if="docs.length" class="doc-list">
                        <li v-for="d in docs" :key="d.name">
                            <i class="pi pi-file doc-file-icon"></i>
                            <span class="doc-name">{{ d.name }}</span>
                            <small class="doc-size">{{ fmtSize(d.size) }}</small>
                            <Button icon="pi pi-download" text rounded size="small" title="Descargar"
                                :loading="downloading === d.name" @click="downloadDoc(d)" />
                            <Button icon="pi pi-trash" text rounded size="small" severity="danger" title="Eliminar"
                                :loading="deleting === d.name" @click="askDeleteDoc(d)" />
                        </li>
                    </ul>
                    <p v-else class="thread-empty">Sin documentos. Anexa el primero abajo.</p>
                    <div class="doc-upload">
                        <input ref="fileInput" type="file" multiple
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.doc,.docx" class="hidden-file"
                            @change="onFilesPicked" />
                        <Button label="Anexar documentos" icon="pi pi-folder-open" size="small"
                            :loading="uploading" @click="fileInput?.click()" />
                        <small>PDF, imágenes, Excel, Word · máx. 15 MB por archivo</small>
                    </div>
                </Panel>
            </div>
            <ConfirmDialog />
        </Dialog>

        <Dialog v-model:visible="showCreate" modal class="kiwik-dialog" header="Nueva tarea"
            :style="{ width: 'min(560px, 95vw)' }">
            <div class="grid p-fluid">
                <div class="col-12">
                    <FloatLabel variant="on" class="w-full">
                        <InputText id="portal-new-name" v-model="newName" maxlength="120" class="w-full" />
                        <label for="portal-new-name">Título *</label>
                    </FloatLabel>
                </div>
                <div class="col-12">
                    <FloatLabel variant="on" class="w-full">
                        <Textarea id="portal-new-desc" v-model="newDesc" rows="4" autoResize class="w-full" />
                        <label for="portal-new-desc">Descripción</label>
                    </FloatLabel>
                </div>
                <div class="col-12">
                    <FloatLabel variant="on" class="w-full">
                        <Select id="portal-new-kind" v-model="assigneeType" :options="assigneeOptions" optionLabel="label"
                            optionValue="value" class="w-full" @change="onAssigneeTypeChange" />
                        <label for="portal-new-kind">Asignar a *</label>
                    </FloatLabel>
                </div>
                <div v-if="assigneeType === 'user'" class="col-12">
                    <FloatLabel variant="on" class="w-full">
                        <Select id="portal-new-user" v-model="newUser" :options="userOptions" optionLabel="label"
                            optionValue="value" class="w-full" filter />
                        <label for="portal-new-user">Usuario interno *</label>
                    </FloatLabel>
                </div>
                <div v-else class="col-12">
                    <FloatLabel variant="on" class="w-full">
                        <Select id="portal-new-contact" v-model="newContact" :options="contactOptions" optionLabel="label"
                            optionValue="value" class="w-full" filter :loading="loadingContacts" />
                        <label for="portal-new-contact">Contacto de tu empresa *</label>
                    </FloatLabel>
                </div>
            </div>
            <template #footer>
                <Button label="Crear tarea" icon="pi pi-check" :loading="creating" :disabled="!canCreate"
                    @click="createTask" />
            </template>
        </Dialog>
    </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import CorporateLoader from '@/components/shared/CorporateLoader.vue';
import Dialog from 'primevue/dialog';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Panel from 'primevue/panel';
import ProgressBar from 'primevue/progressbar';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';
import { backendUrl } from '@/services/backendUrl';
import {
    portalChangeTaskState,
    portalComments,
    portalCreateTask,
    portalDeleteTaskDocument,
    portalDownloadTaskDocument,
    portalEntitieContacts,
    portalSendComment,
    portalTask,
    portalTaskDocuments,
    portalUploadTaskDocuments,
    type PortalDoc
} from '@/services/Tasks/portalService';
import { getUsers } from '@/services/Tasks/taskService';
import Frm_TaskGantt from '@/views/Tasks/Frm_TaskGantt.vue';
import { exportPortalTasksToExcel } from '@/services/Tasks/portalTaskExport';
import {
    TASK_PRIORITIES,
    TASK_STATES,
    formatTaskDate,
    priorityOf,
    type TaskCommentDTO,
    type TaskDTO,
    type TaskState
} from '@/services/Tasks/taskService';

const props = defineProps<{
    token: string;
    contactPkid: number;
    tasks: TaskDTO[];
    loading: boolean;
}>();

const emit = defineEmits<{
    reload: [];
}>();

const toast = useToast();
const confirm = useConfirm();

const query = ref('');
const view = ref<'kanban' | 'gantt'>('kanban');
const exporting = ref(false);
const searchInput = ref<InstanceType<typeof InputText> | null>(null);
const filterState = ref<string | null>(null);
const filterPriority = ref<string | null>(null);
const overdueOnly = ref(false);
const archiveMode = ref(false);
const ARCHIVE_DAYS = 60;
const showDetail = ref(false);
const selected = ref<TaskDTO | null>(null);
const comments = ref<TaskCommentDTO[]>([]);
const newComment = ref('');
const sendingComment = ref(false);
const threadRef = ref<HTMLElement | null>(null);
const showCreate = ref(false);
const newName = ref('');
const newDesc = ref('');
const newUser = ref<number | null>(null);
const newContact = ref<number | null>(null);
const assigneeType = ref<'user' | 'contact'>('user');
const assigneeOptions = [
    { label: 'Usuario interno', value: 'user' },
    { label: 'Contacto de mi empresa', value: 'contact' }
];
const creating = ref(false);
const userOptions = ref<{ label: string; value: number }[]>([]);
const contactOptions = ref<{ label: string; value: number }[]>([]);
const loadingContacts = ref(false);

const canCreate = computed(() =>
    !!newName.value.trim() && (assigneeType.value === 'user' ? newUser.value != null : newContact.value != null)
);

function onAssigneeTypeChange() {
    newUser.value = null;
    newContact.value = null;
}

async function loadContacts() {
    loadingContacts.value = true;
    try {
        const list = await portalEntitieContacts(props.token);
        contactOptions.value = list.map((c) => ({ label: c.name || `Contacto ${c.pkid}`, value: Number(c.pkid) }));
    } catch {
        contactOptions.value = [];
    } finally {
        loadingContacts.value = false;
    }
}
const docs = ref<PortalDoc[]>([]);
const docsLoading = ref(false);
const uploading = ref(false);
const downloading = ref<string | null>(null);
const deleting = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const columns = computed(() => TASK_STATES);
const stateOptions = computed(() => TASK_STATES.map((s) => ({ label: s.label, value: s.value })));
const priorityOptions = computed(() => TASK_PRIORITIES.map((p) => ({ label: p.label, value: p.value })));

const isAuthor = computed(() =>
    selected.value != null && selected.value.contactAuthorPkid != null
    && selected.value.contactAuthorPkid === props.contactPkid
);
const isLocked = computed(() =>
    selected.value != null && (selected.value.billingState === 'FACTURADA' || selected.value.billingState === 'PARCIAL')
);
const stateDraft = ref<string | null>(null);
const changingState = ref(false);

async function changeState() {
    if (!selected.value?.pkid || !stateDraft.value || changingState.value) return;
    if (stateDraft.value === selected.value.state) return;
    changingState.value = true;
    try {
        const saved = await portalChangeTaskState(props.token, selected.value.pkid, stateDraft.value);
        selected.value = saved;
        stateDraft.value = saved.state;
        toast.add({ severity: 'success', summary: `Tarea movida a ${columnLabel(saved.state)}`, life: 3000 });
        emit('reload');
    } catch (e: any) {
        stateDraft.value = selected.value.state;
        const status = e.response?.status;
        toast.add({
            severity: 'error',
            summary: status === 403 ? 'Sin permiso' : 'No se pudo mover',
            detail: e.response?.data?.message ?? 'No se pudo cambiar el estado',
            life: 4000
        });
    } finally {
        changingState.value = false;
    }
}

const hasFilters = computed(() =>
    !!query.value || !!filterState.value || !!filterPriority.value || overdueOnly.value || archiveMode.value
);

const hasPrivate = computed(() => visibleTasks.value.some((t) => isPrivateTask(t)));

const visibleTasks = computed(() => {
    const q = query.value.trim().toLowerCase();
    const since = new Date();
    since.setDate(since.getDate() - ARCHIVE_DAYS);
    since.setHours(0, 0, 0, 0);
    return props.tasks.filter((t) => {
        // Kanban, Gantt y Excel comparten el ámbito personal del contacto conectado.
        const contactPkid = Number(props.contactPkid);
        if (!Number.isInteger(contactPkid) || contactPkid <= 0) return false;
        if (Number(t.contactAuthorPkid) !== contactPkid && Number(t.contactPkid) !== contactPkid) return false;
        // Igual que en el ERP, la ventana de archivo usa la última actualización, no el vencimiento.
        if (!archiveMode.value && (t.state === 'FINALIZADA' || t.state === 'DESCARTADA')) {
            const updatedAt = t.updatedAt ? new Date(t.updatedAt.replace(' ', 'T')).getTime() : NaN;
            if (!Number.isFinite(updatedAt) || updatedAt < since.getTime()) return false;
        }
        if (filterState.value && t.state !== filterState.value) return false;
        if (filterPriority.value && (t.priority ?? 'MEDIA') !== filterPriority.value) return false;
        if (overdueOnly.value && !t.overdue) return false;
        if (q && !`${t.code ?? ''} ${t.name ?? ''} ${t.userName ?? ''}`.toLowerCase().includes(q)) return false;
        return true;
    });
});

function tasksByState(state: TaskState): TaskDTO[] {
    return visibleTasks.value
        .filter((t) => t.state === state)
        .sort((a, b) => Number(a.position ?? Number.MAX_SAFE_INTEGER) - Number(b.position ?? Number.MAX_SAFE_INTEGER));
}

async function exportExcel() {
    if (exporting.value || props.loading || !visibleTasks.value.length) return;
    exporting.value = true;
    try {
        const count = await exportPortalTasksToExcel(visibleTasks.value, props.contactPkid);
        toast.add({ severity: 'success', summary: `Excel generado con ${count} tareas`, life: 3000 });
    } catch {
        toast.add({ severity: 'error', summary: 'No se pudo exportar el Excel', life: 4000 });
    } finally {
        exporting.value = false;
    }
}

function columnLabel(state: TaskState): string {
    return TASK_STATES.find((s) => s.value === state)?.label ?? state;
}

function columnSeverity(state: TaskState): string {
    return TASK_STATES.find((s) => s.value === state)?.severity ?? 'secondary';
}

function isLockedTask(t: TaskDTO): boolean {
    return t.billingState === 'FACTURADA' || t.billingState === 'PARCIAL';
}

/** Tarea entre contactos de la empresa: creada en el portal sin responsable interno. */
function isPrivateTask(t: TaskDTO): boolean {
    return t.contactAuthorPkid != null && t.userPkid == null;
}

function isAuthorTask(t: TaskDTO): boolean {
    return t.contactAuthorPkid != null && t.contactAuthorPkid === props.contactPkid;
}

function canDrag(t: TaskDTO): boolean {
    return t.pkid != null && isAuthorTask(t) && !isLockedTask(t);
}

const dragPkid = ref<number | null>(null);
const dropState = ref<TaskState | null>(null);
const movingState = ref(false);

function onDragStart(task: TaskDTO) {
    dragPkid.value = task.pkid;
}

function onDragEnd() {
    dragPkid.value = null;
    dropState.value = null;
}

function onDrop(state: TaskState) {
    const pkid = dragPkid.value;
    dragPkid.value = null;
    dropState.value = null;
    if (pkid == null || movingState.value) return;
    const task = props.tasks.find((t) => t.pkid === pkid);
    if (!task || task.state === state || !canDrag(task)) return;
    if (state === 'DESCARTADA') {
        confirm.require({
            message: `¿Descartar la tarea "${task.name}"? Solo es posible si no tiene horas ni facturación.`,
            header: 'Descartar tarea',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Descartar',
            rejectLabel: 'Cancelar',
            accept: () => void moveTaskTo(task, state)
        });
        return;
    }
    void moveTaskTo(task, state);
}

async function moveTaskTo(task: TaskDTO, state: TaskState) {
    if (task.pkid == null || movingState.value) return;
    movingState.value = true;
    try {
        const saved = await portalChangeTaskState(props.token, task.pkid, state);
        task.state = saved.state;
        if (selected.value?.pkid === task.pkid) {
            selected.value = saved;
            stateDraft.value = saved.state;
        }
        toast.add({ severity: 'success', summary: `Tarea movida a ${columnLabel(state)}`, life: 3000 });
        emit('reload');
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: e.response?.status === 403 ? 'Sin permiso' : 'No se pudo mover',
            detail: e.response?.data?.message ?? 'No se pudo cambiar el estado',
            life: 4000
        });
    } finally {
        movingState.value = false;
    }
}

function clearFilters() {
    query.value = '';
    filterState.value = null;
    filterPriority.value = null;
    overdueOnly.value = false;
    archiveMode.value = false;
}

const initials = (name?: string) =>
    (name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');

const photoErrors = ref<Record<number, boolean>>({});
const userPhotoUrl = (userPkid: number) => backendUrl(`/gestdoc/users/${userPkid}/photoPerfil.jpg`);
const onPhotoError = (userPkid: number) => {
    photoErrors.value[userPkid] = true;
};

function fmtTime(v: any): string {
    if (!v) return '';
    const d = new Date(String(v).replace(' ', 'T'));
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ' '
        + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
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

async function openTask(t: TaskDTO) {
    if (!t.pkid) return;
    try {
        selected.value = await portalTask(props.token, t.pkid);
        comments.value = await portalComments(props.token, t.pkid);
        newComment.value = '';
        stateDraft.value = selected.value.state;
        showDetail.value = true;
        void loadDocs();
        nextTick(() => {
            const el = threadRef.value;
            if (el) el.scrollTop = el.scrollHeight;
        });
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo abrir la tarea', life: 3000 });
    }
}

function fmtSize(bytes: any): string {
    const n = Number(bytes ?? 0);
    if (!n) return '—';
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

async function loadDocs() {
    if (!selected.value?.pkid) return;
    docsLoading.value = true;
    try {
        docs.value = await portalTaskDocuments(props.token, selected.value.pkid);
    } catch {
        docs.value = [];
    } finally {
        docsLoading.value = false;
    }
}

async function onFilesPicked(e: Event) {
    const input = e.target as HTMLInputElement | null;
    const files = input?.files ? Array.from(input.files) : [];
    if (!selected.value?.pkid || !files.length || uploading.value) return;
    uploading.value = true;
    try {
        docs.value = await portalUploadTaskDocuments(props.token, selected.value.pkid, files);
        if (selected.value) selected.value.attachmentCount = docs.value.length;
        toast.add({ severity: 'success', summary: 'Documentos anexados', life: 3000 });
        emit('reload');
    } catch (err: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: err.response?.data?.message ?? 'No se pudieron subir los documentos', life: 3000 });
    } finally {
        uploading.value = false;
        if (input) input.value = '';
    }
}

async function downloadDoc(d: PortalDoc) {
    if (!selected.value?.pkid || downloading.value) return;
    downloading.value = d.name;
    try {
        await portalDownloadTaskDocument(props.token, selected.value.pkid, d.name);
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento', life: 3000 });
    } finally {
        downloading.value = null;
    }
}

function askDeleteDoc(d: PortalDoc) {
    if (!selected.value?.pkid) return;
    confirm.require({
        message: `¿Eliminar el documento ${d.name}?`,
        header: 'Eliminar documento',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        accept: () => void deleteDoc(d)
    });
}

async function deleteDoc(d: PortalDoc) {
    if (!selected.value?.pkid || deleting.value) return;
    deleting.value = d.name;
    try {
        await portalDeleteTaskDocument(props.token, selected.value.pkid, d.name);
        docs.value = docs.value.filter((x) => x.name !== d.name);
        if (selected.value) selected.value.attachmentCount = docs.value.length;
        emit('reload');
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el documento', life: 3000 });
    } finally {
        deleting.value = null;
    }
}

async function sendComment() {
    const text = newComment.value.trim();
    if (!selected.value?.pkid || !text || sendingComment.value) return;
    sendingComment.value = true;
    try {
        const saved = await portalSendComment(props.token, selected.value.pkid, text);
        comments.value = [...comments.value, saved];
        newComment.value = '';
        nextTick(() => {
            const el = threadRef.value;
            if (el) el.scrollTop = el.scrollHeight;
        });
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar', life: 3000 });
    } finally {
        sendingComment.value = false;
    }
}

async function createTask() {
    const assigneeOk = assigneeType.value === 'user' ? newUser.value != null : newContact.value != null;
    if (!newName.value.trim() || !assigneeOk || creating.value) return;
    creating.value = true;
    try {
        await portalCreateTask({
            token: props.token,
            name: newName.value.trim(),
            description: newDesc.value,
            userPkid: assigneeType.value === 'user' ? newUser.value : null,
            contactPkid: assigneeType.value === 'contact' ? newContact.value : null
        });
        toast.add({ severity: 'success', summary: 'Tarea creada', life: 3000 });
        showCreate.value = false;
        newName.value = '';
        newDesc.value = '';
        newUser.value = null;
        newContact.value = null;
        emit('reload');
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message ?? 'No se pudo crear', life: 3000 });
    } finally {
        creating.value = false;
    }
}

function openCreate() {
    showCreate.value = true;
}

function openTaskByPkid(pkid: number) {
    const t = props.tasks.find((x) => x.pkid === pkid);
    if (t) void openTask(t);
}

async function refreshOpenDetail() {
    if (!showDetail.value || !selected.value?.pkid) return;
    try {
        const pkid = selected.value.pkid;
        selected.value = await portalTask(props.token, pkid);
        stateDraft.value = selected.value.state;
        comments.value = await portalComments(props.token, pkid);
    } catch {
        /* mantiene lo visible */
    }
}

function focusSearch() {
    (searchInput.value as any)?.$el?.focus?.();
}

function showOverdue() {
    query.value = '';
    filterState.value = null;
    filterPriority.value = null;
    overdueOnly.value = true;
}

defineExpose({ openCreate, openTaskByPkid, refreshOpenDetail, focusSearch, showOverdue });

onMounted(() => {
    void loadUsers();
    void loadContacts();
});
</script>

<style scoped>
.entities-page {
    --kiwi: #9cc10a;
    --kiwi-dark: #648506;
    color: #243044;
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
.archive-hint {
    color: #9aa0ad;
    font-size: 0.72rem;
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
.private-legend {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 700;
    color: #8a7a3a;
}
.private-legend i {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    border: 1px solid #e3d9b8;
    background: #fffdf3;
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
    cursor: pointer;
}
.kanban-card:not(.not-mine) {
    cursor: grab;
}
.kanban-card:hover {
    border-color: var(--kiwi);
}
.kanban-card.dragging {
    opacity: 0.5;
}
.kanban-card.private {
    border-color: #e3d9b8;
    background: #fffdf3;
}
.kanban-card.private:hover {
    border-color: var(--kiwi);
}
.kanban-card.overdue {
    border-color: #e57373;
    background: #fff7f7;
}
.kanban-lock {
    color: #b7791f;
    font-size: 0.75rem;
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
.detail-panel {
    margin-top: 20px;
}
.detail-panel-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.detail-panel-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #eef4d8;
    color: #648506;
}
.doc-hint {
    margin: 0 0 0.8rem;
    color: #687386;
    font-size: 0.85rem;
}
.docs-loading {
    color: #899184;
    font-size: 0.82rem;
    text-align: center;
    padding: 1rem 0;
}
.doc-list {
    list-style: none;
    margin: 0 0 0.8rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.doc-list li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 8px 10px;
    border: 1px solid #edf0e4;
    border-radius: 10px;
    background: #fbfcfa;
}
.doc-file-icon {
    color: #648506;
    flex: 0 0 auto;
}
.doc-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.85rem;
    font-weight: 600;
    color: #303b32;
}
.doc-size {
    color: #9aa0ad;
    font-size: 0.72rem;
    white-space: nowrap;
}
.doc-upload {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
}
.doc-upload small {
    color: #9aa0ad;
    font-size: 0.72rem;
}
.hidden-file {
    display: none;
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
.task-detail h3 {
    margin: 0 0 0.3rem;
}
.task-desc {
    color: #4b5563;
    font-size: 0.9rem;
    white-space: pre-wrap;
}
.task-detail-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.6rem;
    font-size: 0.8rem;
    color: #687386;
    margin-bottom: 0.6rem;
}
.task-state-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.6rem;
    padding: 0.6rem 0.8rem;
    border: 1px solid #e3e8d2;
    border-radius: 10px;
    background: #fbfcfa;
    font-size: 0.8rem;
}
.task-state-row label {
    font-weight: 800;
    color: #648506;
}
.task-locked {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.6rem;
    font-size: 0.78rem;
    color: #b7791f;
}
.task-detail h4 {
    margin: 0.8rem 0 0.4rem;
}
.thread {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 140px;
    max-height: 320px;
    padding: 12px 14px;
    overflow-y: auto;
    background: #fbfcfa;
    border: 1px solid #edf0e4;
    border-radius: 10px;
}
.thread-empty {
    color: #899184;
    font-size: 0.82rem;
    text-align: center;
}
.bubble {
    max-width: 88%;
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 0.85rem;
    line-height: 1.5;
}
.bubble p {
    margin: 0;
    white-space: pre-wrap;
}
.bubble-user {
    align-self: flex-end;
    color: #253000;
    background: #eef5dc;
    border-bottom-right-radius: 4px;
}
.bubble-other {
    align-self: flex-start;
    color: #243044;
    background: #f1f5f9;
    border-bottom-left-radius: 4px;
}
.bubble-author {
    display: block;
    font-size: 0.7rem;
    font-weight: 800;
    opacity: 0.7;
    margin-bottom: 2px;
}
.bubble-time {
    display: block;
    margin-top: 4px;
    font-size: 0.7rem;
    opacity: 0.65;
}
.bubble-user .bubble-time {
    text-align: right;
}
.chat-input {
    display: grid;
    gap: 8px;
    margin-top: 10px;
}
.chat-actions {
    display: flex;
    justify-content: flex-end;
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
