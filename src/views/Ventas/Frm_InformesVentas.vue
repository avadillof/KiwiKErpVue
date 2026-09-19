<template>
  <main class="reports-page">
    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><i class="pi pi-chart-bar" /></div>
        <div>
          <span class="breadcrumb">KiwiKERP / Reportes</span>
          <h1>Reportes</h1>
          <p>Informes parametrizados del ERP. Cada informe tiene su código único RPT.</p>
        </div>
      </div>
      <nav class="header-actions" aria-label="Navegación">
        <Button label="Ventas" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Ventas' })" />
        <Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" />
      </nav>
    </header>

    <Tabs value="VEN" class="reports-tabs">
      <TabList>
        <Tab value="VEN"><i class="pi pi-briefcase" /> Reportes de Ventas</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="VEN" class="ven-panel">
          <div class="ven-body">
            <section class="ven-card ven-card--side" aria-label="Catálogo de informes de ventas">
              <Tree
                v-model:selectionKeys="selection"
                v-model:expandedKeys="expanded"
                :value="salesNodes"
                selectionMode="single"
                class="ven-tree"
                @node-select="onNodeSelect"
              >
                <template #default="slotProps">
                  <span v-if="slotProps.node.children" class="ven-parent">
                    <span class="ven-parent-icon"><i class="pi pi-folder-open" /></span>
                    <span>{{ slotProps.node.label }}</span>
                    <Tag :value="String(slotProps.node.children.length)" rounded />
                  </span>
                  <span v-else class="ven-leaf">
                    <span class="ven-leaf-code">{{ leafCode(slotProps.node.label) }}</span>
                    <span>{{ leafTitle(slotProps.node.label) }}</span>
                  </span>
                </template>
              </Tree>
            </section>
            <section class="ven-card ven-card--main" aria-label="Ficha del informe">
              <Toolbar class="ven-toolbar">
                <template #start><Tag v-if="isReport" :value="selectedReport" severity="info" rounded /><strong class="ven-report-name">{{ selectedTitle }}</strong></template>
                <template #end>
                  <Button label="Vista previa" icon="pi pi-eye" outlined :disabled="!isReport || !!dateError || previewLoading" :loading="previewLoading" title="Se activa al validar el formulario" @click="preview" />
                  <Button icon="pi pi-download" label="Descargar" outlined :disabled="!pdfUrl" title="Descargar el PDF con el nombre del informe" @click="downloadPdf" />
                  <Button label="A Excel" icon="pi pi-file-excel" severity="success" :disabled="!previewRows.length" title="Exportar las columnas visibles" @click="exportExcel" />
                </template>
              </Toolbar>
              <div class="ven-main-body">
                <section class="ven-params" aria-label="Parámetros">
                  <div class="section-heading"><span><i class="pi pi-sliders-h" /></span><div><h2>Parámetros</h2><p>Filtros del informe seleccionado.</p></div></div>
                  <div v-if="selectedReport === 'RPT-CLI-001'" class="params-grid">
                    <label class="field"><span>Fecha alta desde</span><DatePicker v-model="cli001.dateFrom" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Fecha alta hasta</span><DatePicker v-model="cli001.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Tipo de entidad</span><Select v-model="cli001.kind" :options="kindOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Estado</span><Select v-model="cli001.active" :options="activeOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Borrados</span><Select v-model="cli001.deleted" :options="deletedOptions" optionLabel="label" optionValue="value" fluid /></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-ART-001'" class="params-grid">
                    <label class="field"><span>Familia</span><Select v-model="art001.family" :options="artFamilies" optionLabel="label" optionValue="value" filter placeholder="Todas" fluid /></label>
                    <label class="field"><span>Fecha alta desde</span><DatePicker v-model="art001.dateFrom" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Fecha alta hasta</span><DatePicker v-model="art001.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Comercialización</span><Select v-model="art001.sale" :options="saleOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Estado</span><Select v-model="art001.active" :options="activeOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Borrados</span><Select v-model="art001.deleted" :options="deletedOptions" optionLabel="label" optionValue="value" fluid /></label>
                  </div>
                  <div v-if="isReport" class="order-box">
                    <span class="order-title"><i class="pi pi-table" /> Columnas del informe</span>
                    <div class="order-chips">
                      <span
                        v-for="(key, i) in visibleCols"
                        :key="key"
                        class="order-chip"
                        :class="{ dragging: dragCol === i }"
                        draggable="true"
                        title="Arrastra para reordenar"
                        @dragstart="dragCol = i"
                        @dragover.prevent
                        @drop="dropCol(i)"
                        @dragend="dragCol = -1"
                      >
                        <Checkbox :modelValue="true" binary @update:modelValue="toggleCol(key)" @click.stop />
                        {{ columnLabel(key) }}
                      </span>
                    </div>
                    <div class="order-chips">
                      <span v-for="col in hiddenCols" :key="col.key" class="order-chip order-chip--off">
                        <Checkbox :modelValue="false" binary @update:modelValue="toggleCol(col.key)" />
                        {{ col.header }}
                      </span>
                    </div>
                  </div>
                  <div v-if="isReport" class="order-box">
                    <span class="order-title"><i class="pi pi-sort-alpha-down" /> Ordenación</span>                    <div class="order-chips">
                      <span
                        v-for="(c, i) in orderCriteria"
                        :key="c.field"
                        class="order-chip"
                        :class="{ dragging: dragOrder === i }"
                        draggable="true"
                        title="Arrastra para reordenar la prioridad"
                        @dragstart="dragOrder = i"
                        @dragover.prevent
                        @drop="dropOrder(i)"
                        @dragend="dragOrder = -1"
                      >
                        <b>{{ i + 1 }}</b> {{ orderLabel(c.field) }}
                        <button type="button" class="order-dir" :title="'Sentido: ' + (c.dir === 'asc' ? 'ascendente' : 'descendente')" @click="c.dir = c.dir === 'asc' ? 'desc' : 'asc'">{{ c.dir === 'asc' ? 'ASC' : 'DES' }}</button>
                        <Button icon="pi pi-times" text rounded size="small" :aria-label="'Quitar ' + orderLabel(c.field)" @click="removeOrder(i)" />
                      </span>
                      <span v-if="!orderCriteria.length" class="order-empty">Sin orden: selecciona campos por prioridad.</span>
                    </div>
                    <label class="field"><span>Añadir campo</span><Select :modelValue="null" :options="availableOrderFields" optionLabel="label" optionValue="value" placeholder="Seleccionar campo" fluid @update:modelValue="addOrder" /></label>
                  </div>
                  <Message v-if="dateError" severity="error" :closable="false">{{ dateError }}</Message>
                </section>
                <section ref="previewSection" class="ven-preview" aria-label="Previsualización">
                  <div class="section-heading"><span><i class="pi pi-eye" /></span><div><h2>Previsualización</h2><p>Vista previa del informe generado.</p></div></div>
                  <div class="rep-body">
                    <div v-if="previewLoading" class="rep-loading"><i class="pi pi-spin pi-spinner" /> Generando vista previa…</div>
                    <Message v-else-if="previewError" severity="error" :closable="false">{{ previewError }}</Message>
                    <template v-else-if="previewDone">
                      <div class="rep-meta"><strong>{{ previewRows.length }} registros</strong><span>{{ filtersText }}</span></div>
                      <Message v-if="!previewRows.length" severity="info" :closable="false">Sin resultados para los filtros indicados.</Message>
                      <iframe v-else :src="pdfUrl" class="rep-pdf" title="Vista previa del PDF" />
                    </template>
                    <p v-else class="rep-empty">Configura los parámetros y pulsa Vista previa.</p>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '@/stores/companyStore';
