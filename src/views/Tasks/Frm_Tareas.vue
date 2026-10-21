<template>
    <main class="entities-page">
        <header class="entities-header">
            <div class="entities-title">
                <div class="entities-icon task-icon"><i class="pi pi-clipboard"></i></div>
                <div>
                    <span class="breadcrumb">Gestión / Tareas</span>
                    <h1>Tareas</h1>
                    <p>Planifica, consulta y organiza el trabajo mediante Kanban, Gantt o tabla.</p>
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
                        <span>{{ viewTitle }}</span>
                        <small>{{ viewHelp }}</small>
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
                        <Button icon="pi pi-table" :severity="view === 'table' ? 'success' : 'secondary'"
                            :text="view !== 'table'" rounded title="Vista tabla" @click="view = 'table'" />
                        <Button icon="pi pi-calendar" :severity="view === 'calendar' ? 'success' : 'secondary'"
                            :text="view !== 'calendar'" rounded title="Vista calendario" @click="view = 'calendar'" />
                        <Button :icon="compact ? 'pi pi-list' : 'pi pi-bars'"
                            :severity="compact ? 'success' : 'secondary'" text rounded
                            :title="compact ? 'Densidad cómoda' : 'Densidad compacta'"
                            @click="compact = !compact" />
                        <Button v-if="view === 'kanban'"
                            :icon="hideDoneColumn ? 'pi pi-eye' : 'pi pi-eye-slash'"
                            :label="hideDoneColumn ? 'Mostrar Hecho' : 'Ocultar Hecho'"
                            severity="secondary" outlined size="small"
                            :title="hideDoneColumn ? 'Volver a mostrar la columna Hecho' : 'Ocultar la columna Hecho'"
                            @click="hideDoneColumn = !hideDoneColumn" />
                        <Button v-if="view === 'kanban'"
                            :icon="hideDiscardedColumn ? 'pi pi-eye' : 'pi pi-eye-slash'"
                            :label="hideDiscardedColumn ? 'Mostrar Descartado' : 'Ocultar Descartado'"
                            severity="secondary" outlined size="small"
                            :title="hideDiscardedColumn ? 'Volver a mostrar la columna Descartado' : 'Ocultar la columna Descartado'"
                            @click="hideDiscardedColumn = !hideDiscardedColumn" />
                        <Tag v-if="runningCount" severity="warn" rounded icon="pi pi-stopwatch"
                            :value="String(runningCount)"
                            :title="`${runningCount} cronómetro${runningCount === 1 ? '' : 's'} en marcha`" />
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

            <section class="task-kpis" aria-label="Resumen de tareas">
                <article class="kpi" :class="{ clickable: true, selected: filterState === null && !overdueOnly }"
                    title="Ver todas" @click="clearFilters">
                    <i class="pi pi-clipboard kpi-icon"></i>
                    <div><strong>{{ kpis.abiertas }}</strong><span>Abiertas</span></div>
                </article>
                <article class="kpi doing" :class="{ clickable: true, selected: filterState === 'EN_CURSO' }"
                    title="Ver las que se están realizando" @click="filterState = 'EN_CURSO'; load()">
                    <i class="pi pi-hourglass kpi-icon"></i>
                    <div><strong>{{ kpis.enCurso }}</strong><span>En curso</span></div>
                </article>
                <article class="kpi overdue" :class="{ clickable: true, selected: overdueOnly }"
                    title="Ver solo vencidas" @click="overdueOnly = !overdueOnly; load()">
                    <i class="pi pi-exclamation-triangle kpi-icon"></i>
                    <div><strong>{{ kpis.vencidas }}</strong><span>Vencidas</span></div>
                </article>
                <article class="kpi unassigned" title="Tareas abiertas sin responsable">
                    <i class="pi pi-user-minus kpi-icon"></i>
                    <div><strong>{{ kpis.sinAsignar }}</strong><span>Sin asignar</span></div>
                </article>
                <article class="kpi hours" title="Horas imputadas en la vista">
                    <i class="pi pi-clock kpi-icon"></i>
                    <div><strong>{{ kpis.horas }}</strong><span>Horas imputadas</span></div>
                </article>
            </section>

            <div v-if="loading && view === 'kanban'" class="kanban-skeleton"
                :style="{ '--kanban-columns': columns.length }" aria-hidden="true">
                <section v-for="col in columns" :key="col.value" class="skeleton-column">
                    <div class="skeleton-line w40"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card"></div>
                    <div class="skeleton-card short"></div>
                </section>
            </div>

            <div v-else-if="loading" class="kanban-loading">
                <CorporateLoader label="Cargando tareas…" />
            </div>

            <Frm_TaskGantt v-else-if="view === 'gantt'" :tasks="tasks" @edit="openEdit" />

            <Frm_TaskCalendar v-else-if="view === 'calendar'" :tasks="tasks" @edit="openEdit" />

            <section v-else-if="view === 'table'" class="task-table-panel">
                <DataTable :value="tasks" dataKey="pkid" class="task-table" stripedRows removableSort
                    paginator :rows="25" :rowsPerPageOptions="[25, 50, 100]" scrollable scrollHeight="flex"
                    sortField="dueDate" :sortOrder="1" tableStyle="min-width: 1320px"
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first}–{last} de {totalRecords} tareas"
                    @row-dblclick="openEdit($event.data)">
                    <template #empty>
                        <div class="table-empty"><i class="pi pi-inbox"></i><strong>Sin tareas</strong><span>No hay resultados para los filtros seleccionados.</span></div>
                    </template>
                    <Column field="code" header="Código" sortable frozen style="width: 115px">
                        <template #body="{ data }"><span class="table-code">{{ data.code || '—' }}</span></template>
                    </Column>
                    <Column field="type" header="Tipo" sortable style="width: 125px">
                        <template #body="{ data }"><Tag :value="typeOf(data).label" :severity="typeOf(data).severity"
                            rounded /></template>
                    </Column>
                    <Column field="name" header="Tarea" sortable style="min-width: 245px">
                        <template #body="{ data }">
                            <button type="button" class="task-name-cell" @click="openEdit(data)">
                                <strong>{{ data.name }}</strong>
                                <small v-if="data.contactName"><i class="pi pi-user"></i>{{ data.contactName }}</small>
                            </button>
                        </template>
                    </Column>
                    <Column field="entitieName" header="Empresa" sortable style="min-width: 185px">
                        <template #body="{ data }"><span class="company-cell"><i class="pi pi-building"></i>{{ data.entitieName || '—' }}</span></template>
                    </Column>
                    <Column field="userName" header="Asignada a" sortable style="min-width: 170px">
                        <template #body="{ data }">
                            <span v-if="data.userName" class="assignee-cell">
                                <Avatar shape="circle" class="kanban-avatar">
                                    <img v-if="data.userPkid && !photoErrors[data.userPkid]" :src="userPhotoUrl(data.userPkid)"
                                        :alt="data.userName" @error="onPhotoError(data.userPkid)" />
                                    <span v-else>{{ initials(data.userName) }}</span>
                                </Avatar>{{ data.userName }}
                            </span><span v-else>—</span>
                        </template>
                    </Column>
                    <Column field="state" header="Estado" sortable style="width: 145px">
                        <template #body="{ data }"><Tag :value="stateOf(data.state).label" :severity="stateOf(data.state).severity" rounded /></template>
                    </Column>
                    <Column field="priority" header="Prioridad" sortable style="width: 120px">
                        <template #body="{ data }"><Tag :value="priorityOf(data).label" :severity="priorityOf(data).severity" rounded /></template>
                    </Column>
                    <Column field="startDate" header="Inicio" sortable style="width: 118px">
                        <template #body="{ data }">{{ data.startDate ? formatTaskDate(data.startDate) : '—' }}</template>
                    </Column>
                    <Column field="dueDate" header="Vencimiento" sortable style="width: 135px">
                        <template #body="{ data }"><span class="due-cell" :class="{ late: data.overdue }"><i class="pi pi-calendar"></i>{{ data.dueDate ? formatTaskDate(data.dueDate) : '—' }}</span></template>
                    </Column>
                    <Column field="estimatedHours" header="Previstas" sortable headerClass="numeric-head" bodyClass="numeric-cell" style="width: 105px">
                        <template #body="{ data }">{{ numberHours(data.estimatedHours) }}</template>
                    </Column>
                    <Column field="totalHours" header="Registradas" sortable headerClass="numeric-head" bodyClass="numeric-cell" style="width: 115px">
                        <template #body="{ data }">{{ numberHours(data.totalHours) }}</template>
                    </Column>
                    <Column field="progress" header="Progreso" sortable style="width: 145px">
                        <template #body="{ data }"><div class="table-progress"><ProgressBar :value="Math.round(Number(data.progress || 0))" /><span>{{ Math.round(Number(data.progress || 0)) }}%</span></div></template>
                    </Column>
                    <Column field="billingState" header="Facturación" sortable style="width: 145px">
                        <template #body="{ data }"><Tag :value="billingLabel(data)" :severity="billingSeverity(data)" rounded /></template>
                    </Column>
                    <Column field="attachmentCount" header="Docs." sortable headerClass="center-head" bodyClass="center-cell" style="width: 82px">
                        <template #body="{ data }"><span v-if="Number(data.attachmentCount || 0)" class="attachment-cell"><i class="pi pi-paperclip"></i>{{ data.attachmentCount }}</span><span v-else>—</span></template>
                    </Column>
                    <Column header="Acciones" frozen alignFrozen="right" style="width: 94px">
                        <template #body="{ data }"><div class="table-actions"><Button icon="pi pi-pencil" text rounded size="small" title="Abrir tarea" @click="openEdit(data)" /><Button v-if="securityStore.hasPermission(PERM.TASK_DELETE)" icon="pi pi-trash" text rounded size="small" severity="danger" title="Descartar" :disabled="data.state === 'DESCARTADA'" @click="askDiscard(data)" /></div></template>
                    </Column>
                </DataTable>
            </section>

            <div v-else class="kanban-board" :class="{ compact }"
                :style="{ '--kanban-columns': columns.length }">
                <section v-for="col in columns" :key="col.value" class="kanban-column"
                    :class="{ 'drop-target': dropState === col.value }" @dragover.prevent="dropState = col.value"
                    @dragleave="dropState = null" @drop="onDrop(col.value)">
                    <header class="kanban-column-header">
                        <Tag :value="col.label" :severity="col.severity" rounded />
                        <span class="kanban-count">{{ tasksByState(col.value).length }}</span>
                        <span v-if="columnHours(col.value) > 0" class="kanban-hours-total"
                            :title="`${columnHours(col.value)} h imputadas`">
                            <i class="pi pi-clock"></i>{{ columnHours(col.value) }}h
                        </span>
                        <Button icon="pi pi-plus" text rounded size="small" title="Nueva en esta columna"
                            @click="openNew(col.value)" />
                    </header>

                    <div class="kanban-cards">
                        <article v-for="(task, idx) in tasksByState(col.value)" :key="task.pkid ?? task.code" class="kanban-card"
                            :class="[{ overdue: task.overdue, dragging: dragPkid === task.pkid, unassigned: isUnassigned(task), timing: isTimerRunning(task.pkid), 'drop-before': isDropHint(col.value, idx, false), 'drop-after': isDropHint(col.value, idx, true) }, 'prio-' + (task.priority || 'MEDIA')]"
                            :draggable="!isLockedState(task)" @dragstart="onDragStart(task)" @dragend="onDragEnd"
                            @dragover.prevent="onCardOver($event, col.value, idx)" @drop.stop="onCardDrop(col.value, idx)"
                            @click="openEdit(task)">
                            <div class="kanban-card-top">
                                <span class="code-with-attachments"><Tag :value="typeOf(task).label"
                                    :severity="typeOf(task).severity" rounded /><span class="entity-code">{{ task.code || 'Sin código' }}</span><Tag
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
                                <Tag v-if="isUnassigned(task)" value="Sin asignar" severity="warn" rounded />
                            </div>
                            <div class="kanban-progress">
                                <ProgressBar :value="Math.round(Number(task.progress ?? 0))" />
                                <span>{{ Math.round(Number(task.progress ?? 0)) }} %</span>
                            </div>
                            <div v-if="isTimerRunning(task.pkid)" class="card-timer">
                                <i class="pi pi-stopwatch"></i>
                                <span class="card-timer-elapsed">{{ formatElapsed(timerElapsed(task.pkid)) }}</span>
                                <Button label="Parar" icon="pi pi-stop" size="small" severity="danger"
                                    @click.stop="stopRunningTimer(task)" />
                            </div>
                            <footer class="kanban-card-footer">
                                <Button v-if="task.state === 'EN_CURSO' && !isTimerRunning(task.pkid)"
                                    icon="pi pi-play" text rounded size="small" severity="success"
                                    title="Iniciar cronómetro" @click.stop="beginTimer(task)" />
                                <Button v-if="task.state !== 'FINALIZADA'" icon="pi pi-check" text rounded
                                    size="small" severity="success" title="Marcar como hecho"
                                    @click.stop="quickComplete(task)" />
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

        <Frm_TaskForm ref="taskFormRef" @saved="onTaskSaved" />
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
import Column from 'primevue/column';
import CorporateLoader from '@/components/shared/CorporateLoader.vue';
import CustomerLookup from '@/components/shared/CustomerLookup.vue';
import DataTable from 'primevue/datatable';
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
import Frm_TaskCalendar from './Frm_TaskCalendar.vue';
import { formatElapsed, isTimerRunning, runningCount, startTimer, stopTimer, timerElapsed } from '@/services/Tasks/taskTimer';
import {
    TASK_OPEN_STATES,
    TASK_PRIORITIES,
    TASK_STATES,
    exportTaskTimesToExcel,
    formatTaskDate,
    getTasksPage,
    getUsers,
    isOpenState,
    notifyOverdueTasks as notifyOverdueApi,
    priorityOf,
    typeOf,
    saveTaskOrder,
    saveTaskTime,
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
const view = ref<'kanban' | 'gantt' | 'table' | 'calendar'>('kanban');
const compact = ref(false);
const hideDoneColumn = ref(false);
const hideDiscardedColumn = ref(false);
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
let loadGeneration = 0;

const columns = computed(() => TASK_STATES.filter((column) =>
    !(hideDoneColumn.value && column.value === 'FINALIZADA')
    && !(hideDiscardedColumn.value && column.value === 'DESCARTADA')
));
const stateOptions = computed(() => TASK_STATES.map((s) => ({ label: s.label, value: s.value })));
const priorityOptions = computed(() => TASK_PRIORITIES.map((p) => ({ label: p.label, value: p.value })));
const currentUserPkid = computed(() => authStore.user?.pkid ?? null);
const isAdmin = computed(() => authStore.user?.admin === true);
const requesterPkid = computed(() => (isAdmin.value ? null : currentUserPkid.value));
const hasFilters = computed(() =>
    !!query.value || !!filterState.value || filterUser.value != null || filterEntitie.value != null
    || !!filterPriority.value || mineOnly.value || overdueOnly.value || archiveMode.value
);
const viewTitle = computed(() => view.value === 'kanban' ? 'Tablero Kanban' : view.value === 'gantt' ? 'Planificación Gantt' : view.value === 'calendar' ? 'Calendario de vencimientos' : 'Listado de tareas');
const viewHelp = computed(() => view.value === 'kanban'
    ? 'Arrastra una tarjeta entre columnas para cambiar su estado.'
    : view.value === 'gantt'
        ? 'Revisa la duración y el solapamiento temporal de las tareas.'
        : view.value === 'calendar'
            ? 'Consulta las tareas ordenadas por su fecha de vencimiento.'
            : 'Ordena, compara y abre las tareas desde una vista compacta.');

const kpis = computed(() => {
    const t = tasks.value;
    const open = t.filter((x) => isOpenState(x.state)).length;
    const doing = t.filter((x) => x.state === 'EN_CURSO').length;
    const overdue = t.filter((x) => x.overdue).length;
    const unassigned = t.filter((x) => isOpenState(x.state) && !x.userPkid && !x.contactPkid).length;
    const hours = t.reduce((acc, x) => acc + Number(x.totalHours || 0), 0);
    return {
        abiertas: open,
        enCurso: doing,
        vencidas: overdue,
        sinAsignar: unassigned,
        horas: hours > 0 ? hours.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : '0'
    };
});

function isUnassigned(task: TaskDTO): boolean {
    return !task.userPkid && !task.contactPkid && isOpenState(task.state);
}

function columnHours(state: TaskState): number {
    const total = tasksByState(state).reduce((acc, t) => acc + Number(t.totalHours || 0), 0);
    return Math.round(total * 100) / 100;
}

function stateOf(state: string) {
    return TASK_STATES.find((item) => item.value === state) ?? { label: state || 'Sin estado', severity: 'secondary' };
}

function numberHours(value: unknown): string {
    const hours = Number(value || 0);
    return hours > 0 ? `${hours.toLocaleString('es-ES', { maximumFractionDigits: 2 })} h` : '—';
}

function billingLabel(task: TaskDTO): string {
    if (!task.billable) return 'No facturable';
    if (Number(task.pendingHours || 0) > 0) return `${numberHours(task.pendingHours)} pendientes`;
    if (task.billingState === 'FACTURADA' || task.billingState === 'INVOICED') return 'Facturada';
    return task.billingState || 'Facturable';
}

function billingSeverity(task: TaskDTO): string {
    if (!task.billable) return 'secondary';
    if (Number(task.pendingHours || 0) > 0) return 'warn';
    return task.billingState === 'FACTURADA' || task.billingState === 'INVOICED' ? 'success' : 'info';
}

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
    const generation = ++loadGeneration;
    if (!quiet) loading.value = true;
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
            if (generation !== loadGeneration) return;
            tasks.value = res.items;
            archiveTruncated.value = terminal && res.total > res.items.length ? res.total : null;
        } else {
            const [open, done] = await Promise.all([
                getTasksPage({ ...common, states: TASK_OPEN_STATES.join(','), size: 2000 }),
                archiveMode.value
                    ? getTasksPage({ ...common, states: 'FINALIZADA,DESCARTADA', size: 2000 })
                    : getTasksPage({ ...common, states: 'FINALIZADA,DESCARTADA', updatedSince: recentSince(), size: 500 })
            ]);
            if (generation !== loadGeneration) return;
            tasks.value = [...open.items, ...done.items];
            archiveTruncated.value = done.total > done.items.length ? done.total : null;
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
        if (!quiet && generation === loadGeneration) loading.value = false;
    }
}

