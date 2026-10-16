<template>
  <Dialog
    :visible="visible"
    header="Informes de cierre de caja"
    modal
    class="kiwik-dialog"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
    :style="{ width: 'min(780px,96vw)' }"
    :closable="!working"
    :close-on-escape="!working"
    @update:visible="$emit('close')"
  >
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <Message v-if="notice" severity="success" :closable="false">{{
      notice
    }}</Message>
    <template v-if="selected">
      <Button
        label="Ver histórico de la zona"
        icon="pi pi-history"
        text
        :disabled="working"
        @click="
          selected = null;
          load(true);
        "
      />
      <h3>
        {{ selected.code }} · {{ selected.zoneName }} ·
        {{ selected.registerName }}
      </h3>
      <p>
        Informe guardado al cerrar. Los importes corresponden a aquella
        apertura.
      </p>
      <div class="closure-table-wrap">
        <table class="closure-table">
          <tbody>
            <tr v-for="(row, i) in closureRows(selected)" :key="i">
              <th>{{ row[0] }}</th>
              <td>{{ row[1] }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <section
        v-if="selected.status === 'PENDING_RECONCILIATION' && auth.user?.admin"
        class="reconciliation"
      >
        <h4>Registrar recuento físico</h4>
        <p>
          Se añade un acta de arqueo sin modificar el informe original del
          cierre remoto.
        </p>
        <label for="reconcile-cash">Efectivo contado</label
        ><InputNumber
          input-id="reconcile-cash"
          v-model="counted"
          locale="de-DE"
          :min="0"
          :max-fraction-digits="2"
          :disabled="working"
        />
        <p v-if="reconciliationDifference !== null" role="status">
          Diferencia con el cierre:
          {{
            reconciliationDifference.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })
          }}
          ·
          {{
            reconciliationDifference < 0
              ? "Falta efectivo"
              : reconciliationDifference > 0
                ? "Sobra efectivo"
                : "Caja cuadrada"
          }}
        </p>
        <label for="reconcile-reason"
          >Motivo (obligatorio si hay diferencia)</label
        ><InputText
          id="reconcile-reason"
          v-model="reconcileReason"
          maxlength="500"
          :disabled="working"
        />
        <Button
          label="Guardar arqueo definitivo"
          :disabled="
            working ||
            counted === null ||
            (reconciliationDifference !== 0 && !reconcileReason.trim())
          "
          @click="reconcile"
        />
      </section>
      <Message
        v-else-if="selected.status === 'PENDING_RECONCILIATION'"
        severity="warn"
        :closable="false"
        >Este cierre está pendiente de arqueo. Solo un administrador puede
        registrar el recuento físico.</Message
      >
    </template>
    <template v-else>
      <p>
        Histórico de esta zona. Los cierres anteriores a esta función no tienen
        informe archivado.
      </p>
      <p v-if="loading" role="status">Cargando cierres…</p>
      <p v-else-if="!reports.length">No hay informes de cierre guardados.</p>
      <Button
        v-for="r in reports"
        :key="r.openingId"
        :label="`${r.code} · ${r.registerName} · ${r.closedAt?.replace('T', ' ')}${r.status === 'PENDING_RECONCILIATION' ? ' · Pendiente de arqueo' : ''}`"
        outlined
        class="closure-entry"
        @click="selected = r"
      />
      <Button
        v-if="more"
        label="Cargar más antiguos"
        :loading="loading"
        @click="load(false)"
      />
    </template>
    <template #footer
      ><div class="closure-actions">
        <div class="kiwik-separator" />
        <Button
          label="Cerrar"
          text
          :disabled="working"
          @click="$emit('close')"
        /><Button
          v-if="selected"
          label="Descargar PDF"
          icon="pi pi-file-pdf"
          :disabled="working"
          @click="perform()"
        /></div
    ></template>
  </Dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Message from "primevue/message";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import { backendUrl } from "../../services/backendUrl";
