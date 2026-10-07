<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    class="kiwik-dialog price-update-dialog"
    header="Actualización masiva de precios"
    :style="{ width: '94vw', maxWidth: '1500px', height: '90vh' }"
    :closable="!busy"
    :closeOnEscape="!busy"
  >
    <div class="update-workspace">
      <div class="view-switch">
        <Button label="Actualizar precios" :severity="tab === 'update' ? 'primary' : 'secondary'" :disabled="busy" @click="tab = 'update'" />
        <Button label="Historial" icon="pi pi-history" :severity="tab === 'history' ? 'primary' : 'secondary'" :disabled="busy" @click="showHistory" />
      </div>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Button v-if="!catalogLoaded && !busy" label="Reintentar carga de catálogos" icon="pi pi-refresh" severity="secondary" @click="loadCatalogs" />
      <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

      <template v-if="tab === 'update'">
        <fieldset class="filters" :disabled="busy">
          <legend>1. Selecciona los precios y el ajuste</legend>
          <label>Precios que se actualizarán
            <Select v-model="form.mode" :options="modes" optionLabel="label" optionValue="value" optionDisabled="disabled" :disabled="busy" />
          </label>
          <label v-if="form.mode === 'TARIFF'">Tarifa
            <Select v-model="form.tarifaId" :options="catalog.rates" optionLabel="description" optionValue="id" filter placeholder="Seleccionar tarifa" :disabled="busy" />
          </label>
          <label>Familias exactas
            <MultiSelect v-model="form.familyIds" :options="families" optionLabel="label" optionValue="id" filter placeholder="Todas las familias" emptyMessage="No hay familias disponibles" emptyFilterMessage="No hay coincidencias" :maxSelectedLabels="2" :disabled="busy || !catalogLoaded" />
          </label>
          <label>Clase de artículo
            <Select v-model="form.categoryId" :options="categories" optionLabel="label" optionValue="id" showClear placeholder="Todas las clases" emptyMessage="No hay clases de artículo disponibles" :loading="busy && !catalogLoaded" :disabled="busy" />
          </label>
          <label>Código o descripción
            <InputText v-model="form.query" maxlength="150" placeholder="Todos los artículos" />
          </label>
          <label>Ajuste
            <Select v-model="form.direction" :options="directions" optionLabel="label" optionValue="value" :disabled="busy" />
          </label>
          <label>Porcentaje
            <InputNumber v-model="form.percent" :min="0.0001" :max="form.direction === 'DOWN' ? 100 : 1000" :maxFractionDigits="4" suffix=" %" locale="es-ES" :disabled="busy" />
          </label>
          <label>Decimales del nuevo precio
            <Select v-model="form.decimals" :options="[0, 1, 2, 3, 4, 5, 6]" :disabled="busy" />
          </label>
          <label class="reason">Motivo de la actualización
            <InputText v-model="form.reason" maxlength="250" placeholder="Ej.: revisión anual de precios" />
          </label>
          <label class="active-filter"><Checkbox v-model="form.activeOnly" binary :disabled="busy" /> Solo artículos activos</label>
        </fieldset>
        <p class="help-text">
          Importes sin impuestos, en la unidad de venta habitual. Los documentos guardados conservan sus importes.
          Las familias no incluyen automáticamente sus subfamilias.
        </p>
        <Message v-if="form.mode === 'TARIFF'" severity="info" :closable="false">
          Se actualizan precios fijos, conservando los tramos. Los descuentos no se modifican.
          Para incluir reglas compartidas de familia o generales, desmarca «Solo artículos activos» y deja vacíos la clase y la búsqueda.
          Cada regla compartida afecta a todo su ámbito; las reglas de producto siguen teniendo prioridad.
        </Message>
        <div class="preview-heading">
          <h3>2. Revisa y selecciona los cambios</h3>
          <Button label="Previsualizar" icon="pi pi-eye" class="corporate-action" :loading="busy" :disabled="!canPreview" @click="preview" />
        </div>
        <template v-if="batch">
          <Message v-if="batch.preview.affectedRates.length" severity="warn" :closable="false">
            Las tarifas {{ batch.preview.affectedRates.join(', ') }} pueden heredar estos precios base o aplicarles descuentos.
            Sus precios fijos se mantienen.
          </Message>
          <p v-if="batch.preview.skippedDiscounts || batch.preview.skippedShared" class="help-text">
            Excluidas: {{ batch.preview.skippedDiscounts }} reglas de descuento y {{ batch.preview.skippedShared }} reglas compartidas incompatibles con los filtros.
          </p>
          <div class="selection-summary">
            <span><b>{{ selectedChanges.length }}</b> precios se actualizarán de {{ batch.preview.rows.length }} revisados · {{ batch.preview.currency }}</span>
            <span v-if="zeroCount">{{ zeroCount }} precios a cero seguirán a cero.</span>
            <span>La previsualización caduca a los 30 minutos.</span>
          </div>
          <DataTable
            v-model:selection="selected"
            :value="batch.preview.rows"
            dataKey="id"
            scrollable
            scrollHeight="flex"
            paginator
            :rows="50"
            :rowsPerPageOptions="[25, 50, 100]"
            class="preview-table"
          >
            <template #empty>No hay precios que coincidan con estos filtros.</template>
            <Column selectionMode="multiple" headerStyle="width: 3rem" />
            <Column field="label" header="Artículo / ámbito" />
            <Column field="family" header="Familia" />
            <Column v-if="form.mode === 'TARIFF'" header="Cantidad mínima"><template #body="{ data }">{{ number(data.minQuantity) }}</template></Column>
            <Column header="Precio actual"><template #body="{ data }">{{ number(data.before) }}</template></Column>
            <Column header="Precio nuevo"><template #body="{ data }"><b>{{ number(data.after) }}</b></template></Column>
            <Column header="Diferencia"><template #body="{ data }">{{ number(data.after - data.before) }}</template></Column>
          </DataTable>
        </template>
        <div v-else class="empty-preview"><i class="pi pi-percentage" /><span>Previsualiza el resultado antes de actualizar. Puedes excluir filas de la selección.</span></div>
      </template>

      <template v-else>
        <div class="preview-heading">
          <h3>Historial de actualizaciones</h3>
          <Button label="Refrescar" icon="pi pi-refresh" text :disabled="busy" @click="loadHistory" />
        </div>
        <DataTable :value="history" dataKey="id" scrollable scrollHeight="flex" class="history-table" :loading="busy">
          <template #empty>Todavía no hay actualizaciones aplicadas.</template>
          <Column header="Fecha"><template #body="{ data }">{{ date(data.appliedAt) }}</template></Column>
          <Column field="actor" header="Usuario" />
          <Column field="reason" header="Motivo" />
          <Column header="Destino"><template #body="{ data }">{{ data.tariffLabel || 'Precios base' }}</template></Column>
          <Column header="Ajuste"><template #body="{ data }">{{ data.input.direction === 'DOWN' ? '−' : '+' }}{{ number(data.input.percent) }} %</template></Column>
          <Column field="count" header="Precios" />
          <Column header="Estado"><template #body="{ data }"><Tag :value="data.status === 'REVERTED' ? 'Revertida' : 'Aplicada'" :severity="data.status === 'REVERTED' ? 'secondary' : 'success'" /></template></Column>
          <Column header="Detalle"><template #body="{ data }"><Button icon="pi pi-search" label="Ver" text :disabled="busy" @click="viewDetail(data.id)" /></template></Column>
        </DataTable>
        <Paginator :rows="20" :first="historyPage * 20" :totalRecords="historyTotal" @page="changeHistoryPage" />
      </template>
    </div>
    <template #footer>
      <div class="footer-actions">
        <div class="kiwik-separator" />
        <div>
          <Button label="Cerrar" severity="secondary" text :disabled="busy" @click="visible = false" />
          <Button v-if="tab === 'update'" :label="`Aplicar actualización (${selectedChanges.length})`" icon="pi pi-check" class="corporate-action" :disabled="!canPreview || !batch || !selectedChanges.length || busy" @click="confirmApply = true" />
        </div>
      </div>
    </template>
  </Dialog>

  <Dialog v-model:visible="confirmApply" modal header="Confirmar actualización de precios" class="kiwik-dialog" :style="{ width: 'min(540px, 95vw)' }" :closable="!busy" :closeOnEscape="!busy">
    <p>Se actualizarán <b>{{ selectedChanges.length }} precios</b> con un {{ form.direction === 'UP' ? 'incremento' : 'descenso' }} del <b>{{ number(form.percent) }} %</b>.</p>
    <p>{{ form.reason }}. Los documentos guardados conservarán sus importes.</p>
    <template #footer><div class="footer-actions"><div class="kiwik-separator" /><div><Button label="Volver" text :disabled="busy" @click="confirmApply = false" /><Button label="Aplicar ahora" class="corporate-action" :loading="busy" @click="apply" /></div></div></template>
  </Dialog>

  <Dialog v-model:visible="detailVisible" modal maximizable header="Detalle de la actualización" class="kiwik-dialog" :style="{ width: 'min(1100px, 95vw)' }" :closable="!busy" :closeOnEscape="!busy">
    <template v-if="detail">
      <p><b>{{ detail.reason }}</b> · {{ detail.actor }} · {{ date(detail.appliedAt) }}</p>
      <p>{{ detail.tariffLabel || 'Precios base' }} · {{ detail.input.direction === 'UP' ? '+' : '−' }}{{ number(detail.input.percent) }} % · {{ detail.input.decimals }} decimales · {{ detail.preview.currency }}</p>
      <p>Familias: {{ familyLabels(detail.input.familyIds) }} · Clase: {{ categoryLabel(detail.input.categoryId) }} · {{ detail.input.activeOnly ? 'Solo activos' : 'Activos e inactivos' }} · Búsqueda: {{ detail.input.query || 'Todas' }}</p>
      <Message v-if="detail.status === 'REVERTED'" severity="info" :closable="false">Revertida por {{ detail.revertedBy }} el {{ date(detail.revertedAt) }}.</Message>
      <Message v-if="detailError" severity="error" :closable="false">{{ detailError }}</Message>
      <DataTable :value="detail.preview.rows" paginator :rows="25" scrollable scrollHeight="45vh">
        <Column field="label" header="Artículo / ámbito" />
        <Column field="family" header="Familia" />
        <Column header="Cantidad mínima"><template #body="{ data }">{{ data.minQuantity == null ? '—' : number(data.minQuantity) }}</template></Column>
        <Column header="Precio anterior"><template #body="{ data }">{{ number(data.before) }}</template></Column>
        <Column header="Precio aplicado"><template #body="{ data }">{{ number(data.after) }}</template></Column>
      </DataTable>
      <Message v-if="confirmRevert" severity="warn" :closable="false">Se restaurarán todos los precios anteriores de este lote. Si se ha editado alguna ficha de producto afectada o la tarifa después de la actualización, se rechazará la reversión completa.</Message>
    </template>
    <template #footer>
      <div class="footer-actions"><div class="kiwik-separator" /><div>
        <Button label="Cerrar" text severity="secondary" :disabled="busy" @click="detailVisible = false" />
        <Button v-if="detail?.status === 'APPLIED' && canEdit && (detail.input.mode !== 'BASE' || canEditBase)" :label="confirmRevert ? 'Confirmar reversión' : 'Revertir actualización'" severity="warn" :loading="busy" @click="confirmRevert ? revert() : (confirmRevert = true)" />
      </div></div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import MultiSelect from 'primevue/multiselect';
