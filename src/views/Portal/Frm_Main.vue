<template>
    <div class="portal-app">
        <!-- TOPBAR CORPORATIVA -->
        <div class="p-topbar">
            <div class="p-topbar-left">
                <img src="../../assets/logos/LogTras.png" alt="KiwiKERP Logo" class="p-logo" />
                <div class="p-div"></div>
                <div class="p-titleblock">
                    <div class="p-appname">KiwiKERP - Portal del Cliente</div>
                    <div class="p-date">{{ fechaActual }}</div>
                </div>
            </div>
            <div class="p-topbar-right">
                <div role="button" title="Buscar tareas (Ctrl + K)" class="p-search-pill" @click="goSearch">
                    <i class="pi pi-search"></i>
                    <span>Buscar</span>
                    <kbd>Ctrl K</kbd>
                </div>
                <div class="p-bell" title="Notificaciones" @click="notifRef?.open()">
                    <OverlayBadge v-if="unread > 0" :value="unread" severity="danger">
                        <i class="pi pi-bell"></i>
                    </OverlayBadge>
                    <i v-else class="pi pi-bell"></i>
                </div>
                <PortalNotificationPanel ref="notifRef" :token="session.token" @unread="unread = $event"
                    @go-task="goTaskFromNotif" />
                <div class="p-div-h"></div>
                <div class="p-logout" @click="emit('logout')">
                    <i class="pi pi-sign-out"></i>
                    <span>Salir</span>
                </div>
                <div class="p-user">
                    <span>{{ session.contactName }}</span>
                    <Avatar size="large" shape="circle" class="p-avatar">{{ initials }}</Avatar>
                </div>
            </div>
        </div>

        <!-- CUERPO: SIDEBAR + CONTENIDO -->
        <div class="p-body">
            <aside class="p-sidebar" :class="{ 'p-sidebar--collapsed': sidebarCollapsed }">
                <div class="p-sidebar__head">
                    <span v-if="!sidebarCollapsed" class="p-sidebar__title">Navegación</span>
                    <button type="button" class="p-sidebar__toggle"
                        :title="sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'"
                        @click="toggleSidebar">
                        <i :class="sidebarCollapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"></i>
                    </button>
                </div>
                <nav class="p-sidebar__nav">
                    <button type="button" class="p-sidebar__item"
                        :class="{ 'p-sidebar__item--active': section === 'dashboard' }"
                        :title="sidebarCollapsed ? 'Panel de control' : ''"
                        @click="section = 'dashboard'">
                        <span class="p-sidebar__item-icon p-icon-kiwi"><i class="pi pi-th-large"></i></span>
                        <span v-if="!sidebarCollapsed" class="p-sidebar__item-label">Panel de control</span>
                        <i v-if="!sidebarCollapsed" class="p-sidebar__item-arrow pi pi-angle-right"></i>
                    </button>
                    <button type="button" class="p-sidebar__item"
                        :class="{ 'p-sidebar__item--active': section === 'tasks' }"
                        :title="sidebarCollapsed ? 'Tareas' : ''"
                        @click="section = 'tasks'">
                        <span class="p-sidebar__item-icon p-icon-task"><i class="pi pi-clipboard"></i></span>
                        <span v-if="!sidebarCollapsed" class="p-sidebar__item-label">Tareas</span>
                        <i v-if="!sidebarCollapsed" class="p-sidebar__item-arrow pi pi-angle-right"></i>
                    </button>
                </nav>
                <div v-if="!sidebarCollapsed" class="p-sidebar__foot">
                    <i class="pi pi-moon"></i>
                    <span>KiwiKERP</span>
                </div>
            </aside>

            <!-- CONTENIDO DINÁMICO -->
            <div class="p-content">
                <main v-if="section === 'dashboard'" class="dashboard">
                    <section class="dashboard-hero">
                        <div class="hero-copy">
                            <span class="hero-eyebrow"><i class="pi pi-th-large"></i> Portal del Cliente</span>
                            <h1>Panel de control</h1>
                            <p>Hola {{ session.contactName }}, este es el espacio privado de {{ session.entitieName }}. Consulta tus tareas y mantén el seguimiento con nuestro equipo.</p>
                        </div>
                    </section>

                    <section class="recents-section" aria-label="Accesos directos">
                        <div class="section-heading compact">
                            <div><span class="section-kicker">Continuar</span><h2>Accesos directos</h2></div>
                        </div>
                        <div class="recents-row">
                            <button type="button" class="recent-chip" @click="section = 'tasks'">
                                <span class="recent-icon" style="color: #648506; background: #f1f3f6"><i class="pi pi-clipboard" /></span>
                                <span>Mis tareas</span>
                            </button>
                            <button type="button" class="recent-chip" @click="goNewTask">
                                <span class="recent-icon" style="color: #648506; background: #f1f3f6"><i class="pi pi-plus" /></span>
                                <span>Nueva tarea</span>
                            </button>
                        </div>
                    </section>

                    <section class="actions-section" aria-label="Acciones pendientes">
                        <div class="section-heading compact">
                            <div><span class="section-kicker">Acciones pendientes</span><h2>En espera de tu atención</h2></div>
                        </div>
                        <div class="actions-grid">
                            <button
                                v-for="k in actionCards"
                                :key="k.key"
                                type="button"
                                class="action-card"
                                :class="{ 'action-card--quiet': !k.value }"
                                @click="k.action"
                            >
                                <span class="action-icon" :style="{ background: k.gradient }"><i :class="k.icon" /></span>
                                <span class="action-copy">
                                    <strong>{{ k.value == null ? '—' : k.value }}</strong>
                                    <span>{{ k.label }}</span>
                                    <small>{{ k.sub }}</small>
                                </span>
                                <i class="pi pi-chevron-right action-arrow" />
                            </button>
                        </div>
                    </section>
                </main>

                <section v-if="section === 'tasks'" class="tasks-section">
                    <Frm_Portal_Tasks
                        ref="tasksRef"
                        :token="session.token"
                        :contact-pkid="session.contactPkid"
                        :tasks="tasks"
                        :loading="loading"
                        @reload="loadTasks"
                    />
                </section>
            </div>
        </div>

        <!-- FOOTER CORPORATIVO -->
        <div class="p-footer">
            <div class="p-footer-left">
                <i class="pi pi-building"></i>
                <div class="p-footer-company">
                    <div class="p-footer-company-row">
                        <span class="p-footer-company-name">{{ session.entitieName }}</span>
                        <div class="p-footer-sep"></div>
                        <span class="p-footer-contact">{{ session.contactName }}</span>
                    </div>
                    <span class="p-footer-slogan">Portal CRM del Cliente</span>
                </div>
            </div>
            <div class="p-footer-right">
                <img src="../../assets/logos/LogTras.png" alt="Logo" class="p-footer-logo" />
                <span>KiwiKERP <span class="p-footer-version">Portal</span></span>
                <div class="p-footer-dot"></div>
                <span>&copy; {{ currentYear }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import Frm_Portal_Tasks from './Frm_Portal_Tasks.vue';
import PortalNotificationPanel from './PortalNotificationPanel.vue';
import {
    portalNotifications,
    portalTasks,
    type PortalSession
} from '@/services/Tasks/portalService';
import type { TaskDTO } from '@/services/Tasks/taskService';

const props = defineProps<{
    session: PortalSession;
    company: { name: string; cif: string; logo: string };
}>();

const emit = defineEmits<{
    logout: [reason?: string];
}>();

const toast = useToast();

const section = ref<'dashboard' | 'tasks'>('dashboard');
const tasks = ref<TaskDTO[]>([]);
const loading = ref(false);
const tasksRef = ref<InstanceType<typeof Frm_Portal_Tasks> | null>(null);
const sidebarCollapsed = ref(window.localStorage.getItem('kiwik.portal.sidebarCollapsed') === '1');

function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    window.localStorage.setItem('kiwik.portal.sidebarCollapsed', sidebarCollapsed.value ? '1' : '0');
}

