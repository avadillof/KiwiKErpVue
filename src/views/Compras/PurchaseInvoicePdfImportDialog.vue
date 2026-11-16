<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="dialogTitle"
    :style="{ width: 'min(1380px, 98vw)' }"
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
        <div>
          <small>Coincidencia KiwiKERP</small>
          <b>{{ result.supplierMatch?.name || 'Pendiente de seleccionar' }}</b>
          <span>{{ result.supplierMatch?.code || '—' }}</span>
          <Button
            v-if="!result.supplierMatch && securityStore.hasPermission(PERM.ENTI_GEN_DOCS)"
            label="Crear proveedor"
            icon="pi pi-building"
            size="small"
            text
            @click="createSupplierFromDocument"
          />
        </div>
        <div><small>{{ supplierNumberLabel }}</small><b>{{ supplierDocumentNumber || 'No identificado' }}</b></div>
        <div><small>Fecha</small><b>{{ humanDate(documentDate) }}</b></div>
        <div><small>Total extraído</small><b>{{ money(result.grossTotal) }} {{ result.currencyCode || 'EUR' }}</b></div>
      </div>

      <Message v-for="warning in result.warnings || []" :key="warning" severity="warn" :closable="false">{{ warning }}</Message>

      <DataTable
        v-model:selection="selectedComparisonLines"
        :value="result.lines || []"
        dataKey="comparisonKey"
        size="small"
        stripedRows
        scrollable
        scrollHeight="260px"
        class="result-lines"
      >
        <Column v-if="!isDelivery" selectionMode="multiple" headerStyle="width:3rem" />
        <Column header="Producto">
          <template #body="{ data }">
            <b>{{ data.productMatch?.code || data.productCode || 'Sin asociar' }}</b>
            <small>{{ data.productMatch?.description || data.description }}</small>
            <Button
              v-if="!data.productMatch && securityStore.hasPermission(PERM.PROD_DOCS)"
              label="Crear producto"
              icon="pi pi-box"
              size="small"
              text
              @click="createProductFromLine(data)"
            />
          </template>
        </Column>
        <Column field="quantity" header="Cantidad" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ quantity(data.quantity) }}</template></Column>
        <Column field="unitPrice" header="Precio" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ money(data.unitPrice) }}</template></Column>
        <Column field="taxPercent" header="IVA" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ quantity(data.taxPercent) }} %</template></Column>
        <Column header="Neto" bodyStyle="text-align:right" headerStyle="text-align:right"><template #body="{ data }">{{ money(Number(data.quantity || 0) * Number(data.unitPrice || 0)) }}</template></Column>
        <Column v-if="!isDelivery" header="Histórico KiwiKERP" bodyStyle="min-width:175px">
          <template #body="{ data }">
            <div v-if="data.bestHistoricalPrice" class="history-price">
              <b>{{ money(data.bestHistoricalPrice) }} {{ result.currencyCode || 'EUR' }}</b>
              <Tag v-if="Number(data.historicalSavingPercent) > 0" :value="`${money(data.historicalSavingPercent)} % menos`" severity="success" rounded />
              <small>
                {{ bestHistoricalOffer(data)?.supplierName || 'Compra anterior' }}
                · {{ (data.historicalOffers || []).length }} proveedor(es) en el histórico
              </small>
            </div>
            <small v-else>Sin compras anteriores comparables</small>
          </template>
        </Column>
        <template #empty><div class="empty-result">La IA no ha identificado líneas. Puedes añadirlas durante la revisión.</div></template>
      </DataTable>

      <div v-if="!isDelivery" class="comparison-panel">
        <div>
          <b>Comparación de precios</b>
          <small>El histórico de KiwiKERP es gratuito. La búsqueda en Internet sólo analizará las líneas marcadas.</small>
        </div>
        <Button
          label="Buscar alternativas en Internet"
          icon="pi pi-globe"
          outlined
          :badge="selectedComparisonLines.length ? String(selectedComparisonLines.length) : undefined"
          :disabled="!selectedComparisonLines.length || searchingAlternatives"
          @click="confirmSearchVisible = true"
        />
      </div>
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

  <Dialog v-model:visible="confirmSearchVisible" modal header="Confirmar búsqueda externa" :style="{ width: 'min(610px, 94vw)' }" class="kiwik-dialog">
    <Message severity="warn" :closable="false">
      Se enviarán a OpenAI los datos de {{ selectedComparisonLines.length }} producto(s) y se consultarán fuentes públicas en Internet.
    </Message>
    <template #footer>
      <div class="dialog-footer">
        <div class="kiwik-separator dialog-footer-separator" />
        <div class="dialog-actions">
          <Button label="Cancelar" severity="secondary" text @click="confirmSearchVisible = false" />
          <Button label="Buscar alternativas" icon="pi pi-globe" @click="searchAlternatives" />
        </div>
      </div>
    </template>
  </Dialog>

  <Dialog v-model:visible="comparisonVisible" modal header="Alternativas de compra encontradas" :style="{ width: 'min(1520px, 98vw)' }" class="kiwik-dialog">
    <ProgressBar v-if="searchingAlternatives" mode="indeterminate" class="analysis-progress" />
    <Message v-if="comparisonError" severity="error" :closable="false">{{ comparisonError }}</Message>
    <template v-if="comparisonResult && !searchingAlternatives">
      <Message severity="info" :closable="false">
        Resultado orientativo · {{ comparisonResult.cached ? 'recuperado de la caché de 24 horas' : 'búsqueda nueva' }}. Verifica siempre la oferta antes de comprar.
      </Message>
      <div v-for="comparison in comparisonResult.comparisons || []" :key="comparison.lineKey" class="comparison-group">
        <div class="comparison-title">
          <b>{{ comparison.productCode || 'Producto' }} · {{ comparison.description }}</b>
          <small v-if="!(comparison.offers || []).length">No se localizaron ofertas suficientemente fiables.</small>
        </div>
        <DataTable v-if="(comparison.offers || []).length" :value="comparison.offers" size="small" stripedRows scrollable>
          <Column header="Proveedor" style="min-width:150px">
            <template #body="{ data }">
              <b>{{ data.supplierName }}</b>
              <small>{{ data.supplierTaxId || 'NIF/CIF no verificado' }}</small>
            </template>
          </Column>
          <Column header="Precio unidad" bodyStyle="text-align:right" headerStyle="text-align:right">
            <template #body="{ data }">
              <b>{{ money(data.comparableUnitPrice ?? data.unitPrice) }} {{ data.currency || 'EUR' }}</b>
              <small v-if="data.vatIncluded && Number(data.comparableUnitPrice) !== Number(data.unitPrice)">
                {{ money(data.unitPrice) }} con IVA
              </small>
              <small v-else>Sin IVA</small>
            </template>
          </Column>
          <Column header="Ahorro" bodyStyle="text-align:right" headerStyle="text-align:right">
            <template #body="{ data }">
              <Tag :value="savingLabel(data.savingPercent)" :severity="Number(data.savingPercent) > 0 ? 'success' : Number(data.savingPercent) < 0 ? 'danger' : 'secondary'" rounded />
            </template>
          </Column>
          <Column header="Formato / mínimo"><template #body="{ data }">{{ quantity(data.packageQuantity) }} ud. / {{ quantity(data.minimumOrder) }} ud.</template></Column>
          <Column header="Portes"><template #body="{ data }">{{ money(data.shippingCost) }} {{ data.currency || 'EUR' }}</template></Column>
          <Column header="IVA"><template #body="{ data }">{{ data.vatIncluded ? 'Incluido' : 'No incluido' }}</template></Column>
          <Column field="availability" header="Disponibilidad" />
          <Column header="Confianza"><template #body="{ data }">{{ Math.round(Number(data.confidence || 0) * 100) }} %</template></Column>
          <Column header="Fuente"><template #body="{ data }"><a v-if="data.sourceUrl" :href="data.sourceUrl" target="_blank" rel="noopener noreferrer">{{ data.sourceTitle || 'Abrir oferta' }}</a><span v-else>Sin enlace verificable</span></template></Column>
          <Column header="Acciones" style="min-width:260px">
            <template #body="{ data }">
              <div class="offer-actions">
                <Button v-if="securityStore.hasPermission(PERM.ENTI_GEN_DOCS)" label="Proveedor" icon="pi pi-building" size="small" text @click="createSupplier(data)" />
                <Button v-if="securityStore.hasPermission(PERM.PROD_DOCS)" label="Producto" icon="pi pi-box" size="small" text @click="createProduct(comparison, data)" />
                <Button label="Vincular" icon="pi pi-link" size="small" outlined @click="openLinkAlternative(comparison, data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
      <Message v-for="warning in comparisonResult.warnings || []" :key="warning" severity="warn" :closable="false">{{ warning }}</Message>
      <small class="comparison-disclaimer">{{ comparisonResult.disclaimer }}</small>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <div class="kiwik-separator dialog-footer-separator" />
        <div class="dialog-actions"><Button label="Cerrar" severity="secondary" text :disabled="searchingAlternatives" @click="comparisonVisible = false" /></div>
      </div>
    </template>
  </Dialog>

  <Dialog v-model:visible="linkVisible" modal header="Vincular proveedor alternativo" :style="{ width: 'min(620px, 94vw)' }" class="kiwik-dialog">
    <Message severity="info" :closable="false">
      Se guardará esta oferta en el producto existente. Si ya estaba vinculado al proveedor, se actualizarán el precio y la procedencia.
    </Message>
    <div class="link-alternative-form">
      <div><small>Producto KiwiKERP</small><b>{{ pendingProductLabel }}</b></div>
      <div><small>Oferta encontrada</small><b>{{ pendingAlternative?.offer?.productName || 'Sin descripción' }}</b></div>
      <SupplierLookup
        v-model="linkSupplierId"
        :label="linkSupplierLabel"
        :disabled="linkingAlternative"
        @selected="selectLinkSupplier"
        @cleared="clearLinkSupplier"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div class="kiwik-separator dialog-footer-separator" />
        <div class="dialog-actions">
          <Button label="Cancelar" severity="secondary" text :disabled="linkingAlternative" @click="linkVisible = false" />
          <Button label="Vincular alternativa" icon="pi pi-link" :loading="linkingAlternative" :disabled="!linkSupplierId" @click="linkAlternative" />
        </div>
      </div>
    </template>
  </Dialog>

  <Frm_ClientForm ref="clientFormRef" />
  <Frm_Product ref="productFormRef" />
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
import { useToast } from 'primevue/usetoast';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';
import SupplierLookup from '@/components/shared/SupplierLookup.vue';
import Frm_ClientForm from '@/views/Ventas/Frm_Clientes/Frm_ClientForm.vue';
import Frm_Product from '@/views/Frm_Products/Frm_Product.vue';

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
const selectedComparisonLines = ref<any[]>([]);
const confirmSearchVisible = ref(false);
const comparisonVisible = ref(false);
const searchingAlternatives = ref(false);
const comparisonResult = ref<any>(null);
const comparisonError = ref('');
const toast = useToast();
const securityStore = useSecurityStore();
const clientFormRef = ref<any>(null);
const productFormRef = ref<any>(null);
const linkVisible = ref(false);
const linkingAlternative = ref(false);
const linkSupplierId = ref<number | null>(null);
const linkSupplier = ref<any>(null);
const pendingAlternative = ref<any>(null);
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
const linkSupplierLabel = computed(() => linkSupplier.value ? `${linkSupplier.value.code ? `${linkSupplier.value.code} — ` : ''}${linkSupplier.value.name}` : 'Seleccionar proveedor');
const pendingProductLabel = computed(() => {
  const line = findOriginalLine(pendingAlternative.value?.comparison?.lineKey);
  return line?.productMatch ? `${line.productMatch.code} — ${line.productMatch.description}` : 'Producto no asociado';
});

