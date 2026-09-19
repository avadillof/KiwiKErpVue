<template>
  <SettingsPanelCard
    class="document-backups document-backups--kiwi"
    title="Recuperación documental"
    subtitle="Repositorio incremental y recuperación de documentos"
    icon="pi pi-folder"
  >
    <template #actions>
      <Button
        label="Actualizar documentos"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        size="small"
        :loading="loading"
        @click="load"
      />
    </template>

    <section class="document-backups__content">
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

      <div class="document-summary">
        <Tag :value="statusLabel" :severity="statusSeverity" />
        <span>Última copia documental completa: <strong>{{ date(catalog.lastCompletedAt) }}</strong></span>
        <span>Último progreso guardado: <strong>{{ date(catalog.updatedAt) }}</strong></span>
        <span>Retención de borrados y versiones: <strong>30 días</strong></span>
      </div>

      <p v-if="catalog.status === 'RUNNING'" class="hint">
        Copia iniciada o pendiente de finalizar. Si se reinició el servidor, este estado puede corresponder a una ejecución interrumpida.
      </p>
      <p class="hint">
        Descarga la versión elegida y colócala en la ruta original indicada. La descarga no sobrescribe documentos del
        servidor. El índice también se guarda en Drive, dentro de KERP_DOCUMENTAL_CONTROL.
      </p>

      <form class="search-row" @submit.prevent="load">
        <InputText
          v-model="search"
          aria-label="Buscar documento por nombre o ruta"
          placeholder="Buscar por nombre o ruta…"
        />
        <Button type="submit" label="Buscar" icon="pi pi-search" severity="secondary" outlined :disabled="loading" />
      </form>

      <div class="tree-toolbar">
        <span><i class="pi pi-sitemap"></i> {{ catalog.totalElements }} documentos organizados por carpetas</span>
        <div>
          <Button label="Expandir" icon="pi pi-plus" severity="secondary" text size="small" @click="expandAll" />
          <Button label="Contraer" icon="pi pi-minus" severity="secondary" text size="small" @click="collapseAll" />
        </div>
      </div>

      <TreeTable
        v-model:expandedKeys="expandedKeys"
        class="document-tree"
        :value="documentTree"
        :loading="loading"
        size="small"
        scrollable
        scrollHeight="clamp(340px, 48vh, 620px)"
      >
        <template #empty>No hay documentos registrados para esta búsqueda. Ejecuta una copia para generar el catálogo.</template>
        <Column field="name" header="Carpetas y documentos" expander>
          <template #body="{ node }">
            <span class="tree-entry" :class="{ 'tree-entry--folder': node.data.kind === 'folder' }">
              <i :class="node.data.kind === 'folder' ? 'pi pi-folder' : fileIcon(node.data.name)"></i>
              <span>{{ node.data.name }}</span>
            </span>
          </template>
        </Column>
        <Column header="Versión">
          <template #body="{ node }">
            <Tag
              v-if="node.data.kind === 'file'"
              :value="versionLabel(node.data.version.status)"
              :severity="node.data.version.status === 'CURRENT' ? 'success' : 'secondary'"
            />
          </template>
        </Column>
        <Column header="Modificado">
          <template #body="{ node }">{{ node.data.kind === 'file' ? date(node.data.version.modifiedAt) : '' }}</template>
        </Column>
        <Column header="Tamaño">
          <template #body="{ node }">{{ node.data.kind === 'file' ? sizeLabel(node.data.version.size) : '' }}</template>
        </Column>
        <Column header="Conservar hasta">
          <template #body="{ node }">{{ node.data.kind === 'file' ? date(node.data.version.expiresAt) : '' }}</template>
        </Column>
        <Column header="Recuperación">
          <template #body="{ node }">
            <Button
              v-if="node.data.kind === 'file'"
              label="Descargar"
              icon="pi pi-download"
              severity="secondary"
              outlined
              size="small"
              :loading="downloading === node.data.version.id"
              :disabled="!!downloading"
              @click="download(node.data.version)"
            />
          </template>
        </Column>
      </TreeTable>

      <div class="kiwik-separator" />
      <section class="bulk-export">
        <div class="bulk-export__copy">
          <span class="bulk-export__icon"><i class="pi pi-file-export"></i></span>
          <div>
            <strong>Descarga completa</strong>
            <p>Prepara en segundo plano un ZIP con la versión actual de todos los documentos y sus carpetas.</p>
            <small v-if="zipJob.status === 'RUNNING'">
              Preparando ZIP… {{ zipJob.processed || 0 }} documentos incorporados.
            </small>
            <small v-else-if="zipJob.status === 'READY'">
              Disponible: {{ zipJob.fileName }} · {{ sizeLabel(zipJob.size) }} · caduca {{ date(zipJob.expiresAt) }}.
            </small>
            <small v-else-if="zipJob.status === 'ERROR'" class="bulk-export__error">
              {{ zipJob.error || 'No se pudo preparar el ZIP documental.' }}
            </small>
          </div>
        </div>
        <div class="bulk-export__actions">
          <Button
            v-if="zipJob.status === 'READY'"
            label="Descargar ZIP"
            icon="pi pi-download"
            :loading="downloading === 'documents-zip'"
            :disabled="!!downloading"
            @click="downloadDocumentZip"
          />
          <Button
            :label="zipJob.status === 'READY' ? 'Preparar de nuevo' : 'Preparar ZIP completo'"
            :icon="zipJob.status === 'RUNNING' ? 'pi pi-spin pi-spinner' : 'pi pi-box'"
            severity="secondary"
            outlined
            :disabled="zipJob.status === 'RUNNING' || !!downloading"
            @click="prepareDocumentZip"
          />
        </div>
      </section>

      <div class="kiwik-separator" />
      <Button
        label="Descargar índice de recuperación"
        icon="pi pi-download"
        severity="secondary"
        outlined
        :disabled="!!downloading"
        @click="downloadIndex"
      />
    </section>
  </SettingsPanelCard>