const CLOSED_STATES = ['FINALIZADA', 'DESCARTADA'];
const openTasks = computed(() => tasks.value.filter((t) => !CLOSED_STATES.includes(t.state)));
const openCount = computed(() => tasks.value.filter((t) => t.state === 'EN_CURSO').length);
const overdueCount = computed(() => tasks.value.filter((t) => t.overdue).length);

const initials = computed(() => {
    const parts = props.session.contactName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
});

const fechaActual = ref('');
let clockTimer: number | null = null;

function tickClock() {
    const now = new Date();
    const date = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    fechaActual.value = `${date} a las ${time}`;
}

const currentYear = new Date().getFullYear();

const actionCards = computed(() => [
    {
        key: 'open', icon: 'pi pi-clipboard', label: 'Mis tareas abiertas',
        value: openTasks.value.length,
        sub: overdueCount.value ? `${overdueCount.value} vencidas` : 'Al día',
        gradient: 'linear-gradient(135deg,#9cc10a,#648506)',
        action: () => { section.value = 'tasks'; }
    },
    {
        key: 'progress', icon: 'pi pi-spinner', label: 'Tareas en curso',
        value: openCount.value,
        sub: 'Realizándose ahora',
        gradient: 'linear-gradient(135deg,#f3ae48,#dc7c22)',
        action: () => { section.value = 'tasks'; }
    },
    {
        key: 'overdue', icon: 'pi pi-exclamation-triangle', label: 'Tareas vencidas',
        value: overdueCount.value,
        sub: 'Requieren seguimiento',
        gradient: 'linear-gradient(135deg,#f28b82,#c53030)',
        action: () => { section.value = 'tasks'; }
    },
    {
        key: 'new', icon: 'pi pi-plus', label: 'Nueva tarea',
        value: null,
        sub: 'Crear y asignar',
        gradient: 'linear-gradient(135deg,#374151,#111827)',
        action: () => goNewTask()
    }
]);