const open = async () => {
  file.value = null;
  result.value = null;
  resetComparison();
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
  resetComparison();
  error.value = '';
};
const analyze = async () => {
  if (!file.value || analyzing.value) return;
  analyzing.value = true;
  error.value = '';
  result.value = null;
  resetComparison();
  const body = new FormData();
  body.append('file', file.value);
  try {
    const response = await axios.post(backendUrl(analyzeEndpoint.value), body);
    const extracted = response.data || {};
    extracted.lines = (extracted.lines || []).map((line: any, index: number) => ({ ...line, comparisonKey: `line-${index}` }));
    result.value = extracted;
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
const resetComparison = () => {
  selectedComparisonLines.value = [];
  confirmSearchVisible.value = false;
  comparisonVisible.value = false;
  searchingAlternatives.value = false;
  comparisonResult.value = null;
  comparisonError.value = '';
  linkVisible.value = false;
  linkingAlternative.value = false;
  linkSupplierId.value = null;
  linkSupplier.value = null;
  pendingAlternative.value = null;
};
const searchAlternatives = async () => {
  if (!selectedComparisonLines.value.length || searchingAlternatives.value) return;
  confirmSearchVisible.value = false;
  comparisonVisible.value = true;
  searchingAlternatives.value = true;
  comparisonError.value = '';
  comparisonResult.value = null;
  try {
    const lines = selectedComparisonLines.value.map((line: any) => ({
      lineKey: line.comparisonKey,
      productId: line.productMatch?.pkid || line.productMatch?.id || 0,
      productCode: line.productMatch?.code || line.productCode || '',
      description: line.productMatch?.description || line.description || '',
      currentUnitPrice: Number(line.unitPrice || 0),
      currentTaxPercent: Number(line.taxPercent || 0),
      currentSupplier: result.value?.supplierMatch?.name || result.value?.supplierName || '',
    }));
    const { data } = await axios.post(backendUrl('/WebSearchPurchasePriceAlternatives'), { lines });
    comparisonResult.value = data;
  } catch (failure: any) {
    const response = failure.response?.data;
    comparisonError.value = typeof response === 'string'
      ? response
      : response?.message || response?.detail || response?.error || 'No se pudo completar la búsqueda externa.';
  } finally {
    searchingAlternatives.value = false;
  }
};
const findOriginalLine = (lineKey: string) => (result.value?.lines || []).find((line: any) => line.comparisonKey === lineKey);
const createSupplier = (offer: any) => {
  clientFormRef.value?.open(undefined, {
    name: offer.supplierName || '',
    cif: offer.supplierTaxId || '',
    web: offer.supplierWebsite || offer.sourceUrl || '',
    email: offer.supplierEmail || '',
    phone: offer.supplierPhone || '',
    isprove: true,
    isclient: false,
    active: true,
  });
};
const createSupplierFromDocument = () => {
  clientFormRef.value?.open(undefined, {
    name: result.value?.supplierName || '',
    cif: result.value?.supplierTaxId || '',
    isprove: true,
    isclient: false,
    active: true,
  });
};
const createProductFromLine = (line: any) => {
  const description = line.description || line.productCode || '';
  productFormRef.value?.open(undefined, {
    code: line.productCode || '',
    description,
    descriptionEn: description,
    purchase: true,
    sale: false,
    purchasePrice: Number(line.unitPrice || 0),
    purchasesDescription: `Producto propuesto desde la importación IA de ${result.value?.sourceFileName || 'un PDF de compra'}.`,
  });
};
const createProduct = (comparison: any, offer: any) => {
  const description = offer.productName || comparison.description || '';
  productFormRef.value?.open(undefined, {
    description,
    descriptionEn: description,
    purchase: true,
    sale: false,
    purchasePrice: Number(offer.comparableUnitPrice ?? offer.unitPrice ?? 0),
    purchasesDescription: `Oferta localizada mediante IA. Fuente: ${offer.sourceUrl || 'sin enlace'}`,
  });
};
const openLinkAlternative = (comparison: any, offer: any) => {
  const original = findOriginalLine(comparison.lineKey);
  if (!original?.productMatch?.pkid) {
    toast.add({ severity: 'warn', summary: 'Producto sin asociar', detail: 'Asocia primero la línea a un producto de KiwiKERP o crea uno nuevo.', life: 5000 });
    return;
  }
  pendingAlternative.value = { comparison, offer, productId: original.productMatch.pkid };
  linkSupplierId.value = null;
  linkSupplier.value = null;
  linkVisible.value = true;
};
const selectLinkSupplier = (supplier: any) => { linkSupplier.value = supplier; linkSupplierId.value = supplier.pkid; };
const clearLinkSupplier = () => { linkSupplier.value = null; linkSupplierId.value = null; };
const linkAlternative = async () => {
  if (!pendingAlternative.value || !linkSupplierId.value || linkingAlternative.value) return;
  linkingAlternative.value = true;
  try {
    const offer = pendingAlternative.value.offer;
    await axios.post(backendUrl('/WebLinkPurchaseSupplierAlternative'), {
      productId: pendingAlternative.value.productId,
      supplierId: linkSupplierId.value,
      unitPrice: Number(offer.comparableUnitPrice ?? offer.unitPrice ?? 0),
      currency: offer.currency || 'EUR',
      productName: offer.productName || '',
      packageQuantity: offer.packageQuantity,
      minimumOrder: offer.minimumOrder,
      shippingCost: offer.shippingCost,
      vatIncluded: offer.vatIncluded,
      confidence: offer.confidence,
      sourceUrl: offer.sourceUrl || '',
      sourceTitle: offer.sourceTitle || '',
    });
    toast.add({ severity: 'success', summary: 'Alternativa vinculada', detail: 'El proveedor y su oferta quedan asociados al producto.', life: 4000 });
    linkVisible.value = false;
  } catch (failure: any) {
    toast.add({ severity: 'error', summary: 'No se pudo vincular', detail: failure.response?.data || 'Revisa los datos seleccionados.', life: 5000 });
  } finally {
    linkingAlternative.value = false;
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
const savingLabel = (value: any) => {
  const percent = Number(value || 0);
  if (percent > 0) return `${money(percent)} % ahorro`;
  if (percent < 0) return `${money(Math.abs(percent))} % más caro`;
  return 'Sin diferencia';
};
const bestHistoricalOffer = (line: any) => (line?.historicalOffers || []).reduce(
  (best: any, offer: any) => !best || Number(offer.unitPrice) < Number(best.unitPrice) ? offer : best,
  null,
);

defineExpose({ open });
</script>

<style scoped>
.pdf-picker,
.comparison-panel,
.comparison-title,
.result-heading,
.dialog-actions {
  display: flex;
  align-items: center;
}
.pdf-picker { gap: .75rem; margin: 1rem 0; flex-wrap: wrap; }
.selected-file { display: flex; align-items: center; gap: .65rem; flex: 1; min-width: 240px; padding: .65rem .8rem; border: 1px solid #dfe5d0; border-radius: 8px; background: #fbfcf7; }
.selected-file > i { font-size: 1.5rem; color: #b42318; }
.selected-file span,
.result-heading > div,
.comparison-panel > div { display: flex; flex-direction: column; gap: .2rem; min-width: 0; }
.selected-file b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.selected-file small,
.result-heading small,
.result-lines small,
.comparison-panel small,
.comparison-title small,
.comparison-disclaimer { display: block; color: #768091; }
.analysis-progress { height: 5px; margin: .75rem 0; }
.analysis-result { display: flex; flex-direction: column; gap: .75rem; }
.result-heading,
.comparison-panel,
.comparison-title { justify-content: space-between; gap: 1rem; }
.invoice-summary { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .65rem; }
.invoice-summary > div { display: flex; flex-direction: column; gap: .2rem; padding: .65rem; background: #f8faf4; border: 1px solid #e1e7d2; border-radius: 8px; }
.invoice-summary small { color: #75806a; }
.invoice-summary span { font-size: .82rem; color: #778090; }
.result-lines { border: 1px solid #e3e7dc; border-radius: 8px; }
.history-price { display: flex; flex-direction: column; align-items: flex-start; gap: .25rem; }
.comparison-panel { padding: .8rem; border: 1px solid #dce6c3; border-radius: 9px; background: #f9fbf3; }
.comparison-group { margin-top: 1rem; border: 1px solid #e3e7dc; border-radius: 9px; overflow: hidden; }
.comparison-title { padding: .75rem; background: #f8faf4; }
.comparison-disclaimer { margin-top: 1rem; }
.offer-actions { display: flex; align-items: center; gap: .25rem; white-space: nowrap; }
.link-alternative-form { display: grid; gap: .85rem; padding: 1rem 0; }
.link-alternative-form > div { display: flex; flex-direction: column; gap: .2rem; }
.link-alternative-form small { color: #768091; }
.empty-result { text-align: center; color: #7c8491; padding: 1.5rem; }
.dialog-footer,
.dialog-actions { width: 100%; }
.dialog-footer-separator { margin-bottom: .75rem; }
.dialog-actions { justify-content: flex-end; gap: .5rem; }
@media (max-width: 850px) {
  .invoice-summary { grid-template-columns: 1fr 1fr; }
  .comparison-panel { align-items: stretch; flex-direction: column; }
}
</style>
