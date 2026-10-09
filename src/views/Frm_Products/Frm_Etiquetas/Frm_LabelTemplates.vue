<template>
  <main class="maintenance-page">
    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><i class="pi pi-tags"></i></div>
        <div>
          <span class="breadcrumb">Configuración / Datos maestros</span>
          <h1>Etiquetas Zebra (ZPL)</h1>
          <p>Plantillas de etiquetas de productos por empresa.</p>
        </div>
      </div>
      <nav class="header-actions" aria-label="Navegación">
        <Button label="Ajustes" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Frm_Ajustes', query: { tab: '3' } })" />
        <Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" />
      </nav>
    </header>

    <div class="card list-card">
      <Toolbar class="list-toolbar">
        <template #start>
          <div class="workspace-heading">
            <span>Catálogo de plantillas</span>
            <small>Diseño, vista previa, ZPL y prueba de impresión.</small>
          </div>
        </template>
        <template #end>
          <Button v-if="canEdit" :disabled="busy" label="Nueva plantilla" icon="pi pi-plus" size="small" class="new-template-button" @click="create" />
        </template>
      </Toolbar>

      <p v-if="error" class="catalog-error" role="alert">{{ error }} <Button label="Reintentar" text :disabled="busy" @click="refresh" /></p>
      <DataTable :loading="busy" :value="list" dataKey="id" class="maintenance-table compact-table custom-header-table" stripedRows selectionMode="single" v-model:selection="sel"
        :paginator="true" :rows="10" :rowsPerPageOptions="[10, 25, 50]" sortField="nombre" :sortOrder="1">
        <template #header>
          <div class="flex justify-content-end gap-1">
            <Button icon="pi pi-refresh" text rounded title="Refrescar" :disabled="busy" @click="refresh" />
          </div>
        </template>
        <Column field="nombre" header="Plantilla" sortable />
        <Column field="tipo" header="Tipo" sortable style="width: 140px">
          <template #body><Tag value="Productos" severity="info" /></template>
        </Column>
        <Column header="Tamaño" sortable sortField="anchoMm" style="width: 190px">
          <template #body="{ data }">{{ data.anchoMm }}x{{ data.altoMm }}mm · {{ data.dpi }}dpi</template>
        </Column>
        <Column field="updatedAt" header="Actualizada" sortable style="width: 170px">
          <template #body="{ data }">{{ fmtDate(data.updatedAt) }}</template>
        </Column>
        <Column header="Acciones" style="width: 5%">
          <template #body="{ data }">
            <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, data)" />
          </template>
        </Column>
      </DataTable>
      <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" />
    </div>

    <Dialog
      v-model:visible="dlg"
      modal
      maximizable
      :style="{ width: 'min(1500px, 96vw)', height: '96dvh', maxHeight: '96dvh' }"
      :contentStyle="{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: '0' }"
      :header="draft.id ? 'Editar plantilla' : 'Nueva plantilla'"
    >
      <div class="template-settings">
        <div class="setting-name"><label>Nombre</label><InputText v-model="draft.nombre" class="w-full" size="small" /></div>
        <div class="setting-type"><label>Tipo</label><Select v-model="draft.tipo" :options="kinds" optionLabel="label" optionValue="value" class="w-full" size="small" /></div>
        <div class="setting-measure"><label>Ancho mm</label><InputNumber v-model="draft.anchoMm" :min="20" :max="250" class="w-full" size="small" /></div>
        <div class="setting-measure"><label>Alto mm</label><InputNumber v-model="draft.altoMm" :min="10" :max="250" class="w-full" size="small" /></div>
        <div class="setting-measure"><label>DPI</label><Select v-model="draft.dpi" :options="[203, 300, 600]" class="w-full" size="small" /></div>
        <div class="setting-measure"><label>Margen</label><InputNumber v-model="draft.margenMm" :min="0" :max="10" class="w-full" size="small" /></div>
      </div>
      <Tabs value="0" class="template-tabs">
        <TabList><Tab value="0">Diseñador</Tab><Tab value="1">ZPL generado</Tab></TabList>
        <TabPanels class="template-panels">
          <TabPanel value="0"><PnLabelDesigner v-if="draft" v-model="draft" /></TabPanel>
          <TabPanel value="1" class="zpl-panel"><pre class="zpl">{{ zplPreview }}</pre>
            <div class="flex gap-2 mt-2">
              <Button label="Descargar .zpl" icon="pi pi-download" size="small" @click="testPrint(draft)" />
            </div>
            <PnLabelPrinters :zpl="zplPreview" />
            <small v-if="msg" class="msg">{{ msg }}</small>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <template #footer>
        <div class="template-footer">
          <div class="kiwik-separator" />
          <div class="template-footer-actions">
            <Button label="Cancelar" text severity="secondary" @click="dlg = false" />
            <Button label="Guardar" icon="pi pi-save" size="small" @click="save" :loading="busy" :disabled="busy || !canEdit || !draft.nombre || !draft.anchoMm" />
          </div>
        </div>
      </template>
    </Dialog>
    <ConfirmDialog />
    <Toast />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Menu from 'primevue/menu';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import PnLabelDesigner from './Pn_LabelDesigner.vue';