async function loadTasks(quiet = false) {
    if (!quiet) loading.value = true;
    try {
        tasks.value = await portalTasks(props.session.token);
    } catch (e: any) {
        if (e?.response?.status === 401) {
            emit('logout', 'expired');
        } else if (!quiet) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
        }
    } finally {
        if (!quiet) loading.value = false;
    }
}

function goNewTask() {
    section.value = 'tasks';
    nextTick(() => tasksRef.value?.openCreate());
}

function goSearch() {
    section.value = 'tasks';
    nextTick(() => tasksRef.value?.focusSearch());
}

function goOverdue() {
    section.value = 'tasks';
    nextTick(() => tasksRef.value?.showOverdue());
}

const unread = ref(0);
const notifRef = ref<InstanceType<typeof PortalNotificationPanel> | null>(null);
let notifTimer: number | null = null;
let lastNotifId = 0;
let notifInit = false;

async function refreshUnread() {
    if (document.hidden) return;
    try {
        const list = await portalNotifications(props.session.token);
        unread.value = list.filter((n) => !n.read).length;
        const maxId = list.reduce((m, n) => Math.max(m, Number(n.notificationKyId ?? 0)), 0);
        if (!notifInit) {
            notifInit = true;
            lastNotifId = maxId;
        } else if (maxId > lastNotifId) {
            lastNotifId = maxId;
            toast.add({ severity: 'info', summary: 'Novedades recibidas', detail: 'Lista de tareas actualizada', life: 4000 });
        }
        // Refresco periódico garantizado: la otra parte puede haber cambiado
        // estados o comentarios por vías que no generan aviso.
        await loadTasks(true);
        tasksRef.value?.refreshOpenDetail();
    } catch {
        /* sin notificaciones */
    }
}

function goTaskFromNotif(taskPkid: number) {
    section.value = 'tasks';
    nextTick(() => tasksRef.value?.openTaskByPkid(taskPkid));
}

function onGlobalKey(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        goSearch();
    }
}

function onWindowFocus() {
    void refreshUnread();
}

onMounted(() => {
    tickClock();
    clockTimer = window.setInterval(tickClock, 1000);
    window.addEventListener('keydown', onGlobalKey);
    window.addEventListener('focus', onWindowFocus);
    void loadTasks();
    void refreshUnread();
    notifTimer = window.setInterval(refreshUnread, 45000);
});

onUnmounted(() => {
    if (clockTimer != null) window.clearInterval(clockTimer);
    if (notifTimer != null) window.clearInterval(notifTimer);
    window.removeEventListener('keydown', onGlobalKey);
    window.removeEventListener('focus', onWindowFocus);
});
</script>

<style scoped>
.portal-app {
    font-family: 'Segoe UI', Arial, sans-serif;
    background-color: #f9fafb;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: #1f2937;
}

