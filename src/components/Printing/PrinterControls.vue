<template>
  <div class="printer-controls">
    <span class="printer-purpose">{{ purposeLabel }}</span>
    <Select
      :model-value="selectedId"
      :options="compatible"
      option-label="name"
      option-value="id"
      :placeholder="purposeLabel"
      :aria-label="purposeLabel"
      :disabled="printing || disabled"
      @update:model-value="selectPrinter"
    />
    <small v-if="selected" class="printer-destination"
      ><i class="pi pi-print" aria-hidden="true" /> {{ selected.name }} ·
      {{ selected.queue || selected.host || selected.uid }}</small
    >
    <Button
      v-if="showSettings"
      label="Configurar impresoras"
      icon="pi pi-cog"
      outlined
      :disabled="printing || disabled"
      @click="openSettings"
    />
    <Button
      v-if="zpl !== undefined"
      label="Imprimir"
      icon="pi pi-print"
      :loading="printing"
      :disabled="disabled || !selected || !zpl"
      @click="printLabel"
    />
    <small v-if="message || printerStorageError" class="status" role="status">{{
      message || printerStorageError
    }}</small>
  </div>
  <Dialog
    v-model:visible="settings"
    modal
    header="Impresoras de este puesto"
    class="kiwik-dialog"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
    :style="{ width: 'min(850px, 96vw)' }"
    :closable="!discovering"
    :close-on-escape="!discovering"
  >
    <p>
      La lista es común para etiquetas y tickets y se guarda en este navegador.
      Cada módulo recuerda su destino por separado en este puesto: tickets por
      caja, cocina y barra por zona.
    </p>
    <div class="settings-grid">
      <section class="destinations">
        <Button
          label="Nueva impresora"
          icon="pi pi-plus"
          :disabled="discovering"
          @click="create"
        />
        <button
          v-for="printer in printers"
          :key="printer.id"
          type="button"
          :disabled="discovering"
          :class="{ selected: draft.id === printer.id }"
          @click="edit(printer)"
        >
          <strong>{{ printer.name }}</strong
          ><small
            >{{
              printer.language === "ZPL"
                ? "Etiquetas · ZPL"
                : printer.language === "PLAIN"
                  ? "Tickets · Texto plano"
                  : "Tickets · ESC/POS"
            }}
            ·
            {{
              printer.transport === "zebra" ? "Browser Print" : "QZ Tray"
            }}</small
          >
        </button>
        <p v-if="!printers.length">No hay impresoras configuradas.</p>
      </section>
      <section class="printer-form">
        <label
          >Nombre<InputText
            v-model="draft.name"
            :disabled="discovering"
            maxlength="100"
            fluid
        /></label>
        <label
          >Uso<Select
            v-model="draft.language"
            :options="languages"
            option-label="label"
            option-value="value"
            :disabled="discovering"
            fluid
            @update:model-value="languageChanged"
        /></label>
        <label
          >Conexión<Select
            v-model="draft.transport"
            :options="transports"
            option-label="label"
            option-value="value"
            :disabled="discovering"
            fluid
            @update:model-value="resetDevices"
        /></label>
        <template v-if="draft.transport === 'qz'">
          <p class="help">
            Instala
            <a
              href="https://qz.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              >QZ Tray</a
            >
            y registra la impresora USB o de red en el sistema operativo con un
            controlador que admita impresión RAW. Autoriza KiwiKERP cuando QZ
            Tray lo solicite.
          </p>
          <Button
            label="Buscar impresoras con QZ Tray"
            icon="pi pi-search"
            outlined
            class="discover-btn"
            :loading="discovering"
            @click="discover"
          />
          <Select
            v-if="queues.length"
            :options="queues"
            :model-value="draft.queue"
            placeholder="Selecciona el destino encontrado"
            aria-label="Impresora encontrada"
            :disabled="discovering"
            @update:model-value="chooseQueue"
          />
          <label
            >Nombre exacto en el sistema<InputText
              v-model="draft.queue"
              :disabled="discovering"
              fluid
          /></label>
          <small
            >Sin firma de confianza, QZ Tray puede pedir confirmación por
            trabajo. Guardar aquí no imprime.</small
          >
        </template>
        <template v-else>
          <p class="help">
            Mantén abierto
            <a
              href="https://www.zebra.com/es/es/support-downloads/software/printer-software/browser-print.html"
              target="_blank"
              rel="noopener noreferrer"
              >Zebra Browser Print</a
            >. Las impresoras de red deben estar registradas también allí.
          </p>
          <Button
            label="Buscar en Browser Print"
            icon="pi pi-search"
            outlined
            :loading="discovering"
            @click="discover"
          />
          <Select
            v-if="devices.length"
            :options="devices"
            option-label="name"
            option-value="uid"
            :model-value="draft.uid"
            placeholder="Dispositivo encontrado"
            :disabled="discovering"
            @update:model-value="chooseDevice"
          />
          <label
            >IP / nombre del equipo<InputText
              v-model="draft.host"
              :disabled="discovering"
              fluid
              @update:model-value="draft.uid = ''"
          /></label>
          <label
            >Puerto<InputNumber
              v-model="draft.port"
              :min="1"
              :max="65535"
              :use-grouping="false"
              :disabled="discovering"
              fluid
              @update:model-value="draft.uid = ''"
          /></label>
          <small v-if="draft.uid">Dispositivo vinculado: {{ draft.uid }}</small>
        </template>
        <template
          v-if="draft.language === 'ESCPOS' || draft.language === 'PLAIN'"
        >
          <label
            >Papel / caracteres por línea<Select
              v-model="draft.columns"
              :options="widths"
              option-label="label"
              option-value="value"
              :disabled="discovering"
              fluid
          /></label>
          <template v-if="draft.language === 'ESCPOS'">
            <label
              >Índice de tabla CP858<InputNumber
                v-model="draft.codePage"
                :min="0"
                :max="127"
                :use-grouping="false"
                :disabled="discovering"
                fluid
            /></label>
            <small
              >19 es habitual en Epson. Comprueba en el manual del modelo qué
              índice corresponde a CP858 para tildes y ñ.</small
            >
            <label class="cut"
              ><Checkbox
                v-model="draft.cut"
                binary
                :disabled="discovering"
                input-id="receipt-cut"
              /><span
                >Cortar al terminar (solo si dispone de cortador)</span
              ></label
            >
          </template>
          <small v-else
            >Se imprime con el controlador del sistema: vale para impresoras
            láser o de oficina, con tildes y ñ.</small
          >
        </template>
      </section>
    </div>
    <Message
      v-if="settingsMessage || printerStorageError"
      severity="info"
      :closable="false"
      >{{ settingsMessage || printerStorageError }}</Message
    >
    <template #footer
      ><div class="printer-footer">
        <div class="kiwik-separator" />
        <div class="footer-actions">
          <Button
            v-if="draft.id"
            label="Eliminar"
            icon="pi pi-trash"
            severity="danger"
            text
            :disabled="discovering"
            @click="remove"
          /><Button
            label="Cerrar"
            text
            :disabled="discovering"
            @click="settings = false"
          /><Button
            label="Guardar impresora"
            icon="pi pi-save"
            :disabled="discovering || !!printerStorageError"
            @click="save"
          />
        </div></div
    ></template>
  </Dialog>