import { buildReportPdf, exportReportExcel, sortReportRows, type ReportRow } from '@/services/Informes/reportEngine';
import {
  CLI_001_COLUMNS,
  CLI_001_ORDER_FIELDS,
  cli001FiltersText,
  fetchCli001,
  type Cli001Filters
} from '@/services/Informes/reports/rptCli001';
import {
  ART_001_COLUMNS,
  ART_001_ORDER_FIELDS,
  art001FiltersText,
  artFamilyOptions,
  fetchArt001,
  type Art001Filters
} from '@/services/Informes/reports/rptArt001';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import Tree from 'primevue/tree';

const router = useRouter();
const companyStore = useCompanyStore();

/** Catálogo de reportes de ventas en árbol. El código RPT es la identidad única. */
const salesNodes = ref([
  {
    key: 'mae',
    label: 'Maestros',
    children: [
      { key: 'RPT-CLI-001', label: '[RPT-CLI-001] Listado General de Entidades' },
      { key: 'RPT-ART-001', label: '[RPT-ART-001] Listado de Artículos y Servicios' }
    ]
  },
  {
    key: 'fac',
    label: 'Facturación',
    children: []
  }
]);
const selection = ref<Record<string, boolean>>({ 'RPT-CLI-001': true });
const expanded = ref<Record<string, boolean>>({ mae: true });
const selectedReport = ref('RPT-CLI-001');

