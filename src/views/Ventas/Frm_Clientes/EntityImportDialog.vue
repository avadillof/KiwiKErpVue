<template>
    <Dialog v-model:visible="visible" modal :closable="!busy" :closeOnEscape="!busy" class="kiwik-dialog entity-import-dialog"
        :style="{ width: '96vw', maxWidth: '1600px' }" :contentStyle="{ overflow: 'auto', minHeight: '0' }">
        <template #header>
            <div class="import-title">
                <span class="import-icon"><i class="pi pi-file-excel" /></span>
                <div><h2>Trae tus clientes y proveedores a KiwiKERP</h2><p>Desde tu Excel, paso a paso y con revisión antes de guardar.</p></div>
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
                <div class="section-heading"><div><h3>¿Qué datos quieres trasladar?</h3><p>Una misma entidad puede ser cliente y proveedor.</p></div><Button label="Ver historial" icon="pi pi-history" severity="secondary" :disabled="busy" @click="showHistory" /></div>
                <div class="kind-grid">
                    <button v-for="kind in kinds" :key="kind.value" type="button" :class="['kind-card', { selected: mode === kind.value }]" :aria-pressed="mode === kind.value" :disabled="busy" @click="mode = kind.value">
                        <i :class="kind.icon" /><strong>{{ kind.label }}</strong><span>{{ kind.detail }}</span>
                    </button>
                </div>
                <section class="import-panel">
                    <h3>Valores comunes del archivo</h3><p>Puedes elegirlos aquí para todas las filas o relacionarlos con columnas de tu Excel después.</p>
                    <div class="defaults-grid">
                        <label>Fecha de alta *<input v-model="defaults.dateUp" type="date" :disabled="busy" /></label>
                        <label>País (opcional)<input v-model="defaults.country" placeholder="Sin valor común" :disabled="busy" /></label>
                        <label>Estado<select v-model="defaults.active" :disabled="busy"><option :value="true">Activo</option><option :value="false">Inactivo</option></select></label>
                        <div v-if="mode !== 'suppliers'" class="default-field">
                            <label for="import-sales-term">Término de venta *</label>
                            <Select v-model="defaults.salesTermId" inputId="import-sales-term" :options="catalogs.salesTerms"
                                optionLabel="label" optionValue="id" placeholder="Elegir aquí o desde una columna"
                                filter showClear :disabled="busy" scrollHeight="250px" class="w-full"
                                emptyMessage="No hay términos de venta disponibles" emptyFilterMessage="No hay coincidencias" />
                        </div>
                        <div v-if="mode !== 'clients'" class="default-field">
                            <label for="import-purchase-term">Término de compra *</label>
                            <Select v-model="defaults.purchasesTermId" inputId="import-purchase-term" :options="catalogs.purchaseTerms"
                                optionLabel="label" optionValue="id" placeholder="Elegir aquí o desde una columna"
                                filter showClear :disabled="busy" scrollHeight="250px" class="w-full"
                                emptyMessage="No hay términos de compra disponibles" emptyFilterMessage="No hay coincidencias" />
                        </div>
                        <div v-if="mode !== 'clients'" class="default-field">
                            <label for="import-purchase-tariff">Tarifa de compra *</label>
                            <Select v-model="defaults.purchasesTarifaId" inputId="import-purchase-tariff" :options="catalogs.tariffs"
                                optionLabel="label" optionValue="id" placeholder="Elegir aquí o desde una columna"
                                filter showClear :disabled="busy" scrollHeight="250px" class="w-full"
                                emptyMessage="No hay tarifas disponibles" emptyFilterMessage="No hay coincidencias" />
                        </div>
                    </div>
                </section>
                <div class="template-card"><i class="pi pi-download" /><div><strong>Tu Excel también sirve</strong><p>No necesitas cambiar los nombres de tus columnas. O empieza con nuestra plantilla vacía.</p></div><Button label="Descargar plantilla" outlined :disabled="busy" @click="template" /></div>
                <Message severity="info" :closable="false">Identificaciones admitidas: NIF/CIF/NIE español y NIF-IVA francés. Las de otros países necesitan revisión en la ficha.</Message>
            </template>

            <template v-else-if="step === 2">
                <h3>Selecciona tu archivo</h3>
                <label class="upload-zone" @dragover.prevent @drop.prevent="dropFile">
                    <i class="pi pi-cloud-upload" /><strong>{{ filename || 'Arrastra tu Excel aquí o selecciona un archivo' }}</strong>
                    <span>.xlsx o .xls · hasta 10 MB y 5.000 filas · solo lectura de datos</span>
                    <input type="file" accept=".xlsx,.xls" :disabled="busy" aria-label="Seleccionar archivo Excel" @change="selectFile" />
                </label>
                <div v-if="workbook" class="defaults-grid sheet-options">
                    <label>Hoja<select v-model="sheetName" :disabled="busy" @change="readSheet"><option v-for="s in workbook.SheetNames" :key="s">{{ s }}</option></select></label>
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
                    <tr v-for="f in fields" :key="f.key"><th scope="row"><label :for="`map-${f.key}`">{{ f.label }}</label></th><td><select :id="`map-${f.key}`" v-model="mapping[f.key]" :disabled="busy"><option :value="-1">{{ commonLabel(f.key) }}</option><option v-for="(h, i) in headers" :key="i" :value="i">{{ i + 1 }}. {{ h }}</option></select></td><td>{{ mappingExample(f) }}</td></tr>
                </tbody></table></div>
                <p class="muted">Columnas ignoradas: {{ ignoredColumns.join(', ') || 'ninguna' }}.</p>
                <section v-for="f in equivalenceFields" :key="f.key" class="import-panel">
                    <h4>Equivalencias: {{ f.label }}</h4><p>Indica qué significa cada valor de esta columna, incluidos los vacíos.</p>
                    <div class="equivalence-grid"><label v-for="value in uniqueValues(f.key)" :key="value">{{ value || '(vacío)' }}
                        <select v-model="equivalences[f.key]![value]" :disabled="busy"><option :value="null">Seleccionar equivalencia</option><option v-for="c in optionsFor(f)" :key="String(c.id)" :value="c.id">{{ c.label }}</option></select>
                    </label></div>
                </section>
                <Message severity="info" :closable="false">Los códigos y códigos postales conservan el texto y los ceros disponibles en el archivo. Las fechas admiten dd/mm/aaaa o aaaa-mm-dd.</Message>
            </template>

            <template v-else-if="step === 4 && batch">
                <div class="section-heading"><div><h3>Revisa antes de importar</h3><p>No se ha creado ni modificado ninguna entidad.</p></div><Button label="Descargar incidencias" icon="pi pi-download" outlined :disabled="busy" @click="downloadResult(true)" /></div>
                <div class="summary-grid"><div><strong>{{ readyCount }}</strong><span>Seleccionadas</span></div><div><strong>{{ issueCount }}</strong><span>Con errores</span></div><div><strong>{{ matchCount }}</strong><span>Con coincidencias</span></div><div><strong>{{ skippedCount }}</strong><span>Omitidas</span></div></div>
                <label class="filter-label">Mostrar<select v-model="reviewFilter"><option value="all">Todas las filas</option><option value="ready">Seleccionadas</option><option value="errors">Con errores</option><option value="matches">Con coincidencias</option><option value="skipped">Omitidas</option></select></label>
                <div class="table-scroll"><table><thead><tr><th>Fila</th><th>Entidad</th><th>Identificación</th><th>Revisión / decisión</th><th>Detalle</th></tr></thead><tbody>
                    <tr v-for="r in pagedRows" :key="r.row_number"><td>{{ r.row_number }}</td><td><strong>{{ r.data.name }}</strong><small>{{ r.data.code || 'Código automático' }}</small></td><td>{{ r.data.cif }}</td><td>
                        <select v-model="r.decision" :aria-label="`Acción de la fila ${r.row_number}`" @change="r.target_id = null">
                            <option value="SKIP">Omitir</option><option v-if="!r.review.issues.length && !r.review.candidates.length" value="CREATE">Crear entidad</option><option v-if="!r.review.issues.length && r.review.candidates.some(c => c.canLink)" value="LINK">Añadir función a existente</option>
                        </select>
                        <select v-if="r.decision === 'LINK'" v-model="r.target_id" :aria-label="`Entidad a vincular en fila ${r.row_number}`"><option :value="null">Elegir entidad existente</option><option v-for="c in r.review.candidates.filter(c => c.canLink)" :key="c.id" :value="c.id">{{ c.code }} · {{ c.name }}</option></select>
                        <ul v-if="r.review.issues.length" class="issue-list"><li v-for="issue in r.review.issues" :key="issue">{{ issue }}</li></ul>
                        <div v-for="c in r.review.candidates" :key="c.id" class="candidate">{{ c.code }} · {{ c.name }} · {{ c.cif }}<small>{{ c.canLink ? 'Puede añadirse la función que falta.' : 'Requiere revisión en su ficha. No se sustituirán datos.' }}</small></div>
                    </td><td><Button icon="pi pi-search" text :aria-label="`Ver detalle de fila ${r.row_number}`" @click="detailRow = r" /></td></tr>
                </tbody></table></div>
                <Paginator v-if="filteredRows.length > 25" v-model:first="first" :rows="25" :totalRecords="filteredRows.length" />
                <label class="check-label"><input v-model="partial" type="checkbox" /> Importar solo las filas seleccionadas y omitir las demás ({{ skippedCount }}).</label>
            </template>

            <template v-else-if="step === 5 && batch">
                <template v-if="batch.state === 'REVIEW'">
                    <h3>Todo preparado para tu confirmación</h3><p>{{ batch.filename }} · Hoja {{ batch.sheet_name }}</p>
                    <div class="summary-grid"><div><strong>{{ createCount }}</strong><span>Nuevas entidades</span></div><div><strong>{{ linkCount }}</strong><span>Funciones añadidas</span></div><div><strong>{{ skippedCount }}</strong><span>Filas omitidas</span></div></div>
                    <Message severity="info" :closable="false">Solo al pulsar «Importar» se guardarán los datos. Las vinculaciones conservarán los datos y condiciones ya existentes.</Message>
                    <div class="table-scroll"><table><thead><tr><th>Valor común</th><th>Configuración confirmada</th></tr></thead><tbody><tr v-for="item in confirmedDefaults" :key="item.label"><td>{{ item.label }}</td><td>{{ item.value }}</td></tr></tbody></table></div>
                </template>
                <template v-else>
                    <h3>{{ batch.state === 'COMPLETED' ? 'Resultado de la importación' : 'Importación en curso' }}</h3>
                    <p>{{ batch.filename }} · {{ batch.sheet_name }}</p>
                    <ProgressBar :value="progress" />
                    <p role="status" aria-live="polite">{{ processedCount }} de {{ batch.rows.length }} filas procesadas.</p>
                    <div class="summary-grid"><div><strong>{{ countState('CREATED') }}</strong><span>Creadas</span></div><div><strong>{{ countState('LINKED') }}</strong><span>Funciones añadidas</span></div><div><strong>{{ countState('FAILED') }}</strong><span>Fallidas</span></div><div><strong>{{ countState('SKIPPED') }}</strong><span>Omitidas</span></div></div>
                    <Message v-if="countState('FAILED')" severity="warn" :closable="false">Hay filas que no se han podido guardar. Descarga el resultado, corrige las incidencias y vuelve a revisar esas filas en una nueva importación.</Message>
                    <Message v-if="batch.state === 'RUNNING' && !busy" severity="info" :closable="false">Puedes continuar esta ejecución desde aquí o desde el historial. Las filas ya guardadas no se repetirán.</Message>
                    <Button label="Descargar resultado" icon="pi pi-download" outlined :disabled="busy" @click="downloadResult(false)" />
                    <div class="table-scroll result-table"><table><thead><tr><th>Fila</th><th>Entidad</th><th>Resultado</th><th>Referencia</th></tr></thead><tbody><tr v-for="r in batch.rows.slice(resultFirst, resultFirst + 25)" :key="r.row_number"><td>{{ r.row_number }}</td><td>{{ r.data.name }}</td><td>{{ stateLabel(r.state) }}<small>{{ r.message }}</small></td><td>{{ r.entity_id || '—' }}</td></tr></tbody></table></div>
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
                <Button v-else-if="batch?.state === 'REVIEW'" :label="`Importar ${readyCount} entidades`" icon="pi pi-upload" class="import-primary" :loading="busy" :disabled="!canConfirm || busy" @click="execute" />
                <Button v-else-if="batch?.state === 'RUNNING'" label="Continuar importación" class="import-primary" :loading="busy" @click="execute" />
                <template v-else-if="batch?.state === 'COMPLETED'"><Button label="Nueva importación" outlined @click="reset" /><Button label="Ver entidades" class="import-primary" @click="visible = false; emit('saved')" /></template>
                </div>
            </div>
        </template>
    </Dialog>

    <Dialog v-model:visible="historyVisible" header="Tus importaciones de entidades" modal class="kiwik-dialog" :style="{ width: 'min(850px, 94vw)' }">
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
import type { WorkBook } from 'xlsx';
import { buildImportRows, downloadImportWorkbook, entityImportApi, importFields, suggestMapping } from '@/services/entityImport';
import type { Catalogs, HistoryItem, ImportBatch, ImportField, ReviewRow, SourceRow } from '@/services/entityImport';

