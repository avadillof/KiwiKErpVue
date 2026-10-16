<template>
  <Dialog
    :visible="true"
    modal
    header="Preparación · Cocina y barra"
    :closable="!busy"
    :closeOnEscape="!busy"
    :pt="{
      header: { class: 'kiwik-dialog-header', style: { flexShrink: 0 } },
      content: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 0',
          minHeight: '0',
          overflow: 'auto',
        },
      },
      footer: { style: { flexShrink: 0 } },
    }"
    :style="{
      width: '98vw',
      maxWidth: '98vw',
      height: '96dvh',
      maxHeight: '96dvh',
    }"
    class="kitchen-dialog"
    @update:visible="emit('close')"
  >
    <section class="kitchen-controls" aria-label="Filtros de preparación">
      <div class="filter-field">
        <label for="kitchen-destination">Puesto de preparación</label>
        <Select
          inputId="kitchen-destination"
          v-model="destination"
          :options="destinations"
          optionLabel="label"
          optionValue="value"
          :disabled="busy"
        />
      </div>
      <div class="filter-field printer-field">
        <span class="printer-caption"
          >Impresora recordada para este módulo</span
        >
        <PrinterControls
          language="ESCPOS"
          :selectionContext="printerKey"
          :purpose="
            destination === 'KITCHEN' ? 'Comandas · cocina' : 'Comandas · barra'
          "
          :disabled="busy"
        />
      </div>
      <div class="filter-actions">
        <Button
          :label="history ? 'Ver pendientes' : 'Ver historial'"
          :icon="history ? 'pi pi-list' : 'pi pi-history'"
          outlined
          :disabled="busy"
          @click="history = !history"
        />
        <Button
          icon="pi pi-refresh"
          label="Actualizar"
          outlined
          :disabled="busy"
          @click="load"
        />
      </div>
    </section>
    <div class="kitchen-section-heading">
      <div>
        <h3>{{ history ? "Historial de comandas" : "Comandas pendientes" }}</h3>
        <span
          >{{ destination === "KITCHEN" ? "Cocina" : "Barra" }} · {{ total }}
          {{ total === 1 ? "comanda" : "comandas" }}</span
        >
      </div>
      <span class="refresh-status"
        ><i class="pi pi-sync" aria-hidden="true" /> Actualización cada 5
        s</span
      >
    </div>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <div v-if="!orders.length && !error" class="kitchen-empty" role="status">
      <div class="empty-icon">
        <i
          :class="history ? 'pi pi-history' : 'pi pi-check'"
          aria-hidden="true"
        />
      </div>
      <h3>{{ history ? "Todavía no hay comandas" : "Todo al día" }}</h3>
      <p>
        {{
          history
            ? "Las comandas enviadas a este puesto aparecerán aquí."
            : "No hay comandas pendientes en este puesto."
        }}
      </p>
      <span v-if="!history"
        >Envía una comanda desde una mesa para empezar.</span
      >
    </div>
    <div v-if="orders.length" class="orders">
      <article
        v-for="order in orders"
        :key="order.id"
        :class="['order', order.state]"
      >
        <header>
          <strong>{{ order.tableName }} · #{{ order.id }}</strong
          ><span>{{ age(order) }} min</span>
        </header>
        <small
          >{{ new Date(Number(order.createdAt)).toLocaleString("es-ES") }} ·
          {{ labels[order.state] }}</small
        >
        <ul>
          <li
            v-for="(item, i) in order.items"
            :key="i"
            :class="{ cancel: item.action === 'REMOVE' }"
          >
            <b
              >{{
                item.action === "REMOVE"
                  ? "ANULAR"
                  : item.action === "MOVE"
                    ? "CAMBIO DE MESA"
                    : "AÑADIR"
              }}
              · {{ Number(item.quantity).toLocaleString("es-ES") }} ×
              {{ item.name }}</b
            >
            <p v-if="item.fromTable">Desde {{ item.fromTable }}</p>
            <p v-if="item.modifiers.length">{{ item.modifiers.join(" · ") }}</p>
            <p v-if="item.note">{{ item.note }}</p>
          </li>
        </ul>
        <div class="actions">
          <Button
            v-if="next[order.state]"
            :label="actions[order.state]"
            :disabled="busy"
            @click="advance(order)"
          />
          <Button
            :label="
              order.printState === 'NOT_PRINTED' ? 'Imprimir' : 'Imprimir copia'
            "
            icon="pi pi-print"
            outlined
            :disabled="
              busy ||
              !printerId ||
              (order.printState === 'SENDING' &&
                now - Number(order.printAt || 0) < 120000)
            "
            @click="print(order)"
          />
        </div>
        <small>{{ printLabels[order.printState] || order.printState }}</small>
      </article>
    </div>
    <template #footer>
      <div class="kitchen-footer">
        <p class="print-hint">
          <i class="pi pi-info-circle" aria-hidden="true" /> Impresión manual
          por comanda. «Enviada a cola» no confirma la salida de papel.
        </p>
        <div class="kiwik-separator"></div>
        <div class="footer-row">
          <nav
            v-if="total > 50"
            class="pagination"
            aria-label="Páginas de comandas"
          >
            <Button
              label="Anterior"
              icon="pi pi-angle-left"
              outlined
              :disabled="busy || page === 0"
              @click="page--"
            />
            <span
              >{{ page + 1 }} / {{ Math.max(1, Math.ceil(total / 50)) }}</span
            >
            <Button
              label="Siguiente"
              icon="pi pi-angle-right"
              iconPos="right"
              outlined
              :disabled="busy || (page + 1) * 50 >= total"
              @click="page++"
            />
          </nav>
          <span v-else class="footer-count"
            >{{ total }} {{ total === 1 ? "comanda" : "comandas" }} ·
            {{ history ? "Historial" : "Pendientes" }}</span
          >
          <Button
            label="Cerrar"
            outlined
            :disabled="busy"
            @click="emit('close')"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import axios from "axios";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Select from "primevue/select";
