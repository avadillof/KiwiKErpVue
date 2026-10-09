import { ref } from 'vue';
import { loadBrowserPrintSdk, printViaBrowserPrint } from '../../libs/labels/zplGenerator';

export interface LabelPrinter {
  id: string;
  name: string;
  kind: 'zebra';
  host: string;
  port: number;
  uid: string;
}
const KEY = 'kiwik.labelPrinters.v1';
export const labelPrinters = ref<LabelPrinter[]>([]);
export const selectedPrinterId = ref('');
export const printerStorageError = ref('');

export function refreshPrinters(): void {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{"printers":[],"selected":""}');
    if (!Array.isArray(saved.printers)) throw new Error();
    labelPrinters.value = saved.printers.filter((p: LabelPrinter) => p && typeof p.id === 'string' && typeof p.name === 'string' && p.kind === 'zebra' && typeof p.host === 'string' && Number.isInteger(p.port) && p.port > 0 && p.port <= 65535 && typeof p.uid === 'string');
    selectedPrinterId.value = labelPrinters.value.some(p => p.id === saved.selected) ? saved.selected : '';
    printerStorageError.value = '';
  } catch {
    printerStorageError.value = 'No se ha podido leer la configuración de impresoras de este navegador.';
  }
}
export function persistPrinters(printers: LabelPrinter[], selected: string): void {
  // Publicar el cambio sólo después de que el navegador confirme el guardado.
  localStorage.setItem(KEY, JSON.stringify({ printers, selected }));
  labelPrinters.value = printers;
  selectedPrinterId.value = selected;
  printerStorageError.value = '';
}
export async function discoverPrinters(): Promise<any[]> {
  await loadBrowserPrintSdk();
  const bp = window.BrowserPrint;
  if (!bp?.getLocalDevices) throw new Error('No se ha podido cargar Browser Print. Comprueba la instalación y la integración.');
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Browser Print no responde. Comprueba que esté abierto y autoriza este sitio.')), 10000);
    try {
      bp.getLocalDevices((devices: any[]) => {
        clearTimeout(timer);
        resolve(Array.isArray(devices) ? devices : []);
      }, () => { clearTimeout(timer); reject(new Error('No se ha podido consultar Browser Print.')); }, 'printer');
    } catch { clearTimeout(timer); reject(new Error('Error al consultar Browser Print.')); }
  });
}
export async function printToConfiguredPrinter(zpl: string): Promise<{ ok: boolean; message: string }> {
  const printer = labelPrinters.value.find(p => p.id === selectedPrinterId.value);
  if (!printer) return { ok: false, message: 'Selecciona una impresora antes de imprimir.' };
  // Red: Browser Print debe tener registrada exactamente esta dirección. USB: UID descubierto.
  return printViaBrowserPrint(zpl, printer.uid || `${printer.host}:${printer.port}`);
}
