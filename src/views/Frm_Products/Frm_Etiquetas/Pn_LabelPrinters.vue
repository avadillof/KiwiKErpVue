<template>
  <div class="printer-controls">
    <Select :modelValue="selectedPrinterId" :options="labelPrinters" optionLabel="name" optionValue="id" placeholder="Selecciona impresora" :disabled="printing" aria-label="Impresora de destino" @update:modelValue="selectPrinter" />
    <Button label="Configurar impresoras" icon="pi pi-cog" severity="secondary" size="small" :disabled="printing" @click="openSettings" />
    <Button v-if="zpl !== undefined" label="Imprimir" icon="pi pi-print" size="small" :loading="printing" :disabled="!selected || !zpl" @click="print" />
    <small v-if="message || printerStorageError" class="status" role="status">{{ message || printerStorageError }}</small>
  </div>
  <Dialog v-model:visible="showSettings" modal header="Configuración de impresoras" :style="{ width: 'min(900px, 96vw)' }">
    <p class="help">Configuración de este navegador y puesto de trabajo. No se comparte entre ordenadores. Elige la impresora antes de cada envío.</p>
    <div class="browser-print-install">
      <i class="pi pi-desktop install-icon" aria-hidden="true"></i>
      <div class="install-copy">
        <strong>Zebra Browser Print</strong>
        <span>Instálalo en este ordenador y mantenlo abierto para imprimir desde KiwiKERP.</span>
      </div>
      <a
        class="install-link"
        href="https://www.zebra.com/es/es/support-downloads/software/printer-software/browser-print.html"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Descargar Zebra Browser Print desde la web oficial (se abre en otra pestaña)"
      >
        <i class="pi pi-download" aria-hidden="true"></i>
        <span>Descargar en Zebra</span>
        <i class="pi pi-external-link" aria-hidden="true"></i>
      </a>
    </div>
    <div class="settings-layout">
      <section class="printer-list">
        <Button label="Nueva impresora" icon="pi pi-plus" size="small" @click="create" />
        <button v-for="printer in labelPrinters" :key="printer.id" class="printer-row" :class="{ active: draft.id === printer.id }" type="button" @click="edit(printer)">
          <strong>{{ printer.name }}</strong>
          <small>Zebra Browser Print · {{ printer.host || 'USB' }}{{ printer.host ? ':' + printer.port : '' }}</small>
        </button>
        <small v-if="!labelPrinters.length">No hay impresoras configuradas.</small>
      </section>
      <section class="printer-form">
        <label class="full">Nombre<InputText v-model="draft.name" fluid /></label>
        <label class="full">Conexión<InputText modelValue="Zebra Browser Print" readonly fluid /></label>
          <p class="help full">Añade la IP y el puerto en la aplicación Zebra Browser Print. Después pulsa «Buscar» y selecciona el dispositivo. También puedes registrar aquí su dirección exacta; debe coincidir con la configurada en Browser Print.</p>
          <Button label="Buscar en Browser Print" icon="pi pi-search" severity="secondary" size="small" :loading="discovering" class="full" @click="discover" />
          <Select v-if="devices.length" :modelValue="draft.uid" :options="devices" optionLabel="name" optionValue="uid" placeholder="Dispositivo encontrado" class="full" aria-label="Dispositivo de Browser Print" @update:modelValue="chooseDevice" />
        <label>IP / nombre del equipo<InputText v-model="draft.host" placeholder="192.168.1.50" fluid @update:modelValue="draft.uid = ''" /></label>
        <label>Puerto<InputNumber v-model="draft.port" :min="1" :max="65535" :useGrouping="false" fluid @update:modelValue="draft.uid = ''" /></label>
        <small class="help full">Dirección TCP de la impresora. Browser Print realiza la conexión; el navegador no abre un socket TCP directo.</small>
        <small v-if="draft.uid" class="full">Dispositivo vinculado: {{ draft.uid }}</small>
        <p v-if="settingsMessage" class="status full" role="status">{{ settingsMessage }}</p>
      </section>
    </div>
    <template #footer>
      <div class="printer-footer">
        <div class="kiwik-separator" />
        <div class="footer-actions">
          <Button v-if="draft.id" label="Eliminar" icon="pi pi-trash" severity="danger" text @click="remove" />
          <Button label="Cerrar" severity="secondary" text @click="showSettings = false" />
          <Button label="Guardar impresora" icon="pi pi-save" @click="save" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import { labelPrinters, selectedPrinterId, printerStorageError, refreshPrinters, persistPrinters, discoverPrinters, printToConfiguredPrinter, type LabelPrinter } from '../../../services/Labels/labelPrinterService';

