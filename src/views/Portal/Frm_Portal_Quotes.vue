<template>
  <main class="quotes-page">
    <header class="quotes-header">
      <div class="quotes-title">
        <span class="quotes-icon"><i class="pi pi-file-edit" /></span>
        <div>
          <span>Portal / Propuestas</span>
          <h1>Presupuestos</h1>
          <p>
            Consulta las versiones recibidas y responde a las propuestas
            pendientes.
          </p>
        </div>
      </div>
      <Button
        label="Actualizar"
        icon="pi pi-refresh"
        severity="secondary"
        outlined
        :loading="loading"
        @click="load"
      />
    </header>
    <section class="quote-summary">
      <article>
        <small>Recibidas</small><strong>{{ rows.length }}</strong>
      </article>
      <article>
        <small>Pendientes</small><strong>{{ pending }}</strong>
      </article>
      <article>
        <small>Aceptadas</small><strong>{{ accepted }}</strong>
      </article>
      <article>
        <small>Importe pendiente</small
        ><strong>{{ money(pendingAmount) }}</strong>
      </article>
    </section>
    <section class="quote-workspace">
      <div v-if="loading" class="empty">
        <i class="pi pi-spin pi-spinner" /> Cargando presupuestos…
      </div>
      <div v-else-if="!rows.length" class="empty">
        <i class="pi pi-inbox" /><b>No tienes presupuestos enviados</b>
      </div>
      <div v-else class="quote-list">
        <article
          v-for="row in rows"
          :key="row.versionId"
          class="quote-card"
          :class="{ 'quote-card--pending': row.canRespond }"
        >
          <div class="quote-card-head">
            <div>
              <span class="quote-code">{{ row.code }}</span
              ><Tag :value="`Versión ${row.version}`" severity="info" rounded />
            </div>
            <Tag
              :value="statusLabel(row.status)"
              :severity="statusSeverity(row.status)"
              rounded
            />
          </div>
          <div class="quote-meta">
            <span><small>Enviado</small>{{ dateTime(row.sentAt) }}</span
            ><span><small>Validez</small>{{ date(row.validityDate) }}</span
            ><span
              ><small>Total</small
              ><b>{{ money(row.totalTotal, row.currencyCode) }}</b></span
            >
          </div>
          <p v-if="row.reference"><b>Referencia:</b> {{ row.reference }}</p>
          <p v-if="row.response" class="response">
            <b>Tu respuesta:</b> {{ row.response }}
          </p>
          <footer>
            <Button
              label="Ver PDF"
              icon="pi pi-file-pdf"
              severity="danger"
              text
              @click="openPdf(row.versionId)"
            /><Button
              v-if="row.canRespond"
              label="Responder"
              icon="pi pi-check-circle"
              @click="openResponse(row)"
            />
          </footer>
        </article>
      </div>
    </section>
    <Dialog
      v-model:visible="responseVisible"
      modal
      class="kiwik-dialog"
      header="Responder al presupuesto"
      :style="{ width: 'min(620px,95vw)' }"
      :closable="!sending"
    >
      <Message severity="info" :closable="false"
        >Tu respuesta se registrará sobre la versión {{ selected?.version }} de
        <b>{{ selected?.code }}</b
        >. La aceptación creará el pedido para que nuestro equipo continúe el
        proceso.</Message
      >
      <SelectButton
        v-model="decision"
        :options="decisions"
        optionLabel="label"
        optionValue="value"
        class="decision"
      />
      <FloatLabel variant="on" class="w-full mt-4"
        ><Textarea
          id="quote-response-comment"
          v-model="comment"
          rows="5"
          maxlength="1000"
          class="w-full"
        /><label for="quote-response-comment"
          >Comentario (opcional)</label
        ></FloatLabel
      >
      <div class="kiwik-separator" />
      <template #footer
        ><Button
          label="Volver"
          severity="secondary"
          text
          :disabled="sending"
          @click="responseVisible = false" /><Button
          :label="
            decision === 'ACCEPT'
              ? 'Aceptar presupuesto'
              : 'Rechazar presupuesto'
          "
          :icon="decision === 'ACCEPT' ? 'pi pi-check' : 'pi pi-times'"
          :severity="decision === 'ACCEPT' ? 'primary' : 'danger'"
          :loading="sending"
          @click="respond"
      /></template>
    </Dialog>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import SelectButton from "primevue/selectbutton";
import FloatLabel from "primevue/floatlabel";
import Textarea from "primevue/textarea";
const props = defineProps<{ token: string; initialVersion?: number | null }>();
const toast = useToast();
const rows = ref<any[]>([]),
  loading = ref(false),
  sending = ref(false),
  responseVisible = ref(false),
  selected = ref<any>(null),
  decision = ref<"ACCEPT" | "REJECT">("ACCEPT"),
  comment = ref("");