</template>

<script setup lang="ts">
import SettingsPanelCard from './SettingsPanelCard.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';

interface DocumentVersion {
  id: string;
  path: string;
  status: 'CURRENT' | 'DELETED' | 'PREVIOUS';
  modifiedAt?: number;
  size?: number;
  expiresAt?: number;
}
interface Catalog {
  status: string;
  lastCompletedAt?: number;
  updatedAt?: number;
  content: DocumentVersion[];
  totalElements: number;
}
interface DocumentZipJob {
  id?: string;
  status: 'NONE' | 'RUNNING' | 'READY' | 'ERROR';
  processed?: number;
  total?: number;
  size?: number;
  fileName?: string;
  error?: string;
  expiresAt?: number;
}
interface DocumentTreeNode {
  key: string;
  data: {
    kind: 'folder' | 'file';
    name: string;
    version?: DocumentVersion;
  };
  children?: DocumentTreeNode[];
}

// El backend limita cada página del catálogo a 100 elementos.
const PAGE_SIZE = 100;
const auth = useAuthStore();
const catalog = ref<Catalog>({ status: 'UNKNOWN', content: [], totalElements: 0 });
const loading = ref(false);
const downloading = ref('');
const error = ref('');
const search = ref('');
const expandedKeys = ref<Record<string, boolean>>({});
const zipJob = ref<DocumentZipJob>({ status: 'NONE' });
let refresh: ReturnType<typeof setTimeout> | undefined;
let zipRefresh: ReturnType<typeof setTimeout> | undefined;
let disposed = false;
const statusLabel = computed(() => ({ OK: 'Documentos copiados', ERROR: 'Copia documental incompleta', RUNNING: 'Copia sin finalizar' }[catalog.value.status] || 'Sin resultado registrado'));
const statusSeverity = computed(() => catalog.value.status === 'OK' ? 'success' : catalog.value.status === 'ERROR' ? 'danger' : 'info');

const documentTree = computed(() => buildDocumentTree(catalog.value.content));

async function load() {
  if (loading.value) return;
  clearTimeout(refresh);
  loading.value = true;
  error.value = '';
  try {
    const firstResponse = await getCatalogPage(0);
    const content = [...firstResponse.content];
    const pageCount = Math.ceil(firstResponse.totalElements / PAGE_SIZE);

    for (let page = 1; page < pageCount; page += 1) {
      const response = await getCatalogPage(page);
      content.push(...response.content);
    }

    catalog.value = { ...firstResponse, content };
    expandedKeys.value = search.value.trim() ? collectFolderKeys(documentTree.value) : {};
  } catch {
    error.value = 'No se pudo consultar el respaldo documental. Comprueba la conexión y la autorización de Google Drive.';
  } finally {
    loading.value = false;
    if (!disposed && catalog.value.status === 'RUNNING') refresh = setTimeout(load, 15000);
  }
}

async function getCatalogPage(page: number) {
  const response = await axios.get<Catalog>(backendUrl('/WebGetDocumentBackupCatalog'), {
    ...auth.portalRequestConfig(),
    params: { search: search.value, page, size: PAGE_SIZE },
  });
  return response.data;
}

function buildDocumentTree(versions: DocumentVersion[]): DocumentTreeNode[] {
  const roots: DocumentTreeNode[] = [];
  const folders = new Map<string, DocumentTreeNode>();

  versions.forEach((version) => {
    const parts = version.path.split(/[\\/]+/).filter(Boolean);
    const fileName = parts.pop() || 'Documento';
    let children = roots;
    let parentPath = '';

    parts.forEach((folderName) => {
      const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;
      let folder = folders.get(folderPath);

      if (!folder) {
        folder = {
          key: `folder:${folderPath}`,
          data: { kind: 'folder', name: folderName },
          children: [],
        };
        folders.set(folderPath, folder);
        children.push(folder);
      }

      children = folder.children!;
      parentPath = folderPath;
    });

    children.push({
      key: `file:${version.id}`,
      data: { kind: 'file', name: fileName, version },
    });
  });

  sortTree(roots);
  return roots;
}

