<template>
    <Dialog v-model:visible="visible" modal :closable="!busy" :closeOnEscape="!busy" class="kiwik-dialog product-import-dialog"
        :style="{ width: '96vw', maxWidth: '1600px' }" :contentStyle="{ overflow: 'auto', minHeight: '0' }">
        <template #header>
            <div class="import-title">
                <span class="import-icon"><i class="pi pi-file-excel" /></span>
                <div><h2>Trae tus productos y servicios a KiwiKERP</h2><p>Desde tu Excel, paso a paso y con revisión antes de guardar.</p></div>
            </div>
        </template>
        <div class="import-body" :aria-busy="busy">
            <ol class="import-steps" aria-label="Pasos de la importación">
                <li v-for="(label, i) in steps" :key="label" :class="{ current: step === i + 1, complete: step > i + 1 }" :aria-current="step === i + 1 ? 'step' : undefined">
                    <span>{{ i + 1 }}</span>{{ label }}
                </li>
            </ol>
            <Message v-if="error" severity="error" :closable="false" role="alert">{{ error }}</Message>

            <template v-if="step === 1">
                <div class="section-heading"><div><h3>¿Qué datos quieres trasladar?</h3><p>Un mismo artículo puede estar disponible para compra y venta.</p></div><Button label="Ver historial" icon="pi pi-history" severity="secondary" :disabled="busy" @click="showHistory" /></div>
                <div class="kind-grid">
                    <button v-for="kind in kinds" :key="kind.value" type="button" :class="['kind-card', { selected: mode === kind.value }]" :aria-pressed="mode === kind.value" :disabled="busy" @click="mode = kind.value">
                        <i :class="kind.icon" /><strong>{{ kind.label }}</strong><span>{{ kind.detail }}</span>
                    </button>
                </div>
                <section class="import-panel">
                    <h3>Valores comunes del archivo</h3><p>Puedes elegirlos aquí para todas las filas o relacionarlos con columnas de tu Excel después.</p>
                    <div class="defaults-grid">
                        <label>Fecha de alta *<input v-model="defaults.dateUp" type="date" :disabled="busy" /></label>
                        <div class="default-field">
                            <label for="product-import-active">Estado</label>
                            <Select v-model="defaults.active" inputId="product-import-active" :options="stateOptions" optionLabel="label" optionValue="id" :disabled="busy" />
                        </div>
                        <div v-for="f in commonCatalogFields" :key="f.key" class="default-field">
                            <label :for="'product-import-' + f.key">{{ f.label }}</label>
                            <Select v-model="defaults[f.key]" :inputId="'product-import-' + f.key" :options="commonOptions(f)"
                                optionLabel="label" optionValue="id" placeholder="Elegir aquí o desde una columna"
                                filter showClear :disabled="busy" scrollHeight="250px" class="w-full"
                                emptyMessage="No hay valores disponibles" emptyFilterMessage="No hay coincidencias" />
                        </div>
                        <label>Precio base de venta (sin impuestos)<input v-model="defaults.salePrice" inputmode="decimal" placeholder="0,00" :disabled="busy" /></label>
                        <label>Precio base de compra (sin impuestos)<input v-model="defaults.purchasePrice" inputmode="decimal" placeholder="0,00" :disabled="busy" /></label>
                    </div>
                    <label class="check-label"><input v-model="defaults.copyDescription" type="checkbox" :disabled="busy" /> Si falta descripción en inglés, conservar la misma descripción del artículo (sin traducir).</label>
                    <p>Las dos unidades son necesarias para guardar la ficha. Los tipos comerciales deben pertenecer al tipo logístico elegido.</p>
                </section>
                <div class="template-card"><i class="pi pi-download" /><div><strong>Tu Excel también sirve</strong><p>No necesitas cambiar los nombres de tus columnas. O empieza con nuestra plantilla vacía.</p></div><Button label="Descargar plantilla" outlined :disabled="busy" @click="template" /></div>
                <Message severity="info" :closable="false">Importa el catálogo y sus precios base sin impuestos. Las existencias iniciales, imágenes, tarifas especiales y movimientos de almacén se gestionan aparte.</Message>
            </template>

            <template v-else-if="step === 2">
                <h3>Selecciona tu archivo</h3>
                <label class="upload-zone" @dragover.prevent @drop.prevent="dropFile">
                    <i class="pi pi-cloud-upload" /><strong>{{ filename || 'Arrastra tu Excel aquí o selecciona un archivo' }}</strong>
                    <span>.xlsx o .xls · hasta 10 MB y 5.000 filas · solo lectura de datos</span>
                    <input type="file" accept=".xlsx,.xls" :disabled="busy" aria-label="Seleccionar archivo Excel" @change="selectFile" />
                </label>
                <div v-if="workbook" class="defaults-grid sheet-options">
                    <div class="default-field">
                        <label for="product-import-sheet">Hoja</label>
                        <Select v-model="sheetName" inputId="product-import-sheet" :options="workbook.SheetNames"
                            :disabled="busy" @change="readSheet" />
                    </div>
                    <label>Fila de encabezados<input v-model.number="headerRow" type="number" min="1" max="1048576" :disabled="busy" @change="readSheet" /></label>
                </div>
                <template v-if="headers.length">
                    <p><strong>{{ sourceRows.length.toLocaleString('es-ES') }} filas de datos</strong> · Vista previa de las diez primeras. Las filas vacías se omiten.</p>
                    <div class="table-scroll"><table><thead><tr><th>Fila Excel</th><th v-for="(h, i) in headers" :key="i">{{ h }}</th></tr></thead><tbody><tr v-for="r in sourceRows.slice(0, 10)" :key="r.row"><td>{{ r.row }}</td><td v-for="(_, i) in headers" :key="i">{{ r.values[i] }}</td></tr></tbody></table></div>
                </template>
            </template>

            <template v-else-if="step === 3">
                <div class="section-heading"><div><h3>Relaciona las columnas</h3><p>Revisa las sugerencias. «Valor común» utiliza lo elegido en el primer paso.</p></div><Tag :value="`${sourceRows.length} filas`" /></div>
                <Message v-if="mappingMissing.length" severity="warn" :closable="false">Falta relacionar: {{ mappingMissing.join(', ') }}.</Message>
                <div class="table-scroll mapping-table"><table><thead><tr><th>Campo de KiwiKERP</th><th>Columna de tu Excel</th><th>Ejemplo / valor común</th></tr></thead><tbody>
                    <tr v-for="f in fields" :key="f.key">
                        <th scope="row"><label :for="`product-map-${f.key}`">{{ f.label }}</label></th>
                        <td><Select v-model="mapping[f.key]" :inputId="`product-map-${f.key}`" :options="columnOptions(f.key)"
                            optionLabel="label" optionValue="id" filter :disabled="busy" class="w-full"
                            emptyFilterMessage="No hay coincidencias" /></td>
                        <td>{{ mappingExample(f) }}</td>
                    </tr>
                </tbody></table></div>
                <p class="muted">Columnas ignoradas: {{ ignoredColumns.join(', ') || 'ninguna' }}.</p>
                <section v-for="f in equivalenceFields" :key="f.key" class="import-panel">
                    <h4>Equivalencias: {{ f.label }}</h4><p>Indica qué significa cada valor de esta columna, incluidos los vacíos.</p>
                    <div class="equivalence-grid">
                        <div v-for="(value, i) in uniqueValues(f.key)" :key="value" class="default-field">
                            <label :for="`product-equivalence-${f.key}-${i}`">{{ value || '(vacío)' }}</label>
                            <Select v-model="equivalences[f.key]![value]" :inputId="`product-equivalence-${f.key}-${i}`"
                                :options="optionsFor(f)" optionLabel="label" optionValue="id" :disabled="busy"
                                placeholder="Seleccionar equivalencia" showClear filter emptyFilterMessage="No hay coincidencias" />
                        </div>
                    </div>
                </section>
                <Message v-if="pendingFamilyNames.length" severity="info" :closable="false">
                    Familias que se crearán si no existen al importar: {{ pendingFamilyNames.join(', ') }}.
                    Tendrán código automático y solo se crearán para las filas de artículos que se guarden.
                </Message>
                <Message severity="info" :closable="false">Los códigos y códigos de barras conservan sus ceros disponibles en Excel. Importes de texto: 1.234,56, sin moneda y sin impuestos. Fechas: dd/mm/aaaa o aaaa-mm-dd.</Message>
            </template>

            <template v-else-if="step === 4 && batch">
                <div class="section-heading"><div><h3>Revisa antes de importar</h3><p>No se ha creado ni modificado ningún artículo.</p></div><Button label="Descargar incidencias" icon="pi pi-download" outlined :disabled="busy" @click="downloadResult(true)" /></div>
                <div class="summary-grid"><div><strong>{{ readyCount }}</strong><span>Seleccionadas</span></div><div><strong>{{ issueCount }}</strong><span>Con errores</span></div><div><strong>{{ matchCount }}</strong><span>Con coincidencias</span></div><div><strong>{{ skippedCount }}</strong><span>Omitidas</span></div></div>
                <div class="filter-label">
                    <label for="product-review-filter">Mostrar</label>
                    <Select v-model="reviewFilter" inputId="product-review-filter" :options="reviewFilters" optionLabel="label" optionValue="id" />
                </div>
                <div class="table-scroll"><table><thead><tr><th>Fila</th><th>Artículo</th><th>Código de barras</th><th>Revisión / decisión</th><th>Detalle</th></tr></thead><tbody>
                    <tr v-for="r in pagedRows" :key="r.row_number"><td>{{ r.row_number }}</td><td><strong>{{ r.data.name }}</strong><small>{{ r.data.code || 'Código automático' }}</small><small v-if="r.data.familyName">Familia: {{ r.data.familyName }} (crear si no existe)</small></td><td>{{ r.data.barcode }}</td><td>
                        <Select v-model="r.decision" :aria-label="`Acción de la fila ${r.row_number}`"
                            :options="decisionsFor(r)" optionLabel="label" optionValue="id" />
                        <ul v-if="r.review.issues.length" class="issue-list"><li v-for="issue in r.review.issues" :key="issue">{{ issue }}</li></ul>
                        <div v-for="c in r.review.candidates" :key="c.id" class="candidate">{{ c.code }} · {{ c.name }} · {{ c.barcode }}<small>Artículo existente. Se omitirá; no se sustituirán datos.</small></div>
                    </td><td><Button icon="pi pi-search" text :aria-label="`Ver detalle de fila ${r.row_number}`" @click="detailRow = r" /></td></tr>
                </tbody></table></div>
                <Paginator v-if="filteredRows.length > 25" v-model:first="first" :rows="25" :totalRecords="filteredRows.length" />
                <label class="check-label"><input v-model="partial" type="checkbox" /> Importar solo las filas seleccionadas y omitir las demás ({{ skippedCount }}).</label>
            </template>

            <template v-else-if="step === 5 && batch">
                <template v-if="batch.state === 'REVIEW'">
                    <h3>Todo preparado para tu confirmación</h3><p>{{ batch.filename }} · Hoja {{ batch.sheet_name }}</p>
                    <div class="summary-grid"><div><strong>{{ createCount }}</strong><span>Nuevos artículos</span></div><div><strong>{{ skippedCount }}</strong><span>Filas omitidas</span></div></div>
                    <Message severity="info" :closable="false">Solo al pulsar «Importar» se guardarán los datos. Los artículos existentes se omiten y no se sobrescriben.</Message>
                    <p v-if="selectedFamilyNames.length">Familias que se crearán si no existen, con código automático: <strong>{{ selectedFamilyNames.join(', ') }}</strong>.</p>
                    <p v-if="(batch.configuration.defaults as Record<string, unknown>)?.copyDescription">Cuando falte la descripción en inglés se conservará la descripción original, sin traducir.</p>
                    <div class="table-scroll"><table><thead><tr><th>Valor común</th><th>Configuración confirmada</th></tr></thead><tbody><tr v-for="item in confirmedDefaults" :key="item.label"><td>{{ item.label }}</td><td>{{ item.value }}</td></tr></tbody></table></div>
                </template>
                <template v-else>
                    <h3>{{ batch.state === 'COMPLETED' ? 'Resultado de la importación' : 'Importación en curso' }}</h3>
                    <p>{{ batch.filename }} · {{ batch.sheet_name }}</p>
                    <ProgressBar :value="progress" />
                    <p role="status" aria-live="polite">{{ processedCount }} de {{ batch.rows.length }} filas procesadas.</p>
                    <div class="summary-grid"><div><strong>{{ countState('CREATED') }}</strong><span>Creadas</span></div><div><strong>{{ countState('FAILED') }}</strong><span>Fallidas</span></div><div><strong>{{ countState('SKIPPED') }}</strong><span>Omitidas</span></div></div>
                    <Message v-if="countState('FAILED')" severity="warn" :closable="false">Hay filas que no se han podido guardar. Descarga el resultado, corrige las incidencias y vuelve a revisar esas filas en una nueva importación.</Message>
                    <Message v-if="batch.state === 'RUNNING' && !busy" severity="info" :closable="false">Puedes continuar esta ejecución desde aquí o desde el historial. Las filas ya guardadas no se repetirán.</Message>
                    <Button label="Descargar resultado" icon="pi pi-download" outlined :disabled="busy" @click="downloadResult(false)" />
                    <div class="table-scroll result-table"><table><thead><tr><th>Fila</th><th>Artículo</th><th>Resultado</th><th>Referencia</th></tr></thead><tbody><tr v-for="r in batch.rows.slice(resultFirst, resultFirst + 25)" :key="r.row_number"><td>{{ r.row_number }}</td><td>{{ r.data.name }}</td><td>{{ stateLabel(r.state) }}<small>{{ r.message }}</small></td><td>{{ r.entity_id || '—' }}</td></tr></tbody></table></div>
                    <Paginator v-if="batch.rows.length > 25" v-model:first="resultFirst" :rows="25" :totalRecords="batch.rows.length" />
                </template>
            </template>
        </div>
        <template #footer>
            <div class="import-footer">
                <div class="kiwik-separator" aria-hidden="true" />
                <div class="import-footer-actions">
                <Button v-if="step > 1 && !historyBatch && (!batch || batch.state === 'REVIEW')" label="Atrás" severity="secondary" text :disabled="busy" @click="back" />
                <Button label="Cerrar" severity="secondary" text :disabled="busy" @click="visible = false" />
                <Button v-if="step < 3" label="Continuar" icon="pi pi-arrow-right" iconPos="right" class="import-primary" :disabled="busy || (step === 2 && !sourceRows.length) || !catalogReady" @click="step++" />
                <Button v-else-if="step === 3" label="Validar datos" icon="pi pi-check-circle" class="import-primary" :loading="busy" :disabled="busy || !!mappingMissing.length" @click="preview" />
                <Button v-else-if="step === 4" label="Revisar confirmación" icon="pi pi-arrow-right" class="import-primary" :disabled="!canConfirm || busy" @click="step = 5" />
                <Button v-else-if="batch?.state === 'REVIEW'" :label="`Importar ${readyCount} artículos`" icon="pi pi-upload" class="import-primary" :loading="busy" :disabled="!canConfirm || busy" @click="execute" />
                <Button v-else-if="batch?.state === 'RUNNING'" label="Continuar importación" class="import-primary" :loading="busy" @click="execute" />
                <template v-else-if="batch?.state === 'COMPLETED'"><Button label="Nueva importación" outlined @click="reset" /><Button label="Ver artículos" class="import-primary" @click="visible = false; emit('saved')" /></template>
                </div>
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="historyVisible" header="Tus importaciones de artículos" modal class="kiwik-dialog" :style="{ width: 'min(850px, 94vw)' }">
        <p>Se muestran tus últimas 50 ejecuciones. Puedes recuperar una revisión o continuar una importación interrumpida.</p>
        <div class="table-scroll"><table><thead><tr><th>Archivo</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead><tbody><tr v-for="h in history" :key="h.id"><td>{{ h.filename }}<small>{{ h.sheet_name }}</small></td><td>{{ new Date(h.created_at).toLocaleString('es-ES') }}</td><td>{{ stateLabel(h.state) }}</td><td><Button label="Abrir" text :disabled="busy" @click="loadHistory(h.id)" /></td></tr><tr v-if="!history.length"><td colspan="4">Todavía no hay importaciones.</td></tr></tbody></table></div>
    </Dialog>
    <Dialog :visible="!!detailRow" header="Detalle de la fila" modal class="kiwik-dialog" :style="{ width: 'min(750px, 94vw)' }" @update:visible="detailRow = null">
        <p>Fila de Excel: {{ detailRow?.row_number }}. Revisa especialmente los cambios de formato.</p>
        <div class="table-scroll"><table><thead><tr><th>Campo</th><th>Valor recibido</th><th>Valor que se guardará</th></tr></thead><tbody><tr v-for="f in fields" :key="f.key"><th>{{ f.label }}</th><td>{{ detailRow?.review.original[f.key] }}</td><td>{{ detailRow?.data[f.key] }}</td></tr></tbody></table></div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import Paginator from 'primevue/paginator';