/**
 * Parámetros del RPT-CLI-001 Listado General de Clientes.
 * Contrato previsto con backend: dateUp desde/hasta, entitieBolClient,
 * entitieBolProve, entitieBolActive y flag de borrado lógico.
 */
const cli001 = reactive<Cli001Filters>({
  dateFrom: null,
  dateTo: null,
  kind: 'ALL',
  active: 'ALL',
  deleted: 'NOT_DELETED'
});
const art001 = reactive<Art001Filters>({
  family: '',
  dateFrom: null,
  dateTo: null,
  sale: 'ALL',
  active: 'ALL',
  deleted: 'NOT_DELETED'
});
const saleOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Para vender', value: 'SALE' },
  { label: 'Para comprar', value: 'PURCHASE' }
];
/** Familias del filtro (misma tabla de búsqueda que el maestro de artículos). */
const artFamilies = ref<Array<{ label: string; value: string }>>([{ label: 'Todas', value: '' }]);
onMounted(async () => {
  loadSavedParams();
  try {
    artFamilies.value = await artFamilyOptions();
  } catch {
    /* sin familias: queda "Todas" */
  }
});
const orderCriteria = ref<Array<{ field: string; dir: 'asc' | 'desc' }>>([{ field: 'name', dir: 'asc' }]);
const orderFields = computed(() => (selectedReport.value === 'RPT-ART-001' ? ART_001_ORDER_FIELDS : CLI_001_ORDER_FIELDS));
const orderLabel = (value: string) => orderFields.value.find((f) => f.value === value)?.label ?? value;
const availableOrderFields = computed(() =>
  orderFields.value.filter((f) => visibleCols.value.includes(f.value) && !orderCriteria.value.some((c) => c.field === f.value))
);
function addOrder(value: string | null) {
  if (value && !orderCriteria.value.some((c) => c.field === value)) orderCriteria.value.push({ field: value, dir: 'asc' });
}
function removeOrder(index: number) {
  orderCriteria.value.splice(index, 1);
}
/** Columnas visibles del informe activo, en orden de salida. Por defecto todas. */
const activeColumns = computed(() => (selectedReport.value === 'RPT-ART-001' ? ART_001_COLUMNS : CLI_001_COLUMNS));
const visibleCols = ref<string[]>(CLI_001_COLUMNS.map((c) => c.key));
const columnLabel = (key: string) => activeColumns.value.find((c) => c.key === key)?.header ?? key;
const hiddenCols = computed(() => activeColumns.value.filter((c) => !visibleCols.value.includes(c.key)));
function toggleCol(key: string) {
  const i = visibleCols.value.indexOf(key);
  if (i >= 0) {
    visibleCols.value.splice(i, 1);
    orderCriteria.value = orderCriteria.value.filter((c) => c.field !== key);
  } else {
    // Al final: se conserva el orden personalizado que ya hubiera.
    visibleCols.value.push(key);
  }
}
/** Reordenación por arrastrar y soltar. */
const dragCol = ref(-1);
const dragOrder = ref(-1);
function dropCol(index: number) {
  const from = dragCol.value;
  dragCol.value = -1;
  if (from < 0 || from === index) return;
  const arr = visibleCols.value;
  const [moved] = arr.splice(from, 1);
  arr.splice(index, 0, moved);
}
function dropOrder(index: number) {
  const from = dragOrder.value;
  dragOrder.value = -1;
  if (from < 0 || from === index) return;
  const arr = orderCriteria.value;
  const [moved] = arr.splice(from, 1);
  arr.splice(index, 0, moved);
}
/** Solo los informes (hojas) tienen parámetros; las ramas limpian y bloquean. */
const isReport = computed(() => selectedReport.value.startsWith('RPT-'));
/** Filtros del informe activo (CLI o ART). */
function currentFilters() {
  return selectedReport.value === 'RPT-ART-001' ? art001 : cli001;
}
function resetFilters() {
  cli001.dateFrom = null;
  cli001.dateTo = null;
  cli001.kind = 'ALL';
  cli001.active = 'ALL';
  cli001.deleted = 'NOT_DELETED';
  art001.family = '';
  art001.dateFrom = null;
  art001.dateTo = null;
  art001.sale = 'ALL';
  art001.active = 'ALL';
  art001.deleted = 'NOT_DELETED';
}
function onNodeSelect(node: any) {
  selectedReport.value = node?.key ?? '';
  // Al cambiar de rama o de informe siempre se limpia la previsualización.
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  pdfUrl.value = '';
  previewRows.value = [];
  previewDone.value = false;
  previewError.value = '';
  if (node?.children) {
    resetFilters();
    orderCriteria.value = [{ field: 'name', dir: 'asc' }];
  } else {
    orderCriteria.value =
      selectedReport.value === 'RPT-ART-001' ? [{ field: 'description', dir: 'asc' }] : [{ field: 'name', dir: 'asc' }];
    visibleCols.value = activeColumns.value.map((c) => c.key);
    loadSavedParams();
  }
}