const emit = defineEmits<{ saved: [] }>();
const security = useSecurityStore();
const canImport = computed(() => canImportMasterData(security, 'entities'));
const visible = ref(false);
const busy = ref(false);
const error = ref('');
const catalogReady = ref(false);
const step = ref(1);
const steps = ['Preparar', 'Cargar', 'Relacionar', 'Revisar', 'Importar'];
const kinds = [
    { value: 'clients', label: 'Clientes', icon: 'pi pi-users', detail: 'Las entidades a las que vendes.' },
    { value: 'suppliers', label: 'Proveedores', icon: 'pi pi-truck', detail: 'Las entidades a las que compras.' },
    { value: 'both', label: 'Clientes y proveedores', icon: 'pi pi-arrows-h', detail: 'Ambas funciones o indicadas por columna.' },
];
const mode = ref('clients');
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const defaults = ref<Record<string, any>>({ dateUp: localToday(), active: true, country: '', salesTermId: null, purchasesTermId: null, purchasesTarifaId: null });
const catalogs = ref<Catalogs>({ salesTerms: [], purchaseTerms: [], tariffs: [] });
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
const fields = importFields;
const mappingMissing = computed(() => ['name', 'cif'].filter(k => (mapping.value[k] ?? -1) < 0).map(k => fields.find(f => f.key === k)!.label));
const ignoredColumns = computed(() => headers.value.filter((_, i) => !Object.values(mapping.value).includes(i)));
const equivalenceFields = computed(() => fields.filter(f => (mapping.value[f.key] ?? -1) >= 0 && (f.catalog || ['isclient', 'isprove', 'active'].includes(f.key))));
const rows = computed(() => batch.value?.rows ?? []);
const readyCount = computed(() => rows.value.filter(r => r.decision !== 'SKIP').length);
const createCount = computed(() => rows.value.filter(r => r.decision === 'CREATE').length);
const linkCount = computed(() => rows.value.filter(r => r.decision === 'LINK').length);
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
watch(mapping, () => { for (const f of equivalenceFields.value) if (!equivalences.value[f.key]) equivalences.value[f.key] = {}; }, { deep: true });