import { useAuthStore } from "../../stores/authStore";
import { closureRows, downloadClosure, type TpvClosure } from "./tpvClosure";
const props = defineProps<{
  visible: boolean;
  zoneId: number | null;
  report: TpvClosure | null;
}>();
defineEmits<{ close: [] }>();
const auth = useAuthStore();
const counted = ref<number | null>(null),
  reconcileReason = ref("");
async function reconcile() {
  if (!selected.value || counted.value === null || working.value) return;
  working.value = true;
  error.value = "";
  try {
    const { data } = await axios.post<TpvClosure>(
      backendUrl(`/WebTpv/openings/${selected.value.openingId}/reconcile`),
      { amount: counted.value, reason: reconcileReason.value },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    selected.value = data;
    notice.value = "Arqueo guardado.";
  } catch (e) {
    error.value =
      axios.isAxiosError(e) && typeof e.response?.data === "string"
        ? e.response.data
        : "No se pudo guardar el arqueo. Consulta el histórico antes de repetir.";
  } finally {
    working.value = false;
  }
}
const selected = ref<TpvClosure | null>(null),
  reports = ref<TpvClosure[]>([]);
// Match the server's counted-minus-expected calculation before the definitive save.
const reconciliationDifference = computed(() =>
  counted.value === null || !selected.value
    ? null
    : Math.round((counted.value - Number(selected.value.expectedCash)) * 100) /
      100,
);
watch(
  () => selected.value?.openingId,
  () => {
    counted.value = null;
    reconcileReason.value = "";
  },
);
const loading = ref(false),
  working = ref(false),
  more = ref(false),
  error = ref(""),
  notice = ref("");
watch(
  () => props.visible,
  (open) => {
    if (open) {
      selected.value = props.report;
      error.value = "";
      notice.value = "";
      if (!selected.value) void load(true);
    }
  },
);
async function load(reset: boolean) {
  if (loading.value || props.zoneId == null) return;
  loading.value = true;
  error.value = "";
  if (reset) reports.value = [];
  try {
    const { data } = await axios.get<TpvClosure[]>(
      backendUrl("/WebTpv/closures"),
      {
        ...auth.portalRequestConfig(),
        params: {
          zoneId: props.zoneId,
          before: reset ? undefined : reports.value.at(-1)?.openingId,
        },
        timeout: 15000,
      },
    );
    reports.value.push(...data);
    more.value = data.length === 25;
  } catch {
    error.value = "No se pudo cargar el histórico de cierres.";
  } finally {
    loading.value = false;
  }
}
async function perform() {
  if (!selected.value || working.value) return;
  working.value = true;
  error.value = "";
  notice.value = "";
  try {
    await downloadClosure(selected.value);
    notice.value = "Informe descargado.";
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "No se pudo generar el informe.";
  } finally {
    working.value = false;
  }
}
</script>
<style scoped>
.reconciliation {
  display: grid;
  gap: 8px;
  margin: 12px 0 4px;
  padding: 12px 14px;
  background: #f4f7ee;
  border-radius: 10px;
}
.reconciliation h4 {
  margin: 0;
  font-size: 14px;
}
.reconciliation p {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
}
.reconciliation label {
  font-size: 12px;
  font-weight: 700;
}
.closure-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}
.closure-table-wrap {
  max-height: min(46vh, 400px);
  overflow-y: auto;
  margin: 16px 0;
  border: 1px solid #e6ebdd;
  border-radius: 10px;
  padding: 0 12px;
}
.closure-table-wrap .closure-table {
  margin: 0;
}
.closure-table th,
.closure-table td {
  padding: 9px;
  text-align: left;
  border-bottom: 1px solid #e0e5da;
  overflow-wrap: anywhere;
}
.closure-table th {
  width: 45%;
  color: #405000;
}
.closure-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}
.closure-actions > .kiwik-separator {
  flex-basis: 100%;
  width: 100%;
}
.closure-entry {
  display: block;
  width: 100%;
  text-align: left;
  margin: 8px 0;
}
</style>