import Paginator from 'primevue/paginator';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { backendUrl } from '@/services/backendUrl';
import { pricingErrorMessage } from '@/services/salesPricing';
import { useAuthStore } from '@/stores/authStore';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';

type Choice = { id: number; label: string };
type PriceInput = {
  mode: string; tarifaId: number | null; familyIds: number[]; categoryId: number | null;
  query: string; activeOnly: boolean; direction: string; percent: number | null; decimals: number; reason: string;
};
type PriceRow = { id: number; label: string; family: string; before: number; after: number; minQuantity: number | null };
type Batch = {
  id: string; status: string; actor: string; reason: string; appliedAt: string; revertedAt: string;
  revertedBy: string; tariffLabel: string | null; count: number; input: PriceInput;
  preview: { rows: PriceRow[]; currency: string; affectedRates: string[]; skippedDiscounts: number; skippedShared: number };
};
const visible = defineModel<boolean>('visible', { default: false });
const props = defineProps<{ catalog: { rates: { id: number; description: string }[]; families: Choice[] } }>();
const emit = defineEmits<{ updated: [] }>();
const auth = useAuthStore();
const security = useSecurityStore();
const canEdit = computed(() => security.hasPermission(PERM.PRICELIST_EDIT));
const canEditBase = computed(() => security.hasPermission(PERM.PROD_PRICE_UPDATE));
const form = ref<PriceInput>({ mode: 'BASE', tarifaId: null, familyIds: [], categoryId: null, query: '', activeOnly: true, direction: 'UP', percent: 5, decimals: 2, reason: '' });
const modes = computed(() => [
  { label: 'Precios base de productos y servicios', value: 'BASE', disabled: !canEditBase.value },
  { label: 'Precios fijos de una tarifa', value: 'TARIFF', disabled: false },
]);
const directions = [{ label: 'Subir', value: 'UP' }, { label: 'Bajar', value: 'DOWN' }];
const categories = ref<Choice[]>([]);
const families = ref<Choice[]>([]);
const catalogLoaded = ref(false);
const tab = ref('update');
const busy = ref(false);
const error = ref('');
const success = ref('');
const batch = ref<Batch | null>(null);
const selected = ref<PriceRow[]>([]);
const confirmApply = ref(false);
const history = ref<Batch[]>([]);
const historyPage = ref(0);
const historyTotal = ref(0);
const detail = ref<Batch | null>(null);
const detailVisible = ref(false);
const detailError = ref('');
const confirmRevert = ref(false);
const canPreview = computed(() => catalogLoaded.value && canEdit.value && !!form.value.reason.trim() && !!form.value.percent && (form.value.mode === 'BASE' ? canEditBase.value : !!form.value.tarifaId));
const zeroCount = computed(() => batch.value?.preview.rows.filter(row => row.before === 0).length || 0);
const selectedChanges = computed(() => selected.value.filter(row => row.before !== row.after));
const number = (value: number | null) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(value ?? 0);
const date = (value: string) => value ? new Date(value).toLocaleString('es-ES') : '—';
const familyLabels = (ids: number[]) => ids.length ? ids.map(id => families.value.find(f => f.id === id)?.label || `Familia ${id}`).join(', ') : 'Todas';
const categoryLabel = (id: number | null) => categories.value.find(c => c.id === id)?.label || (id ? `Clase ${id}` : 'Todas');
const url = (path = '') => backendUrl(`/WebSalesPriceUpdates${path}`);