function sortTree(nodes: DocumentTreeNode[]) {
  nodes.sort((left, right) => {
    if (left.data.kind !== right.data.kind) return left.data.kind === 'folder' ? -1 : 1;
    return left.data.name.localeCompare(right.data.name, 'es', { numeric: true, sensitivity: 'base' });
  });
  nodes.forEach((node) => node.children && sortTree(node.children));
}

function collectFolderKeys(nodes: DocumentTreeNode[], keys: Record<string, boolean> = {}) {
  nodes.forEach((node) => {
    if (node.data.kind === 'folder') keys[node.key] = true;
    if (node.children) collectFolderKeys(node.children, keys);
  });
  return keys;
}

function expandAll() {
  expandedKeys.value = collectFolderKeys(documentTree.value);
}

function collapseAll() {
  expandedKeys.value = {};
}

function fileIcon(name: string) {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'pi pi-file-pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'pi pi-image';
  return 'pi pi-file';
}

async function download(version: DocumentVersion) {
  await downloadFile('/WebDownloadDocumentBackup', version.id, version.path.split(/[\\/]/).pop() || 'documento');
}
async function downloadIndex() {
  await downloadFile('/WebDownloadDocumentBackupIndex', '', 'documentos-backup-index.json');
}

async function prepareDocumentZip() {
  error.value = '';
  try {
    const response = await axios.post<DocumentZipJob>(
      backendUrl('/WebPrepareDocumentBackupZip'),
      {},
      auth.portalRequestConfig(),
    );
    zipJob.value = response.data;
    scheduleZipRefresh();
  } catch {
    error.value = 'No se pudo iniciar la preparación del ZIP documental.';
  }
}

async function loadDocumentZipStatus() {
  clearTimeout(zipRefresh);
  try {
    const response = await axios.get<DocumentZipJob>(
      backendUrl('/WebGetDocumentBackupZipStatus'),
      auth.portalRequestConfig(),
    );
    zipJob.value = response.data;
    scheduleZipRefresh();
  } catch {
    zipJob.value = { status: 'NONE' };
  }
}

function scheduleZipRefresh() {
  clearTimeout(zipRefresh);
  if (!disposed && zipJob.value.status === 'RUNNING') {
    zipRefresh = setTimeout(loadDocumentZipStatus, 5000);
  }
}

