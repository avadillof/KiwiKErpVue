<template>
   
<main v-if="!session" class="login-page">
    <section class="login-shell">

        <img
            src="../../assets/logos/corporate.png"
            alt="FreeLandSite"
            class="corporate-divider-logo"
        />

        <aside class="brand-panel">

            <div class="brand-glow brand-glow--top"></div>
            <div class="brand-glow brand-glow--bottom"></div>

            <div class="brand-copy">

                <span class="brand-eyebrow">
                    Portal CRM del Cliente
                </span>

                <h1>
                    Tu espacio,<br />
                    siempre conectado.
                </h1>

                <p>
                    Accede a tu espacio privado, consulta la información
                    de tu empresa y mantén una comunicación directa
                    con nuestro equipo.
                </p>

            </div>

            <div class="brand-features">

                <span>
                    <i class="pi pi-check-circle"></i>
                    Tu información, siempre disponible
                </span>

                <span>
                    <i class="pi pi-comments"></i>
                    Comunicación directa con nuestro equipo
                </span>

                <span>
                    <i class="pi pi-shield"></i>
                    Acceso privado y seguro
                </span>

            </div>

            <div class="brand-footer">

                <span>
                    Desarrollado por
                    <a
                        href="https://www.freelandsite.es"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        FreeLandSite.es
                    </a>
                </span>

            </div>

        </aside>

        <section class="access-panel">

            <div class="access-content">

                <header class="company-header">

                    <div class="client-logo-wrap">

                        <img
                            v-if="company.logo && !logoError"
                            :key="company.logo"
                            :src="company.logo"
                            alt="Logotipo de la empresa"
                            class="client-logo"
                            @error="logoError = true"
                        />

                        <i class="pi pi-building client-logo-fallback"></i>

                    </div>

                    <div>

                        <span class="access-eyebrow">
                            Bienvenido
                        </span>

                        <h2>
                            {{ company.name || 'Portal CRM del Cliente' }}
                        </h2>

                        <p v-if="company.cif">
                            NIF/CIF: {{ company.cif }}
                        </p>

                    </div>

                </header>

                <div class="access-intro">

                    <h3>
                        Accede a tu Portal CRM
                    </h3>

                    <p>
                        Introduce tu correo electrónico y te enviaremos
                        un enlace personal para acceder a tu espacio
                        privado de cliente.
                    </p>

                </div>

                <form
                    class="login-form"
                    @submit.prevent="sendLink"
                >

                    <div class="field-group">

                        <label for="portal-email">
                            Correo electrónico
                        </label>

                        <IconField>

                            <InputIcon class="pi pi-envelope" />

                            <InputText
                                id="portal-email"
                                v-model="email"
                                autocomplete="email"
                                placeholder="tu@empresa.com"
                                autofocus
                                fluid
                            />

                        </IconField>

                    </div>

                    <Button
                        type="submit"
                        label="Enviar enlace de acceso"
                        icon="pi pi-send"
                        iconPos="right"
                        :loading="sending"
                        :disabled="!email.trim()"
                        class="login-submit"
                    />

                </form>

                <Message
                    v-if="loginMsg"
                    :severity="loginOk ? 'success' : 'error'"
                    :closable="false"
                    style="margin-top:1rem"
                >
                    {{ loginMsg }}
                </Message>

                <p class="access-help">

                    <i class="pi pi-lock"></i>

                    Tu enlace es personal y caduca en 24 horas.

                </p>

            </div>

            <footer class="access-footer">

                <span>KiwiKERP</span>

                <span class="footer-dot"></span>

                <span>Portal CRM del Cliente</span>

            </footer>

        </section>

    </section>