import PnLabelPrinters from './Pn_LabelPrinters.vue';
import { LABEL_SAMPLE, type LabelTemplate } from '../../../libs/labels/labelTemplate';
import { buildZpl, downloadZpl } from '../../../libs/labels/zplGenerator';
import { loadTemplates, removeTemplate, upsertTemplate, templateError } from '../../../services/Labels/labelTemplateService';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const list = ref<LabelTemplate[]>([]);
const busy = ref(false);
const error = ref('');
const security = useSecurityStore();
const canEdit = computed(() => security.hasPermission(PERM.PROD_MASTER_EDIT));
onMounted(() => { void refresh(); });
const sel = ref<LabelTemplate | null>(null);
const rowSel = ref<LabelTemplate | null>(null);
const menuOptionRegistro = ref();
const dlg = ref(false);
const msg = ref('');
const kinds = [{ label: 'Productos', value: 'producto' }];
const draft = ref<LabelTemplate>(blank());

function blank(): LabelTemplate {
  return { id: '', nombre: '', tipo: 'producto', anchoMm: 100, altoMm: 50, dpi: 203, orientacion: 'horizontal', margenMm: 2, elementos: [], updatedAt: new Date().toISOString() };
}
const zplPreview = computed(() => (draft.value ? buildZpl(draft.value, LABEL_SAMPLE) : ''));
function fmtDate(s: string): string {
  try { return new Date(s).toLocaleString('es-ES'); } catch { return s; }
}
function create(): void { draft.value = blank(); msg.value = ''; dlg.value = true; }
async function refresh(): Promise<void> {
  busy.value = true; error.value = ''; rowSel.value = null; sel.value = null;
  try { list.value = await loadTemplates(); }
  catch (e) { list.value = []; error.value = templateError(e); }
  finally { busy.value = false; }
}
function openMenu(event: Event, row: LabelTemplate): void {
  rowSel.value = row;
  sel.value = row;
  menuOptionRegistro.value?.toggle(event);
}
const menuItems = computed(() => {
  const t = rowSel.value;
  if (!t) return [];
  return [
    { label: 'Editar / diseñar', icon: 'pi pi-pencil', command: () => edit(t) },
    { label: 'Duplicar', disabled: !canEdit.value || busy.value, icon: 'pi pi-copy', command: () => duplicate(t) },
    { label: 'Descargar ZPL', icon: 'pi pi-download', command: () => testPrint(t) },
    { separator: true },
    { label: 'Eliminar', disabled: !canEdit.value || busy.value, icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => askDelete(t) },
  ];
});
function edit(t: LabelTemplate): void { draft.value = JSON.parse(JSON.stringify(t)); msg.value = ''; dlg.value = true; }
async function duplicate(t: LabelTemplate): Promise<void> {
  if (busy.value || !canEdit.value) return;
  const copy = JSON.parse(JSON.stringify(t)) as LabelTemplate;
  copy.id = ''; delete copy.version; copy.nombre = `${t.nombre} (copia)`;
  busy.value = true; error.value = '';
  try { const saved = await upsertTemplate(copy); list.value = [...list.value, saved]; }
  catch (e) { error.value = templateError(e); }
  finally { busy.value = false; }
}
async function save(): Promise<void> {
  if (busy.value || !canEdit.value) return;
  busy.value = true; msg.value = '';
  try {
    const saved = await upsertTemplate(draft.value);
    list.value = [...list.value.filter(t => t.id !== saved.id), saved];
    dlg.value = false;
    toast.add({ severity: 'success', summary: 'Plantilla guardada en base de datos', life: 2500 });
  } catch (e) { msg.value = templateError(e); toast.add({ severity: 'error', summary: 'No se ha guardado', detail: msg.value, life: 6000 }); }
  finally { busy.value = false; }
}
function askDelete(t: LabelTemplate): void {
  if (busy.value || !canEdit.value) return;
  confirm.require({ message: `Eliminar "${t.nombre}"?`, header: 'Confirmar', acceptLabel: 'Eliminar', rejectLabel: 'Cancelar', accept: async () => {
    busy.value = true; error.value = '';
    try { await removeTemplate(t); list.value = list.value.filter(item => item.id !== t.id); rowSel.value = null; }
    catch (e) { error.value = templateError(e); }
    finally { busy.value = false; }
  } });
}
function testPrint(t: LabelTemplate): void {
  downloadZpl(t.nombre || 'etiqueta', buildZpl(t, LABEL_SAMPLE));
  toast.add({ severity: 'info', summary: '.zpl descargado', detail: 'Envialo a la Zebra o usa Browser Print', life: 3000 });
}
</script>