/** Recuerda los parámetros por informe: back primero, navegador como respaldo. */
import { loadReportPref, saveReportPref } from '@/services/Informes/reportPrefs';
function saveParams() {
  void saveReportPref(selectedReport.value, { filters: { ...currentFilters() }, order: orderCriteria.value, columns: [...visibleCols.value] });
}
async function loadSavedParams() {
  const saved = await loadReportPref<any>(selectedReport.value);
  try {
    if (!saved) return;
    const target: any = currentFilters();
    if (saved.filters) {
      for (const key of Object.keys(target)) {
        if (!(key in saved.filters)) continue;
        if (key === 'dateFrom' || key === 'dateTo') target[key] = saved.filters[key] ? new Date(saved.filters[key]) : null;
        else target[key] = saved.filters[key];
      }
    }
    if (Array.isArray(saved.order) && saved.order.length) orderCriteria.value = saved.order;
    if (Array.isArray(saved.columns) && saved.columns.length) {
      const known = activeColumns.value.map((c) => c.key);
      visibleCols.value = saved.columns.filter((k: string) => known.includes(k));
      if (!visibleCols.value.length) visibleCols.value = [...known];
    }
  } catch {
    /* sin parámetros guardados */
  }
}
const kindOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Clientes', value: 'CLIENTS' },
  { label: 'Proveedores', value: 'SUPPLIERS' }
];
const activeOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Activos', value: 'ACTIVE' },
  { label: 'Inactivos', value: 'INACTIVE' }
];
const deletedOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Sin borrar', value: 'NOT_DELETED' },
  { label: 'Solo borrados', value: 'ONLY_DELETED' }
];

/**
 * Validación de fechas: todo puede ir en blanco, pero si se
 * indica una fecha hay que indicar la otra y la inicial no puede superar a la final.
 */
const dateError = computed(() => {
  const { dateFrom, dateTo } = currentFilters();
  if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) return 'Si indicas una fecha debes indicar la otra.';
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()).getTime();
    const to = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()).getTime();
    if (from > to) return 'La fecha inicial no puede ser superior a la fecha final.';
  }
  return '';
});

/** Vista previa del RPT-CLI-001: consulta con los filtros del formulario. */
const previewLoading = ref(false);
const previewError = ref('');
const previewDone = ref(false);
const previewRows = ref<ReportRow[]>([]);
const previewSection = ref<HTMLElement | null>(null);
const pdfUrl = ref('');

const filtersText = computed(() =>
  selectedReport.value === 'RPT-ART-001' ? art001FiltersText(art001) : cli001FiltersText(cli001)
);

async function preview() {
  if (dateError.value || !isReport.value) return;
  saveParams();
  previewLoading.value = true;
  previewError.value = '';
  previewDone.value = false;
  previewRows.value = [];
  try {
    const isArt = selectedReport.value === 'RPT-ART-001';
    const rows = isArt ? await fetchArt001(art001) : await fetchCli001(cli001);
    const columns = visibleCols.value.flatMap((key) => {
      const col = activeColumns.value.find((c) => c.key === key);
      return col ? [col] : [];
    });
    const effectiveColumns = columns.length ? columns : [...activeColumns.value];
    orderCriteria.value = orderCriteria.value.filter((c) => effectiveColumns.some((col) => col.key === c.field));
    previewRows.value = sortReportRows(
      rows,
      orderCriteria.value.map((c) => ({ key: c.field, dir: c.dir }))
    );
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = await buildReportPdf({
      code: selectedReport.value,
      title: selectedTitle.value,
      filtersText: filtersText.value,
      columns: effectiveColumns,
      rows: previewRows.value,
      redWhen: (r) => r.deleted === true,
      company: {
        name: companyStore.companyInfo.nameCompany,
        slogan: companyStore.companyInfo.sloganCompany,
        logoUrl: companyStore.companyInfo.urlLogo
      }
    });
    previewDone.value = true;
    await nextTick();
    previewSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e: any) {
    previewError.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudo generar la vista previa.';
  } finally {
    previewLoading.value = false;
  }
}