function onTaskSaved(saved: TaskDTO) {
    const index = tasks.value.findIndex((task) => task.pkid === saved.pkid);
    if (index >= 0) {
        tasks.value.splice(index, 1, { ...tasks.value[index], ...saved });
    } else {
        tasks.value.unshift(saved);
    }
    void load(true);
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

async function quickComplete(task: TaskDTO) {
    if (task.state === 'FINALIZADA') return;
    if (isLockedState(task)) {
        lockedToast(task);
        return;
    }
    const target = tasksByState('FINALIZADA').filter((t) => t.pkid !== task.pkid);
    await moveTaskTo(task, task.state, 'FINALIZADA', target, target.length);
}

function beginTimer(task: TaskDTO) {
    startTimer(task);
    toast.add({
        severity: 'info',
        summary: `Cronómetro iniciado · ${task.code}`,
        detail: 'Se contará el tiempo hasta que lo pares.',
        life: companyStore.companyInfo.toastDuration ?? 3000
    });
}

async function stopRunningTimer(task: TaskDTO) {
    if (!task.pkid) return;
    const hours = stopTimer(task.pkid);
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    try {
        await saveTaskTime({
            pkid: null,
            taskPkid: task.pkid,
            userPkid: currentUserPkid.value ?? null,
            workDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
            hours,
            memo: 'Cronometrado'
        });
        toast.add({
            severity: 'success',
            summary: `Anotadas ${hours} h en ${task.code}`,
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
        void load(true);
    } catch (e: any) {
        toast.add({
            severity: 'error',
            summary: 'No se pudo registrar el tiempo',
            detail: e.response?.data?.message ?? 'Inténtalo desde la ficha de la tarea',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
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
        view: view.value,
        compact: compact.value,
        hideDoneColumn: hideDoneColumn.value,
        hideDiscardedColumn: hideDiscardedColumn.value
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
    compact.value = !!p.compact;
    hideDoneColumn.value = !!p.hideDoneColumn;
    hideDiscardedColumn.value = !!p.hideDiscardedColumn;
    if (p.view === 'kanban' || p.view === 'gantt' || p.view === 'table' || p.view === 'calendar') view.value = p.view;
}

let prefsTimer: ReturnType<typeof setTimeout> | undefined;
watch(
    [query, filterState, filterUser, filterEntitie, filterEntitieLabel, filterPriority, mineOnly, overdueOnly, archiveMode, view, compact, hideDoneColumn, hideDiscardedColumn],
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
.card-timer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.45rem;
    padding: 0.3rem 0.5rem;
    border: 1px solid #f2d48a;
    border-radius: 9px;
    background: #fff9ec;
}
.card-timer > i {
    color: #d99a06;
    font-size: 0.95rem;
}
.card-timer-elapsed {
    flex: 1;
    font-variant-numeric: tabular-nums;
    font-weight: 800;
    font-size: 0.95rem;
    color: #b06f00;
}
.kanban-card.timing {
    border-color: #f2d48a;
    box-shadow: 0 0 0 2px rgba(242, 212, 138, 0.45);
}
.task-kpis {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.7rem;
}
.task-kpis .kpi {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.7rem 0.9rem;
    border: 1px solid #e3e8d2;
    border-radius: 13px;
    background: #fff;
}
.task-kpis .kpi.clickable {
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
}
.task-kpis .kpi.clickable:hover {
    border-color: var(--kiwi);
    transform: translateY(-1px);
}
.task-kpis .kpi.selected {
    border-color: var(--kiwi);
    box-shadow: inset 0 0 0 1px var(--kiwi);
    background: #fbfdf3;
}
.task-kpis .kpi-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    border-radius: 11px;
    font-size: 1.05rem;
    color: #648506;
    background: #eef4d8;
}
.task-kpis .kpi div {
    display: flex;
    flex-direction: column;
    min-width: 0;
}
.task-kpis .kpi strong {
    color: #293444;
    font-size: 1.25rem;
    line-height: 1.1;
}
.task-kpis .kpi span {
    color: #7d8797;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.task-kpis .kpi.doing .kpi-icon { color: #b7791f; background: #fdf3e0; }
.task-kpis .kpi.overdue .kpi-icon { color: #c53030; background: #fdecec; }
.task-kpis .kpi.unassigned .kpi-icon { color: #718096; background: #eef1f5; }
.task-kpis .kpi.hours .kpi-icon { color: #2b6cb0; background: #e8f0fa; }
.kanban-skeleton {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(var(--kanban-columns, 5), minmax(0, 1fr));
    gap: 0.8rem;
}
.skeleton-column {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    min-height: 320px;
    padding: 0.7rem;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    background: #fff;
}
.skeleton-line,
.skeleton-card {
    border-radius: 10px;
    background: linear-gradient(90deg, #eef1ea 25%, #f6f8f3 37%, #eef1ea 63%);
    background-size: 400% 100%;
    animation: skeleton-pulse 1.4s ease infinite;
}
.skeleton-line { height: 20px; margin-bottom: 0.2rem; }
.skeleton-line.w40 { width: 40%; }
.skeleton-card { height: 88px; }
.skeleton-card.short { height: 62px; }
@keyframes skeleton-pulse {
    0% { background-position: 100% 50%; }
    100% { background-position: 0 50%; }
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
    grid-template-columns: repeat(var(--kanban-columns, 5), minmax(0, 1fr));
    gap: 0.8rem;
}
.task-table-panel {
    height: clamp(470px, calc(100vh - 365px), 760px);
    min-height: 470px;
    margin-top: 14px;
    overflow: hidden;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    background: #fff;
}
.task-table {
    height: 100%;
}
.task-table :deep(.p-datatable-table-container) {
    flex: 1 1 auto;
    min-height: 0;
}
.task-table :deep(.p-datatable-thead > tr > th) {
    padding: .72rem .7rem;
    background: #f6f9ee;
    color: #526029;
    border-color: #e3e8d2;
    font-size: .78rem;
    font-weight: 800;
    white-space: nowrap;
}
.task-table :deep(.p-datatable-tbody > tr > td) {
    padding: .62rem .7rem;
    border-color: #edf0e6;
    color: #384253;
    font-size: .82rem;
    vertical-align: middle;
}
.task-table :deep(.p-datatable-tbody > tr:hover > td) {
    background: #fbfdf6;
}
.task-table :deep(.p-paginator) {
    min-height: 48px;
    border-top: 1px solid #e7ebdf;
}
.table-code { color: #648506; font-weight: 800; white-space: nowrap; }
.task-name-cell { display: flex; flex-direction: column; gap: .2rem; width: 100%; padding: 0; border: 0; background: transparent; color: #273142; text-align: left; cursor: pointer; }
.task-name-cell:hover strong { color: #648506; text-decoration: underline; }
.task-name-cell small { display: flex; align-items: center; gap: .3rem; color: #87909e; }
.company-cell, .assignee-cell, .due-cell, .attachment-cell { display: inline-flex; align-items: center; gap: .42rem; }
.company-cell { color: #596579; }
.assignee-cell { white-space: nowrap; }
.due-cell { white-space: nowrap; color: #657084; }
.due-cell.late { color: #c0392b; font-weight: 800; }
.table-progress { display: flex; align-items: center; gap: .45rem; min-width: 115px; }
.table-progress :deep(.p-progressbar) { width: 75px; height: 9px; background: #e9eddf; }
.table-progress span { min-width: 32px; color: #648506; font-size: .73rem; font-weight: 800; text-align: right; }
.table-actions { display: flex; justify-content: flex-end; white-space: nowrap; }
.table-empty { display: grid; justify-items: center; gap: .35rem; padding: 3rem; color: #899184; }
.table-empty i { font-size: 1.8rem; color: #9cc10a; }
.task-table :deep(.numeric-head .p-datatable-column-header-content) { justify-content: flex-end; }
.task-table :deep(.numeric-cell) { text-align: right; font-variant-numeric: tabular-nums; }
.task-table :deep(.center-head .p-datatable-column-header-content) { justify-content: center; }
.task-table :deep(.center-cell) { text-align: center; }
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
.kanban-hours-total {
    display: inline-flex;
    align-items: center;
    gap: 0.22rem;
    margin-left: auto;
    margin-right: 0.15rem;
    color: #648506;
    font-size: 0.72rem;
    font-weight: 800;
}
.kanban-card.unassigned {
    background: #fffdf6;
}
.kanban-card.prio-BAJA { border-left: 4px solid #b7c4d4; }
.kanban-card.prio-MEDIA { border-left: 4px solid #7fb3d5; }
.kanban-card.prio-ALTA { border-left: 4px solid #f0b429; }
.kanban-card.prio-URGENTE { border-left: 4px solid #e05252; }
.kanban-board.compact .kanban-card {
    padding: 0.5rem 0.55rem;
}
.kanban-board.compact .kanban-card h3 {
    margin: 0.15rem 0;
    font-size: 0.88rem;
}
.kanban-board.compact .kanban-client,
.kanban-board.compact .kanban-user,
.kanban-board.compact .kanban-creator {
    display: none;
}
.kanban-board.compact .kanban-meta {
    margin-top: 0.2rem;
}
.kanban-board.compact .kanban-progress {
    margin-top: 0.3rem;
}
.kanban-board.compact .kanban-card-footer {
    margin-top: 0.15rem;
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
    .kanban-board,
    .kanban-skeleton {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .task-kpis {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}
@media (max-width: 640px) {
    .kanban-board,
    .kanban-skeleton {
        grid-template-columns: 1fr;
    }
    .task-kpis {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
