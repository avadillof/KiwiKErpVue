<template>
  <Dialog v-model:visible="visible" modal header="Impresión masiva de etiquetas" class="kiwik-dialog" :style="{ width: 'min(1200px, 97vw)' }" :contentStyle="{ minHeight: '70vh' }" maximizable>
    <div class="grid">
      <div class="col-12 md:col-4"><label>Plantilla</label>
        <Select :loading="loadingTpl" :disabled="loadingTpl" v-model="templateId" :options="templates" optionLabel="nombre" optionValue="id" class="w-full" size="small" />
      </div>
      <div class="col-6 md:col-4"><label>Familia</label>
        <Select v-model="familyId" :options="families" optionLabel="description" optionValue="pkid" showClear filter placeholder="Todas" class="w-full" size="small" />
      </div>
      <div class="col-6 md:col-4"><label>Tarifa (precio etiqueta)</label>
        <Select v-model="tarifaId" :options="tarifas" optionLabel="description" optionValue="id" showClear placeholder="Base del artículo" class="w-full" size="small" />
      </div>
      <div class="col-12"><label>Buscar artículo (código o descripción)</label>
        <div class="flex gap-2 search-row">
          <InputText v-model="query" class="search-input" size="small" placeholder="Vacío + Buscar = listar familia" @keydown.enter="search" />
          <Button icon="pi pi-search" size="small" :loading="searching" @click="search" aria-label="Buscar" class="shrink-0" />
          <Button :label="results.length ? `Añadir todos (${results.length})` : 'Añadir todos'" icon="pi pi-plus" size="small" severity="secondary" :disabled="!results.length" @click="addAll" title="Añadir los resultados a la cola" class="add-all" />
        </div>
      </div>
    </div>

    <section class="panel panel-search">
      <header><i class="pi pi-search"></i><strong>Resultados de búsqueda</strong><span>{{ results.length }} registros</span></header>
      <DataTable v-if="results.length" :value="results" size="small" scrollable scrollHeight="220px">
        <Column field="code" header="Código" style="width:140px" />
        <Column field="description" header="Descripción" />
        <Column field="barcode" header="Barras" style="width:160px" />
        <Column header="" style="width:60px">
          <template #body="{ data }"><Button icon="pi pi-plus" text rounded title="Añadir a la cola" @click="addLine(data)" /></template>
        </Column>
      </DataTable>
      <p v-else class="empty">Sin búsqueda todavía. Filtra por familia o texto y pulsa Buscar.</p>
    </section>

    <section class="panel panel-queue">
      <header><i class="pi pi-barcode"></i><strong>Cola de impresión</strong><span>{{ lines.length }} artículos · {{ totalLabels }} etiquetas{{ sizeKb ? ` · ${sizeKb} KB` : '' }}</span></header>
      <DataTable :value="lines" size="small" dataKey="key" scrollable scrollHeight="260px">
      <Column field="code" header="Código" style="width:130px" />
      <Column field="description" header="Descripción" />
      <Column header="Precio" style="width:110px">
        <template #body="{ data }">{{ data.price != null ? eur(data.price) : '—' }}</template>
      </Column>
      <Column header="Copias" style="width:110px">
        <template #body="{ data }"><InputNumber v-model="data.copies" :min="1" :max="999" size="small" class="w-full" /></template>
      </Column>
      <Column header="Cantidad" style="width:110px">
        <template #body="{ data }"><InputText v-model="data.cantidad" size="small" class="w-full" /></template>
      </Column>
      <Column header="" style="width:50px">
        <template #body="{ data }"><Button icon="pi pi-trash" text rounded severity="danger" @click="removeLine(data.key)" /></template>
      </Column>
      <template #empty><div class="p-3 text-center text-500">Cola vacía. Busca y añade artículos, o abre desde la fila de un producto.</div></template>
      </DataTable>
    </section>

    <small v-if="msg" class="msg" role="status">{{ msg }}</small>
    <PnLabelPrinters :zpl="canPrint ? zpl : undefined" />
    <pre v-if="zplPreview" class="zpl">{{ zplPreview }}</pre>

    <template #footer>
      <div class="w-full"><div class="kiwik-separator mb-3" />
        <div class="flex justify-content-end gap-2">
          <Button label="Cerrar" text severity="secondary" @click="visible = false" />
          <Button label="Descargar .zpl" icon="pi pi-download" size="small" severity="secondary" :disabled="!canPrint" @click="download" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import PnLabelPrinters from './Pn_LabelPrinters.vue';