/** Descarga la previa con el nombre del informe: RPT-XXX-NNN_AAAAMMDD.pdf. */async function downloadPdf() {
  if (!pdfUrl.value) return;
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  const name = `${selectedReport.value}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.pdf`;
  try {
    const w = window as any;
    if (w.showSaveFilePicker) {
      const blob = await (await fetch(pdfUrl.value)).blob();
      const handle = await w.showSaveFilePicker({
        suggestedName: name,
        types: [{ description: 'Informe PDF', accept: { 'application/pdf': ['.pdf'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch {
    return; // diálogo cancelado o no soportado: se usa el enlace clásico
  }
  const a = document.createElement('a');
  a.href = pdfUrl.value;
  a.download = name;
  a.click();
}

/** Exporta a Excel las columnas visibles, en su orden. */
function exportExcel() {
  if (!previewRows.value.length) return;
  const columns = visibleCols.value.flatMap((key) => {
    const col = activeColumns.value.find((c) => c.key === key);
    return col ? [col] : [];
  });
  exportReportExcel({ code: selectedReport.value, columns, rows: previewRows.value });
}

/** Las hojas tienen forma "[CODIGO] Título": separamos para resaltar el código. */
const leafCode = (label?: string) => (label?.startsWith('[') ? label.slice(0, label.indexOf(']') + 1) : '');
const leafTitle = (label?: string) => (label?.startsWith('[') ? label.slice(label.indexOf(']') + 1).trim() : (label ?? ''));

/** Título del informe seleccionado para la cabecera del panel derecho. */
const selectedTitle = computed(() => {
  const all = salesNodes.value.flatMap((n) => [n, ...(n.children ?? [])]);
  return leafTitle(all.find((n) => n.key === selectedReport.value)?.label);
});
</script>

<style scoped>
.reports-page { display: flex; flex-direction: column; width: 100%; min-height: calc(100dvh - 66px); box-sizing: border-box; padding: 18px 16px 72px; color: #243044; background: rgba(247,248,250,.58); }
.page-header { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; padding: 15px 20px; border: 1px solid #e3e8d2; border-radius: 15px; background: #fff; box-shadow: 0 6px 18px rgba(31,41,55,.055); }
.page-header::after { content: ""; position: absolute; z-index: 0; width: 300px; height: 300px; right: 20px; top: 50%; transform: translateY(-50%); background: url('/logos/logo512.png') center/contain no-repeat; filter: grayscale(1); opacity: .075; pointer-events: none; }
.page-header > * { position: relative; z-index: 1; }
.page-heading { display: flex; align-items: center; gap: 14px; }
.page-icon { display: grid; width: 50px; height: 50px; flex: 0 0 auto; place-items: center; border-radius: 13px; color: #fff; background: linear-gradient(135deg,#16a085,#0e7c66); box-shadow: 0 7px 15px rgba(22,160,133,.22); }
.page-icon i { font-size: 1.3rem; }
.breadcrumb { color: #8791a0; font-size: .8rem; font-weight: 700; }
.page-heading h1 { margin: 3px 0 2px; color: #202939; font-size: 1.38rem; }
.page-heading p { margin: 0; color: #7a8494; font-size: .92rem; }
.header-actions { display: flex; align-items: center; gap: 3px; }
.reports-tabs { display: flex; flex-direction: column; height: calc(100dvh - 160px); min-height: 1200px; overflow: hidden; border: 1px solid #e1e6eb; border-radius: 13px; background: #fff; box-shadow: 0 3px 11px rgba(30,41,59,.04); }
.reports-tabs :deep(.p-tabpanels) { flex: 1; min-height: 0; padding: 14px; background: #f7f9f5; }
.reports-tabs :deep(.p-tabpanel) { height: 100%; }
.reports-tabs :deep(.p-tab) { gap: 7px; }
.ven-panel { height: 100%; }
.ven-body { display: flex; gap: 14px; height: 100%; min-height: 0; }
.ven-card { min-height: 0; border: 1px solid #e1e6eb; border-radius: 13px; background: #fff; box-shadow: 0 3px 11px rgba(30,41,59,.04); }
.ven-card--side { flex: 0 0 25%; padding: 10px; overflow-y: auto; }
.ven-card--main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.ven-toolbar { padding: 13px 17px; border: 0; border-bottom: 1px solid #e8ecf0; border-radius: 0; background: #fff; }
.ven-toolbar :deep(.p-toolbar-start) { display: flex; align-items: center; gap: .6rem; }
.ven-toolbar :deep(.p-toolbar-end) { display: flex; gap: .5rem; }
.ven-report-name { color: #344054; font-size: .95rem; }
.ven-main-body { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 14px; padding: 14px; overflow: hidden; background: #f7f9f5; }
.ven-params, .ven-preview { border: 1px solid #e1e6eb; border-radius: 13px; background: #fff; box-shadow: 0 3px 11px rgba(30,41,59,.04); padding: 20px; }
.ven-preview { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.section-heading { display: flex; align-items: center; gap: 11px; }
.section-heading > span { display: grid; width: 37px; height: 37px; place-items: center; border-radius: 9px; color: #66810a; background: #eef5dc; }
.section-heading h2 { margin: 0; font-size: 1rem; color: #273244; }
.section-heading p { margin: 3px 0 0; color: #7c8796; font-size: .82rem; }
.params-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 17px 22px; margin-top: 16px; }
.params-grid .field { display: flex; min-width: 0; flex-direction: column; gap: 7px; }
.params-grid .field > span { color: #596577; font-size: .78rem; font-weight: 750; }
.order-box { display: flex; flex-wrap: wrap; align-items: flex-end; gap: .8rem 22px; margin-top: 16px; padding: 12px 14px; border: 1px dashed #9cc10a; border-radius: 10px; background: #f4f9e8; }
.order-box .order-title { display: flex; align-items: center; gap: .45rem; width: 100%; color: #648506; font-size: .82rem; font-weight: 800; }
.order-chips { display: flex; flex-wrap: wrap; gap: .4rem; width: 100%; }
.order-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .25rem .35rem .25rem .5rem; border: 1px solid #cfe3a8; border-radius: 999px; background: #fff; font-size: .8rem; color: #344054; }
.order-chip b { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #9cc10a; color: #253000; font-size: .72rem; }
.order-chip[draggable="true"] { cursor: grab; }
.order-chip.dragging { opacity: .4; }
.order-dir { border: 1px solid #cfe3a8; border-radius: 6px; background: #f4f9e8; color: #648506; font-size: .68rem; font-weight: 800; padding: .1rem .35rem; cursor: pointer; }
.order-empty { color: #7d8797; font-size: .8rem; }
.order-chip--off { opacity: .75; border-style: dashed; }
.order-box .field { display: flex; min-width: 180px; flex: 1; flex-direction: column; gap: 7px; }
.order-box .field > span { color: #596577; font-size: .78rem; font-weight: 750; }
.rep-body { flex: 1; min-height: 0; display: flex; flex-direction: column; margin-top: 14px; overflow: hidden; }
.rep-loading { display: flex; align-items: center; justify-content: center; gap: .6rem; padding: 2rem; color: #687386; }
.rep-meta { display: flex; align-items: baseline; gap: 1rem; margin-bottom: .6rem; color: #344054; }
.rep-meta span { color: #7d8797; font-size: .82rem; }
.rep-empty { color: #7d8797; font-size: .88rem; }
.rep-pdf { flex: 1; min-height: 0; width: 100%; border: 1px solid #e8ecf0; border-radius: 8px; background: #fff; }
@media (max-width: 900px) { .params-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media (max-width: 620px) { .params-grid { grid-template-columns: 1fr; } }
.ven-tree { border: 0; padding: 0; }
.ven-tree :deep(.p-treenode-label) { flex: 1; font-size: .83rem; }
.ven-parent { display: flex; align-items: center; gap: .5rem; color: #3c4a1e; font-weight: 800; font-size: .9rem; }
.ven-parent-icon { display: grid; place-items: center; width: 26px; height: 26px; flex: 0 0 26px; border-radius: 7px; background: #eef5dc; }
.ven-parent-icon i { font-size: .85rem; color: #66810a; }
.ven-parent .p-tag { margin-left: auto; }
.ven-leaf { display: flex; align-items: center; gap: .45rem; font-size: .9rem; }
.ven-leaf-code { color: #648506; font-size: .8rem; font-weight: 800; white-space: nowrap; }
@media (max-width: 900px) { .page-heading p { display: none; } }
</style>