<style scoped>
.list-toolbar :deep(.p-button.new-template-button) {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}
.list-toolbar :deep(.p-button.new-template-button:not(:disabled):hover) {
  background: #8bad09;
  border-color: #8bad09;
  color: #253000;
}
.catalog-error { padding: 12px; color: #b42318; }
.template-footer { width: 100%; }
.template-footer .kiwik-separator { margin-bottom: 1rem; }
.template-footer-actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
.template-settings { display: flex; flex: 0 0 auto; flex-wrap: wrap; align-items: flex-end; gap: 12px; margin-bottom: 12px; }
/* El código ocupa el espacio restante, conservando los botones debajo. */
.template-tabs { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.template-tabs :deep(.p-tablist) { flex: 0 0 auto; }
.template-panels { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: auto; }
/* TabPanel tiene una raíz dinámica: deep alcanza el panel real de PrimeVue. */
.template-panels :deep(.zpl-panel[data-p-active="true"]) {
  display: flex;
  flex-direction: column;
  flex: 1 0 240px;
  min-height: 240px;
}
.template-panels :deep(.zpl-panel > :not(.zpl)) { flex-shrink: 0; }
.setting-name { width: 260px; max-width: 100%; }
.setting-type { width: 155px; }
.setting-measure { width: 100px; }
.template-settings :deep(.p-inputnumber-input) { width: 100%; min-width: 0; }
.maintenance-page { --kiwi:#9cc10a; --kiwi-dark:#648506; width:100%; min-height:calc(100dvh - 66px); padding:18px 16px 72px; box-sizing:border-box; background:rgba(247,248,250,.58); }
.page-header { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:18px; padding:15px 20px; border:1px solid #e3e8d2; border-radius:15px; background:#fff; box-shadow:0 6px 18px rgba(31,41,55,.055); }.page-header::after{content:"";position:absolute;z-index:0;width:300px;height:300px;right:20px;top:50%;transform:translateY(-50%);background:url('/logos/logo512.png') center/contain no-repeat;filter:grayscale(1);opacity:.075;pointer-events:none}.page-header>*{position:relative;z-index:1}.page-heading{display:flex;align-items:center;gap:14px}.page-icon{display:grid;width:50px;height:50px;flex:0 0 auto;place-items:center;border-radius:13px;color:#fff;background:linear-gradient(135deg,#b1d70e,#719808);box-shadow:0 7px 15px rgba(113,152,8,.22)}.page-icon i{font-size:1.3rem}.breadcrumb{color:#8791a0;font-size:.8rem;font-weight:700}.page-heading h1{margin:3px 0 2px;color:#202939;font-size:1.38rem}.page-heading p{margin:0;color:#7a8494;font-size:.92rem}.header-actions{display:flex;align-items:center;gap:3px}
.list-card{height:clamp(520px,calc(100dvh - 270px),760px);min-height:0;display:flex;flex-direction:column;overflow:hidden;padding:0;border:1px solid #dfe4ea;border-radius:14px;background:#fff;box-shadow:0 5px 18px rgba(30,41,59,.055)}.list-toolbar{padding:13px 17px;border:0;border-bottom:1px solid #e8ecf0;border-radius:0;background:#fff}.workspace-heading{display:flex;flex-direction:column;gap:3px}.workspace-heading span{color:#344054;font-size:1rem;font-weight:800}.workspace-heading small{color:#8a93a2;font-size:.82rem}.list-toolbar :deep(.p-button){border-color:var(--kiwi-dark);background:var(--kiwi-dark)}.maintenance-table{flex:1 1 auto;min-height:0}.list-card :deep(.table-container){border:0;border-radius:0}@media(max-width:700px){.maintenance-page{padding:12px 10px 66px}.page-header{padding:12px;align-items:flex-start}.page-heading p,.workspace-heading small,.header-actions :deep(.p-button-label){display:none}.list-card{height:560px}}
label { font-size: .72rem; font-weight: 700; color: #6b7280; display: block; margin-bottom: 3px; }
.zpl { flex: 1; min-height: 0; margin: 0; background: #111827; color: #d1fae5; border-radius: 8px; padding: 10px; overflow: auto; font-size: .75rem; }
.msg { color: #6b7280; }
</style>

