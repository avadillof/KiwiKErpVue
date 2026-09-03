<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :closable="false"
    :dismissable-mask="false"
    :style="{ width: 'min(72rem, 96vw)', height: '92dvh' }"
    :content-style="{
      height: 'calc(92dvh - 9rem)',
      minHeight: '0',
      overflow: 'hidden',
    }"
    :pt="dialogPt"
    @hide="cancelRequest"
  >
    <template #header>
      <div class="trace-header">
        <div class="trace-heading">
          <span class="trace-heading-icon"><i class="pi pi-sitemap" /></span>
          <div>
            <b>Trazabilidad comercial</b>
            <small>Del presupuesto al cobro, conservando todas las ramas</small>
          </div>
        </div>
        <Button
          icon="pi pi-times"
          severity="secondary"
          text
          rounded
          aria-label="Cerrar trazabilidad"
          title="Cerrar"
          @click="close"
        />
      </div>
    </template>

    <div class="trace-scroll-body">
      <div v-if="loading" class="trace-loading">
        <i class="pi pi-spin pi-spinner" />
        <span>Reconstruyendo el circuito comercial…</span>
      </div>

      <Message v-else-if="error" severity="error" :closable="false">
        {{ error }}
        <Button label="Reintentar" icon="pi pi-refresh" size="small" text @click="retry" />
      </Message>

      <Timeline v-else-if="stages.length" :value="stages" align="left" class="sales-timeline">
      <template #marker="{ item }">
        <span class="stage-marker" :class="`stage-${item.type.toLowerCase()}`">
          <i :class="item.icon" />
        </span>
      </template>

      <template #content="{ item }">
        <section class="trace-stage">
          <div class="stage-heading">
            <div>
              <h3>{{ item.label }}</h3>
              <small>{{ stageDescription(item) }}</small>
            </div>
            <Tag :value="String(item.nodes.length)" severity="secondary" rounded />
          </div>

          <div v-if="item.nodes.length" class="node-grid">
            <article
              v-for="node in item.nodes"
              :key="node.key"
              class="trace-node"
              :class="{ selected: node.key === selectedKey, reversed: node.reversed }"
            >
              <div class="node-topline">
                <div class="node-code">
                  <i :class="item.icon" />
                  <strong>{{ node.code }}</strong>
                </div>
                <Tag :value="shortState(node.state)" :severity="stateSeverity(node.state)" rounded />
              </div>

              <div v-if="node.parentKeys?.length" class="node-origin">
                <i class="pi pi-share-alt" />
                <span>{{ originText(node.parentKeys) }}</span>
              </div>

              <dl class="node-details">
                <div>
                  <dt>Fecha</dt>
                  <dd>{{ formatDate(node.date) }}</dd>
                </div>
                <div>
                  <dt>{{ node.type === 'PAYMENT' ? 'Cobrado' : 'Importe' }}</dt>
                  <dd>{{ formatCurrency(node.amount) }}</dd>
                </div>
              </dl>

              <div v-if="node.method || node.reference" class="node-extra">
                <span v-if="node.method"><i class="pi pi-credit-card" /> {{ paymentMethod(node.method) }}</span>
                <span v-if="node.reference"><i class="pi pi-hashtag" /> {{ node.reference }}</span>
              </div>

              <div class="node-footer">
                <span v-if="node.key === selectedKey" class="selected-label">
                  <i class="pi pi-map-marker" /> Documento consultado
                </span>
                <Button
                  v-if="node.type !== 'PAYMENT' && node.key !== selectedKey"
                  label="Ir al módulo"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  size="small"
                  text
                  @click="goToDocument(node)"
                />
              </div>
            </article>
          </div>

          <div v-else class="empty-stage">
            <i :class="item.icon" />
            <span>{{ emptyText(item.type) }}</span>
          </div>
        </section>
      </template>
      </Timeline>
    </div>

    <template #footer>
      <div class="trace-footer">
        <div class="kiwik-separator" />
        <div class="trace-actions">
          <Button label="Cerrar" severity="secondary" text @click="close" />
          <Button
            label="Imprimir trazabilidad"
            icon="pi pi-print"
            :disabled="loading || Boolean(error) || !stages.length"
            @click="printTraceability"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Timeline from "primevue/timeline";
import { parseLocalizedServerDate } from "@/libs/HelperDates";

