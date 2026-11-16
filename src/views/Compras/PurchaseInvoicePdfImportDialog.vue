<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="dialogTitle"
    :style="{ width: 'min(1050px, 96vw)' }"
    class="kiwik-dialog"
    :closable="!analyzing"
  >
    <Message severity="info" :closable="false">
      La IA prepara una propuesta, pero no guarda ni registra el {{ documentLabel }}. El contenido del PDF —texto o páginas escaneadas— se enviará al proveedor de IA configurado; revisa todos los datos antes de crear el borrador.
    </Message>
    <Message v-if="statusLoading" severity="secondary" :closable="false">Comprobando la configuración de inteligencia artificial…</Message>
    <Message v-else-if="!aiReady" severity="warn" :closable="false">
      La importación no está disponible. Un administrador debe activar la IA y guardar una clave válida en Ajustes → Inteligencia artificial.
    </Message>
    <Message v-else severity="success" :closable="false">
      IA preparada · {{ aiStatus.provider === 'groq' ? 'Groq' : 'OpenAI' }} · {{ aiStatus.model }}
    </Message>

    <div class="pdf-picker">
      <input ref="fileInput" type="file" accept="application/pdf,.pdf" hidden @change="selectFile" />
      <Button label="Seleccionar PDF" icon="pi pi-file-pdf" outlined :disabled="analyzing" @click="fileInput?.click()" />
      <div v-if="file" class="selected-file">
        <i class="pi pi-file-pdf" />
        <span><b>{{ file.name }}</b><small>{{ fileSize(file.size) }}</small></span>
      </div>
      <Button label="Analizar con IA" icon="pi pi-sparkles" :loading="analyzing" :disabled="!file || !aiReady || statusLoading" @click="analyze" />
    </div>

    <ProgressBar v-if="analyzing" mode="indeterminate" class="analysis-progress" />
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-if="result" class="analysis-result">
      <div class="result-heading">
        <div>
          <b>Propuesta extraída</b>
          <small>
            Proveedor: {{ result.provider }} · Confianza: {{ confidenceLabel }}
            <template v-if="result.visionUsed"> · Lectura visual de PDF escaneado</template>
          </small>
        </div>
        <Tag :value="confidenceLabel" :severity="confidenceSeverity" rounded />
      </div>

      <div class="invoice-summary">
        <div><small>Proveedor</small><b>{{ result.supplierName || 'No identificado' }}</b><span>{{ result.supplierTaxId || 'Sin NIF' }}</span></div>
        <div><small>Coincidencia KiwiKERP</small><b>{{ result.supplierMatch?.name || 'Pendiente de seleccionar' }}</b><span>{{ result.supplierMatch?.code || '—' }}</span></div>
        <div><small>{{ supplierNumberLabel }}</small><b>{{ supplierDocumentNumber || 'No identificado' }}</b></div>
        <div><small>Fecha</small><b>{{ humanDate(documentDate) }}</b></div>
        <div><small>Total extraído</small><b>{{ money(result.grossTotal) }} {{ result.currencyCode || 'EUR' }}</b></div>
      </div>

      <Message v-for="warning in result.warnings || []" :key="warning" severity="warn" :closable="false">{{ warning }}</Message>

      <DataTable :value="result.lines || []" size="small" stripedRows scrollable scrollHeight="260px" class="result-lines">
        <Column header="Producto"><template #body="{ data }"><b>{{ data.productMatch?.code || data.productCode || 'Sin asociar' }}</b><small>{{ data.productMatch?.description || data.description }}</small></template></Column>
        <Column field="quantity" header="Cantidad" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ quantity(data.quantity) }}</template></Column>
        <Column field="unitPrice" header="Precio" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ money(data.unitPrice) }}</template></Column>
        <Column field="taxPercent" header="IVA" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ quantity(data.taxPercent) }} %</template></Column>
        <Column header="Neto" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ money(Number(data.quantity || 0) * Number(data.unitPrice || 0)) }}</template></Column>
        <template #empty><div class="empty-result">La IA no ha identificado líneas. Puedes añadirlas durante la revisión.</div></template>
      </DataTable>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="kiwik-separator dialog-footer-separator" />
        <div class="dialog-actions">
          <Button label="Cerrar" severity="secondary" text :disabled="analyzing" @click="visible = false" />
          <Button v-if="result" :label="reviewLabel" icon="pi pi-arrow-right" @click="review" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import { backendUrl } from '@/services/backendUrl';