const props = defineProps<{ zpl?: string }>();
const selected = computed(() => labelPrinters.value.find(p => p.id === selectedPrinterId.value));
const printing = ref(false);
const message = ref('');
const showSettings = ref(false);
const discovering = ref(false);
const settingsMessage = ref('');
const devices = ref<any[]>([]);
const blank = (): LabelPrinter => ({ id: '', name: '', kind: 'zebra', host: '', port: 9100, uid: '' });
const draft = ref<LabelPrinter>(blank());
onMounted(refreshPrinters);
function openSettings(): void {
  refreshPrinters();
  draft.value = selected.value ? { ...selected.value } : blank();
  settingsMessage.value = '';
  showSettings.value = true;
}
async function create(): Promise<void> {
  draft.value = blank();
  settingsMessage.value = '';
  await nextTick();
}
function edit(printer: LabelPrinter): void {
  draft.value = { ...printer };
  settingsMessage.value = '';
}
function selectPrinter(id: string): void {
  try { persistPrinters(labelPrinters.value, id); message.value = ''; }
  catch { message.value = 'No se ha podido guardar la selección en este navegador.'; }
}
async function discover(): Promise<void> {
  discovering.value = true;
  settingsMessage.value = '';
  try {
    devices.value = await discoverPrinters();
    if (!devices.value.length) settingsMessage.value = 'Browser Print no ha encontrado impresoras. Añádelas en su configuración.';
  } catch (error) { settingsMessage.value = (error as Error).message; }
  finally { discovering.value = false; }
}
function chooseDevice(uid: string): void {
  const device = devices.value.find(d => d.uid === uid);
  if (!device) return;
  draft.value.uid = uid;
  if (!draft.value.name) draft.value.name = device.name;
  const address = /^([^:]+):(\d+)$/.exec(uid);
  draft.value.host = address?.[1] || '';
  draft.value.port = address ? Number(address[2]) : 9100;
}
function save(): void {
  const printer = { ...draft.value, name: draft.value.name.trim(), host: draft.value.host.trim() };
  if (!printer.name || !Number.isInteger(printer.port) || printer.port < 1 || printer.port > 65535 ||
    (!printer.uid && !/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(printer.host))) {
    settingsMessage.value = 'Indica un nombre, una IP o nombre de equipo válido (sin http:// ni ruta) y un puerto entre 1 y 65535. Para USB selecciona un dispositivo encontrado.';
    return;
  }
  if (labelPrinters.value.some(p => p.id !== printer.id && p.name.toLocaleLowerCase() === printer.name.toLocaleLowerCase())) {
    settingsMessage.value = 'Ya existe una impresora con ese nombre.';
    return;
  }
  printer.id ||= crypto.randomUUID();
  const list = labelPrinters.value.filter(p => p.id !== printer.id);
  try {
    persistPrinters([...list, printer], printer.id);
    draft.value = printer;
    settingsMessage.value = 'Impresora guardada y seleccionada en este navegador.';
  } catch { settingsMessage.value = 'No se ha podido guardar. Comprueba el almacenamiento del navegador.'; }
}
function remove(): void {
  const list = labelPrinters.value.filter(p => p.id !== draft.value.id);
  try {
    persistPrinters(list, selectedPrinterId.value === draft.value.id ? '' : selectedPrinterId.value);
    draft.value = blank();
    settingsMessage.value = 'Impresora eliminada de este navegador.';
  } catch { settingsMessage.value = 'No se ha podido eliminar la impresora.'; }
}
async function print(): Promise<void> {
  if (printing.value || !props.zpl || !selected.value) return;
  printing.value = true;
  message.value = '';
  try { message.value = (await printToConfiguredPrinter(props.zpl)).message; }
  catch { message.value = 'No se ha podido completar el envío. Comprueba el destino antes de repetir.'; }
  finally { printing.value = false; }
}
</script>

<style scoped>
.browser-print-install {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border: 1px solid #dfe8c8;
  border-radius: 10px;
  background: #f7faef;
}
.install-icon { color: #648506; font-size: 1.5rem; }
.install-copy { display: flex; flex: 1 1 240px; flex-direction: column; gap: 4px; }
.install-copy strong { color: #344054; font-size: .88rem; }
.install-copy span { color: #667085; font-size: .78rem; line-height: 1.5; }
.install-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #9cc10a;
  border-radius: 7px;
  color: #253000;
  background: #fff;
  font-size: .8rem;
  font-weight: 600;
  text-decoration: none;
}
.install-link:hover { background: #eef5d9; }
.install-link:focus-visible { outline: 2px solid #648506; outline-offset: 3px; }
.printer-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.printer-controls > :first-child { min-width: 220px; }
.status { flex-basis: 100%; color: #475467; line-height: 1.5; }
.help { color: #667085; font-size: .82rem; line-height: 1.5; margin: 0 0 12px; }
.settings-layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 20px; }
.printer-list { display: flex; flex-direction: column; gap: 10px; }
.printer-row { display: flex; flex-direction: column; gap: 5px; padding: 12px; border: 1px solid #d0d5dd; border-radius: 8px; background: #fff; text-align: left; cursor: pointer; overflow-wrap: anywhere; }
.printer-row.active { border-color: #9cc10a; background: #f7faed; }
.printer-form { display: grid; grid-template-columns: minmax(0, 1fr) 120px; gap: 12px; align-content: start; }
.printer-form label { display: flex; flex-direction: column; gap: 6px; font-size: .8rem; font-weight: 600; }
.full { grid-column: 1 / -1; }
.printer-footer { width: 100%; }
.footer-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
@media (max-width: 650px) { .settings-layout { grid-template-columns: 1fr; } }
</style>
