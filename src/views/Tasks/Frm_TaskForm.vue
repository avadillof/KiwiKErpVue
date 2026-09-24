<template>
    <Dialog v-model:visible="visible" modal
        :header="form.pkid ? `Tarea ${form.code || ''}` : 'Nueva tarea'"
        :style="{ width: '75rem', maxWidth: '95vw' }" class="kiwik-dialog task-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">

        <div class="task-dialog-scroll">

            <Panel>
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">
                            <i class="pi pi-clipboard text-primary"></i>
                        </div>
                        <span class="font-bold">
                            Datos de la tarea
                        </span>
                    </div>
                </template>

                <div class="grid p-fluid">
                    <div class="col-12 md:col-4">
                        <FloatLabel variant="on" class="w-full">
                            <InputText id="task-code" v-model="form.code" class="w-full" disabled />
                            <label for="task-code">
                                Código
                            </label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 md:col-8">
                        <FloatLabel variant="on" class="w-full">
                            <InputText id="task-name" v-model="form.name" maxlength="120" class="w-full" />
                            <label for="task-name">
                                Título *
                            </label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.name" severity="error">
                            {{ errors.name }}
                        </InlineMessage>
                    </div>

                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on" class="w-full">
                            <Select id="task-state" v-model="form.state" :options="TASK_STATES" optionLabel="label"
                                optionValue="value" class="w-full" :disabled="isTaskLocked(form)" />
                            <label for="task-state">
                                Estado
                            </label>
                        </FloatLabel>
                        <small v-if="isTaskLocked(form)" class="mail-hint">
                            <i class="pi pi-lock"></i>
                            Bloqueado: tiene factura vinculada.
                        </small>
                    </div>

                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on" class="w-full">
                            <Select id="task-creator" v-model="form.creatorPkid" :options="userOptions"
                                optionLabel="label" optionValue="value" class="w-full" filter
                                emptyMessage="Sin usuarios" />
                            <label for="task-creator">
                                Responsable (quien la crea) *
                            </label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.creator" severity="error">
                            {{ errors.creator }}
                        </InlineMessage>
                    </div>

                    <div class="col-12">
                        <label class="assign-label">Asignar la ejecución a: *</label>
                        <SelectButton v-model="assigneeType" :options="assigneeOptions" optionLabel="label"
                            optionValue="value" />
                        <InlineMessage v-if="errors.assignee" severity="error">
                            {{ errors.assignee }}
                        </InlineMessage>
                    </div>

                    <div v-if="assigneeType === 'USER'" class="col-12 md:col-6">
                        <FloatLabel variant="on" class="w-full">
                            <Select id="task-user" v-model="form.userPkid" :options="userOptions"
                                optionLabel="label" optionValue="value" class="w-full" filter
                                emptyMessage="Sin usuarios" />
                            <label for="task-user">
                                Usuario interno que la realiza *
                            </label>
                        </FloatLabel>
                        <div class="assign-self">
                            <Button label="Asignarme a mí" icon="pi pi-user" text size="small"
                                @click="assignToMe" />
                        </div>
                    </div>

                    <div v-if="assigneeType === 'USER'" class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <CustomerLookup id="task-entity" v-model="form.entitiePkid" :label="entitieLabel"
                                @selected="onEntitieSelected" @update:modelValue="onEntitieInput" />
                            <label for="task-entity">Cliente (contexto de facturación)</label>
                        </FloatLabel>
                    </div>

                    <div v-if="assigneeType === 'CONTACT'" class="col-12 md:col-6">
                        <FloatLabel variant="on">
                            <CustomerLookup id="task-entity-c" v-model="form.entitiePkid" :label="entitieLabel"
                                @selected="onEntitieSelected" @update:modelValue="onEntitieInput" />
                            <label for="task-entity-c">Cliente *</label>
                        </FloatLabel>
                    </div>

                    <div v-if="assigneeType === 'CONTACT'" class="col-12 md:col-6">
                        <FloatLabel variant="on" class="w-full">
                            <Select id="task-contact" v-model="form.contactPkid" :options="contactOptions"
                                optionLabel="label" optionValue="value" class="w-full" filter showClear
                                :disabled="!form.entitiePkid" />
                            <label for="task-contact">
                                Contacto que la realiza *
                            </label>
                        </FloatLabel>
                        <small class="mail-hint">
                            <i class="pi pi-envelope"></i>
                            Al guardar se le enviará un correo, también ante cambios de estado.
                        </small>
                    </div>

                    <div class="col-12 md:col-4">
                        <FloatLabel variant="on" class="w-full">
                            <Select id="task-priority" v-model="form.priority" :options="TASK_PRIORITIES"
                                optionLabel="label" optionValue="value" class="w-full" />
                            <label for="task-priority">
                                Prioridad
                            </label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 md:col-4">
                        <FloatLabel variant="on" class="w-full">
                            <DatePicker id="task-start" v-model="startDate" class="w-full" showIcon
                                dateFormat="dd/mm/yy" showClear />
                            <label for="task-start">
                                Inicio
                            </label>
                        </FloatLabel>
                    </div>

                    <div class="col-12 md:col-4">
                        <FloatLabel variant="on" class="w-full">
                            <DatePicker id="task-due" v-model="dueDate" class="w-full" showIcon
                                dateFormat="dd/mm/yy" showClear />
                            <label for="task-due">
                                Vencimiento
                            </label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.dates" severity="error">
                            {{ errors.dates }}
                        </InlineMessage>
                    </div>

                    <div class="col-12">
                        <label class="progress-label" for="task-progress">
                            Avance: <strong>{{ Math.round(progressValue) }} %</strong>
                            <span class="progress-hint">(al finalizar se pone 100 % solo)</span>
                        </label>
                        <Slider id="task-progress" v-model="progressValue" :step="5" class="w-full mt-2"
                            :disabled="form.state !== 'EN_CURSO'" />
                        <small v-if="form.state !== 'EN_CURSO'" class="mail-hint">Solo se avanza en Realizándose.</small>
                    </div>

                    <div class="col-12" v-if="form.state === 'DESCARTADA'">                        <FloatLabel variant="on" class="w-full">
                            <Textarea id="task-discard" v-model="form.discardReason" rows="2" autoResize
                                maxlength="500" class="w-full" />
                            <label for="task-discard">
                                Motivo del descarte *
                            </label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.discard" severity="error">
                            {{ errors.discard }}
                        </InlineMessage>
                    </div>

                    <div class="col-12">
                        <FloatLabel variant="on" class="w-full">
                            <Textarea id="task-memo" v-model="form.memo" rows="6" autoResize class="w-full" />
                            <label for="task-memo">
                                Descripción
                            </label>
                        </FloatLabel>
                    </div>
                </div>
            </Panel>

            <Panel style="margin-top:20px">
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">
                            <i class="pi pi-clock text-primary"></i>
                        </div>
                        <span class="font-bold">
                            Horas
                        </span>
                        <Tag :value="`${totalHours} h imputadas`" severity="info" rounded />
                    </div>
                </template>

                <div class="grid p-fluid">
                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on" class="w-full">
                            <InputNumber id="task-est" v-model="form.estimatedHours" :min="0" :maxFractionDigits="2"
                                class="w-full" />
                            <label for="task-est">
                                Horas previstas
                            </label>
                        </FloatLabel>
                    </div>
                    <div class="col-12 md:col-6 flex align-items-center gap-2">
                        <Checkbox id="task-billable" v-model="form.billable" binary />
                        <label for="task-billable">
                            Facturable
                        </label>
                    </div>
                </div>

                <div v-if="form.pkid" class="task-times">
                    <DataTable v-if="times.length" :value="times" size="small" stripedRows>
                        <Column field="workDate" header="Fecha" style="width:130px">
                            <template #body="{ data }">{{ formatDate(data.workDate) }}</template>
                        </Column>
                        <Column field="userName" header="Usuario" />
                        <Column field="hours" header="Horas" style="width:90px" />
                        <Column field="memo" header="Comentario" />
                        <Column style="width:60px">
                            <template #body="{ data }">
                                <Button icon="pi pi-trash" text rounded severity="danger" title="Borrar parte"
                                    @click="removeTime(data)" />
                            </template>
                        </Column>
                        <template #empty>
                            <span class="text-muted">Sin partes. Añade el primero abajo.</span>
                        </template>
                    </DataTable>

                    <div v-if="form.state === 'EN_CURSO'" class="time-add">
                        <div class="time-add-date">
                            <FloatLabel variant="on" class="w-full">
                                <DatePicker id="time-date" v-model="newTimeDate" class="w-full" showIcon
                                    dateFormat="dd/mm/yy" />
                                <label for="time-date">
                                    Fecha
                                </label>
                            </FloatLabel>
                        </div>
                        <div class="time-add-user">
                            <FloatLabel variant="on" class="w-full">
                                <Select id="time-user" v-model="newTimeUser" :options="userOptions"
                                    optionLabel="label" optionValue="value" class="w-full" filter />
                                <label for="time-user">
                                    Quien imputa
                                </label>
                            </FloatLabel>
                        </div>
                        <div class="time-add-hours">
                            <FloatLabel variant="on" class="w-full">
                                <InputNumber id="time-hours" v-model="newTimeHours" :min="0" :maxFractionDigits="2"
                                    class="w-full" />
                                <label for="time-hours">
                                    Horas
                                </label>
                            </FloatLabel>
                        </div>
                        <div class="time-add-memo">
                            <FloatLabel variant="on" class="w-full">
                                <InputText id="time-memo" v-model="newTimeMemo" maxlength="500" class="w-full" />
                                <label for="time-memo">
                                    Comentario
                                </label>
                            </FloatLabel>
                        </div>
                        <Button label="Añadir" icon="pi pi-plus" size="small"
                            :disabled="!canAddTime" @click="addTime" />
                    </div>
                    <small v-if="form.pkid && form.state !== 'EN_CURSO' && !times.length" class="mail-hint">
                        Pasa la tarea a Realizándose para imputar horas.
                    </small>
                </div>
                <Message v-else severity="info" :closable="false" class="mt-2">
                    Guarda la tarea para poder imputar partes de horas.
                </Message>
            </Panel>

            <Panel style="margin-top:20px">
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">
                            <i class="pi pi-comments text-primary"></i>
                        </div>
                        <span class="font-bold">
                            Comentarios
                        </span>
                        <Tag :value="`${comments.length}`" severity="info" rounded />
                    </div>
                </template>

                <div v-if="form.pkid" class="chat">
                    <div ref="threadRef" class="thread" aria-live="polite">
                        <p v-if="!comments.length" class="thread-empty">
                            Sin comentarios. Escribe el primero abajo.
                        </p>
                        <article v-for="(c, i) in comments" :key="c.pkid ?? `n${i}`" class="bubble"
                            :class="c.userPkid === myPkid ? 'bubble-user' : 'bubble-other'">
                            <span class="bubble-author">{{ c.userName || 'Usuario' }}</span>
                            <p>{{ c.text }}</p>
                            <span class="bubble-time">{{ fmtCommentTime(c.createdAt) }}</span>
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
                </div>
                <Message v-else severity="info" :closable="false" class="mt-2">
                    Guarda la tarea para poder comentar.
                </Message>
            </Panel>

            <Panel style="margin-top:20px">
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">
                            <i class="pi pi-paperclip text-primary"></i>
                        </div>
                        <span class="font-bold">
                            Documentación
                        </span>
                        <Tag :value="`${form.attachmentCount ?? 0}`" severity="info" rounded />
                    </div>
                </template>

                <div v-if="form.pkid">
                    <p class="doc-hint">PDF, imágenes, Excel, Word… se guardan en el repositorio documental de la tarea.</p>
                    <Button label="Gestionar documentos" icon="pi pi-folder-open" size="small"
                        @click="showAttachments = true" />
                </div>
                <Message v-else severity="info" :closable="false" class="mt-2">
                    Guarda la tarea para poder anexar documentos.
                </Message>
            </Panel>

            <Panel v-if="form.pkid" style="margin-top:20px">
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">
                            <i class="pi pi-receipt text-primary"></i>
                        </div>
                        <span class="font-bold">
                            Facturación
                        </span>
                        <Tag :value="form.billingState || 'NO_FACTURABLE'" severity="info" rounded />
                    </div>
                </template>

                <div v-if="(form.links ?? []).length" class="billing-links">
                    <div v-for="(l, li) in (form.links ?? [])" :key="l.pkid ?? `l${li}`" class="billing-link">
                        <Tag :value="l.invoiceCode || `#${l.invoiceId}`" severity="success" rounded />
                        <span>{{ l.hoursBilled }} h</span>
                        <small class="text-muted">{{ l.invoiceState || '' }}</small>
                        <Button icon="pi pi-unlink" text rounded severity="danger" size="small"
                            title="Desvincular (solo si la factura sigue en borrador)"
                            @click="askUnlink(l.pkid)" />
                    </div>
                </div>
                <p v-else class="text-muted">
                    Sin facturas vinculadas.
                    <span v-if="Number(form.pendingHours ?? 0) > 0">{{ form.pendingHours }} h pendientes de facturar.</span>
                </p>
            </Panel>

        </div>

        <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_TASKS_DOCUMENTS"
            :title="`Documentos indexados a ${form.code || ''} ${form.name || ''}`" :entityId="form.pkid ?? 0"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.doc,.docx" :maxFileSize="15728640"
            @update:visible="onAttachmentsVisible" />

        <div class="kiwik-separator"></div>

        <template #footer>
            <Button label="Guardar" icon="pi pi-check" :loading="saving" @click="save" />
        </template>

        <ConfirmDialog />

    </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import CustomerLookup from '@/components/shared/CustomerLookup.vue';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import FloatLabel from 'primevue/floatlabel';
