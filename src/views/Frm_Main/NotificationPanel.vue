<template>
  <Dialog
    v-model:visible="visible"
    modal
    class="kiwik-dialog notification-dialog"
    :style="{ width: 'min(520px, 95vw)' }"
    @hide="q = ''">
    <template #header>
      <div class="notification-header">
        <span class="notification-header__icon"><i class="pi pi-bell"></i></span>
        <div>
          <small>Centro de mensajes</small>
          <h2>Notificaciones</h2>
        </div>
        <Button
          v-if="store.unreadCount > 0"
          label="Marcar todas como leídas"
          icon="pi pi-check"
          text
          size="small"
          class="notification-header__markall"
          @click="store.markAllRead()" />
      </div>
    </template>

    <div class="notification-body">
      <div v-if="store.loading && !store.messages.length" class="notification-state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Cargando notificaciones…</span>
      </div>

      <div v-else-if="!store.messages.length" class="notification-state">
        <i class="pi pi-inbox"></i>
        <span>No tienes notificaciones.</span>
      </div>

      <template v-else>
        <input
          v-model="q"
          type="text"
          class="notification-filter"
          placeholder="Filtrar notificaciones…" />

        <ul class="notification-list">
          <li
            v-for="m in filteredMessages"
            :key="m.pkid"
            class="notification-item"
            :class="{ 'notification-item--unread': !m.read }"
            role="button"
            :tabindex="0"
            @click="openMessage(m)"
            @keydown.enter="openMessage(m)">
            <span class="notification-item__icon" :style="{ color: iconFor(m.type).color, background: iconFor(m.type).bg }">
              <i :class="iconFor(m.type).icon"></i>
            </span>
            <span class="notification-item__content">
              <span class="notification-item__title">{{ m.title }}</span>
              <span class="notification-item__body">{{ m.body }}</span>
              <span class="notification-item__meta">{{ formatDate(m.createdAt) }}</span>
            </span>
            <i v-if="!m.read" class="notification-item__dot"></i>
            <i v-else-if="m.link" class="pi pi-external-link notification-item__go"></i>
          </li>
          <li v-if="!filteredMessages.length" class="notification-item notification-item--empty">
            No hay notificaciones que coincidan.
          </li>
        </ul>
      </template>
    </div>
  </Dialog>

  <Dialog
    v-model:visible="detailVisible"
    modal
    class="kiwik-dialog notification-detail-dialog"
    :style="{ width: 'min(500px, 95vw)' }">
    <template #header>
      <div v-if="selected" class="notification-detail-header">
        <span
          class="notification-item__icon"
          :style="{ color: iconFor(selected.type).color, background: iconFor(selected.type).bg }">
          <i :class="iconFor(selected.type).icon"></i>
        </span>
        <div>
          <small>Detalle del mensaje</small>
          <h2>{{ selected.title }}</h2>
        </div>
      </div>
    </template>
    <div v-if="selected" class="notification-detail-body">
      <p class="notification-detail-meta">
        {{ typeLabel(selected.type) }} · {{ selected.read ? "Leído" : "No leído" }} · {{ formatDate(selected.createdAt) }}
      </p>
      <p class="notification-detail-text">{{ selected.body }}</p>
    </div>
    <template #footer>
      <div class="notification-detail-actions">
        <Button label="Cerrar" text severity="secondary" @click="detailVisible = false" />
        <Button
          v-if="selected?.link"
          :label="linkLabel(selected)"
          icon="pi pi-external-link"
          @click="goTo(selected)" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useMessagesStore } from '@/stores/messagesStore';
import { formatHumanDate } from '@/services/composables/UseServerTime';
import type { NotificationMessage, NotificationType } from '@/services/Frm_Main/MessageNotifications';

const ICONS: Record<NotificationType, { icon: string; color: string; bg: string }> = {
  quote: { icon: 'pi pi-file-edit', color: '#4f6fd0', bg: '#eef2fc' },
  order: { icon: 'pi pi-shopping-cart', color: '#b25e09', bg: '#fdf1e2' },
  delivery: { icon: 'pi pi-truck', color: '#0e7490', bg: '#e6f6f9' },
  invoice: { icon: 'pi pi-receipt', color: '#5b7d07', bg: '#eef5d7' },
  verifactu: { icon: 'pi pi-building-columns', color: '#8a4bd0', bg: '#f3edfc' },
  security: { icon: 'pi pi-shield', color: '#b42318', bg: '#fdefec' },
  system: { icon: 'pi pi-cog', color: '#475467', bg: '#eef0f3' },
  other: { icon: 'pi pi-info-circle', color: '#475467', bg: '#eef0f3' }
};

const router = useRouter();
const store = useMessagesStore();
const visible = ref(false);
const q = ref('');
const selected = ref<NotificationMessage | null>(null);

const detailVisible = computed({
  get: () => selected.value !== null,
  set: (v: boolean) => {
    if (!v) selected.value = null;
  }
});

