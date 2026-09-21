<template>
  <SettingsPanelCard
    class="backup-panel"
    title="Salvaguarda de datos"
    subtitle="Copias de seguridad de la base de datos y del repositorio documental"
    icon="pi pi-shield"
  >

    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

    <section class="backup-card">
      <div class="card-head">
        <h5><i class="pi pi-history"></i> Histórico de copias</h5>
        <div class="card-actions">
          <Button label="Actualizar histórico" icon="pi pi-refresh" severity="secondary" outlined size="small"
            :loading="loading" @click="loadHistory(0)" />
          <Button label="Crear copia" icon="pi pi-play" size="small" class="backup-primary" :loading="runningBackup"
            :disabled="!settings.provider" @click="startManualBackup" />
        </div>
      </div>
      <p class="backup-note">
        La copia incluye la base de datos y el repositorio documental (adjuntos y gestdoc). Los documentos se
        copian por incrementos: primera vez todo, después sólo lo nuevo o modificado.
      </p>
      <DataTable class="backup-history-table" :value="backups" :loading="loading" lazy :totalRecords="totalRecords" :rows="rowsPerPage"
        :first="first" @page="onPage" paginator :rowsPerPageOptions="[5, 10, 25]"
        emptyMessage="Todavía no hay copias registradas." size="small" stripedRows scrollable
        scrollHeight="clamp(260px, 38vh, 450px)">
        <Column field="createdAt" header="Fecha" :sortable="false" style="min-width: 150px">
          <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
        </Column>
        <Column field="scope" header="Contenido" :sortable="false" style="min-width: 190px">
          <template #body="{ data }">
            <Tag :value="scopeLabel(data.scope)" :severity="scopeSeverity(data.scope)" />
          </template>
        </Column>
        <Column field="provider" header="Destino" :sortable="false" style="min-width: 150px">
          <template #body="{ data }">
            <span class="dest-inline"><i :class="providerIcon(data.provider)"></i>{{
              providerLabel(data.provider) }}</span>
          </template>
        </Column>
        <Column field="sizeBytes" header="Tamaño" :sortable="false" style="min-width: 90px">
          <template #body="{ data }">{{ formatSize(data.sizeBytes ?? data.size) }}</template>
        </Column>
        <Column field="status" header="Estado" :sortable="false" style="min-width: 110px">
          <template #body="{ data }">
            <Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" />
          </template>
        </Column>
        <Column header="Acciones" :sortable="false" style="width: 100px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button icon="pi pi-download" aria-label="Descargar copia" text rounded severity="secondary" v-tooltip.top="'Descargar copia'"
                :disabled="data.status !== 'OK'" @click="downloadBackup(data)" />
              <Button icon="pi pi-trash" aria-label="Eliminar copia" text rounded severity="danger" v-tooltip.top="'Eliminar copia'"
                :disabled="data.status === 'RUNNING'" @click="openDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
      <Message v-if="!loading && !backups.length" severity="info" :closable="false" class="history-empty">
        Las copias realizadas por la infraestructura quedarán reflejadas aquí.
      </Message>
    </section>

    <DocumentBackupPanel v-if="settings.provider === 'DRIVE'" />

    <section class="backup-card">
      <h5><i class="pi pi-cloud"></i> Configuración de las copias</h5>
      <p class="backup-note">
        Configura tu cuenta de Google Drive para conservar una copia fuera del
        servidor. Cada copia generada por la infraestructura se entregará a este destino.
      </p>
      <div class="form-row destination-fields">
        <div class="form-item">
          <label for="bk-drive-folder">Carpeta de Google Drive</label>
          <InputText id="bk-drive-folder" v-model="settings.driveFolderId" placeholder="ID de la carpeta"
            class="w-full" size="small" :disabled="saving || testingCloud" />
        </div>
      </div>

      <div class="oauth-box">
          <div class="oauth-info">
            <i class="pi" :class="driveAuthorized ? 'pi-check-circle' : 'pi-exclamation-triangle'"></i>
            <div>
              <strong>{{ driveAuthorized ? 'Google Drive autorizado' : 'Google Drive no autorizado' }}</strong>
              <p>{{ driveAuthorized ? 'Cuenta conectada para guardar las copias.' : 'Conecta tu cuenta para guardar las copias.' }}</p>
            </div>
          </div>
          <Button :label="driveAuthorized ? 'Reautorizar' : 'Autorizar Google'" icon="pi pi-google"
            severity="secondary" outlined size="small" :loading="authPending"
            @click="startDriveAuth" />
        </div>

      <div class="backup-schedule">
        <div class="backup-schedule__heading">
          <span class="backup-schedule__icon"><i class="pi pi-clock"></i></span>
          <div>
            <label for="bk-schedule-enabled">Copia automática diaria</label>
            <small>La programación utiliza la zona horaria Europe/Madrid.</small>
          </div>
          <ToggleSwitch id="bk-schedule-enabled" v-model="settings.scheduleEnabled" :disabled="saving" />
        </div>
        <div class="backup-schedule__time">
          <label for="bk-schedule-time">Hora de ejecución</label>
          <InputText id="bk-schedule-time" v-model="settings.scheduleTime" type="time" size="small"
            :disabled="saving || !settings.scheduleEnabled" />
          <small v-if="settings.lastScheduledRun">Última ejecución automática: {{ settings.lastScheduledRun }}</small>
          <small v-else>Todavía no se ha registrado ninguna ejecución automática.</small>
        </div>
      </div>

      <div class="form-item backup-notifications">
        <label for="bk-notify-users"><i class="pi pi-bell" /> Avisos del resultado</label>
        <MultiSelect id="bk-notify-users" v-model="settings.notifyUserIds" :options="notifyOptions"
          optionValue="id" optionLabel="label" filter display="chip" :loading="loadingCandidates"
          :disabled="saving || testingCloud" :placeholder="loadingCandidates ? 'Cargando usuarios…' : 'Selecciona usuarios'"
          class="w-full" size="small" />
        <small class="field-hint">Los usuarios seleccionados recibirán un mensaje en la campana de KiwiKERP cuando la copia termine o falle.</small>
      </div>
      <div class="kiwik-separator" />
      <div class="settings-footer">
        <div class="actions">
          <Button label="Recargar ajustes" icon="pi pi-refresh" severity="secondary" text size="small"
            :disabled="saving" @click="loadSettings" />
          <Button label="Probar conexión" icon="pi pi-link" severity="secondary" outlined size="small"
            :loading="testingCloud" :disabled="saving" @click="testCloud" />
          <Button label="Guardar configuración" icon="pi pi-save" size="small" :loading="saving"
            :disabled="testingCloud" @click="saveSettings" />
        </div>
      </div>
    </section>

    <Dialog v-model:visible="authDialog" modal header="Autorizar Google Drive" :draggable="false"
      :closable="!authWaiting" class="kiwik-dialog" :style="{ width: 'min(620px,94vw)' }">
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <template v-if="driveAuth?.status === 'waiting'">
        <div class="auth-waiting">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Autorización abierta en otra pestaña. Esperando a que Google redirija al servidor…</p>
          <p class="field-hint">La autorización se completa sola: Google redirige al servidor y aquí se detecta al
            instante. Si el navegador muestra «no se puede conectar», usa el enlace manual.</p>
          <Button label="Completar manualmente" icon="pi pi-key" severity="secondary" text size="small"
            @click="driveAuth.status = 'manual'" />
        </div>
      </template>
      <template v-else>
        <ol class="oauth-steps">
          <li>Pulsa <strong>Abrir autorización</strong> para abrir Google en una pestaña nueva.</li>
          <li>Selecciona la cuenta y pulsa <em>Continuar</em> para conceder los permisos.</li>
          <li>Google redirigirá de vuelta a la aplicación; el token se guarda automáticamente.</li>
        </ol>
        <div class="oauth-window">
          <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png" alt="" width="32" />
          <Button :label="driveAuth?.authUrl ? 'Abrir autorización' : 'Generar enlace'" icon="pi pi-external-link"
            severity="primary" text @click="openDriveAuthFlow" />
        </div>
        <template v-if="driveAuth?.status === 'manual'">
          <div class="form-item" style="margin-top: 14px">
            <label for="bk-oauth-code">Dirección tras autorizar (con code=…)</label>
            <InputText id="bk-oauth-code" v-model="driveAuth.code"
              placeholder="http://localhost:8083/WebDriveOAuthCallback?state=…&code=…" class="w-full" size="small"
              :disabled="authPending" />
            <small class="field-hint">Pega aquí la URL completa (aunque muestre «no se puede conectar»); el sistema
              extraerá el <code>code</code> automáticamente.</small>
          </div>
        </template>
      </template>
      <template #footer>
        <Button v-if="driveAuth?.status === 'manual'" label="Completar autorización" icon="pi pi-check"
          :loading="authPending" @click="completeDriveAuth" />
        <Button label="Cerrar" severity="secondary" text :disabled="authWaiting" @click="authDialog = false" />
      </template>
    </Dialog>

    <Dialog v-model:visible="confirmDelete" modal header="Eliminar copia" :draggable="false"
      class="kiwik-dialog" :style="{ width: 'min(540px,94vw)' }">
      <p v-if="pendingDelete">
        Eliminarás la copia de <strong>{{ scopeLabel(pendingDelete.scope) }}</strong>
        del {{ formatDate(pendingDelete.createdAt) }}. Se eliminará junto con su archivo del destino de
        almacenamiento. Esta acción no puede deshacerse.
      </p>
      <template #footer>
        <Button label="Cancelar" text severity="secondary" @click="confirmDelete = false" />
        <Button label="Eliminar" icon="pi pi-trash" severity="danger" @click="confirmRemove" />
      </template>
    </Dialog>
  </SettingsPanelCard>
