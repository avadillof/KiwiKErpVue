<template>
  <Dialog
    v-model:visible="visible"
    modal
    class="kiwik-dialog"
    header="Versiones enviadas del presupuesto"
    :style="{ width: 'min(920px,95vw)' }"
  >
    <Message severity="info" :closable="false"
      >Cada envío conserva su PDF y la respuesta del cliente. Una versión
      sustituida permanece disponible como histórico.</Message
    >
    <div v-if="loading" class="versions-loading">
      <i class="pi pi-spin pi-spinner" /> Cargando versiones…
    </div>
    <DataTable
      v-else
      :value="rows"
      size="small"
      stripedRows
      scrollable
      scrollHeight="420px"
      class="mt-3"
    >
      <Column header="Versión"
        ><template #body="{ data }"
          ><Tag :value="`V${data.version}`" severity="info" rounded /></template
      ></Column>
      <Column header="Enviada"
        ><template #body="{ data }">{{
          dateTime(data.sentAt)
        }}</template></Column
      >
      <Column header="Destinatario"
        ><template #body="{ data }"
          ><b>{{ data.recipientName }}</b
          ><small class="recipient-mail">{{
            data.recipientEmail
          }}</small></template
        ></Column
      >
      <Column header="Estado"
        ><template #body="{ data }"
          ><Tag
            :value="statusLabel(data.status)"
            :severity="statusSeverity(data.status)"
            rounded /></template
      ></Column>
      <Column header="Respuesta"
        ><template #body="{ data }"
          ><span v-if="data.respondedAt"
            >{{ dateTime(data.respondedAt)
            }}<small v-if="data.response" class="response-note">{{
              data.response
            }}</small></span
          ><span v-else>—</span></template
        ></Column
      >
      <Column header="PDF" style="width: 70px"
        ><template #body="{ data }"
          ><Button
            icon="pi pi-file-pdf"
            text
            rounded
            severity="danger"
            title="Abrir PDF de esta versión"
            @click="openPdf(data.id)" /></template
      ></Column>
      <template #empty
        ><div class="versions-empty">
          <i class="pi pi-history" /><b>Aún no se ha enviado ninguna versión</b>
        </div></template
      >
    </DataTable>
    <div class="kiwik-separator" />
    <template #footer
      ><Button
        label="Cerrar"
        severity="secondary"
        text
        @click="visible = false"
    /></template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import Button from "primevue/button";
const visible = ref(false),
  loading = ref(false),
  rows = ref<any[]>([]);
async function open(quoteId: number) {
  visible.value = true;
  loading.value = true;
  try {
    rows.value =
      (await axios.get(backendUrl(`/WebGetSalesQuoteVersions/${quoteId}`)))
        .data ?? [];
  } finally {
    loading.value = false;
  }
}
const openPdf = (id: number) =>
  window.open(
    backendUrl(`/WebGetSalesQuoteVersionPdf/${id}`),
    "_blank",
    "noopener",
  );
const dateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("es-ES", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
const statusLabel = (value: string) =>
  (
    ({
      SENT: "Pendiente de respuesta",
      ACCEPTED: "Aceptada",
      REJECTED: "Rechazada",
      SUPERSEDED: "Sustituida",
    }) as Record<string, string>
  )[value] ?? value;
const statusSeverity = (value: string) =>
  (
    ({
      SENT: "warn",
      ACCEPTED: "success",
      REJECTED: "danger",
      SUPERSEDED: "secondary",
    }) as Record<string, string>
  )[value] ?? "info";
defineExpose({ open });
</script>
<style scoped>
.versions-loading,
.versions-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  min-height: 180px;
  color: var(--text-color-secondary);
}
.versions-empty {
  flex-direction: column;
}
.recipient-mail,
.response-note {
  display: block;
  margin-top: 0.2rem;
  color: var(--text-color-secondary);
}
.response-note {
  max-width: 240px;
  white-space: normal;
}
.kiwik-separator {
  margin-top: 1rem;
}
</style>