function explain(e: any) { return typeof e?.response?.data === 'string' ? e.response.data : e?.response?.data?.message || e?.message || 'No se pudo completar la operación.'; }
async function guard(action: () => Promise<void>) {
    if (busy.value) return;
    if (!canImport.value) {
        error.value = 'No tienes permiso para importar entidades.';
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
    reset(); mode.value = suppliers ? 'suppliers' : 'clients'; visible.value = true; catalogReady.value = false;
    await guard(async () => { catalogs.value = await entityImportApi.catalogs(); catalogReady.value = true; });
}
defineExpose({ open });
function commonLabel(key: string) { return key === 'code' ? 'Generar código automáticamente' : ['name', 'cif'].includes(key) ? 'Selecciona una columna obligatoria' : 'Valor común / no importar'; }
function currentDefaults(): Record<string, any> { return { ...defaults.value, isclient: mode.value !== 'suppliers', isprove: mode.value !== 'clients' }; }
function mappingExample(f: ImportField) {
    const index = mapping.value[f.key] ?? -1;
    if (index >= 0) return sourceRows.value.find(r => r.values[index])?.values[index] || '(vacío)';
    const val = currentDefaults()[f.key];
    if (f.catalog) return catalogs.value[f.catalog]?.find(c => c.id === val)?.label || 'Sin seleccionar';
    return typeof val === 'boolean' ? (val ? 'Sí' : 'No') : val || (f.key === 'code' ? 'Código único al guardar' : 'Sin valor');
}
function uniqueValues(key: string) { const index = mapping.value[key] ?? -1; return [...new Set(sourceRows.value.map(r => (r.values[index] ?? '').trim()))]; }
function optionsFor(f: ImportField): { id: any; label: string }[] { return f.catalog ? catalogs.value[f.catalog] ?? [] : [{ id: true, label: 'Sí' }, { id: false, label: 'No' }]; }
async function template() { await guard(async () => { await downloadImportWorkbook('Plantilla_entidades_KiwiKERP.xlsx', ['Nombre', 'NIF', 'Código', 'Dirección', 'CP', 'Población', 'Provincia', 'País', 'Teléfono', 'Email', 'Web'], []); }); }
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
        const values: string[] = []; const issues: Record<number, string> = {}; let hasValue = false;
        for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = sheet[XLSX.utils.encode_cell({ r, c })];
            let value = cell ? XLSX.utils.format_cell(cell) : '';
            if (cell?.v != null || cell?.f) hasValue = true;
            if (cell?.f && cell.v == null) issues[c - range.s.c] = 'La fórmula no tiene resultado guardado. Pega su valor en Excel.';
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
        result.push({ row: r + 1, values, issues });
        if (result.length > 5000) throw new Error('Hay más de 5.000 filas de datos. Divide el archivo; no se ha importado ninguna fila.');
    }
    if (!result.length) throw new Error('No hay filas de datos debajo de los encabezados.');
    headers.value = h; sourceRows.value = result; mapping.value = suggestMapping(h); equivalences.value = {};
}
async function preview() {
    await guard(async () => {
        const selected = currentDefaults();
        const input = buildImportRows(sourceRows.value, mapping.value, selected, equivalences.value);
        batch.value = await entityImportApi.preview({ filename: filename.value, sheet: sheetName.value, configuration: { defaults: selected, mapping: mapping.value, headers: headers.value, equivalences: equivalences.value }, rows: input });
        for (const r of batch.value.rows) r.decision = !r.review.issues.length && !r.review.candidates.length ? 'CREATE' : 'SKIP';
        step.value = 4; first.value = 0; partial.value = false;
    });
}
function back() { if (step.value === 4) batch.value = null; step.value--; }
async function execute() {
    await guard(async () => {
        if (!batch.value) return;
        if (batch.value.state === 'REVIEW') batch.value = await entityImportApi.confirm(batch.value, partial.value);
        while (batch.value.state === 'RUNNING') {
            if (!canImport.value) throw new Error('Ya no tienes permiso para continuar esta importación.');
            batch.value = await entityImportApi.next(batch.value.id);
            emit('saved');
        }
    });
}
async function showHistory() { await guard(async () => { history.value = await entityImportApi.history(); historyVisible.value = true; }); }
async function loadHistory(id: string) {
    await guard(async () => {
        batch.value = await entityImportApi.detail(id); historyBatch.value = true; historyVisible.value = false; partial.value = false; first.value = 0; resultFirst.value = 0;
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
        await downloadImportWorkbook(onlyIssues ? 'Incidencias_entidades.xlsx' : 'Resultado_entidades.xlsx', ['Archivo', 'Hoja', 'Fila Excel', 'Código', 'Nombre', 'Identificación fiscal', 'Estado', 'Decisión', 'Referencia KiwiKERP', 'Detalle'], selected.map(r => [batch.value!.filename, batch.value!.sheet_name, r.row_number, r.data.code, r.data.name, r.data.cif, stateLabel(r.state), r.decision, r.entity_id ?? '', [...r.review.issues, ...r.review.candidates.map(c => `Coincidencia: ${c.code} · ${c.name}`), r.message].filter(Boolean).join(' | ')]));
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
.defaults-grid label, .defaults-grid .default-field, .equivalence-grid label { display: flex; flex-direction: column; gap: 7px; font-weight: 600; min-width: 0; }
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
.entity-import-dialog { max-height: 92dvh; }
.entity-import-dialog .p-dialog-header { flex-shrink: 0; }
.kiwik-dialog.entity-import-dialog .p-dialog-content { height: auto !important; overflow-y: auto !important; min-height: 0; }
.entity-import-dialog .p-dialog-footer { flex-shrink: 0; }
</style>