</template>

<script setup lang="ts">
import SettingsPanelCard from './SettingsPanelCard.vue';
import { computed, onMounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import MultiSelect from 'primevue/multiselect';
import ToggleSwitch from 'primevue/toggleswitch';
import { Frm_Backup } from '@/services/Frm_Ajustes/Frm_Backup';
import type { BackupRecord, BackupScope, BackupStatus, CloudProvider } from '@/services/Frm_Ajustes/Frm_Backup';
import { HelperDates } from '@/libs/HelperDates';
import DocumentBackupPanel from './DocumentBackupPanel.vue';

const {
  backups,
  totalRecords,
  rowsPerPage,
  first,
  loading,
  saving,
  testingCloud,
  settings,
  notifyCandidates,
  loadingCandidates,
  error,
  success,
  loadHistory,
  deleteBackup,
  downloadBackup,
  loadSettings,
  loadNotifyCandidates,
  saveSettings,
  testCloud,
  runBackup,
  runningBackup,
  driveAuth,
  authPending,
  loadDriveAuthStatus,
  requestDriveAuthUrl,
  openDriveAuthUrl,
  openDriveAuth,
  waitDriveAuth,
  submitDriveAuthCode,
} = Frm_Backup();

const confirmDelete = ref(false);
const pendingDelete = ref<BackupRecord | null>(null);
const authDialog = ref(false);
const authWaiting = ref(false);

const driveAuthorized = computed(() => driveAuth.value.status === 'done');

async function openDriveAuthFlow() {
  await openDriveAuth(true, () => {
    authWaiting.value = false;
  });
  authWaiting.value = driveAuth.value.status === 'waiting';
}

async function startDriveAuth() {
  authDialog.value = true;
  await loadDriveAuthStatus();
  if (driveAuth.value.status !== 'ready') {
    await requestDriveAuthUrl();
  }
  if (driveAuth.value.authUrl) {
    await openDriveAuthFlow();
  }
}

async function completeDriveAuth() {
  await submitDriveAuthCode();
  if (driveAuth.value.status === 'done') {
    authDialog.value = false;
    authWaiting.value = false;
  }
}

async function startManualBackup() {
  await runBackup();
  if (driveAuth.value.status === 'ready' && driveAuth.value.authUrl) {
    await startDriveAuth();
  }
}

const providerMeta: Record<string, { label: string; icon: string; hint: string }> = {
  // Se conserva AZURE solo para mostrar el histórico antiguo.
  AZURE: {
    label: 'Azure Blob Storage',
    icon: 'pi pi-cloud',
    hint: 'Cada copia se sube a tu cuenta de Azure al finalizar el volcado.',
  },
  DRIVE: {
    label: 'Google Drive',
    icon: 'pi pi-cloud-upload',
    hint: 'Cada copia se sube a tu cuenta de Google Drive al finalizar el volcado.',
  },
};

const scopeMeta: Record<BackupScope, { label: string; severity: string }> = {
  DB: { label: 'Base de datos', severity: 'info' },
  DOCS: { label: 'Documentos', severity: 'warn' },
  ALL: { label: 'Base de datos + documentos', severity: 'success' },
};

const statusMeta: Record<BackupStatus, { label: string; severity: string }> = {
  OK: { label: 'Completada', severity: 'success' },
  RUNNING: { label: 'En curso', severity: 'warn' },
  ERROR: { label: 'Fallida', severity: 'danger' },
};

const provider = computed<CloudProvider>(() => settings.value.provider);
const providerInfo = computed(() => providerMeta[provider.value] || providerMeta.DRIVE);

const notifyOptions = computed(() =>
  notifyCandidates.value.map((u) => ({
    id: u.id,
    label: `${u.name || 'Usuario'}${u.email ? ' · ' + u.email : ''}`,
  })),
);

function onPage(event: { first: number; rows: number }) {
  void loadHistory(Math.floor(event.first / event.rows));
}

watch(
  () => driveAuth.value.status,
  (status) => {
    if (status === 'done' && authDialog.value) authDialog.value = false;
  },
);

function formatDate(value?: string): string {
  return HelperDates.formatDateFromLocale(value);
}

function formatSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || bytes < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function scopeLabel(value: BackupScope | string): string {
  return scopeMeta[value as BackupScope]?.label || String(value);
}

function scopeSeverity(value: BackupScope | string): string {
  return scopeMeta[value as BackupScope]?.severity || 'secondary';
}

function providerLabel(value: CloudProvider | string): string {
  return providerMeta[value as CloudProvider]?.label || String(value);
}

function providerIcon(value: CloudProvider | string): string {
  return providerMeta[value as CloudProvider]?.icon || 'pi pi-cloud';
}

function statusLabel(value: BackupStatus | string): string {
  return statusMeta[value as BackupStatus]?.label || String(value);
}

function statusSeverity(value: BackupStatus | string): string {
  return statusMeta[value as BackupStatus]?.severity || 'secondary';
}

function openDelete(record: BackupRecord) {
  pendingDelete.value = record;
  confirmDelete.value = true;
}

function confirmRemove() {
  if (pendingDelete.value) {
    const record = pendingDelete.value;
    confirmDelete.value = false;
    pendingDelete.value = null;
    void deleteBackup(record);
  }
}

onMounted(() => {
  void loadSettings();
  void loadHistory(0);
  void loadDriveAuthStatus();
  void loadNotifyCandidates();
});
</script>

<style scoped>
.backup-panel {
  width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.backup-card {
  min-width: 0;
  background: white;
  padding: 18px;
  border: 1px solid #e3e8ee;
  border-radius: 12px;
}

.backup-card h5 {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 12px;
  padding-bottom: 11px;
  border-bottom: 1px solid #edf0f3;
  color: #445064;
  font-size: 1rem;
}

.backup-card h5 i {
  color: #648506;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #edf0f3;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-head h5 {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: 0;
}

.backup-note {
  margin: 0 0 16px;
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.form-item {
  min-width: 0;
  display: grid;
  gap: 6px;
  align-content: start;
}

.form-item label {
  margin: 0;
  font-weight: 600;
}

.form-item .p-inputtext,
.form-item .p-password,
.form-item .p-select {
  width: 100%;
}

.dest-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dest-inline i {
  color: #648506;
}

.row-actions {
  display: flex;
  gap: 2px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.settings-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
}

.destination-fields {
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 2fr);
}

.backup-notifications {
  padding: 16px;
  margin-top: 20px;
  background: #f8fafc;
  border: 1px solid #e3e8ee;
  border-radius: 10px;
  gap: 10px;
}

.backup-schedule {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(210px, auto);
  gap: 18px;
  align-items: center;
  margin-top: 20px;
  padding: 16px;
  border: 1px solid #dfe7c8;
  border-radius: 10px;
  background: #fafcf4;
}

.backup-schedule__heading {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
}

.backup-schedule__icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #648506;
  background: #edf5d9;
}

.backup-schedule label {
  display: block;
  color: #445064;
  font-weight: 700;
}

.backup-schedule small {
  display: block;
  margin-top: 3px;
  color: #657084;
  font-size: .82rem;
}

.backup-schedule__time {
  display: grid;
  grid-template-columns: auto 105px;
  align-items: center;
  gap: 6px 10px;
}

.backup-schedule__time small {
  grid-column: 1 / -1;
  text-align: right;
}

.backup-card > .kiwik-separator {
  margin: 22px 0 16px;
}

.backup-notifications label i {
  margin-right: 6px;
  color: #648506;
}

.footer-label {
  color: #657084;
  font-size: 0.85rem;
}

.card-actions :deep(.p-button),
.actions :deep(.p-button),
.oauth-box :deep(.p-button) {
  min-height: 36px;
  white-space: nowrap;
}

.backup-primary:not(:disabled) {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}

.backup-primary:not(:disabled):hover {
  background: #8bad09;
  border-color: #8bad09;
}

.history-empty {
  margin-top: 12px;
}

.backup-history-table {
  min-height: 330px;
}

.backup-history-table :deep(.p-datatable-table-container) {
  min-height: 260px;
  border: 1px solid #e7ebef;
  border-radius: 9px 9px 0 0;
}

.backup-history-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
}