/* TOPBAR */
.p-topbar {
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 15px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    position: sticky;
    top: 0;
    z-index: 30;
}
.p-topbar-left {
    display: flex;
    align-items: center;
    gap: 20px;
}
.p-logo {
    height: 35px;
    width: auto;
    object-fit: contain;
}
.p-div {
    width: 1px;
    height: 30px;
    background-color: #e5e7eb;
}
.p-titleblock {
    display: flex;
    min-width: 0;
    flex-direction: column;
}
.p-appname {
    font-size: 0.85rem;
    color: #9cc10a;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.p-date {
    font-size: 0.9rem;
    color: #6b7280;
    font-weight: 500;
    margin-top: 2px;
}
.p-topbar-right {
    display: flex;
    align-items: center;
    gap: 25px;
}
.p-search-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    border: 1px solid #e3e7ee;
    border-radius: 999px;
    background: #fbfcfd;
    color: #5a6472;
    font-size: 0.86rem;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
}
.p-search-pill:hover {
    border-color: #9cc10a;
    box-shadow: 0 4px 12px rgba(156, 193, 10, 0.18);
}
.p-search-pill kbd {
    padding: 1px 6px;
    border: 1px solid #d9dfe8;
    border-radius: 5px;
    background: #f1f3f6;
    color: #7a8392;
    font-size: 0.66rem;
    font-family: inherit;
    font-weight: 700;
}
.p-bell {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 5px;
}
.p-bell > i,
.p-bell .pi-bell {
    font-size: 1.4rem;
    color: #4b5563;
}
.p-logout {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 0.9rem;
    transition: color 0.2s;
}
.p-logout:hover {
    color: #ef4444;
}
.p-div-h {
    width: 1px;
    height: 24px;
    background-color: #e5e7eb;
}
.p-user {
    display: flex;
    align-items: center;
    gap: 12px;
}
.p-user span {
    font-size: 0.9rem;
    color: #4b5563;
    font-weight: 600;
}
.p-avatar {
    background-color: #f9fbe7 !important;
    color: #648506 !important;
    font-weight: 700 !important;
    border: 2px solid #9cc10a !important;
    cursor: default;
}

/* BODY + SIDEBAR */
.p-body {
    flex: 1;
    display: flex;
    min-height: 0;
}
.p-sidebar {
    flex: 0 0 240px;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid #e8ebf1;
    box-shadow: 2px 0 12px rgba(17, 24, 39, 0.04);
    transition: flex-basis 0.22s ease;
}
.p-sidebar--collapsed {
    flex-basis: 64px;
}
.p-sidebar__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 10px 8px 20px;
    min-height: 50px;
}
.p-sidebar--collapsed .p-sidebar__head {
    justify-content: center;
    padding: 10px 8px;
}
.p-sidebar__title {
    color: #707a88;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.p-sidebar__toggle {
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border: none;
    border-radius: 8px;
    background: #f1f3f6;
    color: #5a6472;
    cursor: pointer;
    font-size: 0.8rem;
    transition: background 0.15s, color 0.15s;
}
.p-sidebar__toggle:hover {
    background: #e7f2cd;
    color: #5f7d07;
}
.p-sidebar__nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
    overflow-y: auto;
    overflow-x: hidden;
}
.p-sidebar__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 9px 10px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #374151;
    font: inherit;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}
.p-sidebar__item:hover {
    background: #f2f5ea;
}
.p-sidebar__item--active {
    background: #eef5d7;
    color: #42560c;
    box-shadow: inset 2.5px 0 0 #9cc10a;
}
.p-sidebar__item-icon {
    display: grid;
    width: 32px;
    height: 32px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 9px;
    font-size: 0.9rem;
}
.p-icon-kiwi {
    color: #648506;
    background: #eef5d7;
}
.p-icon-task {
    color: #8a6d1b;
    background: #f5efdc;
}
.p-sidebar__item-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.p-sidebar__item-arrow {
    font-size: 0.72rem;
    color: #a7afbc;
    flex: 0 0 auto;
}
.p-sidebar--collapsed .p-sidebar__item {
    justify-content: center;
    padding: 9px 0;
}
.p-sidebar__foot {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px dashed #e5e9f0;
    color: #98a0ad;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.05em;
}

/* CONTENIDO */
.p-content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
}
.dashboard {
    --kiwi: #9cc10a;
    --kiwi-dark: #648506;
    width: 100%;
    padding: 18px 18px 88px;
    color: #1f2937;
}
.dashboard-hero {
    position: relative;
    isolation: isolate;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 96px;
    padding: 15px 24px;
    overflow: hidden;
    border: 1px solid #e7edcf;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 6px 18px rgba(31, 41, 55, 0.07);
}
.dashboard-hero::after {
    content: "";
    position: absolute;
    z-index: 0;
    width: 300px;
    height: 300px;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: url('/logos/logo512.png') center/contain no-repeat;
    filter: grayscale(1);
    opacity: 0.075;
    pointer-events: none;
}
.hero-copy {
    position: relative;
    z-index: 1;
    max-width: 720px;
}
.hero-eyebrow,
.section-kicker {
    color: var(--kiwi-dark);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}
.hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}
.dashboard-hero h1 {
    margin: 5px 0 3px;
    color: #172033;
    font-size: clamp(1.5rem, 2.5vw, 1.85rem);
    line-height: 1.05;
}
.dashboard-hero p {
    margin: 0;
    color: #657084;
    font-size: 1rem;
    line-height: 1.4;
}
.recents-section {
    margin-top: 22px;
}
.section-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 16px;
}
.section-heading.compact {
    margin-bottom: 10px;
}
.section-heading h2 {
    margin: 4px 0 0;
    color: #253047;
    font-size: 1.3rem;
}
.recents-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}
.recent-chip {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 7px 14px 7px 8px;
    border: 1px solid #e5e9f0;
    border-radius: 999px;
    background: #fff;
    color: #344054;
    font: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(17, 24, 39, 0.05);
    transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.recent-chip:hover {
    transform: translateY(-2px);
    border-color: #cfe0a8;
    box-shadow: 0 8px 18px rgba(17, 24, 39, 0.09);
}
.recent-icon {
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border-radius: 50%;
    font-size: 0.8rem;
}
.actions-section {
    margin-top: 22px;
}
.actions-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}
.action-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid #e3e8d2;
    border-radius: 12px;
    background: #fff;
    font: inherit;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
    transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}
.action-card:hover {
    transform: translateY(-3px);
    border-color: #cfe0a8;
    box-shadow: 0 10px 24px rgba(31, 41, 55, 0.1);
}
.action-card--quiet {
    opacity: 0.62;
}
.action-icon {
    display: grid;
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 12px;
    color: #fff;
    box-shadow: inset 0 1px rgba(255, 255, 255, 0.25), 0 4px 10px rgba(38, 48, 68, 0.12);
}
.action-icon i {
    font-size: 1.15rem;
}
.action-copy {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
}
.action-copy strong {
    font-size: 1.3rem;
    line-height: 1.1;
    color: #172033;
    font-variant-numeric: tabular-nums;
}
.action-copy > span {
    font-size: 0.82rem;
    font-weight: 700;
    color: #202939;
}
.action-copy small {
    overflow: hidden;
    color: #7d8797;
    font-size: 0.7rem;
    margin-top: 2px;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.action-arrow {
    flex: 0 0 auto;
    color: #c3cad6;
    font-size: 0.75rem;
}
.tasks-section {
    width: 100%;
    padding: 18px 18px 88px;
}

/* FOOTER */
.p-footer {
    background-color: white;
    border-top: 1px solid #e5e7eb;
    padding: 12px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
}
.p-footer-left {
    display: flex;
    align-items: center;
    gap: 15px;
}
.p-footer-left > i {
    color: #9cc10a;
    font-size: 1.2rem;
}
.p-footer-company {
    display: flex;
    flex-direction: column;
}
.p-footer-company-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
}
.p-footer-company-name {
    color: #374151;
    font-weight: 700;
}
.p-footer-sep {
    width: 1px;
    height: 12px;
    background-color: #d1d5db;
}
.p-footer-contact {
    color: #6b7280;
    font-weight: 500;
}
.p-footer-slogan {
    font-size: 0.75rem;
    color: #9ca3af;
    font-style: italic;
    margin-top: 1px;
}
.p-footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.85rem;
    color: #9ca3af;
    font-weight: 500;
}
.p-footer-logo {
    height: 18px;
    width: auto;
    opacity: 0.85;
}
.p-footer-version {
    color: #9cc10a;
    font-weight: 700;
}
.p-footer-dot {
    width: 4px;
    height: 4px;
    background-color: #d1d5db;
    border-radius: 50%;
}

@media (max-width: 1400px) {
    .actions-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 920px) {
    .p-topbar {
        padding: 12px 16px;
    }
    .p-topbar-right {
        gap: 16px;
    }
    .p-search-pill kbd {
        display: none;
    }
    .p-search-pill span {
        display: none;
    }
    .p-date {
        display: none;
    }
    .p-user span {
        display: none;
    }
    .p-sidebar {
        flex-basis: 64px;
    }
    .p-sidebar__title,
    .p-sidebar__item-label,
    .p-sidebar__item-arrow,
    .p-sidebar__foot {
        display: none;
    }
    .p-sidebar__head {
        justify-content: center;
        padding: 10px 8px;
    }
    .p-sidebar__item {
        justify-content: center;
        padding: 9px 0;
    }
    .p-footer {
        padding: 10px 16px;
    }
    .p-footer-slogan,
    .p-footer-contact {
        display: none;
    }
}
@media (max-width: 720px) {
    .dashboard,
    .tasks-section {
        padding: 18px 15px 78px;
    }
    .actions-grid {
        grid-template-columns: 1fr;
    }
}
</style>