import InlineMessage from 'primevue/inlinemessage';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Panel from 'primevue/panel';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Slider from 'primevue/slider';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useCompanyStore } from '@/stores/companyStore';
import { useAuthStore } from '@/stores/authStore';
import { useFormValidator } from '@/libs/HelperView';
import {
    TASK_PRIORITIES,
    TASK_STATES,
    deleteTaskTime,
    emptyTask,
    getContacts,
    getTask,
    getTaskComments,
    getTaskTimes,
    getUsers,
    isTaskLocked,
    saveTask,
    saveTaskComment,
    saveTaskTime,
    unlinkTaskInvoice,
    type TaskCommentDTO,
    type TaskDTO,
    type TaskTimeDTO
} from '@/services/Tasks/taskService';

const toast = useToast();
const confirm = useConfirm();
const companyStore = useCompanyStore();
const authStore = useAuthStore();
const { scrollToError } = useFormValidator();
const emit = defineEmits(['saved']);

const visible = ref(false);
const saving = ref(false);
const form = ref<TaskDTO>(emptyTask());
const entitieLabel = ref('');
const userOptions = ref<{ label: string; value: number }[]>([]);
const contactOptions = ref<{ label: string; value: number }[]>([]);
const times = ref<TaskTimeDTO[]>([]);
const comments = ref<TaskCommentDTO[]>([]);
const newComment = ref('');
const sendingComment = ref(false);
const threadRef = ref<HTMLElement | null>(null);
const showAttachments = ref(false);
const myPkid = computed(() => authStore.user?.pkid ?? null);
const dueDate = ref<Date | null>(null);
const startDate = ref<Date | null>(null);
const newTimeDate = ref<Date | null>(new Date());
const newTimeHours = ref<number | null>(null);
const newTimeMemo = ref('');
const newTimeUser = ref<number | null>(null);