// A change of any criterion invalidates the server snapshot and its selected rows.
watch(form, () => { batch.value = null; selected.value = []; success.value = ''; }, { deep: true, flush: 'sync' });
watch(visible, async open => {
  if (!open) return;
  error.value = ''; success.value = ''; batch.value = null; selected.value = [];
  if (!canEditBase.value) form.value.mode = 'TARIFF';
  if (!canEdit.value) tab.value = 'history';
  await loadCatalogs();
  if (tab.value === 'history' && catalogLoaded.value) await loadHistory();
});

async function loadCatalogs() {
  busy.value = true;
  catalogLoaded.value = false;
  error.value = '';
  categories.value = [];
  families.value = [];
  try {
    // Each catalog can render even if the other request fails. Reuse the product form's class IDs.
    const [categoryResult, familyResult] = await Promise.allSettled([
      axios.get(backendUrl('/WebLoadProductCatalog'), { ...auth.portalRequestConfig(), timeout: 15000 }),
      axios.get<Choice[]>(url('/families'), { ...auth.portalRequestConfig(), timeout: 15000 }),
    ]);
    const errors: string[] = [];
    if (categoryResult.status === 'fulfilled') {
      const rows = categoryResult.value.data?.productCategories;
      if (Array.isArray(rows) && rows.length) {
        categories.value = rows.map((row: { pkid: number; description: string }) => ({ id: Number(row.pkid), label: row.description }));
      } else errors.push('El catálogo de productos no ha devuelto clases de artículo.');
    } else errors.push(`No se pudieron cargar las clases de artículo: ${pricingErrorMessage(categoryResult.reason)}`);
    if (familyResult.status === 'fulfilled' && Array.isArray(familyResult.value.data)) {
      families.value = familyResult.value.data;
    } else errors.push(`No se pudieron cargar las familias: ${familyResult.status === 'rejected' ? pricingErrorMessage(familyResult.reason) : 'respuesta de catálogo no válida.'}`);
    error.value = errors.join(' ');
    catalogLoaded.value = errors.length === 0;
  }
  catch (e) { error.value = pricingErrorMessage(e); }
  finally { busy.value = false; }
}