import ProgressBar from 'primevue/progressbar';
import Select from 'primevue/select';
import { useSecurityStore } from '@/stores/securityStore';
import { canImportMasterData } from '@/services/importSecurity';
import { PERM } from '@/services/Frm_Main/permissions';
import type { WorkBook } from 'xlsx';
import { downloadImportWorkbook } from '@/services/entityImport';
import { buildProductImportRows, productImportApi, productImportFields, suggestProductMapping, suggestFamilyEquivalences } from '@/services/productImport';
import type { Catalogs, HistoryItem, ImportBatch, ImportField, ReviewRow, SourceRow } from '@/services/entityImport';

const emit = defineEmits<{ saved: [] }>();
const security = useSecurityStore();
const canImport = computed(() => canImportMasterData(security, 'products'));
const canCreateFamilies = computed(() => security.hasPermission(PERM.FAM_EDIT));
const visible = ref(false);
const busy = ref(false);
const error = ref('');
const catalogReady = ref(false);
const step = ref(1);
const steps = ['Preparar', 'Cargar', 'Relacionar', 'Revisar', 'Importar'];
const kinds = [
    { value: 'sale', label: 'Para vender', icon: 'pi pi-shopping-cart', detail: 'Artículos disponibles para tus ventas.' },
    { value: 'purchase', label: 'Para comprar', icon: 'pi pi-truck', detail: 'Artículos que adquieres a proveedores.' },
    { value: 'both', label: 'Compra y venta', icon: 'pi pi-arrows-h', detail: 'Ambos usos o indicados por columna.' },
];
const mode = ref('sale');
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const defaults = ref<Record<string, any>>({ dateUp: localToday(), active: true, copyDescription: true, salePrice: '0', purchasePrice: '0', productCategoryId: null, categoryId: null, familyId: null, uomId: null, uomIdPurchases: null, saleTaxId: null, purchaseTaxId: null });
const catalogs = ref<Catalogs>({ productCategories: [], categoryTypes: [], units: [], families: [], taxes: [] });
const workbook = shallowRef<WorkBook | null>(null);
const filename = ref('');
const sheetName = ref('');
const headerRow = ref(1);
const headers = ref<string[]>([]);
const sourceRows = shallowRef<SourceRow[]>([]);
const mapping = ref<Record<string, number>>({});
const equivalences = ref<Record<string, Record<string, any>>>({});
const batch = ref<ImportBatch | null>(null);
const history = ref<HistoryItem[]>([]);
const historyVisible = ref(false);
const historyBatch = ref(false);
const detailRow = ref<ReviewRow | null>(null);
const partial = ref(false);
const first = ref(0);
const resultFirst = ref(0);
const reviewFilter = ref('all');
const fields = productImportFields;
const pendingFamilyNames = computed(() => uniqueValues('familyId').filter(name => name && equivalences.value.familyId?.[name] === 'CREATE'));
const selectedFamilyNames = computed(() => [...new Set((batch.value?.rows ?? []).filter(r => r.decision === 'CREATE' && r.data.familyName).map(r => String(r.data.familyName)))]);
const mappingMissing = computed(() => {
    const required = defaults.value.copyDescription ? ['name'] : ['name', 'descriptionEn'];
    return required.filter(k => (mapping.value[k] ?? -1) < 0).map(k => fields.find(f => f.key === k)!.label);
});
const commonCatalogFields = computed(() => fields.filter(f => f.catalog));
const booleanOptions = [{ id: true, label: 'Sí' }, { id: false, label: 'No' }];
const stateOptions = [{ id: true, label: 'Activo' }, { id: false, label: 'Inactivo' }];
const reviewFilters = [
    { id: 'all', label: 'Todas las filas' }, { id: 'ready', label: 'Seleccionadas' },
    { id: 'errors', label: 'Con errores' }, { id: 'matches', label: 'Con coincidencias' },
    { id: 'skipped', label: 'Omitidas' },
];
function columnOptions(key: string) {
    return [{ id: -1, label: commonLabel(key) }, ...headers.value.map((h, i) => ({ id: i, label: `${i + 1}. ${h}` }))];
}
function decisionsFor(row: ReviewRow) {
    return row.review.issues.length || row.review.candidates.length
        ? [{ id: 'SKIP', label: 'Omitir' }]
        : [{ id: 'CREATE', label: 'Crear artículo' }, { id: 'SKIP', label: 'Omitir' }];
}
function commonOptions(f: ImportField) {
    const options = f.catalog ? catalogs.value[f.catalog] ?? [] : [];
    return f.key === 'categoryId' && defaults.value.productCategoryId ? options.filter(c => c.parentId === defaults.value.productCategoryId) : options;
}
watch(() => defaults.value.productCategoryId, () => {
    if (!catalogs.value.categoryTypes?.some(c => c.id === defaults.value.categoryId && c.parentId === defaults.value.productCategoryId)) defaults.value.categoryId = null;
});
const ignoredColumns = computed(() => headers.value.filter((_, i) => !Object.values(mapping.value).includes(i)));
const equivalenceFields = computed(() => fields.filter(f => (mapping.value[f.key] ?? -1) >= 0 && (f.catalog || ['sale', 'purchase', 'active'].includes(f.key))));
const rows = computed(() => batch.value?.rows ?? []);
const readyCount = computed(() => rows.value.filter(r => r.decision !== 'SKIP').length);
const createCount = computed(() => rows.value.filter(r => r.decision === 'CREATE').length);
const skippedCount = computed(() => rows.value.length - readyCount.value);
const issueCount = computed(() => rows.value.filter(r => r.review.issues.length).length);
const matchCount = computed(() => rows.value.filter(r => r.review.candidates.length).length);
const canConfirm = computed(() => readyCount.value > 0 && (partial.value || !rows.value.some(r => r.decision === 'SKIP' && (r.review.issues.length || r.review.candidates.length))) && rows.value.every(r => r.decision !== 'LINK' || r.target_id != null));
const filteredRows = computed(() => rows.value.filter(r => reviewFilter.value === 'all' || (reviewFilter.value === 'errors' && r.review.issues.length) || (reviewFilter.value === 'matches' && r.review.candidates.length) || (reviewFilter.value === 'skipped' && r.decision === 'SKIP') || (reviewFilter.value === 'ready' && r.decision !== 'SKIP')));
const pagedRows = computed(() => filteredRows.value.slice(first.value, first.value + 25));
const countState = (state: string) => rows.value.filter(r => r.state === state).length;
const processedCount = computed(() => rows.value.filter(r => ['CREATED', 'LINKED', 'FAILED', 'SKIPPED'].includes(r.state)).length);
const progress = computed(() => rows.value.length ? Math.round(processedCount.value / rows.value.length * 100) : 0);
const confirmedDefaults = computed(() => {
    const config = batch.value?.configuration ?? {};
    const common = (config.defaults ?? {}) as Record<string, unknown>;
    const mapped = (config.mapping ?? {}) as Record<string, number>;
    return fields.filter(f => (mapped[f.key] ?? -1) < 0 && common[f.key] != null && common[f.key] !== '').map(f => ({ label: f.label, value: f.catalog ? catalogs.value[f.catalog]?.find(c => c.id === Number(common[f.key]))?.label ?? common[f.key] : typeof common[f.key] === 'boolean' ? (common[f.key] ? 'Sí' : 'No') : common[f.key] }));
});
watch(reviewFilter, () => { first.value = 0; });
watch([mapping, canCreateFamilies], () => {
    for (const f of equivalenceFields.value) {
        if (!equivalences.value[f.key]) equivalences.value[f.key] = {};
        if (f.key !== 'familyId') continue;
        const suggestions = suggestFamilyEquivalences(uniqueValues(f.key), catalogs.value.families ?? [], canCreateFamilies.value);
        for (const [name, suggestion] of Object.entries(suggestions)) {
            if (!Object.hasOwn(equivalences.value.familyId!, name)) equivalences.value.familyId![name] = suggestion;
            if (!canCreateFamilies.value && equivalences.value.familyId![name] === 'CREATE') equivalences.value.familyId![name] = null;
        }
    }
}, { deep: true });