import { backendUrl } from '../../../services/backendUrl';
import { useAuthStore } from '../../../stores/authStore';
import { resolveSalesPrice } from '../../../services/salesPricing';
import { LABEL_SAMPLE, type LabelTemplate } from '../../../libs/labels/labelTemplate';
import { buildZpl, downloadZpl } from '../../../libs/labels/zplGenerator';
import { loadTemplates, templateError } from '../../../services/Labels/labelTemplateService';

interface BulkLine { key: string; pkid: number | null; code: string; description: string; barcode: string; price?: number | null; copies: number; cantidad: string }

const props = defineProps<{ seed?: any }>();
const visible = defineModel<boolean>('visible', { default: false });
const MAX_LABELS = 500;

const authStore = useAuthStore();
const templates = ref<LabelTemplate[]>([]);
const templateId = ref('');
const loadingTpl = ref(false);
const query = ref('');
const searching = ref(false);
const results = ref<any[]>([]);
const families = ref<any[]>([]);
const tarifas = ref<any[]>([]);
const familyId = ref<number | null>(null);
const tarifaId = ref<number | null>(null);
const lines = ref<BulkLine[]>([]);
const msg = ref('');

let loadId = 0;
watch(visible, (open) => {
  if (!open) { loadId++; return; }
  void refreshTemplates();
  void loadFilters();
  if (props.seed) void addLine(props.seed);
});

async function refreshTemplates(): Promise<void> {
  const request = ++loadId;
  loadingTpl.value = true; msg.value = '';
  try {
    const rows = await loadTemplates();
    if (request !== loadId) return;
    templates.value = rows;
    if (!rows.some((t) => t.id === templateId.value)) templateId.value = rows[0]?.id ?? '';
    if (!rows.length) msg.value = 'No hay plantillas en base de datos. Crea una desde Configuración / Etiquetas.';
  } catch (e) { if (request === loadId) msg.value = templateError(e); }
  finally { if (request === loadId) loadingTpl.value = false; }
}

async function loadFilters(): Promise<void> {
  try {
    const [fam, tar] = await Promise.all([
      axios.get(backendUrl('/WebGetProductFamilies'), { params: { page: 0, size: 200 }, timeout: 15000 }),
      axios.get(backendUrl('/WebSalesPriceLists'), { ...authStore.portalRequestConfig(), params: { page: 0, size: 100 }, timeout: 15000 }),
    ]);
    families.value = fam.data?.content ?? fam.data ?? [];
    tarifas.value = tar.data?.content ?? tar.data ?? [];
  } catch { /* filtros opcionales: el buscador sigue funcionando sin ellos */ }
}

async function search(): Promise<void> {
  searching.value = true;
  try {
    const params: any = { page: 0, size: 20 };
    const q = query.value.trim();
    if (q) params.query = q;
    if (familyId.value != null) params.familyId = familyId.value;
    const { data } = await axios.get(backendUrl('/WebGetProducts'), { params, timeout: 15000 });
    results.value = data?.content ?? [];
    if (!results.value.length) msg.value = 'Sin resultados para este filtro.';
    else if (!q && familyId.value != null) msg.value = `${results.value.length} artículos de la familia. Usa «Añadir todos».`;
  } catch { msg.value = 'No se ha podido buscar artículos. Comprueba la conexión.'; }
  finally { searching.value = false; }
}

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
function toLine(p: any): BulkLine {
  return {
    key: `${p.code ?? p.pkid ?? Math.random()}`,
    pkid: typeof p.pkid === 'number' ? p.pkid : null,
    code: String(p.code ?? ''),
    description: String(p.description ?? ''),
    barcode: String(p.barcode ?? p.code ?? ''),
    price: typeof p.salePrice === 'number' ? p.salePrice : null,
    copies: 1,
    cantidad: '1',
  };
}
async function resolveLinePrice(line: BulkLine): Promise<void> {
  if (tarifaId.value == null || line.pkid == null) return;
  try {
    const r = await resolveSalesPrice(tarifaId.value, { productId: line.pkid, priceUnit: line.price ?? null, quantity: 1 });
    line.price = r.priceUnit;
  } catch { /* se conserva el precio base y se imprime igual */ }
}
async function addLine(p: any): Promise<void> {
  if (!p) return;
  const line = toLine(p);
  if (lines.value.some((l) => l.key === line.key)) return;
  lines.value = [...lines.value, line];
  await resolveLinePrice(line);
}
async function addAll(): Promise<void> {
  for (const p of results.value) {
    const line = toLine(p);
    if (!lines.value.some((l) => l.key === line.key)) lines.value = [...lines.value, line];
  }
  if (tarifaId.value != null) {
    msg.value = 'Resolviendo precios de tarifa…';
    await Promise.all(lines.value.map(resolveLinePrice));
    msg.value = `${lines.value.length} artículos en cola con la tarifa seleccionada.`;
  }
}
function removeLine(key: string): void { lines.value = lines.value.filter((l) => l.key !== key); }