const decisions = [
  { label: "Aceptar", value: "ACCEPT" },
  { label: "Rechazar", value: "REJECT" },
];
const pending = computed(() => rows.value.filter((r) => r.canRespond).length),
  accepted = computed(
    () => rows.value.filter((r) => r.status === "ACCEPTED").length,
  ),
  pendingAmount = computed(() =>
    rows.value
      .filter((r) => r.canRespond)
      .reduce((s, r) => s + Number(r.totalTotal || 0), 0),
  );
async function load() {
  loading.value = true;
  try {
    rows.value =
      (
        await axios.get(backendUrl("/WebPortalSalesQuotes"), {
          params: { token: props.token },
        })
      ).data ?? [];
    if (props.initialVersion) {
      const row = rows.value.find(
        (r) => Number(r.versionId) === Number(props.initialVersion),
      );
      if (row?.canRespond) openResponse(row);
    }
  } finally {
    loading.value = false;
  }
}
function openResponse(row: any) {
  selected.value = row;
  decision.value = "ACCEPT";
  comment.value = "";
  responseVisible.value = true;
}
async function respond() {
  if (!selected.value) return;
  sending.value = true;
  try {
    await axios.post(
      backendUrl(`/WebPortalRespondSalesQuote/${selected.value.versionId}`),
      { decision: decision.value, comment: comment.value },
      { params: { token: props.token } },
    );
    responseVisible.value = false;
    toast.add({
      severity: "success",
      summary:
        decision.value === "ACCEPT"
          ? "Presupuesto aceptado"
          : "Presupuesto rechazado",
      detail: "Tu respuesta ha quedado registrada.",
      life: 4000,
    });
    await load();
  } catch (e: any) {
    toast.add({
      severity: "error",
      summary: "No se pudo registrar la respuesta",
      detail: e.response?.data ?? "Actualiza la pantalla e inténtalo de nuevo.",
      life: 5000,
    });
  } finally {
    sending.value = false;
  }
}
const openPdf = (id: number) =>
  window.open(
    backendUrl(
      `/WebPortalSalesQuotePdf/${id}?token=${encodeURIComponent(props.token)}`,
    ),
    "_blank",
    "noopener",
  );
const dateTime = (v: string) =>
  v
    ? new Intl.DateTimeFormat("es-ES", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(v))
    : "—";
const date = (v: string) =>
  v
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
        new Date(v),
      )
    : "—";
const money = (v: number, c = "EUR") =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: c || "EUR",
  }).format(Number(v) || 0);
const statusLabel = (v: string) =>
  (
    ({
      SENT: "Pendiente",
      ACCEPTED: "Aceptado",
      REJECTED: "Rechazado",
      SUPERSEDED: "Versión anterior",
    }) as any
  )[v] ?? v;
const statusSeverity = (v: string) =>
  (
    ({
      SENT: "warn",
      ACCEPTED: "success",
      REJECTED: "danger",
      SUPERSEDED: "secondary",
    }) as any
  )[v] ?? "info";
onMounted(load);
</script>
<style scoped>
.quotes-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.quotes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #dfe7cf;
  border-radius: 15px;
  background: #fff;
}
.quotes-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.quotes-title > div > span {
  color: #6b7b51;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.quotes-title h1 {
  margin: 0.15rem 0;
  font-size: 1.55rem;
}
.quotes-title p {
  margin: 0;
  color: #667085;
}
.quotes-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #eff7d8;
  color: #6b9000;
  font-size: 1.25rem;
}
.quote-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.quote-summary article {
  padding: 15px 18px;
  border: 1px solid #e1e7d6;
  border-radius: 12px;
  background: #fff;
}
.quote-summary small,
.quote-summary strong {
  display: block;
}
.quote-summary small {
  color: #73806b;
}
.quote-summary strong {
  margin-top: 0.25rem;
  font-size: 1.25rem;
}
.quote-workspace {
  min-height: 360px;
  padding: 16px;
  border: 1px solid #dfe7cf;
  border-radius: 15px;
  background: #fff;
}
.quote-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.quote-card {
  padding: 17px;
  border: 1px solid #e1e5dc;
  border-radius: 12px;
  background: #fff;
}
.quote-card--pending {
  border-left: 4px solid #9cc10a;
}
.quote-card-head,
.quote-card-head > div,
.quote-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}
.quote-code {
  font-size: 1.05rem;
  font-weight: 800;
}
.quote-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 16px 0;
}
.quote-meta span {
  padding: 9px;
  border-radius: 8px;
  background: #f7f9f4;
}
.quote-meta small,
.quote-meta b {
  display: block;
}
.quote-meta small {
  color: #77836d;
  font-size: 0.72rem;
}
.quote-card p {
  color: #667085;
}
.response {
  padding: 9px;
  background: #f4f8e8;
  border-radius: 8px;
}
.empty {
  display: flex;
  min-height: 320px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: #73806b;
}
.decision {
  margin-top: 18px;
}
.kiwik-separator {
  margin-top: 18px;
}
@media (max-width: 850px) {
  .quote-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .quote-list {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 520px) {
  .quotes-header {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }
  .quote-summary {
    grid-template-columns: 1fr;
  }
  .quote-meta {
    grid-template-columns: 1fr;
  }
}
</style>