</template>

<script setup lang="ts">
import { createUuid } from "@/libs/createUuid";
import { computed, nextTick, onMounted, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Select from "primevue/select";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import {
  printers,
  printerSelections,
  printerStorageError,
  selectionKey,
  isTicketLanguage,
  refreshPrintSettings,
  persistPrintSettings,
  printRawProfile,
  validProfile,
  type PrinterProfile,
  type PrintLanguage,
} from "../../services/Printing/printerService";
import { discoverQzPrinters } from "../../services/Printing/qzTransport";
import { loadBrowserPrintSdk } from "../../libs/labels/zplGenerator";
const props = withDefaults(
  defineProps<{
    language?: PrintLanguage;
    registerId?: string;
    selectionContext?: string;
    purpose?: string;
    zpl?: string;
    disabled?: boolean;
    showSettings?: boolean;
  }>(),
  { language: "ZPL", registerId: "", disabled: false, showSettings: true },
);
const toast = useToast();
const compatible = computed(() =>
  printers.value.filter(
    (p) =>
      p.language === props.language ||
      (isTicketLanguage(p.language) && isTicketLanguage(props.language)),
  ),
);
const key = computed(
  () =>
    props.selectionContext || selectionKey(props.language, props.registerId),
);
const purposeLabel = computed(
  () =>
    props.purpose ||
    (props.language === "ZPL" ? "Etiquetas" : "Tickets de venta · esta caja"),
);
const selectedId = computed(() => printerSelections.value[key.value] || "");
const selected = computed(() =>
  compatible.value.find((p) => p.id === selectedId.value),
);
const settings = ref(false),
  printing = ref(false),
  discovering = ref(false);
const message = ref(""),
  settingsMessage = ref("");
const queues = ref<string[]>([]);
const devices = ref<Array<{ uid: string; name: string }>>([]);
const blank = (): PrinterProfile => ({
  id: "",
  name: "",
  language: props.language,
  transport: props.language === "ZPL" ? "zebra" : "qz",
  queue: "",
  uid: "",
  host: "",
  port: 9100,
  columns: 48,
  codePage: 19,
  cut: false,
});
const draft = ref<PrinterProfile>(blank());
const languages = [
  { label: "Etiquetas · ZPL", value: "ZPL" },
  { label: "Tickets · ESC/POS", value: "ESCPOS" },
  { label: "Tickets · Texto plano (láser/oficina)", value: "PLAIN" },
];
const widths = [
  { label: "58 mm · 32 caracteres", value: 32 },
  { label: "80 mm · 42 caracteres", value: 42 },
  { label: "80 mm · 48 caracteres", value: 48 },
];
const transports = computed(() =>
  draft.value.language === "ZPL"
    ? [
        { label: "Zebra Browser Print", value: "zebra" },
        { label: "QZ Tray · USB o red del sistema", value: "qz" },
      ]
    : [{ label: "QZ Tray · USB o red del sistema", value: "qz" }],
);
const detail = (e: unknown) =>
  e instanceof Error ? e.message : "No se pudo completar la operación.";
onMounted(refreshPrintSettings);
function resetDevices() {
  queues.value = [];
  devices.value = [];
}
function languageChanged() {
  if (draft.value.language !== "ZPL") draft.value.transport = "qz";
  resetDevices();
}
function openSettings() {
  refreshPrintSettings();
  draft.value = selected.value ? { ...selected.value } : blank();
  settingsMessage.value = "";
  resetDevices();
  settings.value = true;
}
async function create() {
  draft.value = blank();
  resetDevices();
  settingsMessage.value = "";
  await nextTick();
  document.querySelector<HTMLInputElement>(".printer-form input")?.focus();
}
function edit(profile: PrinterProfile) {
  draft.value = { ...profile };
  resetDevices();
  settingsMessage.value = "";
}
function selectPrinter(id: string) {
  if (!compatible.value.some((p) => p.id === id)) return;
  try {
    persistPrintSettings(printers.value, {
      ...printerSelections.value,
      [key.value]: id,
    });
    message.value = "";
  } catch (e) {
    message.value = detail(e);
  }
}
async function discover() {
  if (discovering.value) return;
  discovering.value = true;
  settingsMessage.value = "";
  resetDevices();
  try {
    if (draft.value.transport === "qz")
      queues.value = await discoverQzPrinters();
    else {
      await loadBrowserPrintSdk();
      const bp = window.BrowserPrint;
      if (!bp?.getLocalDevices)
        throw new Error(
          "No se pudo cargar Browser Print. Comprueba su instalación.",
        );
      devices.value = await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () =>
            reject(
              new Error(
                "Browser Print no responde. Comprueba que esté abierto.",
              ),
            ),
          10000,
        );
        bp.getLocalDevices(
          (found: any[]) => {
            clearTimeout(timer);
            resolve(Array.isArray(found) ? found : []);
          },
          () => {
            clearTimeout(timer);
            reject(new Error("No se pudo consultar Browser Print."));
          },
          "printer",
        );
      });
    }
    if (!queues.value.length && !devices.value.length)
      settingsMessage.value =
        "No se han encontrado impresoras. Revisa su instalación en el puesto.";
  } catch (e) {
    settingsMessage.value = detail(e);
  } finally {
    discovering.value = false;
  }
}
function chooseQueue(queue: string) {
  draft.value.queue = queue;
  if (!draft.value.name) draft.value.name = queue;
}
function chooseDevice(uid: string) {
  const device = devices.value.find((p) => p.uid === uid);
  if (!device) return;
  draft.value.uid = uid;
  if (!draft.value.name) draft.value.name = device.name;
}
function save() {
  const profile = {
    ...draft.value,
    id: draft.value.id || createUuid(),
    name: draft.value.name.trim(),
    queue: draft.value.queue.trim(),
    host: draft.value.host.trim(),
  };
  if (!validProfile(profile)) {
    settingsMessage.value =
      "Revisa nombre, destino y configuración de la impresora.";
    return;
  }
  if (
    printers.value.some(
      (p) =>
        p.id !== profile.id &&
        p.name.toLocaleLowerCase() === profile.name.toLocaleLowerCase(),
    )
  ) {
    settingsMessage.value = "Ya existe una impresora con ese nombre.";
    return;
  }
  try {
    const list = [
      ...printers.value.filter((p) => p.id !== profile.id),
      profile,
    ];
    // Clear incompatible old selections when changing a profile's language.
    const selections = Object.fromEntries(
      Object.entries(printerSelections.value).filter(
        ([k, id]) =>
          id !== profile.id ||
          (k === "labels"
            ? profile.language === "ZPL"
            : isTicketLanguage(profile.language)),
      ),
    );
    if (
      profile.language === props.language ||
      (isTicketLanguage(profile.language) && isTicketLanguage(props.language))
    )
      selections[key.value] = profile.id;
    persistPrintSettings(list, selections);
    draft.value = profile;
    settingsMessage.value = "";
    settings.value = false;
    toast.add({
      severity: "success",
      summary: "Impresora guardada",
      detail: "No se ha enviado ningún trabajo.",
      life: 3000,
    });
  } catch (e) {
    settingsMessage.value = detail(e);
  }
}
function remove() {
  try {
    persistPrintSettings(
      printers.value.filter((p) => p.id !== draft.value.id),
      Object.fromEntries(
        Object.entries(printerSelections.value).filter(
          ([, id]) => id !== draft.value.id,
        ),
      ),
    );
    draft.value = blank();
    settingsMessage.value = "Impresora eliminada de este navegador.";
  } catch (e) {
    settingsMessage.value = detail(e);
  }
}
async function printLabel() {
  if (printing.value || !selected.value || !props.zpl) return;
  printing.value = true;
  message.value = "";
  try {
    message.value = await printRawProfile(selected.value, props.zpl, "ZPL");
  } catch (e) {
    message.value = detail(e);
  } finally {
    printing.value = false;
  }
}
</script>