import Message from "primevue/message";
import { useAuthStore } from "../../stores/authStore";
import { backendUrl } from "../../services/backendUrl";
import {
  printers,
  refreshPrintSettings,
  printKitchenOrder,
  printerSelections,
  kitchenSelectionKey,
  restoreKitchenSelection,
  isTicketLanguage,
} from "../../services/Printing/printerService";
import PrinterControls from "../../components/Printing/PrinterControls.vue";
import type { KitchenOrder } from "../../libs/printing/kitchenOrder";
const props = defineProps<{
  zoneId: number;
  initialDestination?: "KITCHEN" | "BAR";
}>();
const emit = defineEmits<{ close: [] }>();
const auth = useAuthStore();
const destination = ref(props.initialDestination || "KITCHEN"),
  history = ref(false),
  page = ref(0),
  total = ref(0);
const orders = ref<KitchenOrder[]>([]),
  busy = ref(false),
  error = ref(""),
  now = ref(Date.now());
const destinations = [
  { label: "Cocina", value: "KITCHEN" },
  { label: "Barra", value: "BAR" },
];
const labels: Record<string, string> = {
  PENDING: "Pendiente",
  COOKING: "En preparación",
  READY: "Lista",
  DONE: "Entregada",
};
const next: Record<string, string> = {
  PENDING: "COOKING",
  COOKING: "READY",
  READY: "DONE",
};
const actions: Record<string, string> = {
  PENDING: "Comenzar",
  COOKING: "Marcar lista",
  READY: "Entregada",
};
const printLabels: Record<string, string> = {
  NOT_PRINTED: "Sin imprimir",
  SENDING: "Envío en curso o sin confirmar",
  SUBMITTED: "Enviada a cola",
  UNKNOWN: "Salida desconocida: comprueba la impresora antes de copiar",
};
const printerKey = computed(() =>
  kitchenSelectionKey(props.zoneId, destination.value),
);
const printerId = computed(() => {
  const id = printerSelections.value[printerKey.value];
  return printers.value.some((p) => p.id === id && isTicketLanguage(p.language))
    ? id
    : "";
});
function restorePrinter() {
  restoreKitchenSelection(props.zoneId, destination.value);
}
function message(e: unknown) {
  return axios.isAxiosError(e)
    ? typeof e.response?.data === "string" && !e.response.data.includes("<")
      ? e.response.data
      : e.response?.data?.message ||
        "No se pudo confirmar la operación. Actualiza antes de repetir."
    : e instanceof Error
      ? e.message
      : "No se pudo completar la operación.";
}
let generation = 0,
  disposed = false,
  loading = false;