async function preview() {
  busy.value = true; error.value = ''; success.value = ''; batch.value = null; selected.value = [];
  try {
    const { data } = await axios.post<Batch>(url('/preview'), form.value, auth.portalRequestConfig());
    batch.value = data;
    selected.value = data.preview.rows.filter(row => row.before !== row.after);
  } catch (e) { error.value = pricingErrorMessage(e); }
  finally { busy.value = false; }
}
async function apply() {
  if (!batch.value || busy.value) return;
  busy.value = true; error.value = '';
  try {
    const { data } = await axios.post<Batch>(url('/apply'), { id: batch.value.id, selectedIds: selectedChanges.value.map(row => row.id) }, auth.portalRequestConfig());
    success.value = `Actualización aplicada: ${data.count} precios. Puedes consultar el detalle en el historial.`;
    batch.value = null; selected.value = []; emit('updated');
  } catch (e) {
    error.value = `${pricingErrorMessage(e)} Consulta el historial antes de reintentar si se perdió la conexión.`;
    batch.value = null; selected.value = [];
  } finally { busy.value = false; confirmApply.value = false; }
}
async function loadHistory() {
  busy.value = true; error.value = '';
  try {
    const { data } = await axios.get(url(), { ...auth.portalRequestConfig(), params: { page: historyPage.value } });
    history.value = data.content; historyTotal.value = data.totalElements;
  } catch (e) { error.value = pricingErrorMessage(e); }
  finally { busy.value = false; }
}
async function showHistory() { tab.value = 'history'; historyPage.value = 0; await loadHistory(); }
async function changeHistoryPage(event: { page: number }) { if (busy.value) return; historyPage.value = event.page; await loadHistory(); }
async function viewDetail(id: string) {
  busy.value = true; error.value = ''; detailError.value = ''; confirmRevert.value = false;
  try { detail.value = (await axios.get<Batch>(url(`/${id}`), auth.portalRequestConfig())).data; detailVisible.value = true; }
  catch (e) { error.value = pricingErrorMessage(e); }
  finally { busy.value = false; }
}
async function revert() {
  if (!detail.value || busy.value) return;
  busy.value = true; detailError.value = '';
  try {
    detail.value = (await axios.post<Batch>(url(`/${detail.value.id}/revert`), {}, auth.portalRequestConfig())).data;
    batch.value = null; selected.value = []; success.value = 'Actualización revertida. Se han restaurado los precios anteriores.';
    emit('updated'); await loadHistory();
  } catch (e) { detailError.value = pricingErrorMessage(e); }
  finally { busy.value = false; confirmRevert.value = false; }
}
</script>