<style scoped>
.printer-purpose {
  font-size: 0.8rem;
  font-weight: 700;
  color: #536047;
  width: 100%;
}
.printer-destination {
  width: 100%;
  font-size: 0.78rem;
  color: #687563;
  overflow-wrap: anywhere;
}
.printer-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}
.printer-controls :deep(.p-select) {
  min-width: 200px;
  max-width: 100%;
}
.status {
  width: 100%;
  line-height: 1.5;
}
.settings-grid {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 24px;
}
.destinations {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 520px;
  overflow: auto;
}
.destinations > button:not(.p-button) {
  display: grid;
  gap: 5px;
  text-align: left;
  padding: 14px;
  border: 1px solid #dce4d5;
  background: white;
  border-radius: 10px;
  color: #253000;
  font: inherit;
  cursor: pointer;
  overflow-wrap: anywhere;
}
.destinations > button.selected {
  background: #f2f7e6;
  border-color: #9cc10a;
}
.printer-form {
  display: grid;
  gap: 12px;
  max-height: 55vh;
  overflow: auto;
  padding: 2px 6px;
}
.printer-form label {
  display: grid;
  gap: 6px;
  font-weight: 600;
}
.printer-form label.cut {
  display: flex;
  align-items: center;
  gap: 10px;
}
small,
.help {
  color: #647064;
  line-height: 1.5;
}
.help {
  margin: 0;
}
.printer-form :deep(.discover-btn) {
  width: 100%;
  min-height: 58px;
  font-size: 17px;
  font-weight: 800;
  border-width: 2px;
}
.printer-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.kiwik-separator {
  height: 1.5px;
  background: #9cc10a;
  width: 100%;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}
@media (max-width: 650px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .destinations {
    max-height: 140px;
  }
  .printer-form {
    max-height: 40vh;
  }
}
</style>