.oauth-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  background: #f7f9f4;
  border: 1px solid #e3ecce;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.oauth-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: min(260px, 100%);
}

.oauth-info > i {
  margin-top: 3px;
  color: #648506;
}

.oauth-info strong {
  display: block;
  color: #445064;
}

.oauth-info p {
  margin: 2px 0 0;
  color: #657084;
  font-size: 0.85rem;
  line-height: 1.5;
}

.oauth-steps {
  margin: 0 0 6px;
  padding-left: 20px;
  color: #445064;
  line-height: 1.8;
}

.oauth-steps code,
.field-hint code {
  background: #f1f3f5;
  border: 1px solid #e3e8ee;
  border-radius: 4px;
  padding: 0 5px;
  font-size: 0.85em;
}

.oauth-window {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.auth-waiting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 14px 4px;
  text-align: center;
}

.auth-waiting > i {
  font-size: 2rem;
  color: #648506;
}

.auth-waiting p {
  margin: 0;
  color: #445064;
  line-height: 1.6;
}

@media (max-width: 700px) {
  .card-actions,
  .actions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .oauth-box > .p-button {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .backup-card {
    padding: 14px;
  }

  .backup-schedule {
    grid-template-columns: 1fr;
  }

  .backup-schedule__time small {
    text-align: left;
  }
}

/* Lenguaje visual común para todos los bloques de Salvaguarda. */
.backup-panel :deep(.backup-card),
.backup-panel :deep(.backup-section) {
  border: 1px solid #dfe5eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: none;
}

.backup-panel :deep(.backup-card h3),
.backup-panel :deep(.backup-card h4),
.backup-panel :deep(.backup-card h5),
.backup-panel :deep(.backup-section h3),
.backup-panel :deep(.backup-section h4),
.backup-panel :deep(.backup-section h5) {
  color: #334155;
  font-size: .92rem;
  font-weight: 700;
}

.backup-panel :deep(.backup-card i),
.backup-panel :deep(.backup-section i) {
  color: #719808;
}

</style>