interface TraceNode {
  key: string;
  type: "QUOTE" | "ORDER" | "DELIVERY" | "INVOICE" | "PAYMENT";
  pkid: number;
  code: string;
  date?: string;
  state?: string;
  amount?: number;
  reference?: string;
  method?: string;
  reversed?: boolean;
  parentKeys?: string[];
}

interface TraceStage {
  type: TraceNode["type"];
  label: string;
  icon: string;
  nodes: TraceNode[];
}

const router = useRouter();
const visible = ref(false);
const loading = ref(false);
const error = ref("");
const selectedKey = ref("");
const stages = ref<TraceStage[]>([]);
let activeRequest: AbortController | null = null;
let lastRequest: { documentType: string; documentId: number } | null = null;

const dialogPt = {
  root: { class: "kiwik-dialog sales-traceability-dialog" },
  header: { class: "kiwik-dialog-header" },
  content: { class: "kiwik-dialog-content" },
  footer: { class: "kiwik-dialog-footer" },
};

const open = async (documentType: string, documentId: number) => {
  if (!documentId) return;
  cancelRequest();
  lastRequest = { documentType, documentId };
  visible.value = true;
  loading.value = true;
  error.value = "";
  selectedKey.value = `${documentType.toUpperCase()}-${documentId}`;
  stages.value = [];
  const request = new AbortController();
  activeRequest = request;
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/WebGetSalesTraceability`,
      {
        params: { documentType, documentId },
        signal: request.signal,
        timeout: 15000,
      },
    );
    if (request.signal.aborted || activeRequest !== request) return;
    selectedKey.value = data.selectedKey;
    stages.value = data.stages ?? [];
  } catch (requestError: any) {
    if (request.signal.aborted || requestError.code === "ERR_CANCELED") return;
    error.value =
      requestError.code === "ECONNABORTED"
        ? "La consulta está tardando demasiado. Cierra el diálogo y vuelve a intentarlo después de revisar el backend."
        : requestError.response?.data ??
          "No se pudo reconstruir la trazabilidad comercial.";
  } finally {
    if (activeRequest === request) {
      activeRequest = null;
      loading.value = false;
    }
  }
};

const cancelRequest = () => {
  activeRequest?.abort();
  activeRequest = null;
  loading.value = false;
};

const close = () => {
  cancelRequest();
  visible.value = false;
};

const retry = () => {
  if (lastRequest) open(lastRequest.documentType, lastRequest.documentId);
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  try {
    const direct = new Date(value);
    const date = Number.isNaN(direct.getTime())
      ? parseLocalizedServerDate(value)
      : direct;
    if (!date || Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return value;
  }
};

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0));

const shortState = (state?: string) => state?.split(" /")[0] || "Sin estado";
const stateSeverity = (state?: string) => {
  const normalized = (state ?? "").toLowerCase();
  if (normalized.includes("cancel") || normalized.includes("anulad") || normalized.includes("revert")) return "danger";
  if (normalized.includes("complet") || normalized.includes("confirm") || normalized.includes("registrad") || normalized.includes("pagad") || normalized.includes("cobrad")) return "success";
  if (normalized.includes("parcial") || normalized.includes("pend") || normalized.includes("aprobar")) return "warn";
  if (normalized.includes("borrador")) return "secondary";
  return "info";
};

const stageDescription = (stage: TraceStage) =>
  stage.nodes.length === 1
    ? "1 documento relacionado"
    : `${stage.nodes.length} documentos relacionados`;

const emptyText = (type: TraceNode["type"]) =>
  ({
    QUOTE: "El circuito no parte de un presupuesto.",
    ORDER: "No hay pedidos de venta relacionados.",
    DELIVERY: "No se han generado albaranes.",
    INVOICE: "Todavía no se han generado facturas.",
    PAYMENT: "Todavía no hay cobros registrados.",
  })[type];

const originText = (parentKeys: string[]) => {
  const labels = parentKeys.map((key) => {
    const [type, ...id] = key.split("-");
    const label = { QUOTE: "Presupuesto", ORDER: "Pedido", DELIVERY: "Albarán", INVOICE: "Factura" }[type] ?? "Documento";
    const parent = stages.value
      .flatMap((stage) => stage.nodes)
      .find((node) => node.key === key);
    return `${label} ${parent?.code ?? `#${id.join("-")}`}`;
  });
  return `Procede de ${labels.join(", ")}`;
};

const paymentMethod = (method: string) =>
  ({ CASH: "Efectivo", TRANSFER: "Transferencia", CARD: "Tarjeta", DIRECT_DEBIT: "Domiciliación", OTHER: "Otro" })[method] ?? method;

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const printTraceability = () => {
  if (!stages.value.length) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.opener = null;

  const stageHtml = stages.value
    .map((stage) => {
      const nodes = stage.nodes.length
        ? stage.nodes
            .map((node) => {
              const origin = node.parentKeys?.length
                ? `<div class="origin">${escapeHtml(originText(node.parentKeys))}</div>`
                : "";
              const method = node.method
                ? `<span><b>Medio:</b> ${escapeHtml(paymentMethod(node.method))}</span>`
                : "";
              const reference = node.reference
                ? `<span><b>Referencia:</b> ${escapeHtml(node.reference)}</span>`
                : "";
              return `<article class="node${node.key === selectedKey.value ? " selected" : ""}${node.reversed ? " reversed" : ""}">
                <div class="node-head"><strong>${escapeHtml(node.code)}</strong><span class="state">${escapeHtml(shortState(node.state))}</span></div>
                ${origin}
                <div class="details"><span><b>Fecha:</b> ${escapeHtml(formatDate(node.date))}</span><span><b>Importe:</b> ${escapeHtml(formatCurrency(node.amount))}</span>${method}${reference}</div>
                ${node.key === selectedKey.value ? '<div class="consulted">Documento consultado</div>' : ""}
              </article>`;
            })
            .join("")
        : `<div class="empty">${escapeHtml(emptyText(stage.type))}</div>`;
      return `<section class="stage"><div class="stage-title"><span>${escapeHtml(stage.label)}</span><small>${stage.nodes.length}</small></div><div class="nodes">${nodes}</div></section>`;
    })
    .join("");

  printWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Trazabilidad comercial</title><style>
    @page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;color:#263126;font:12px Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:end;padding-bottom:10px;border-bottom:3px solid #9cc10a}h1{margin:0;font-size:21px}header p{margin:4px 0 0;color:#667264}header small{color:#7b8578}.stage{position:relative;margin-top:16px;padding-left:24px}.stage:before{content:"";position:absolute;left:6px;top:13px;bottom:-18px;border-left:2px solid #dbe5c7}.stage:last-child:before{bottom:auto;height:13px}.stage-title{display:flex;align-items:center;gap:8px;margin-bottom:7px;font-size:14px;font-weight:bold}.stage-title:before{content:"";position:absolute;left:0;width:14px;height:14px;border:3px solid #fff;border-radius:50%;background:#789900;box-shadow:0 0 0 1px #aabd83}.stage-title small{display:inline-grid;min-width:19px;height:19px;place-items:center;border-radius:10px;background:#eef2ea;color:#5f695c}.nodes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.node{break-inside:avoid;padding:9px;border:1px solid #dce3d8;border-radius:6px}.node.selected{border:2px solid #9cc10a;background:#fbfdf4}.node.reversed{background:#fff5f3}.node-head{display:flex;justify-content:space-between;gap:8px}.state{padding:2px 6px;border-radius:9px;background:#eef2ea;font-size:10px}.origin{margin-top:6px;padding:4px 6px;background:#f5f7f3;color:#606c5d;font-size:10px}.details{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;margin-top:7px;color:#4d584b}.consulted{margin-top:6px;color:#668500;font-size:10px;font-weight:bold}.empty{padding:8px;border:1px dashed #d5ddd1;color:#788176}.print-footer{margin-top:18px;padding-top:7px;border-top:1px solid #dce3d8;color:#7b8578;font-size:9px;text-align:right}@media print{.node{box-shadow:none}}
  </style></head><body><header><div><h1>Trazabilidad comercial</h1><p>Presupuesto · Pedido · Albarán · Factura · Cobro</p></div><small>${escapeHtml(new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" }).format(new Date()))}</small></header>${stageHtml}<div class="print-footer">KiwiKERP · Trazabilidad comercial</div><script>window.addEventListener('load',()=>{window.print();});<\/script></body></html>`);
  printWindow.document.close();
};