</main>

    <main v-else class="portal">
        <header class="portal-hero">
            <img src="/logos/logo512.png" alt="KiwiKERP" class="portal-logo" />
            <div>
                <span class="portal-eyebrow">Portal del Cliente · Tareas</span>
                <h1>Mis tareas</h1>
                <p>Hola {{ session.contactName }} · {{ session.entitieName }}</p>
            </div>
            <Button label="Salir" icon="pi pi-sign-out" text severity="secondary" size="small"
                @click="logout" />
        </header>

            <Toolbar class="portal-toolbar">
                <template #start>
                    <span class="portal-count">{{ tasks.length }} tarea{{ tasks.length === 1 ? '' : 's' }} asignada{{ tasks.length === 1 ? '' : 's' }}</span>
                </template>
                <template #end>
                    <Button icon="pi pi-refresh" text rounded title="Refrescar" :loading="loading" @click="load" />
                    <Button class="new-document" label="Nueva tarea" icon="pi pi-plus" size="small"
                        @click="showCreate = true" />
                </template>
            </Toolbar>

            <div v-if="loading" class="portal-loading">Cargando tareas…</div>

            <div v-else class="portal-list">
                <article v-for="t in tasks" :key="t.pkid ?? t.code" class="portal-task" @click="openTask(t)">
                    <div class="portal-task-top">
                        <strong>{{ t.code }}</strong>
                        <Tag :value="stateLabel(t.state)" :severity="stateSeverity(t.state)" rounded />
                    </div>
                    <h3>{{ t.name }}</h3>
                    <div class="portal-task-meta">
                        <span v-if="t.dueDate"><i class="pi pi-calendar"></i>{{ fmtDate(t.dueDate) }}</span>
                        <Tag v-if="t.overdue" value="Vencida" severity="danger" rounded />
                        <span>{{ Math.round(Number(t.progress ?? 0)) }} %</span>
                    </div>
                </article>
                <p v-if="!tasks.length" class="portal-empty">No tienes tareas asignadas.</p>
            </div>

        <Dialog v-model:visible="showDetail" modal class="kiwik-dialog" :header="selected?.code || 'Tarea'"
            :style="{ width: 'min(640px, 95vw)' }">
            <div v-if="selected" class="portal-detail">
                <h3>{{ selected.name }}</h3>
                <p class="portal-desc">{{ selected.memo || 'Sin descripción.' }}</p>
                <div class="portal-detail-meta">
                    <Tag :value="stateLabel(selected.state)" :severity="stateSeverity(selected.state)" rounded />
                    <span v-if="selected.dueDate">Vence: {{ fmtDate(selected.dueDate) }}</span>
                    <span>{{ Math.round(Number(selected.progress ?? 0)) }} % hecho</span>
                </div>
                <h4>Comentarios</h4>
                <div ref="threadRef" class="thread">
                    <p v-if="!comments.length" class="thread-empty">Sin comentarios todavía.</p>
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
                        <span></span>
                        <Button label="Enviar" icon="pi pi-send" size="small"
                            :disabled="!newComment.trim() || sendingComment" :loading="sendingComment"
                            @click="sendComment" />
                    </div>
                </div>
            </div>
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
                        <Select id="portal-new-user" v-model="newUser" :options="userOptions" optionLabel="label"
                            optionValue="value" class="w-full" filter />
                        <label for="portal-new-user">Asignar a (usuario interno) *</label>
                    </FloatLabel>
                </div>
            </div>
            <template #footer>
                <Button label="Crear tarea" icon="pi pi-check" :loading="creating" :disabled="!newName.trim() || !newUser"
                    @click="createTask" />
            </template>
        </Dialog>
    </main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toolbar from 'primevue/toolbar';
import { backendUrl } from '@/services/backendUrl';
import {
    portalComments,
    portalCreateTask,
    portalLogout,
    portalSendComment,
    portalSession,
    portalTask,
    portalTasks,
    portalToken,
    requestPortalLink,
    setPortalToken,
    type PortalSession
} from '@/services/Tasks/portalService';
import { getUsers } from '@/services/Tasks/taskService';
import type { TaskCommentDTO, TaskDTO } from '@/services/Tasks/taskService';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const session = ref<PortalSession | null>(null);
const company = ref({ name: '', cif: '', logo: '' });
const logoError = ref(false);
const email = ref('');
const sending = ref(false);
const loginMsg = ref('');
const loginOk = ref(false);
const loading = ref(false);
const tasks = ref<TaskDTO[]>([]);
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
const creating = ref(false);
const userOptions = ref<{ label: string; value: number }[]>([]);

function stateLabel(s: string): string {
    const map: Record<string, string> = { PLANIFICADA: 'Planificado', EN_CURSO: 'Realizándose', FINALIZADA: 'Hecho', DESCARTADA: 'Descartado' };
    return map[s] ?? s;
}

function stateSeverity(s: string): string {
    const map: Record<string, string> = { PLANIFICADA: 'info', EN_CURSO: 'warn', FINALIZADA: 'success', DESCARTADA: 'danger' };
    return map[s] ?? 'secondary';
}