<style scoped>
.update-workspace { display: flex; flex-direction: column; gap: .8rem; height: 100%; min-height: 0; overflow: auto; color: #253040; }
.view-switch, .preview-heading, .selection-summary { display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap; }
.view-switch { justify-content: flex-start; }
.filters { display: grid; flex-shrink: 0; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .8rem; padding: 1rem; border: 1px solid #dce3ce; border-radius: 10px; }
.filters legend { font-weight: 600; padding: 0 .4rem; }
.filters label { display: flex; flex-direction: column; gap: .35rem; min-width: 0; font-size: .88rem; font-weight: 600; }
.filters .reason { grid-column: span 2; }
.filters .active-filter { flex-direction: row; align-items: center; gap: .5rem; }
.help-text, .selection-summary { margin: 0; font-size: .85rem; color: #536173; }
.preview-heading h3 { margin: 0; font-size: 1rem; }
.preview-table, .history-table { flex: 1 0 240px; min-height: 240px; }
.empty-preview { flex: 1; min-height: 140px; display: flex; gap: 1rem; align-items: center; justify-content: center; color: #657381; background: #f7f9f3; border-radius: 8px; }
.empty-preview i { font-size: 1.7rem; }
.footer-actions { width: 100%; }
.footer-actions > div:last-child { display: flex; justify-content: flex-end; gap: .7rem; margin-top: 1rem; }
.corporate-action { background: #9cc10a; border-color: #9cc10a; color: #253000; }
.corporate-action:not(:disabled):hover { background: #8bad09; border-color: #8bad09; color: #253000; }
:deep(.p-datatable-tbody > tr > td) { font-size: .9rem; }
@media (max-width: 1000px) { .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .filters { grid-template-columns: 1fr; } .filters .reason { grid-column: auto; } }
</style>