function explain(e: any) { return typeof e?.response?.data === 'string' ? e.response.data : e?.response?.data?.message || e?.message || 'No se pudo completar la operación.'; }
async function guard(action: () => Promise<void>) {
    if (busy.value) return;
    if (!canImport.value) {
        error.value = 'No tienes permiso para importar productos.';
        return;
    }
    busy.value = true; error.value = '';
    try { await action(); } catch (e) { error.value = explain(e); } finally { busy.value = false; }
}
function reset() {
    step.value = 1; error.value = ''; workbook.value = null; filename.value = ''; sheetName.value = ''; headerRow.value = 1;
    headers.value = []; sourceRows.value = []; mapping.value = {}; equivalences.value = {}; batch.value = null; partial.value = false; historyBatch.value = false; first.value = 0; resultFirst.value = 0;
}
async function open(suppliers = false) {
    if (!canImport.value) return;
    reset(); mode.value = suppliers ? 'purchase' : 'sale'; visible.value = true; catalogReady.value = false;
    await guard(async () => { catalogs.value = await productImportApi.catalogs(); catalogReady.value = true; });
}
defineExpose({ open });
function commonLabel(key: string) {
    if (key === 'code') return 'Generar código automáticamente';
    if (key === 'descriptionEn' && defaults.value.copyDescription) return 'Conservar la descripción original';
    return ['name', 'descriptionEn'].includes(key) ? 'Selecciona una columna obligatoria' : 'Valor común / no importar';
}
function currentDefaults(): Record<string, any> { return { ...defaults.value, sale: mode.value !== 'purchase', purchase: mode.value !== 'sale' }; }
function mappingExample(f: ImportField) {
    const index = mapping.value[f.key] ?? -1;
    if (index >= 0) return sourceRows.value.find(r => r.values[index])?.values[index] || '(vacío)';
    if (f.key === 'descriptionEn' && defaults.value.copyDescription) return 'Misma descripción del artículo, sin traducir';
    const val = currentDefaults()[f.key];
    if (f.catalog) return catalogs.value[f.catalog]?.find(c => c.id === val)?.label || 'Sin seleccionar';
    return typeof val === 'boolean' ? (val ? 'Sí' : 'No') : val || (f.key === 'code' ? 'Código único al guardar' : 'Sin valor');
}
function uniqueValues(key: string) { const index = mapping.value[key] ?? -1; return [...new Set(sourceRows.value.map(r => (r.values[index] ?? '').trim()))]; }
function optionsFor(f: ImportField): { id: any; label: string }[] {
    if (!f.catalog) return booleanOptions;
    const options = catalogs.value[f.catalog] ?? [];
    if (f.key === 'familyId') return [
        { id: 0, label: 'Sin familia' }, ...options,
        ...(canCreateFamilies.value ? [{ id: 'CREATE', label: 'Crear si no existe (código automático)' }] : []),
    ];
    return ['familyId', 'saleTaxId', 'purchaseTaxId'].includes(f.key)
        ? [{ id: 0, label: f.key === 'familyId' ? 'Sin familia' : 'Sin impuesto' }, ...options]
        : options;
}
async function template() { await guard(async () => { await downloadImportWorkbook('Plantilla_productos_KiwiKERP.xlsx', ['Descripción', 'Descripción en inglés', 'Código', 'Código de barras', 'Familia', 'Precio venta', 'Precio compra'], []); }); }
async function selectFile(event: Event) { const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = ''; if (file) await loadFile(file); }
async function dropFile(event: DragEvent) { const file = event.dataTransfer?.files[0]; if (file) await loadFile(file); }
async function loadFile(file: File) {
    await guard(async () => {
        workbook.value = null; sourceRows.value = []; headers.value = []; batch.value = null;
        if (!/\.xlsx?$/i.test(file.name)) throw new Error('Selecciona un archivo .xlsx o .xls.');
        if (file.size > 10 * 1024 * 1024) throw new Error('El archivo supera 10 MB. Divídelo en archivos más pequeños.');
        const XLSX = await import('xlsx');
        try { workbook.value = XLSX.read(await file.arrayBuffer(), { type: 'array', cellFormula: true, cellNF: true, cellText: true, cellDates: false }); }
        catch { throw new Error('No se puede leer este Excel. Comprueba que no esté protegido y vuelve a guardarlo como .xlsx.'); }
        filename.value = file.name; sheetName.value = workbook.value.SheetNames[0] ?? ''; headerRow.value = 1;
        await extractSheet();
    });
}
async function readSheet() { await guard(extractSheet); }
async function extractSheet() {
    sourceRows.value = []; headers.value = []; batch.value = null;
    const XLSX = await import('xlsx');
    const sheet = workbook.value?.Sheets[sheetName.value];
    if (!sheet || !sheet['!ref']) throw new Error('La hoja no contiene datos.');
    const range = XLSX.utils.decode_range(sheet['!ref']);
    if (!Number.isInteger(headerRow.value) || headerRow.value < 1 || headerRow.value > range.e.r + 1) throw new Error('Selecciona una fila de encabezados válida.');
    if (range.e.c - range.s.c > 199) throw new Error('La hoja tiene más de 200 columnas. Elimina las columnas vacías o que no necesites.');
    const h: string[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) h.push(XLSX.utils.format_cell(sheet[XLSX.utils.encode_cell({ r: headerRow.value - 1, c })] ?? {}).trim() || `Columna ${c + 1}`);
    const result: SourceRow[] = [];
    const occupiedRows = [...new Set(Object.keys(sheet).filter(key => /^[A-Z]+[1-9][0-9]*$/.test(key))
        .map(key => XLSX.utils.decode_cell(key).r).filter(r => r >= headerRow.value))].sort((a, b) => a - b);
    for (const r of occupiedRows) {
        const values: string[] = []; const issues: Record<number, string> = {}; const numbers: Record<number, number> = {}; let hasValue = false;
        for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = sheet[XLSX.utils.encode_cell({ r, c })];
            let value = cell ? XLSX.utils.format_cell(cell) : '';
            if (cell?.v != null || cell?.f) hasValue = true;
            if (cell?.f && cell.v == null) issues[c - range.s.c] = 'La fórmula no tiene resultado guardado. Pega su valor en Excel.';
            if (cell?.t === 'n') numbers[c - range.s.c] = Number(cell.v);
            if (cell?.t === 'e') issues[c - range.s.c] = 'La celda contiene un error de Excel.';
            if (cell?.t === 'n' && Number.isInteger(cell.v) && Math.abs(Number(cell.v)) >= 1e15) issues[c - range.s.c] = 'Número con posible pérdida de precisión. Guarda este dato como texto en el archivo original.';
            if (cell?.t === 'n' && XLSX.SSF.is_date(cell.z || '')) {
                const date = XLSX.SSF.parse_date_code(cell.v as number, { date1904: !!workbook.value?.Workbook?.WBProps?.date1904 });
                if (date && date.y >= 1900 && date.m && date.d) value = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
                else issues[c - range.s.c] = 'La fecha de Excel no es válida.';
            }
            values.push(value.trim());
        }
        if (!hasValue || values.every(v => !v) && !Object.keys(issues).length) continue;
        result.push({ row: r + 1, values, issues, numbers });
        if (result.length > 5000) throw new Error('Hay más de 5.000 filas de datos. Divide el archivo; no se ha importado ninguna fila.');
    }
    if (!result.length) throw new Error('No hay filas de datos debajo de los encabezados.');
    headers.value = h; sourceRows.value = result; mapping.value = suggestProductMapping(h); equivalences.value = {};
}
async function preview() {
    await guard(async () => {
        const selected = currentDefaults();
        const input = buildProductImportRows(sourceRows.value, mapping.value, selected, equivalences.value);
        batch.value = await productImportApi.preview({ filename: filename.value, sheet: sheetName.value, configuration: { defaults: selected, mapping: mapping.value, headers: headers.value, equivalences: equivalences.value }, rows: input });
        for (const r of batch.value.rows) r.decision = !r.review.issues.length && !r.review.candidates.length ? 'CREATE' : 'SKIP';
        step.value = 4; first.value = 0; partial.value = false;
    });
}
function back() { if (step.value === 4) batch.value = null; step.value--; }
async function execute() {
    await guard(async () => {
        if (!batch.value) return;
        if (batch.value.state === 'REVIEW') batch.value = await productImportApi.confirm(batch.value, partial.value);
        try {
            while (batch.value.state === 'RUNNING') {
                if (!canImport.value) throw new Error('Ya no tienes permiso para continuar esta importación.');
                batch.value = await productImportApi.next(batch.value.id);
            }
        } finally {
            emit('saved');
        }
    });
}
async function showHistory() { await guard(async () => { history.value = await productImportApi.history(); historyVisible.value = true; }); }
async function loadHistory(id: string) {
    await guard(async () => {
        batch.value = await productImportApi.detail(id); historyBatch.value = true; historyVisible.value = false; partial.value = false; first.value = 0; resultFirst.value = 0;
        if (batch.value.state === 'REVIEW') {
            for (const r of batch.value.rows) r.decision = !r.review.issues.length && !r.review.candidates.length ? 'CREATE' : 'SKIP';
            step.value = 4;
        } else step.value = 5;
    });
}
function stateLabel(state: string) { return ({ REVIEW: 'Pendiente de revisión', RUNNING: 'En curso', COMPLETED: 'Finalizada', CREATED: 'Creada', LINKED: 'Función añadida', FAILED: 'Error', SKIPPED: 'Omitida', PENDING: 'Pendiente' } as Record<string, string>)[state] ?? state; }
async function downloadResult(onlyIssues: boolean) {
    await guard(async () => {
        if (!batch.value) return;
        const selected = onlyIssues ? rows.value.filter(r => r.review.issues.length || r.review.candidates.length) : rows.value;
        await downloadImportWorkbook(onlyIssues ? 'Incidencias_artículos.xlsx' : 'Resultado_artículos.xlsx', ['Archivo', 'Hoja', 'Fila Excel', 'Código', 'Descripción', 'Código de barras', 'Estado', 'Decisión', 'Referencia KiwiKERP', 'Detalle'], selected.map(r => [batch.value!.filename, batch.value!.sheet_name, r.row_number, r.data.code, r.data.name, r.data.barcode, stateLabel(r.state), r.decision, r.entity_id ?? '', [...r.review.issues, ...r.review.candidates.map(c => `Coincidencia: ${c.code} · ${c.name}`), r.message].filter(Boolean).join(' | ')]));
    });
}
</script>