async function downloadDocumentZip() {
  if (!zipJob.value.id) return;
  downloading.value = 'documents-zip';
  error.value = '';
  try {
    const response = await axios.get(backendUrl('/WebDownloadDocumentBackupZip'), {
      ...auth.portalRequestConfig(),
      params: { id: zipJob.value.id },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipJob.value.fileName || 'kiwikerp-documentos.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    error.value = 'No se pudo descargar el ZIP documental. Puede haber caducado; prepáralo de nuevo.';
  } finally {
    downloading.value = '';
  }
}
async function downloadFile(endpoint: string, id: string, name: string) {
  downloading.value = id || 'index';
  error.value = '';
  try {
    const response = await axios.get(backendUrl(endpoint), {
      ...auth.portalRequestConfig(), params: id ? { id } : {}, responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    error.value = 'No se pudo descargar esta versión. Actualiza el catálogo: podría haber vencido o haberse eliminado de Drive.';
  } finally {
    downloading.value = '';
  }
}
function date(value?: number) {
  return value ? new Date(value).toLocaleString('es-ES') : '—';
}
function versionLabel(value: DocumentVersion['status']) {
  return { CURRENT: 'Actual', DELETED: 'Borrado', PREVIOUS: 'Anterior' }[value];
}
function sizeLabel(value?: number) {
  if (value == null) return '—';
  return value < 1048576 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1048576).toFixed(1)} MB`;
}
onMounted(() => {
  void load();
  void loadDocumentZipStatus();
});
onUnmounted(() => {
  disposed = true;
  clearTimeout(refresh);
  clearTimeout(zipRefresh);
});
</script>

<style scoped>
.document-backups { width: 100%; height: auto; min-width: 0; margin-top: 20px; border: 1px solid #e1e6ec; border-radius: 12px; background: #fff; box-shadow: none; overflow: hidden; }
.document-backups :deep(.p-card-body), .document-backups :deep(.p-card-content) { padding: 0; }
.document-backups__content { min-width: 0; }
.hint { color: #657084; font-size: .9rem; line-height: 1.6; }
.document-summary { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; padding: 14px; margin: 14px 0; background: #f8fafc; border-radius: 8px; }
.search-row { display: flex; gap: 8px; margin: 16px 0; }
.search-row .p-inputtext { flex: 1; min-width: 0; }
.tree-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 10px; color: #657084; font-size: .86rem; }
.tree-toolbar > span { display: flex; align-items: center; gap: 7px; }
.tree-toolbar > span i { color: #648506; }
.tree-toolbar > div { display: flex; gap: 4px; }
.tree-entry { min-width: 0; display: inline-flex; align-items: center; gap: 8px; color: #445064; }
.tree-entry i { color: #778192; }
.tree-entry--folder { color: #334155; font-weight: 700; }
.tree-entry--folder i { color: #719808; }
.document-backups :deep(.p-treetable-table) { min-width: 980px; }
.document-tree { min-height: 410px; }
.document-tree :deep(.p-treetable-table-container) { min-height: 340px; border: 1px solid #e7ebef; border-radius: 9px; }
.document-tree :deep(.p-treetable-thead > tr > th) { background: #f8fafc; }
.document-backups :deep(.p-treetable-tbody > tr > td:first-child) { min-width: 360px; }
.document-backups :deep(.p-treetable-node-toggle-button) { color: #648506; }
.document-backups :deep(.p-treetable-tbody > tr:has(.tree-entry--folder)) { background: #fbfcf8; }
.bulk-export { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 17px; border: 1px solid #dfe7c8; border-radius: 11px; background: #fafcf4; }
.bulk-export__copy { min-width: 0; display: flex; align-items: flex-start; gap: 12px; }
.bulk-export__icon { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; border-radius: 10px; color: #648506; background: #edf5d9; }
.bulk-export__copy strong { color: #334155; }
.bulk-export__copy p { margin: 3px 0 0; color: #657084; font-size: .88rem; line-height: 1.45; }
.bulk-export__copy small { display: block; margin-top: 6px; color: #648506; font-weight: 600; }
.bulk-export__copy .bulk-export__error { color: #b42318; }
.bulk-export__actions { flex: 0 0 auto; display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
@media (max-width: 600px) { .search-row { flex-direction: column; } }
@media (max-width: 760px) { .tree-toolbar, .bulk-export { align-items: flex-start; flex-direction: column; } .bulk-export__actions, .bulk-export__actions :deep(.p-button) { width: 100%; } }

/* =========================================================
   KIWI UI - Recuperación documental
   Mismo lenguaje visual que Histórico de copias.
   ========================================================= */
.document-backups--kiwi {
  width: 100%;
  margin-top: 20px;
  border: 1px solid #dfe5eb;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  box-shadow: none;
}

.document-backups--kiwi :deep(.settings-panel),
.document-backups--kiwi :deep(.p-card),
.document-backups--kiwi :deep(.p-card-body),
.document-backups--kiwi :deep(.p-card-content) {
  width: 100%;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.document-backups--kiwi :deep(.settings-panel__header) {
  min-height: auto;
  margin: 0;
  padding: 16px 18px;
  border-bottom: 1px solid #e7ebef;
  background: #fff;
}

.document-backups--kiwi :deep(.settings-panel__icon) {
  width: auto;
  height: auto;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: #719808;
  background: transparent;
  box-shadow: none;
}

.document-backups--kiwi :deep(.settings-panel__icon i) {
  font-size: 1rem;
}

.document-backups--kiwi :deep(.settings-panel__title) {
  margin: 0;
  color: #2f3b4f;
  font-size: .92rem;
  font-weight: 700;
}

.document-backups--kiwi :deep(.settings-panel__subtitle) {
  margin-top: 4px;
  color: #667085;
  font-size: .82rem;
  font-weight: 400;
}

.document-backups--kiwi :deep(.settings-panel__content) {
  padding: 16px 18px 18px;
}

/* Neutraliza el aspecto azul/grande anterior si el componente usa estas clases. */
.document-backups--kiwi :deep(.panel-icon),
.document-backups--kiwi :deep(.section-icon),
.document-backups--kiwi :deep(.document-icon) {
  color: #719808 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

/* Títulos internos equivalentes a los de Histórico. */
.document-backups--kiwi :deep(h3),
.document-backups--kiwi :deep(h4),
.document-backups--kiwi :deep(h5) {
  color: #334155;
  font-size: .9rem;
  font-weight: 700;
}

/* Evita huecos excesivos dentro del bloque. */
.document-backups--kiwi :deep(.grid),
.document-backups--kiwi :deep(.flex) {
  min-height: 0;
}


/* El encabezado principal ya identifica la función:
   evitamos una segunda cabecera y compactamos el área de acciones. */
.document-backups--kiwi :deep(.settings-panel__content) {
  padding-top: 14px;
}

</style>
