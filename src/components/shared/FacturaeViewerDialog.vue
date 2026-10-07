<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    class="kiwik-dialog facturae-dialog"
    :style="{ width: 'min(1180px, 96vw)', height: '90vh' }"
    :content-style="{ overflow: 'auto', minHeight: '0' }"
    @hide="reset"
  >
    <template #header>
      <div class="viewer-heading">
        <i class="pi pi-file" aria-hidden="true" />
        <div>
          <strong>Factura electrónica</strong>
          <small>{{ document?.filename || "Documento archivado" }}</small>
        </div>
      </div>
    </template>

    <p v-if="loading" role="status">
      <i class="pi pi-spin pi-spinner" /> Cargando XML archivado…
    </p>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <template v-if="document && !loading">
     <div class="viewer-scroll">
      <p class="viewer-note">
        Vista del XML archivado. «—» indica un dato no incluido. La
        visualización no valida la firma ni la aceptación por FACe.
      </p>
      <div class="viewer-toolbar">
        <div class="viewer-tabs" role="group" aria-label="Vista del documento">
          <Button
            label="Vista de factura"
            icon="pi pi-file"
            :outlined="tab !== 'invoice'"
            :aria-pressed="tab === 'invoice'"
            :disabled="!parsed"
            @click="tab = 'invoice'"
          />
          <Button
            label="XML original"
            icon="pi pi-code"
            :outlined="tab !== 'xml'"
            :aria-pressed="tab === 'xml'"
            @click="tab = 'xml'"
          />
        </div>
        <label
          v-if="parsed && parsed.invoices.length > 1"
          class="invoice-select"
        >
          Factura del documento
          <select v-model="invoiceIndex">
            <option
              v-for="(entry, index) in parsed.invoices"
              :key="index"
              :value="index"
            >
              {{ index + 1 }} · {{ entry.series }} /
              {{ entry.number || "Sin número" }}
            </option>
          </select>
        </label>
      </div>

      <article
        v-if="tab === 'invoice' && parsed && invoice"
        class="invoice-sheet"
      >
        <header class="invoice-heading">
          <div>
            <span>FACTURA ELECTRÓNICA</span>
            <h2>
              {{
                [invoice.series, invoice.number].filter(Boolean).join(" / ") ||
                "Sin número en el XML"
              }}
            </h2>
          </div>
          <span class="archive-badge">Documento archivado</span>
        </header>
        <dl class="header-fields">
          <div v-for="field in invoice.header" :key="field.label">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value || "—" }}</dd>
          </div>
        </dl>
        <div class="parties">
          <section
            v-for="(party, index) in [parsed.seller, parsed.buyer]"
            :key="index"
            class="party"
          >
            <h3>{{ index === 0 ? "Emisor" : "Destinatario" }}</h3>
            <strong>{{ party.name || "—" }}</strong>
            <dl>
              <div v-for="field in party.fields" :key="field.label">
                <dt>{{ field.label }}</dt>
                <dd>{{ field.value || "—" }}</dd>
              </div>
            </dl>
            <template v-if="party.centres.length">
              <h4>Centros administrativos · DIR3</h4>
              <div
                v-for="(centre, centreIndex) in party.centres"
                :key="centreIndex"
                class="centre"
              >
                <b>{{ centre.code || "—" }}</b> ·
                {{ centre.name || centre.description || "Sin nombre" }}
                <small>Código de rol: {{ centre.role || "—" }}</small>
              </div>
            </template>
          </section>
        </div>
        <section>
          <h3>Detalle de la factura</h3>
          <div
            class="table-scroll"
            tabindex="0"
            role="region"
            aria-label="Líneas de la factura"
          >
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio sin impuestos</th>
                  <th>Coste total</th>
                  <th>Importe bruto</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, index) in invoice.lines" :key="index">
                  <td v-for="(cell, column) in line" :key="column">
                    {{ cell || "—" }}
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-if="!invoice.lines.length">No hay líneas en el XML.</p>
          </div>
        </section>
        <div class="amounts">
          <div>
            <section
              v-for="tax in invoice.taxes.filter((table) => table.rows.length)"
              :key="tax.title"
            >
              <h3>{{ tax.title }}</h3>
              <div
                class="table-scroll"
                tabindex="0"
                role="region"
                :aria-label="tax.title"
              >
                <table>
                  <thead>
                    <tr>
                      <th v-for="label in tax.headers" :key="label">
                        {{ label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in tax.rows" :key="index">
                      <td v-for="(cell, column) in row" :key="column">
                        {{ cell || "—" }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <section class="totals">
            <h3>
              Totales
              <small v-if="invoice.currency">({{ invoice.currency }})</small>
            </h3>
            <dl>
              <div
                v-for="field in invoice.totals"
                :key="field.label"
                :class="{ 'grand-total': field.label === 'Total factura' }"
              >
                <dt>{{ field.label }}</dt>
                <dd>{{ field.value }}</dd>
              </div>
            </dl>
            <p v-if="!invoice.totals.length">No hay totales en el XML.</p>
          </section>
        </div>
        <section v-if="invoice.information">
          <h3>Información adicional</h3>
          <p class="additional-info">{{ invoice.information }}</p>
        </section>
      </article>
      <section v-else-if="tab === 'xml'" class="xml-panel">
        <p>
          Contenido XML con sangría para facilitar la lectura. La descarga
          conserva el archivo original sin cambios.
        </p>
        <pre
          tabindex="0"
          aria-label="Contenido del XML archivado"
        ><code>{{ parsed?.formattedXml || xml }}</code></pre>
      </section>
     </div>
    </template>
    <template #footer>
      <div class="viewer-footer">
        <div class="kiwik-separator" />
        <div class="viewer-actions">
          <Button
            label="Descargar XML original"
            icon="pi pi-download"
            :disabled="!document || loading"
            @click="download"
          />
          <Button
            label="Cerrar"
            severity="secondary"
            outlined
            @click="visible = false"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Message from "primevue/message";
import {
  downloadArchivedFacturae,
  facturaeError,
  parseFacturae,
  type ArchivedFacturae,
  type FacturaeView,
} from "@/services/facturaeViewer";

const visible = ref(false);
const loading = ref(false);
const error = ref("");
const document = shallowRef<ArchivedFacturae | null>(null);
const parsed = shallowRef<FacturaeView | null>(null);
const xml = ref("");
const tab = ref<"invoice" | "xml">("invoice");
const invoiceIndex = ref(0);
const invoice = computed(() => parsed.value?.invoices[invoiceIndex.value]);
let requestId = 0;

function reset() {
  ++requestId;
  document.value = null;
  parsed.value = null;
  xml.value = "";
  error.value = "";
  loading.value = false;
  invoiceIndex.value = 0;
  tab.value = "invoice";
}

// El proveedor de datos establece la autorización; el visor no depende de rutas del ERP.
async function open(load: () => Promise<ArchivedFacturae>) {
  reset();
  visible.value = true;
  loading.value = true;
  const current = requestId;
  try {
    const archived = await load();
    if (current !== requestId) return;
    document.value = archived;
    if (archived.blob.size > 5 * 1024 * 1024) {
      throw new Error(
        "El XML supera los 5 MB del visor. Puedes descargar el archivo original.",
      );
    }
    const text = await archived.blob.text();
    if (current !== requestId) return;
    xml.value = text;
    parsed.value = parseFacturae(text);
  } catch (failure) {
    const message = await facturaeError(failure);
    if (current !== requestId) return;
    error.value = message;
    tab.value = "xml";
  } finally {
    if (current === requestId) loading.value = false;
  }
}
function download() {
  if (document.value) downloadArchivedFacturae(document.value);
}
onBeforeUnmount(reset);
defineExpose({ open });
</script>

<style scoped>
.facturae-dialog :deep(.p-dialog-content) {
  height: auto !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  overflow: hidden !important;
}
.viewer-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
}
.viewer-heading {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: #365314;
  min-width: 0;
}
.viewer-heading > i {
  font-size: 1.6rem;
}
.viewer-heading strong {
  font-size: 1.15rem;
}
.viewer-heading small {
  display: block;
  color: #64748b;
  margin-top: 0.25rem;
  overflow-wrap: anywhere;
}
.viewer-note,
.xml-panel > p {
  color: #64748b;
  font-size: 0.9rem;
}
.viewer-toolbar,
.viewer-tabs,
.viewer-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.viewer-toolbar {
  justify-content: space-between;
  margin: 1rem 0;
}
.invoice-select {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.invoice-select select {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  max-width: 18rem;
}
.invoice-sheet {
  background: white;
  color: #253000;
  border: 1px solid #dce4cf;
  border-radius: 10px;
  padding: 1.5rem;
}
.invoice-heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
  border-bottom: 3px solid #9cc10a;
  padding-bottom: 1rem;
}
.invoice-heading span {
  font-size: 0.8rem;
  letter-spacing: 0.04em;
}
.invoice-heading h2 {
  margin: 0.4rem 0 0;
  overflow-wrap: anywhere;
}
.archive-badge {
  background: #f1f6e4;
  border-radius: 6px;
  padding: 0.5rem;
  white-space: nowrap;
}
.header-fields {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  padding-bottom: 1rem;
}
dt {
  color: #64748b;
  font-size: 0.85rem;
}
dd {
  margin: 0.3rem 0 0;
  overflow-wrap: anywhere;
}
.parties {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}
.party {
  border: 1px solid #e2e8d8;
  background: #fafcf6;
  border-radius: 8px;
  padding: 1rem;
  min-width: 0;
  overflow-wrap: anywhere;
}
h3 {
  font-size: 1rem;
  color: #45651d;
  margin: 1.1rem 0 0.8rem;
}
.party h3 {
  margin-top: 0;
}
.party dl > div {
  margin-top: 0.6rem;
}
.centre {
  padding: 0.5rem 0;
  border-top: 1px solid #dce4cf;
}
.centre small {
  display: block;
  margin-top: 0.25rem;
  color: #64748b;
}
.table-scroll {
  overflow: auto;
  max-height: 24rem;
  border: 1px solid #e2e8d8;
  border-radius: 6px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th {
  background: #edf3df;
  color: #365314;
  position: sticky;
  top: 0;
  text-align: left;
}
th,
td {
  padding: 0.7rem;
  border-bottom: 1px solid #e2e8d8;
}
td:first-child {
  min-width: 10rem;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
td:not(:first-child),
th:not(:first-child) {
  text-align: right;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.amounts {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 1.5rem;
}
.totals dl > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid #e2e8d8;
}
.totals dd {
  margin: 0;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.grand-total {
  font-weight: bold;
  font-size: 1.15rem;
  background: #f1f6e4;
}
.grand-total dt {
  color: #365314;
  font-size: 1rem;
}
.additional-info {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.xml-panel pre {
  max-height: 55vh;
  overflow: auto;
  background: #f5f7f1;
  color: #253000;
  padding: 1rem;
  border: 1px solid #dce4cf;
  border-radius: 8px;
  font-size: 0.85rem;
  tab-size: 2;
}
.viewer-footer {
  width: 100%;
}
.viewer-actions {
  justify-content: flex-end;
}
.viewer-tabs :deep(.p-button:not(.p-button-outlined)),
.viewer-actions :deep(.p-button:not(.p-button-outlined)) {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}
.viewer-tabs :deep(.p-button:not(.p-button-outlined):hover),
.viewer-actions :deep(.p-button:not(.p-button-outlined):hover) {
  background: #8bad09;
  border-color: #8bad09;
}
@media (max-width: 700px) {
  .parties,
  .amounts {
    grid-template-columns: 1fr;
  }
  .header-fields {
    grid-template-columns: 1fr 1fr;
  }
  .invoice-heading {
    flex-direction: column;
  }
  .invoice-sheet {
    padding: 0.8rem;
  }
  .invoice-select {
    flex-wrap: wrap;
  }
}
</style>
