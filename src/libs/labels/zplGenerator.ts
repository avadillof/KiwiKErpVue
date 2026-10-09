import { resolveValue, type LabelElement, type LabelTemplate } from './labelTemplate';

/** UTF-8 hexadecimal: el transporte sólo contiene ASCII y conserva euros y tildes. */
function encodeField(value: string): string {
  return Array.from(new TextEncoder().encode(value), (byte) =>
    byte >= 32 && byte <= 126 && ![94, 126, 95, 92].includes(byte)
      ? String.fromCharCode(byte)
      : `_${byte.toString(16).toUpperCase().padStart(2, '0')}`,
  ).join('');
}
function mmToDots(mm: number, dpi: number): number {
  return Math.max(1, Math.round((mm * dpi) / 25.4));
}

/** Genera ZPL II a partir de plantilla + muestra de datos. */
export function buildZpl(template: LabelTemplate, sample: Record<string, string>): string {
  const dpi = template.dpi ?? 203;
  const w = mmToDots(template.anchoMm, dpi);
  const h = mmToDots(template.altoMm, dpi);
  const lines: string[] = ['^XA', '^CI28', `^PW${w}`, `^LL${h}`, `^LH0,0`];

  for (const el of template.elementos) {
    if (el.tipo === 'barcode' && el.barcodePrint === false) continue;
    const x = mmToDots(el.xMm + (template.margenMm ?? 0), dpi);
    const y = mmToDots(el.yMm + (template.margenMm ?? 0), dpi);
    const value = encodeField(resolveValue(el, sample));

    if (el.tipo === 'texto' || el.tipo === 'campo') {
      const fh = mmToDots(Math.max(2, el.fontMm ?? 3.5), dpi);
      const fw = Math.round(fh * 0.8);
      lines.push(`^FO${x},${y}^A0N,${fh},${fw}^FH_^FD${value}^FS`);
    } else if (el.tipo === 'barcode') {
      const bh = mmToDots(el.hMm ?? 12, dpi);
      // Valores por defecto compatibles con las plantillas ya guardadas.
      const module = Math.max(1, Math.min(10, Math.round(el.barcodeModuleDots ?? 2)));
      const show = el.barcodeTextPosition === 'none' ? 'N' : 'Y';
      const above = el.barcodeTextPosition === 'above' ? 'Y' : 'N';
      const commands = {
        CODE128: `^BCN,${bh},${show},${above},N`,
        CODE39: `^B3N,N,${bh},${show},${above}`,
        EAN13: `^BEN,${bh},${show},${above}`,
        EAN8: `^B8N,${bh},${show},${above}`,
        UPCA: `^BUN,${bh},${show},${above},Y`,
      };
      lines.push(`^FO${x},${y}^BY${module},3${commands[el.barcodeType ?? 'CODE128']}^FH_^FD${value}^FS`);
    } else if (el.tipo === 'qr') {
      const mag = dpi >= 300 ? 4 : 3;
      lines.push(`^FO${x},${y}^BQN,2,${mag}^FH_^FDLA,${value}^FS`);
    } else if (el.tipo === 'rect') {
      const rw = mmToDots(el.wMm ?? 20, dpi);
      const rh = mmToDots(el.hMm ?? 10, dpi);
      lines.push(`^FO${x},${y}^GB${rw},${rh},2^FS`);
    } else if (el.tipo === 'linea') {
      const lw = mmToDots(el.wMm ?? 40, dpi);
      lines.push(`^FO${x},${y}^GB${lw},2,2^FS`);
    }
  }

  lines.push('^XZ');
  return lines.join('\n');
}

/** Descarga el ZPL como archivo .zpl */
export function downloadZpl(filename: string, zpl: string): void {
  const blob = new Blob([zpl], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.zpl') ? filename : `${filename}.zpl`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

declare global {
  interface Window {
    BrowserPrint?: any;
  }
}

/** Intenta imprimir vía Zebra Browser Print si está instalado. */
export async function printViaBrowserPrint(zpl: string, deviceUid?: string): Promise<{ ok: boolean; message: string }> {
  if (!window.BrowserPrint) {
    await loadBrowserPrintSdk();
  }
  const BP = window.BrowserPrint;
  if (!BP?.getDefaultDevice) {
    return { ok: false, message: 'No se ha podido cargar la integración de Zebra Browser Print. Comprueba la conexión o descarga la etiqueta con «Descargar .zpl».' };
  }
  return new Promise((resolve) => {
    let finished = false;
    let sending = false;
    const finish = (ok: boolean, message: string) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({ ok, message });
    };
    // No reenviar automáticamente: el dispositivo puede haber recibido la etiqueta.
    const timer = setTimeout(() => finish(false, sending
      ? 'No se ha recibido confirmación del envío. Comprueba la impresora antes de repetir para evitar duplicados.'
      : 'Zebra Browser Print no responde. Comprueba que esté instalado y abierto, y que el sitio esté autorizado. Puedes usar «Descargar .zpl».'), 10000);
    const connectionError = () => finish(false, 'No se ha podido conectar con Zebra Browser Print. Comprueba que esté instalado y abierto, y que el sitio esté autorizado. Puedes usar «Descargar .zpl».');
    try {
      const sendToDevice = (dev: any) => {
        if (finished) return;
        if (!dev) {
          finish(false, 'La impresora seleccionada no está disponible en Browser Print. Comprueba su configuración; no se ha enviado a otra impresora.');
          return;
        }
        sending = true;
        try {
          dev.send(zpl, () => finish(true, 'ZPL enviado a la impresora. Comprueba la salida de la etiqueta.'), () =>
            finish(false, 'No se ha podido confirmar el envío a la impresora. Comprueba su conexión y si ha impreso antes de repetir. Puedes usar «Descargar .zpl».'),
          );
        } catch {
          finish(false, 'Error al enviar el ZPL. Comprueba la impresora antes de repetir el envío. Puedes usar «Descargar .zpl».');
        }
      };
      if (deviceUid) {
        BP.getLocalDevices((devices: any[]) => sendToDevice(devices.find(device => device.uid === deviceUid)), connectionError, 'printer');
      } else {
        BP.getDefaultDevice('printer', sendToDevice, connectionError);
      }
    } catch {
      connectionError();
    }
  });
}

let browserPrintSdkLoading: Promise<void> | undefined;

export function loadBrowserPrintSdk(): Promise<void> {
  if (window.BrowserPrint) return Promise.resolve();
  if (browserPrintSdkLoading) return browserPrintSdkLoading;
  // Servir el SDK junto a KiwiKERP evita depender de la web externa de Zebra.
  browserPrintSdkLoading = new Promise<void>((resolve) => {
    const s = document.createElement('script');
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      clearTimeout(timer);
      s.onload = null;
      s.onerror = null;
      if (!window.BrowserPrint) s.remove();
      resolve();
    };
    const timer = setTimeout(finish, 10000);
    s.src = `${import.meta.env.BASE_URL}vendor/zebra/BrowserPrint-3.1.250.min.js`;
    s.onload = finish;
    s.onerror = finish;
    document.head.appendChild(s);
  }).finally(() => { browserPrintSdkLoading = undefined; });
  return browserPrintSdkLoading;
}