<style scoped>
.import-title { display: flex; align-items: center; gap: 14px; padding-right: 16px; }
.import-title h2 { margin: 0 0 4px; font-size: 1.2rem; color: #263342; }
.import-title p, .import-body p { color: #657184; line-height: 1.5; }
.import-title p { margin: 0; font-size: .9rem; }
.import-icon { display: grid; place-items: center; flex: 0 0 46px; height: 46px; border-radius: 12px; background: #eef5d9; color: #638008; font-size: 1.5rem; }
.import-body { padding: 0 3px 16px; min-height: 430px; }
.import-body h3 { margin: 16px 0 6px; font-size: 1.08rem; color: #293548; }
.import-body h4 { margin: 0 0 8px; }
.import-steps { list-style: none; display: flex; padding: 14px 0 20px; margin: 0; gap: 12px; }
.import-steps li { flex: 1; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #738093; font-size: .86rem; }
.import-steps li span { display: grid; place-items: center; width: 29px; height: 29px; border-radius: 50%; background: #edf0f4; flex: 0 0 auto; }
.import-steps .current { color: #405500; }
.import-steps .current span { background: #9cc10a; color: #253000; }
.import-steps .complete span { background: #e9f2cc; color: #4d6505; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.kind-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 18px 0; }
.kind-card { text-align: left; display: flex; flex-direction: column; gap: 9px; padding: 20px; background: #fff; border: 1px solid #dce2e8; border-radius: 12px; cursor: pointer; color: #354256; font: inherit; }
.kind-card i { color: #718b14; font-size: 1.4rem; }
.kind-card span { font-size: .87rem; line-height: 1.5; color: #657184; }
.kind-card.selected { border: 2px solid #9cc10a; padding: 19px; background: #fafdef; }
.import-panel { background: #f9fafb; border: 1px solid #e2e7ed; border-radius: 12px; padding: 16px 18px; margin: 16px 0; }
.import-panel h3 { margin-top: 0; }
.defaults-grid, .equivalence-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
label { font-size: .9rem; color: #37465a; }
.defaults-grid label, .default-field, .equivalence-grid label { display: flex; flex-direction: column; gap: 7px; font-weight: 600; min-width: 0; }
input:not([type='checkbox']):not([type='file']), select { width: 100%; min-height: 39px; border: 1px solid #cad2dd; border-radius: 7px; padding: 8px 10px; background: #fff; color: #293548; font: inherit; font-size: .88rem; }
input:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid #7b9c0a; outline-offset: 2px; }
.template-card { display: flex; align-items: center; gap: 15px; border: 1px solid #dfe8c7; border-radius: 12px; padding: 18px; margin: 18px 0; }
.template-card > i { font-size: 1.5rem; color: #7b960f; }
.template-card > div { flex: 1; }
.template-card p { margin: 5px 0 0; }
.upload-zone { display: flex; align-items: center; flex-direction: column; gap: 13px; border: 2px dashed #b9c88c; border-radius: 14px; background: #fcfef7; padding: 32px 20px; margin: 20px 0; text-align: center; cursor: pointer; }
.upload-zone > i { font-size: 2.5rem; color: #809f16; }
.upload-zone span { color: #657184; }
.upload-zone input { max-width: 100%; }
.sheet-options { margin-bottom: 20px; }
.table-scroll { overflow: auto; max-width: 100%; margin-top: 12px; border: 1px solid #e1e6ec; border-radius: 9px; }
table { width: 100%; border-collapse: collapse; font-size: .88rem; }
th, td { text-align: left; padding: 11px 13px; border-bottom: 1px solid #e8ecf1; vertical-align: top; overflow-wrap: anywhere; }
thead th { background: #f3f6f8; color: #536176; font-weight: 700; }
tbody tr:last-child td, tbody tr:last-child th { border-bottom: 0; }
td small { display: block; margin-top: 5px; color: #6b7788; }
td select + select { margin-top: 8px; }
.mapping-table td { width: 35%; }
.muted { font-size: .85rem; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin: 18px 0; }
.summary-grid > div { background: #f7faef; border: 1px solid #e0e8cc; padding: 17px; border-radius: 10px; }
.summary-grid strong { display: block; font-size: 1.7rem; color: #3d5107; }
.summary-grid span { color: #5d6a53; font-size: .85rem; }
.filter-label { display: flex; gap: 12px; align-items: center; }
.filter-label select { width: 230px; }
.issue-list { padding-left: 18px; color: #a72f32; font-size: .83rem; line-height: 1.5; }
.candidate { border-left: 3px solid #d9a540; padding: 5px 10px; margin-top: 9px; font-size: .83rem; }
.check-label { display: flex; align-items: center; gap: 10px; padding: 17px 0 0; line-height: 1.5; }
.import-footer { width: 100%; }
.import-footer-actions { display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 8px; padding-top: 16px; }
.import-primary { background: #9cc10a !important; border-color: #9cc10a !important; color: #253000 !important; }
.result-table { margin-top: 20px; }
@media (max-width: 750px) {
    .kind-grid, .defaults-grid, .equivalence-grid { grid-template-columns: 1fr; }
    .import-steps { gap: 4px; flex-wrap: wrap; }
    .import-steps li { font-size: .76rem; flex-basis: 28%; }
    .section-heading, .template-card { align-items: flex-start; flex-direction: column; }
    .import-title h2 { font-size: 1rem; }
    .mapping-table table, .mapping-table tbody, .mapping-table tr, .mapping-table th, .mapping-table td { display: block; width: 100%; }
    .mapping-table thead { display: none; }
    .mapping-table tr { border-bottom: 2px solid #e0e7d1; }
}
</style>

<style>
.product-import-dialog { max-height: 92dvh; }
.product-import-dialog .p-dialog-header { flex-shrink: 0; }
.kiwik-dialog.product-import-dialog .p-dialog-content { height: auto !important; overflow-y: auto !important; min-height: 0; }
.product-import-dialog .p-dialog-footer { flex-shrink: 0; }
</style>