const goToDocument = async (node: TraceNode) => {
  const routes: Partial<Record<TraceNode["type"], string>> = {
    QUOTE: "Presupuestos",
    ORDER: "Pedidos",
    DELIVERY: "Albaranes",
    INVOICE: "Facturas",
  };
  const route = routes[node.type];
  if (!route) return;
  close();
  const query = node.type === "INVOICE" ? { invoiceId: String(node.pkid) } : undefined;
  await router.push({ name: route, query });
};

defineExpose({ open });
</script>

<style scoped>
.trace-header{display:flex;width:100%;align-items:center;justify-content:space-between;gap:1rem}.trace-heading{display:flex;align-items:center;gap:.8rem}.trace-heading-icon{display:grid;width:2.65rem;height:2.65rem;place-items:center;border-radius:.7rem;background:#edf5d9;color:#637e00}.trace-heading b,.trace-heading small{display:block}.trace-heading b{color:#273226;font-size:1.05rem}.trace-heading small{margin-top:.15rem;color:#73806e}.trace-scroll-body{box-sizing:border-box;width:100%;height:100%;min-height:0;padding-right:.35rem;overflow-x:hidden;overflow-y:scroll;overscroll-behavior:contain;scrollbar-gutter:stable}.trace-loading{min-height:100%;display:flex;align-items:center;justify-content:center;gap:.7rem;color:#657164}.trace-loading i{color:#86a906;font-size:1.4rem}.sales-timeline{padding:.5rem 0}.sales-timeline :deep(.p-timeline-event-opposite){display:none}.sales-timeline :deep(.p-timeline-event-separator){flex:0 0 3.5rem}.sales-timeline :deep(.p-timeline-event-connector){background:#dfe8ca;width:3px}.sales-timeline :deep(.p-timeline-event-content){padding:0 0 1.5rem .45rem;min-width:0}.stage-marker{display:grid;width:2.65rem;height:2.65rem;place-items:center;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #d6dec8,0 4px 12px rgba(50,70,30,.12);color:#fff}.stage-quote{background:#7a69bd}.stage-order{background:#dc8b2f}.stage-delivery{background:#23967f}.stage-invoice{background:#c84f73}.stage-payment{background:#5485b8}.trace-stage{min-width:0}.stage-heading{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.75rem}.stage-heading h3{margin:0;color:#303a31;font-size:1.05rem}.stage-heading small{display:block;margin-top:.12rem;color:#7d877b}.node-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));gap:.7rem}.trace-node{display:flex;min-width:0;flex-direction:column;gap:.65rem;padding:.85rem;border:1px solid #dfe5dc;border-radius:.75rem;background:#fff;box-shadow:0 3px 12px rgba(31,48,30,.055)}.trace-node.selected{border-color:#9cc10a;box-shadow:0 0 0 2px rgba(156,193,10,.16),0 4px 14px rgba(31,48,30,.07)}.trace-node.reversed{background:#fff8f7}.node-topline,.node-footer{display:flex;align-items:center;justify-content:space-between;gap:.6rem}.node-code{display:flex;align-items:center;gap:.45rem;min-width:0;color:#344434}.node-code strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.node-code i{color:#7b8a75}.node-origin{display:flex;align-items:flex-start;gap:.4rem;padding:.4rem .5rem;border-radius:.4rem;background:#f6f8f3;color:#687465;font-size:.78rem}.node-origin i{margin-top:.1rem;color:#8aa04e}.node-details{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin:0}.node-details div{padding:.45rem .55rem;border-radius:.45rem;background:#fafbfa}.node-details dt{color:#8a9388;font-size:.7rem}.node-details dd{margin:.12rem 0 0;color:#354035;font-weight:700}.node-extra{display:flex;flex-wrap:wrap;gap:.6rem;color:#667164;font-size:.76rem}.selected-label{display:flex;align-items:center;gap:.3rem;color:#637e00;font-size:.76rem;font-weight:700}.node-footer{min-height:1.8rem;margin-top:auto}.empty-stage{display:flex;align-items:center;gap:.55rem;padding:.8rem 1rem;border:1px dashed #d7ded3;border-radius:.65rem;background:#fafbf9;color:#7c867a}.trace-footer{width:100%}.trace-actions{display:flex;justify-content:flex-end;gap:.5rem;padding-top:.75rem}@media(max-width:700px){.sales-timeline :deep(.p-timeline-event-separator){flex-basis:2.7rem}.stage-marker{width:2.2rem;height:2.2rem}.node-grid{grid-template-columns:1fr}.trace-heading small{display:none}}
</style>