const errors = ref({ name: '', creator: '', assignee: '', discard: '', dates: '' });
const assigneeType = ref<'USER' | 'CONTACT'>('USER');
const assigneeOptions = [
    { label: 'Usuario interno', value: 'USER' as const },
    { label: 'Contacto de cliente', value: 'CONTACT' as const }
];

const totalHours = computed(() =>
    times.value.reduce((acc, t) => acc + Number(t.hours || 0), 0)
);

const progressValue = computed({
    get: () => Math.min(100, Math.max(0, Math.round(Number(form.value.progress ?? 0)))),
    set: (v: number) => {
        form.value.progress = v;
    }
});

const canAddTime = computed(() =>
    !!form.value.pkid && newTimeHours.value != null && newTimeHours.value > 0
    && form.value.state === 'EN_CURSO'
);

function formatDate(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function toInputDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseInputDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

async function open(pkid: number | null = null, presetState?: string) {
    errors.value = { name: '', creator: '', assignee: '', discard: '', dates: '' };
    times.value = [];
    comments.value = [];
    newComment.value = '';
    dueDate.value = null;
    startDate.value = null;
    newTimeDate.value = new Date();
    newTimeHours.value = null;
    newTimeMemo.value = '';
    newTimeUser.value = authStore.user?.pkid ?? null;
    contactOptions.value = [];
    entitieLabel.value = '';
    assigneeType.value = 'USER';

    await loadUsers();

    if (pkid) {
        try {
            const data = await getTask(pkid, myRequester());
        form.value = { ...emptyTask(), ...data };
        assigneeType.value = form.value.userPkid ? 'USER' : 'CONTACT';
        dueDate.value = parseInputDate((data as any).dueDate);
        startDate.value = parseInputDate((data as any).startDate);
            entitieLabel.value = (data as any).entitieName ?? '';
        if (form.value.entitiePkid) await loadContacts(form.value.entitiePkid);
        await loadTimes(form.value.pkid);
        await loadComments(form.value.pkid);
        } catch (e: any) {
            toast.add({
                severity: 'error',
                summary: 'Sin acceso',
                detail: e?.response?.status === 403 ? 'No puedes ver esta tarea' : (e.response?.data?.message ?? 'No se pudo abrir la tarea'),
                life: companyStore.companyInfo.toastDuration ?? 3000
            });
            return;
        }
    } else {
        form.value = emptyTask();
        if (authStore.user?.pkid) {
            form.value.creatorPkid = authStore.user.pkid;
            form.value.userPkid = authStore.user.pkid;
        }
        if (presetState) form.value.state = presetState as any;
    }

    visible.value = true;
}

    defineExpose({ open, visible });

async function loadUsers() {
    if (userOptions.value.length) return;
    try {
        const users = await getUsers();
        userOptions.value = users.map((u: any) => ({
            label: u.userDsName || u.name || u.userDsCode || `Usuario ${u.pkid ?? u.userKyId}`,
            value: Number(u.pkid ?? u.userKyId ?? u.id)
        })).filter((o) => !isNaN(o.value));
        if (!userOptions.value.length) {
            toast.add({
                severity: 'warn',
                summary: 'Sin usuarios del sistema',
                detail: 'No se cargó ningún usuario para asignar',
                life: companyStore.companyInfo.toastDuration ?? 3000
            });
        }
    } catch {
        userOptions.value = [];
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los usuarios del sistema',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
}

function assignToMe() {
    if (authStore.user?.pkid) form.value.userPkid = authStore.user.pkid;
}

async function loadContacts(entitiePkid: number) {
    try {
        const contacts = await getContacts(entitiePkid);
        contactOptions.value = contacts.map((c: any) => ({
            label: c.name || `Contacto ${c.pkid}`,
            value: Number(c.pkid)
        })).filter((o) => !isNaN(o.value));
    } catch {
        contactOptions.value = [];
    }
}

function onEntitieSelected(customer: any) {
    entitieLabel.value = customer?.name ?? '';
    form.value.contactPkid = null;
    if (form.value.entitiePkid) void loadContacts(form.value.entitiePkid);
    else contactOptions.value = [];
}

function onEntitieInput(value: number | null) {
    if (value == null && form.value.entitiePkid == null) {
        entitieLabel.value = '';
        form.value.contactPkid = null;
        contactOptions.value = [];
    }
}

function myRequester(): number | null {
    if (authStore.user?.admin === true) return null;
    return authStore.user?.pkid ?? null;
}

async function onAttachmentsVisible(v: boolean) {
    if (!v && form.value.pkid) {
        try {
            const fresh = await getTask(form.value.pkid, myRequester());
            form.value.attachmentCount = fresh.attachmentCount ?? 0;
        } catch {
            /* mantiene el contador anterior */
        }
    }
}

async function loadTimes(taskPkid: number | null) {
    if (!taskPkid) {
        times.value = [];
        return;
    }
    try {
        times.value = await getTaskTimes(taskPkid, myRequester());
    } catch {
        times.value = [];
    }
}

function fmtCommentTime(value: any): string {
    if (!value) return '';
    const d = new Date(String(value).replace(' ', 'T'));
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ' '
        + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function scrollThread() {
    nextTick(() => {
        const el = threadRef.value;
        if (el) el.scrollTop = el.scrollHeight;
    });
}

async function loadComments(taskPkid: number | null) {
    if (!taskPkid) {
        comments.value = [];
        return;
    }
    try {
        comments.value = await getTaskComments(taskPkid, myRequester());
    } catch {
        comments.value = [];
    }
    scrollThread();
}

async function sendComment() {
    const text = newComment.value.trim();
    if (!text || !form.value.pkid || myPkid.value == null || sendingComment.value) return;
    sendingComment.value = true;
    try {
        const saved = await saveTaskComment({
            pkid: null,
            taskPkid: form.value.pkid,
            userPkid: myPkid.value,
            text
        });
        comments.value = [...comments.value, saved];
        newComment.value = '';
        scrollThread();
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'No se pudo enviar el comentario',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } finally {
        sendingComment.value = false;
    }
}

function validate(): boolean {
    errors.value = { name: '', creator: '', assignee: '', discard: '', dates: '' };
    let first = '';
    if (!form.value.name?.trim()) {
        errors.value.name = 'Obligatorio';
        first = first || 'task-name';
    }
    if (!form.value.creatorPkid) {
        errors.value.creator = 'Obligatorio';
        first = first || 'task-creator';
    }
    if (assigneeType.value === 'USER' && !form.value.userPkid) {
        errors.value.assignee = 'Elige el usuario que la realiza';
        first = first || 'task-user';
    }
    if (assigneeType.value === 'CONTACT' && !form.value.contactPkid) {
        errors.value.assignee = 'Elige el contacto que la realiza';
        first = first || 'task-contact';
    }
    if (form.value.state === 'DESCARTADA' && !form.value.discardReason?.trim()) {
        errors.value.discard = 'Obligatorio';
        first = first || 'task-discard';
    }
    if (startDate.value && dueDate.value && startDate.value > dueDate.value) {
        errors.value.dates = 'El inicio no puede ser posterior al vencimiento';
        first = first || 'task-start';
    }
    if (first) void scrollToError(first as any);
    return !errors.value.name && !errors.value.creator && !errors.value.assignee && !errors.value.discard && !errors.value.dates;
}

async function save() {
    if (!validate()) return;
    saving.value = true;
    form.value.dueDate = dueDate.value ? toInputDate(dueDate.value) : null;
    form.value.startDate = startDate.value ? toInputDate(startDate.value) : null;
    if (assigneeType.value === 'USER') form.value.contactPkid = null;
    else form.value.userPkid = null;
    try {
        const saved = await saveTask(form.value);
        form.value = { ...form.value, ...saved };
        entitieLabel.value = saved.entitieName ?? entitieLabel.value;
        toast.add({
            severity: 'success',
            summary: 'Tarea guardada correctamente',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
        emit('saved');
        visible.value = false;
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'Error inesperado',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    } finally {
        saving.value = false;
    }
}

async function addTime() {
    if (!canAddTime.value || !form.value.pkid) return;
    try {
        const saved = await saveTaskTime({
            pkid: null,
            taskPkid: form.value.pkid,
            userPkid: newTimeUser.value ?? myPkid.value,
            workDate: newTimeDate.value ? toInputDate(newTimeDate.value) : null,
            hours: Number(newTimeHours.value),
            memo: newTimeMemo.value
        });
        times.value = [...times.value, saved];
        newTimeHours.value = null;
        newTimeMemo.value = '';
        try {
            const fresh = await getTask(form.value.pkid, myRequester());
            form.value.billingState = fresh.billingState;
            form.value.links = fresh.links;
            form.value.pendingHours = fresh.pendingHours;
        } catch {
            /* mantiene el estado anterior */
        }
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'No se pudo añadir el parte',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
}

async function removeTime(entry: TaskTimeDTO) {
    if (!entry.pkid) return;
    try {
        await deleteTaskTime(entry.pkid);
        times.value = times.value.filter((t) => t.pkid !== entry.pkid);
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'No se pudo borrar el parte',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
}

function askUnlink(linkPkid: number | null) {
    if (linkPkid == null) return;
    confirm.require({
        message: 'Se desvinculará la factura de la tarea. Solo es posible si la factura sigue en borrador.',
        header: 'Desvincular factura',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Desvincular',
        rejectLabel: 'Volver',
        accept: () => void unlinkInvoice(linkPkid)
    });
}

async function unlinkInvoice(linkPkid: number) {
    try {
        await unlinkTaskInvoice(linkPkid);
        if (form.value.pkid) {
            const fresh = await getTask(form.value.pkid, myRequester());
            form.value = { ...form.value, ...fresh };
        }
        toast.add({
            severity: 'success',
            summary: 'Factura desvinculada',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
        emit('saved');
    } catch (error: any) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'No se pudo desvincular',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
}
</script>

<style scoped>
.text-muted {
    color: #788071;
    font-size: 0.82rem;
}
.task-times {
    margin-top: 1rem;
}
.time-add {
    display: flex;
    gap: 0.7rem;
    margin-top: 0.8rem;
    align-items: flex-start;
}
.time-add-date {
    flex: 0 0 150px;
}
.time-add-user {
    flex: 0 0 180px;
}
.time-add-hours {
    flex: 0 0 100px;
}
.time-add-memo {
    flex: 1;
    min-width: 0;
}
.time-add .p-button {
    flex: 0 0 auto;
    margin-top: 0.15rem;
}
.task-dialog-scroll {
    max-height: 78vh;
    overflow-y: auto;
    padding: 0.25rem 0.5rem 1rem 0.25rem;
}
.task-dialog-scroll :deep(.grid) {
    row-gap: 1.4rem;
    margin-top: 0.4rem;
}
.task-dialog-scroll :deep(.grid > [class*='col-']) {
    padding-top: 0.45rem;
    padding-bottom: 0.45rem;
}
.task-dialog-scroll :deep(.p-panel) {
    margin-bottom: 1.6rem;
}
.task-dialog-scroll :deep(.p-panel-content) {
    padding: 1.4rem 1.5rem;
}
.task-dialog-scroll :deep(.p-inlinemessage) {
    margin-top: 0.4rem;
}
.task-dialog-scroll :deep(.p-floatlabel label) {
    white-space: nowrap;
}
.progress-label {
    display: block;
    margin-bottom: 0.6rem;
    color: #344054;
    font-size: 0.9rem;
}
.progress-hint {
    color: #899184;
    font-size: 0.75rem;
    font-weight: 400;
}
.assign-self {
    margin-top: 0.15rem;
}
.mail-hint {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.35rem;
    color: #899184;
    font-size: 0.75rem;
}
.assign-label {
    display: block;
    margin-bottom: 0.45rem;
    color: #344054;
    font-size: 0.9rem;
    font-weight: 700;
}
.chat {
    display: flex;
    flex-direction: column;
}
.thread {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 220px;
    max-height: 460px;
    padding: 14px 16px;
    overflow-y: auto;
    background: #fbfcfa;
    border: 1px solid #edf0e4;
    border-radius: 10px;
}
.thread-empty {
    color: #899184;
    font-size: 0.82rem;
    text-align: center;
    padding: 1rem 0;
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
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}
.chat-actions small {
    color: #899184;
    font-size: 0.72rem;
}
.doc-hint {
    margin: 0 0 0.7rem;
    color: #788071;
    font-size: 0.82rem;
}
.billing-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.billing-link {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.85rem;
}
</style>