const filteredMessages = computed(() => {
  const query = q.value.trim().toLowerCase();
  if (!query) return store.messages;
  return store.messages.filter(
    (m) => m.title.toLowerCase().includes(query) || m.body.toLowerCase().includes(query)
  );
});

function iconFor(type: NotificationType) {
  return ICONS[type] || ICONS.other;
}

function formatDate(raw: string): string {
  return formatHumanDate(raw);
}

function typeLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    quote: 'Presupuesto',
    order: 'Pedido',
    delivery: 'Entrega',
    invoice: 'Factura',
    verifactu: 'VeriFactu',
    security: 'Seguridad',
    system: 'Sistema',
    other: 'Notificación'
  };
  return labels[type] || labels.other;
}

function openMessage(m: NotificationMessage) {
  if (!m.read) void store.markRead(m);
  selected.value = m;
}

function goTo(m: NotificationMessage) {
  selected.value = null;
  if (m.link && typeof m.link === 'string') {
    visible.value = false;
    void router.push(m.link.startsWith('/') ? m.link : { name: m.link });
  }
}

function linkLabel(message: NotificationMessage): string {
  const link = message.link || '';
  if (link.includes('Frm_Ajustes') && link.includes('tab=5')) return 'Ir a Salvaguarda de datos';
  if (link.includes('Frm_Ajustes')) return 'Ir a Configuración';
  if (message.type === 'quote') return 'Ir a Presupuestos';
  if (message.type === 'order') return 'Ir a Pedidos';
  if (message.type === 'delivery') return 'Ir a Albaranes';
  if (message.type === 'invoice') return 'Ir a Facturas';
  return 'Abrir en KiwiKERP';
}

async function open() {
  q.value = '';
  visible.value = true;
  await store.loadMessages();
}

defineExpose({ open });
</script>

<style scoped>
.notification-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.notification-header__icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  color: #5f7d07;
  background: #edf5d5;
  font-size: 1.05rem;
}
.notification-header small {
  display: block;
  color: #71805f;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.notification-header h2 {
  margin: 2px 0 0;
  color: #202a37;
  font-size: 1.15rem;
}
.notification-header__markall {
  margin-left: auto;
}

.notification-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.notification-detail-header small {
  display: block;
  color: #71805f;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.notification-detail-header h2 {
  margin: 2px 0 0;
  color: #202a37;
  font-size: 1.05rem;
  line-height: 1.35;
  word-break: break-word;
}
.notification-detail-body {
  min-height: 60px;
}
.notification-detail-meta {
  margin: 0 0 12px;
  color: #858f9d;
  font-size: 0.78rem;
  font-weight: 600;
}
.notification-detail-text {
  margin: 0;
  color: #334155;
  font-size: 0.92rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.notification-detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 0.25rem;
}

.notification-body {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.notification-filter {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px 12px;
  border: 1px solid #d7dce5;
  border-radius: 9px;
  background: #fbfcfd;
  color: #1f2937;
  font: inherit;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.notification-filter:focus {
  border-color: #9cc10a;
  box-shadow: 0 0 0 3px rgba(156, 193, 10, 0.16);
}

.notification-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px 12px;
  border: 1px solid #e6e9ef;
  border-radius: 11px;
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
}
.notification-item:hover,
.notification-item:focus-visible {
  background: #f4f8ee;
  border-color: #d8e4bd;
  outline: none;
  box-shadow: 0 2px 10px rgba(156, 193, 10, 0.12);
}
.notification-item--unread {
  background: #fdfee9;
  border-color: #e2ecbe;
}
.notification-item__icon {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  font-size: 0.82rem;
}
.notification-item__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.notification-item__title {
  font-weight: 700;
  font-size: 0.88rem;
}
.notification-item__body {
  margin-top: 2px;
  color: #5b6470;
  font-size: 0.8rem;
  line-height: 1.45;
}
.notification-item__meta {
  margin-top: 5px;
  color: #98a0ad;
  font-size: 0.7rem;
}
.notification-item__dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  margin-top: 5px;
  border-radius: 50%;
  background: #b42318;
}
.notification-item__go {
  flex: 0 0 auto;
  margin-top: 5px;
  color: #a7afbc;
  font-size: 0.75rem;
}
.notification-item--empty {
  justify-content: center;
  color: #818a96;
  font-size: 0.85rem;
  cursor: default;
}

.notification-state {
  flex: 1;
  justify-content: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 42px 0;
  color: #818a96;
  font-size: 0.88rem;
}

:deep(.notification-dialog) {
  --notification-dialog-height: min(620px, calc(100dvh - 24px));
  height: var(--notification-dialog-height);
  min-height: var(--notification-dialog-height);
  max-height: var(--notification-dialog-height);
}

:deep(.notification-dialog .p-dialog-content) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

:deep(.notification-detail-dialog) {
  min-height: 270px;
  max-height: min(620px, calc(100dvh - 24px));
}

:deep(.notification-detail-dialog .p-dialog-content) {
  min-height: 80px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.notification-state > i {
  font-size: 2rem;
  color: #c3cad4;
}
</style>