const tpl = computed(() => templates.value.find((t) => t.id === templateId.value));
const totalLabels = computed(() => lines.value.reduce((n, l) => n + (Math.min(l.copies || 0, 999)), 0));
const canPrint = computed(() => !!tpl.value && lines.value.length > 0 && totalLabels.value > 0 && totalLabels.value <= MAX_LABELS);

function sampleOf(l: BulkLine): Record<string, string> {
  return {
    ...LABEL_SAMPLE,
    '{{producto.codigo}}': l.code || LABEL_SAMPLE['{{producto.codigo}}'],
    '{{producto.descripcion}}': l.description || LABEL_SAMPLE['{{producto.descripcion}}'],
    '{{producto.codigoBarras}}': l.barcode || LABEL_SAMPLE['{{producto.codigoBarras}}'],
    '{{producto.precio}}': l.price != null ? eur(l.price) : LABEL_SAMPLE['{{producto.precio}}'],
    '{{cantidad}}': l.cantidad || '1',
  };
}
const zpl = computed(() => {
  if (!canPrint.value || !tpl.value) return '';
  const parts: string[] = [];
  for (const l of lines.value) {
    const one = buildZpl(tpl.value, sampleOf(l));
    for (let i = 0; i < Math.min(l.copies || 0, 999); i++) parts.push(one);
  }
  return parts.join('\n');
});
const sizeKb = computed(() => (zpl.value ? (new Blob([zpl.value]).size / 1024).toFixed(1) : ''));
const zplPreview = computed(() => (zpl.value.length > 4000 ? `${zpl.value.slice(0, 4000)}\n… (${totalLabels.value} etiquetas)` : zpl.value));

watch(totalLabels, (n) => {
  msg.value = n > MAX_LABELS ? `Tope de ${MAX_LABELS} etiquetas por trabajo: reduce copias o divide en varios envíos.` : msg.value.startsWith('Tope de') ? '' : msg.value;
});

function download(): void {
  if (!canPrint.value || !tpl.value) return;
  const d = new Date().toISOString().slice(0, 10);
  downloadZpl(`${tpl.value.nombre || 'etiquetas'}_${d}`, zpl.value);
}
</script>

<style scoped>
label { font-size: .72rem; font-weight: 700; color: #6b7280; display: block; margin-bottom: 3px; }
.search-row { align-items: center; }
.search-row .search-input { flex: 1 1 auto; min-width: 0; }
.search-row .add-all { flex: 0 0 auto; white-space: nowrap; }
.panel { margin-top: 14px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: #fff; }
.panel > header { display: flex; align-items: center; gap: 8px; padding: 9px 12px; font-size: .82rem; }
.panel > header i { font-size: .9rem; }
.panel > header strong { flex: 0 0 auto; }
.panel > header span { margin-left: auto; color: #6b7280; font-size: .75rem; }
.panel-search > header { background: #eef5d9; color: #42560c; border-bottom: 1px solid #d9e6b3; }
.panel-queue > header { background: #eef5d9; color: #42560c; border-bottom: 1px solid #d9e6b3; }
.panel .empty { margin: 0; padding: 12px; color: #9ca3af; font-size: .8rem; text-align: center; }
.msg { color: #6b7280; font-size: .75rem; display: block; margin-top: 8px; }
.zpl { background: #111827; color: #d1fae5; border-radius: 8px; padding: 10px; max-height: 200px; overflow: auto; font-size: .7rem; margin-top: 10px; }
</style>