function fmtDate(v: any): string {
    const d = new Date(String(v).slice(0, 10) + 'T00:00:00');
    return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtTime(v: any): string {
    if (!v) return '';
    const d = new Date(String(v).replace(' ', 'T'));
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) + ' '
        + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

async function sendLink() {
    sending.value = true;
    loginMsg.value = '';
    try {
        await requestPortalLink(email.value.trim());
        loginOk.value = true;
        loginMsg.value = 'Si el correo existe, recibirás un enlace válido 24 horas.';
    } catch {
        loginOk.value = false;
        loginMsg.value = 'No se pudo solicitar el enlace.';
    } finally {
        sending.value = false;
    }
}

async function init(token: string) {
    try {
        session.value = await portalSession(token);
        setPortalToken(token);
        await Promise.all([load(), loadUsers()]);
    } catch {
        session.value = null;
        setPortalToken(null);
        loginOk.value = false;
        loginMsg.value = 'Enlace no válido o caducado. Solicita uno nuevo.';
        router.replace({ name: 'Portal' });
    }
}

async function load() {
    const t = session.value?.token;
    if (!t) return;
    loading.value = true;
    try {
        tasks.value = await portalTasks(t);
    } catch (e: any) {
        if (e?.response?.status === 401) {
            session.value = null;
            setPortalToken(null);
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar tus tareas', life: 3000 });
        }
    } finally {
        loading.value = false;
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

async function openTask(t: TaskDTO) {
    const token = session.value?.token;
    if (!token || !t.pkid) return;
    try {
        selected.value = await portalTask(token, t.pkid);
        comments.value = await portalComments(token, t.pkid);
        newComment.value = '';
        showDetail.value = true;
        nextTick(() => {
            const el = threadRef.value;
            if (el) el.scrollTop = el.scrollHeight;
        });
    } catch {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo abrir la tarea', life: 3000 });
    }
}

async function sendComment() {
    const token = session.value?.token;
    const text = newComment.value.trim();
    if (!token || !selected.value?.pkid || !text || sendingComment.value) return;
    sendingComment.value = true;
    try {
        const saved = await portalSendComment(token, selected.value.pkid, text);
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
    const token = session.value?.token;
    if (!token || !newName.value.trim() || !newUser.value || creating.value) return;
    creating.value = true;
    try {
        await portalCreateTask({ token, name: newName.value.trim(), description: newDesc.value, userPkid: newUser.value });
        toast.add({ severity: 'success', summary: 'Tarea creada', life: 3000 });
        showCreate.value = false;
        newName.value = '';
        newDesc.value = '';
        newUser.value = null;
        await load();
    } catch (e: any) {
        toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.message ?? 'No se pudo crear', life: 3000 });
    } finally {
        creating.value = false;
    }
}

async function logout() {
    const t = session.value?.token ?? portalToken();
    if (t) await portalLogout(t);
    session.value = null;
    tasks.value = [];
    router.replace({ name: 'Portal' });
}

onMounted(() => {
    void loadCompany();
    const q = route.query.token;
    const token = typeof q === 'string' && q ? q : portalToken();
    if (token) void init(token);
});

async function loadCompany() {
    try {
        const response = await fetch(backendUrl('/WebGetParameters'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return;
        const data = await response.json();
        const logoSource = data.urlLogoCompany || backendUrl('/base/logo.png');
        company.value = {
            name: data.nameCompany || '',
            cif: data.cifCompany || '',
            logo: `${logoSource}${logoSource.includes('?') ? '&' : '?'}t=${Date.now()}`
        };
    } catch {
        /* mantiene valores por defecto */
    }
}
</script>

<style scoped>
.portal {
    --kiwi: #9cc10a;
    --kiwi-dark: #648506;
    min-height: 100vh;
    padding: 24px 16px 72px;
    color: #243044;
    background: #f4f6f3 url('/logos/backtransparent.png') center / cover fixed;
}
.portal-hero {
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 1000px;
    margin: 0 auto 16px;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 15px;
    padding: 16px 18px;
}
.portal-logo {
    width: 52px;
    height: 52px;
    object-fit: contain;
}
.portal-eyebrow {
    color: var(--kiwi-dark);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}
.portal-hero h1 {
    margin: 2px 0;
    font-size: 1.4rem;
}
.portal-hero p {
    margin: 0;
    color: #687386;
    font-size: 0.85rem;
}
.portal-hero .p-button {
    margin-left: auto;
}
.portal-card {
    max-width: 520px;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 15px;
    padding: 1.6rem;
}
.portal-card h2 {
    margin: 0 0 0.4rem;
}
.portal-card p {
    color: #687386;
    font-size: 0.88rem;
}
.portal-login {
    display: grid;
    gap: 0.9rem;
    margin: 1rem 0;
}
.portal-toolbar {
    max-width: 1000px;
    margin: 0 auto 12px;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    background: #fff;
}
.portal-count {
    font-weight: 700;
}
.portal-loading,
.portal-empty {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
    color: #788071;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    padding: 2rem;
}
.portal-list {
    max-width: 1000px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.8rem;
}
.portal-task {
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 12px;
    padding: 0.8rem;
    cursor: pointer;
}
.portal-task:hover {
    border-color: var(--kiwi);
}
.portal-task-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    color: #687386;
}
.portal-task h3 {
    margin: 0.3rem 0;
    font-size: 0.95rem;
}
.portal-task-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.78rem;
    color: #687386;
}
.portal-detail h3 {
    margin: 0 0 0.3rem;
}
.portal-desc {
    color: #4b5563;
    font-size: 0.9rem;
    white-space: pre-wrap;
}
.portal-detail-meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.8rem;
    color: #687386;
    margin-bottom: 0.6rem;
}
.portal-detail h4 {
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
.new-document {
    background: var(--kiwi);
    border-color: var(--kiwi);
    color: #253000;
}
</style>
