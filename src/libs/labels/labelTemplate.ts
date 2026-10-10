/** Modelos del generador de etiquetas ZPL y del catálogo persistido. */

export type LabelKind = 'producto';

export type LabelElementType = 'texto' | 'campo' | 'barcode' | 'qr' | 'linea' | 'rect';

export interface LabelElement {
  id: string;
  tipo: LabelElementType;
  /** Posición en mm desde esquina superior-izquierda útil. */
  xMm: number;
  yMm: number;
  wMm?: number;
  hMm?: number;
  locked?: boolean;
  qrMagnification?: number;
  /** Las líneas antiguas siguen siendo horizontales; wMm almacena la longitud. */
  lineDirection?: 'horizontal' | 'vertical';
  /** Texto fijo (tipo texto). */
  texto?: string;
  /** Campo dinámico {{...}} (tipos campo/barcode/qr). */
  campo?: string;
  fontMm?: number;
  bold?: boolean;
  barcodeType?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPCA';
  /** Ancho de la barra mínima en puntos de impresora (^BY), no ancho total. */
  barcodeModuleDots?: number;
  barcodeTextPosition?: 'below' | 'above' | 'none';
  barcodePrint?: boolean;
}

export interface LabelTemplate {
  version?: number;
  id: string;
  nombre: string;
  tipo: LabelKind;
  anchoMm: number;
  altoMm: number;
  dpi: 203 | 300 | 600;
  orientacion: 'horizontal' | 'vertical';
  margenMm: number;
  oscuridad?: number;
  elementos: LabelElement[];
  updatedAt: string;
}

export const LABEL_FIELDS: { code: string; label: string }[] = [
  { code: '{{producto.codigo}}', label: 'Código producto' },
  { code: '{{producto.descripcion}}', label: 'Descripción' },
  { code: '{{producto.precio}}', label: 'Precio' },
  { code: '{{producto.codigoBarras}}', label: 'Código barras' },
  { code: '{{lote.numero}}', label: 'Lote / serie' },
  { code: '{{ubicacion.codigo}}', label: 'Ubicación' },
  { code: '{{cliente.nombre}}', label: 'Cliente' },
  { code: '{{empresa.nombre}}', label: 'Empresa' },
  { code: '{{fecha}}', label: 'Fecha' },
  { code: '{{cantidad}}', label: 'Cantidad' },
];

export const LABEL_SAMPLE: Record<string, string> = {
  '{{producto.codigo}}': 'KIW-001',
  '{{producto.descripcion}}': 'Tornillo inox M8x40',
  '{{producto.precio}}': '12,50 €',
  '{{producto.codigoBarras}}': '8431234567890',
  '{{lote.numero}}': 'L-2026-034',
  '{{ubicacion.codigo}}': 'A-03-12',
  '{{cliente.nombre}}': 'Fontanería Ruiz',
  '{{empresa.nombre}}': 'Mi Empresa S.L.',
  '{{fecha}}': '08/10/2026',
  '{{cantidad}}': '24',
};

/** Resuelve {{campo}} o texto fijo contra la muestra. */
export function resolveValue(el: LabelElement, sample: Record<string, string>): string {
  if (el.tipo === 'texto') return el.texto ?? '';
  const key = (el.campo ?? '').trim();
  if (!key) return '';
  const wrapped = key.startsWith('{{') ? key : `{{${key}}}`;
  return sample[wrapped] ?? wrapped;
}

export function newElementId(): string {
  return `e${Date.now().toString(36)}${Math.floor(Math.random() * 9999)}`;
}