async function load() {
  if (loading || busy.value || disposed) return;
  loading = true;
  const version = ++generation;
  try {
    const { data } = await axios.get(backendUrl("/WebTpv/kitchen"), {
      ...auth.portalRequestConfig(),
      timeout: 12000,
      params: {
        zoneId: props.zoneId,
        destination: destination.value,
        history: history.value,
        page: page.value,
      },
    });
    if (!disposed && version === generation) {
      orders.value = data.items;
      total.value = data.total;
      error.value = "";
    }
  } catch (e) {
    if (!disposed && version === generation) error.value = message(e);
  } finally {
    loading = false;
  }
}
async function post(path: string, body: object) {
  return axios.post(
    backendUrl("/WebTpv/kitchen/" + path),
    { zoneId: props.zoneId, ...body },
    { ...auth.portalRequestConfig(), timeout: 15000 },
  );
}
async function advance(order: KitchenOrder) {
  busy.value = true;
  generation++;
  error.value = "";
  try {
    await post(order.id + "/state", {
      expected: order.state,
      next: next[order.state],
    });
  } catch (e) {
    error.value = message(e);
  } finally {
    busy.value = false;
    if (!error.value) await load();
  }
}
async function print(order: KitchenOrder) {
  busy.value = true;
  generation++;
  error.value = "";
  const selectedPrinter = printerId.value;
  let claim: KitchenOrder | undefined,
    submitted = false;
  try {
    claim = (
      await post(order.id + "/print", {
        copy: order.printState !== "NOT_PRINTED",
      })
    ).data;
    await printKitchenOrder(claim!, selectedPrinter);
    submitted = true;
    await post(order.id + "/print-result", {
      token: claim!.token,
      submitted: true,
    });
  } catch (e) {
    error.value = message(e);
    if (claim && !submitted)
      try {
        await post(order.id + "/print-result", {
          token: claim.token,
          submitted: false,
        });
      } catch {
        /* Leave uncertain print claim; never auto-repeat physical output. */
      }
  } finally {
    busy.value = false;
    if (!error.value) await load();
  }
}
function age(o: KitchenOrder) {
  return Math.max(0, Math.floor((now.value - Number(o.createdAt)) / 60000));
}
watch([destination, history], () => {
  generation++;
  orders.value = [];
  page.value = 0;
  restorePrinter();
  void load();
});
watch(page, () => {
  generation++;
  void load();
});
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
  refreshPrintSettings();
  restorePrinter();
  void load();
  timer = setInterval(() => {
    now.value = Date.now();
    if (!error.value) void load();
  }, 5000);
});
onUnmounted(() => {
  disposed = true;
  generation++;
  clearInterval(timer);
});
</script>
<style scoped>
/* The dialog footer is a flex container: wrap its separator and actions in one full-width block. */
.kitchen-footer {
  width: 100%;
  min-width: 0;
}
.kitchen-footer .kiwik-separator {
  display: block;
  width: 100%;
  margin: 0.85rem 0;
  flex: none;
}
.footer-row,
.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.footer-row {
  justify-content: space-between;
}
.pagination span {
  white-space: nowrap;
  min-width: 3.5rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.footer-count {
  font-size: 0.85rem;
  color: #687563;
}
.kitchen-controls {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: minmax(160px, 0.8fr) minmax(230px, 1.25fr) auto;
  gap: 1rem;
  align-items: end;
  padding: 1rem;
  background: #f7f9f3;
  border: 1px solid #e3e8d9;
  border-radius: 12px;
}
.filter-field {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}
.filter-field label,
.printer-caption {
  font-size: 0.8rem;
  font-weight: 600;
  color: #536047;
}
.filter-field :deep(.p-select) {
  width: 100%;
  min-width: 0;
  background: white;
}
.filter-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.kitchen-section-heading {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0 1rem;
}
.kitchen-section-heading h3 {
  font-size: 1.05rem;
  margin: 0 0 0.35rem;
  color: #253000;
}
.kitchen-section-heading span {
  font-size: 0.82rem;
  color: #687563;
}
.refresh-status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  white-space: nowrap;
}
.kitchen-empty {
  min-height: 230px;
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  border: 1px dashed #dce4cf;
  border-radius: 12px;
  background: #fcfdf9;
}
.empty-icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: #edf4da;
  color: #718d08;
  margin-bottom: 1rem;
}
.empty-icon i {
  font-size: 1.4rem;
}
.kitchen-empty h3 {
  margin: 0 0 0.5rem;
  color: #253000;
  font-size: 1.1rem;
}
.kitchen-empty p {
  margin: 0;
  color: #606d54;
  font-size: 0.9rem;
}
.kitchen-empty > span {
  margin-top: 0.5rem;
  color: #7c8673;
  font-size: 0.82rem;
}
.print-hint {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  text-align: left;
  margin: 1rem 0 0;
  color: #687563;
  font-size: 0.78rem;
  font-weight: 400;
  line-height: 1.5;
}
@media (max-width: 800px) {
  .kitchen-controls {
    grid-template-columns: 1fr 1fr;
  }
  .filter-actions {
    grid-column: 1/-1;
    justify-content: flex-end;
  }
  .kitchen-section-heading {
    align-items: flex-start;
  }
  .refresh-status {
    white-space: normal;
  }
}
@media (max-width: 520px) {
  .kitchen-controls {
    grid-template-columns: 1fr;
  }
  .filter-actions {
    justify-content: flex-start;
  }
  .kitchen-section-heading {
    flex-direction: column;
    gap: 0.5rem;
  }
  .footer-row {
    flex-wrap: wrap;
  }
  .footer-row > .p-button {
    margin-left: auto;
  }
  .pagination {
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .kitchen-empty {
    min-height: 190px;
  }
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}
.hint {
  color: #687563;
  font-size: 0.85rem;
}
.orders {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: 1rem;
  flex: 1 1 0;
  min-height: 160px;
  align-items: start;
  overflow: auto;
  padding: 0.5rem 0;
}
.order {
  border: 1px solid #dce3d4;
  border-top: 4px solid #d9a325;
  border-radius: 14px;
  padding: 1rem;
  background: #fff;
}
.order.COOKING {
  border-top-color: #327bb5;
}
.order.READY {
  border-top-color: #9cc10a;
}
.order.DONE {
  opacity: 0.75;
  border-top-color: #aaa;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 0.8rem 0;
  border-bottom: 1px solid #edf0e8;
}
li p {
  margin: 0.35rem 0;
}
.cancel {
  color: #bb2222;
}
.actions {
  margin: 1rem 0;
}
.order > small {
  color: #66705e;
}
</style>

<style scoped>
.printer-field :deep(.printer-controls) {
  margin: 0;
  gap: 0.4rem;
}
.printer-field :deep(.printer-controls .p-select) {
  width: 100%;
  min-width: 0;
}
</style>