const emit = defineEmits<{ review: [result: any, file: File] }>();
const props = withDefaults(defineProps<{ mode?: 'invoice' | 'delivery' }>(), { mode: 'invoice' });
const visible = ref(false);
const analyzing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const result = ref<any>(null);
const error = ref('');
const statusLoading = ref(false);
const aiStatus = ref<any>({});
const aiReady = computed(() => Boolean(aiStatus.value?.ready));
const isDelivery = computed(() => props.mode === 'delivery');
const dialogTitle = computed(() => isDelivery.value ? 'Importar albarán PDF con IA' : 'Importar factura PDF con IA');
const documentLabel = computed(() => isDelivery.value ? 'albarán' : 'factura');
const supplierNumberLabel = computed(() => isDelivery.value ? 'Nº albarán proveedor' : 'Nº factura proveedor');
const supplierDocumentNumber = computed(() => isDelivery.value ? result.value?.supplierDeliveryNumber : result.value?.supplierInvoiceNumber);
const documentDate = computed(() => isDelivery.value ? result.value?.deliveryDate : result.value?.invoiceDate);
const reviewLabel = computed(() => `Revisar y completar ${documentLabel.value}`);
const statusEndpoint = computed(() => isDelivery.value ? '/WebPurchaseDeliveryPdfImportStatus' : '/WebPurchaseInvoicePdfImportStatus');
const analyzeEndpoint = computed(() => isDelivery.value ? '/WebAnalyzePurchaseDeliveryPdf' : '/WebAnalyzePurchaseInvoicePdf');

const confidence = computed(() => Math.round(Math.max(0, Math.min(1, Number(result.value?.confidence || 0))) * 100));
const confidenceLabel = computed(() => `${confidence.value}% de confianza`);
const confidenceSeverity = computed(() => confidence.value >= 80 ? 'success' : confidence.value >= 55 ? 'warn' : 'danger');

const open = async () => {
  file.value = null;
  result.value = null;
  error.value = '';
  if (fileInput.value) fileInput.value.value = '';
  visible.value = true;
  statusLoading.value = true;
  try {
    const { data } = await axios.get(backendUrl(statusEndpoint.value));
    aiStatus.value = data || {};
  } catch {
    aiStatus.value = {};
    error.value = 'No se pudo comprobar la configuración de inteligencia artificial.';
  } finally {
    statusLoading.value = false;
  }
};
const selectFile = (event: Event) => {
  file.value = (event.target as HTMLInputElement).files?.[0] || null;
  result.value = null;
  error.value = '';
};
const analyze = async () => {
  if (!file.value || analyzing.value) return;
  analyzing.value = true;
  error.value = '';
  result.value = null;
  const body = new FormData();
  body.append('file', file.value);
  try {
    const response = await axios.post(backendUrl(analyzeEndpoint.value), body);
    result.value = response.data;
  } catch (failure: any) {
    const response = failure.response?.data;
    error.value = typeof response === 'string'
      ? response
      : response?.message || response?.detail || response?.error
        || 'No se pudo analizar el PDF. Revisa la configuración de IA e inténtalo de nuevo.';
  } finally {
    analyzing.value = false;
  }
};
const review = () => {
  if (!result.value || !file.value) return;
  emit('review', result.value, file.value);
  visible.value = false;
};
const fileSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const humanDate = (value: string) => value ? value.split('-').reverse().join('/') : 'No identificada';
const money = (value: any) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
const quantity = (value: any) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 3 }).format(Number(value) || 0);

defineExpose({ open });
</script>

<style scoped>
.pdf-picker{display:flex;align-items:center;gap:.75rem;margin:1rem 0;flex-wrap:wrap}.selected-file{display:flex;align-items:center;gap:.65rem;flex:1;min-width:240px;padding:.65rem .8rem;border:1px solid #dfe5d0;border-radius:8px;background:#fbfcf7}.selected-file>i{font-size:1.5rem;color:#b42318}.selected-file span{display:flex;flex-direction:column;min-width:0}.selected-file b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.selected-file small,.result-heading small,.result-lines small{display:block;color:#768091}.analysis-progress{height:5px;margin:.75rem 0}.analysis-result{display:flex;flex-direction:column;gap:.75rem}.result-heading{display:flex;align-items:center;justify-content:space-between}.result-heading>div{display:flex;flex-direction:column;gap:.2rem}.invoice-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.65rem}.invoice-summary>div{display:flex;flex-direction:column;gap:.2rem;padding:.65rem;background:#f8faf4;border:1px solid #e1e7d2;border-radius:8px}.invoice-summary small{color:#75806a}.invoice-summary span{font-size:.82rem;color:#778090}.result-lines{border:1px solid #e3e7dc;border-radius:8px}.empty-result{text-align:center;color:#7c8491;padding:1.5rem}.dialog-footer,.dialog-actions{width:100%}.dialog-footer-separator{margin-bottom:.75rem}.dialog-actions{display:flex;justify-content:flex-end;gap:.5rem}@media(max-width:850px){.invoice-summary{grid-template-columns:1fr 1fr}}
</style>
