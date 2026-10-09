<template>
  <div class="designer">
    <div class="toolbar" aria-label="Añadir elementos">
      <Button v-for="tool in elementTools" :key="tool.type" :label="tool.label" :icon="tool.icon" size="small" severity="secondary" outlined @click="add(tool.type)" />
    </div>

    <div class="workspace">
      <section class="editor">
        <div class="view-controls">
          <span>{{ template.anchoMm }} × {{ template.altoMm }} mm · {{ template.dpi }} dpi</span>
          <div class="zoom-controls">
            <Button icon="pi pi-minus" text size="small" aria-label="Reducir zoom" :disabled="zoom <= 50" @click="setZoom(zoom - 25)" />
            <select :value="zoom" aria-label="Zoom de la etiqueta" @change="setZoom(Number(($event.target as HTMLSelectElement).value))">
              <option v-for="value in zoomOptions" :key="value" :value="value">{{ value }} %</option>
            </select>
            <Button icon="pi pi-plus" text size="small" aria-label="Ampliar zoom" :disabled="zoom >= 400" @click="setZoom(zoom + 25)" />
            <Button label="Ajustar" text size="small" @click="fit" />
          </div>
        </div>
        <div ref="viewport" class="viewport" @click.self="selectedId = ''">
          <div class="paper-space" :style="{ width: paperWidth * scale + RULER_SIZE + 'px', height: paperHeight * scale + RULER_SIZE + 'px' }">
            <div class="ruler-corner" aria-hidden="true">mm</div>
            <div class="ruler ruler-horizontal" aria-label="Regla horizontal en milímetros">
              <span v-for="mm in horizontalTicks" :key="mm" class="ruler-tick" :class="{ major: mm % 10 === 0, middle: mm % 5 === 0 }" :style="{ left: mm * PX_PER_MM * scale + 'px' }">
                <span v-if="mm % rulerLabelStep === 0" class="ruler-number">{{ mm }}</span>
              </span>
            </div>
            <div class="ruler ruler-vertical" aria-label="Regla vertical en milímetros">
              <span v-for="mm in verticalTicks" :key="mm" class="ruler-tick" :class="{ major: mm % 10 === 0, middle: mm % 5 === 0 }" :style="{ top: mm * PX_PER_MM * scale + 'px' }">
                <span v-if="mm % rulerLabelStep === 0" class="ruler-number">{{ mm }}</span>
              </span>
            </div>
            <div class="paper" :style="{ width: paperWidth + 'px', height: paperHeight + 'px', transform: `scale(${scale})`, '--grid-step': PX_PER_MM + 'px' }" @click.self="selectedId = ''">
              <div class="margin-guide" :style="{ inset: template.margenMm * PX_PER_MM + 'px' }" aria-hidden="true"></div>
              <div v-for="el in template.elementos" :key="el.id" class="element" :class="{ selected: el.id === selectedId }" :style="styleOf(el)"
                tabindex="0" role="button" :aria-label="elementName(el)" :aria-pressed="el.id === selectedId"
                @focus="selectedId = el.id" @pointerdown="startDrag($event, el)" @keydown="moveWithKeyboard($event, el)">
                <span v-if="el.tipo === 'texto' || el.tipo === 'campo'" class="label-text">{{ previewText(el) }}</span>
                <template v-else-if="el.tipo === 'barcode'">
                  <span v-if="el.barcodePrint === false" class="barcode-disabled">Código sin imprimir</span>
                  <template v-else>
                    <span v-if="el.barcodeTextPosition === 'above'" class="barcode-caption">{{ previewText(el) }}</span>
                    <div class="barcode-bars" :style="barcodeBarsStyle(el)"></div>
                    <span v-if="!el.barcodeTextPosition || el.barcodeTextPosition === 'below'" class="barcode-caption">{{ previewText(el) }}</span>
                  </template>
                </template>
                <template v-else-if="el.tipo === 'qr'">
                  <i class="pi pi-qrcode qr-symbol" aria-hidden="true"></i>
                </template>
                <div v-else-if="el.tipo === 'rect'" class="printed-rectangle"></div>
                <div v-else class="printed-line"></div>
              </div>
            </div>
          </div>
        </div>
        <p class="hint">Arrastra para mover. Flechas: 0,5 mm; Mayús + flechas: 5 mm. El zoom no cambia el tamaño de impresión.</p>
        <p class="hint">Puntos cada 1 mm. Las reglas miden desde el borde de la etiqueta; X e Y se miden desde el margen. Estas guías no se imprimen.</p>
        <p class="hint">Barras y QR son representaciones orientativas, no códigos escaneables. La impresión utiliza el ZPL generado.</p>
      </section>

      <aside class="properties">
        <h4>Elementos <span>{{ template.elementos.length }}</span></h4>
        <div class="element-list">
          <button v-for="(el, index) in template.elementos" :key="el.id" type="button" :class="{ active: selectedId === el.id }" @click="selectedId = el.id">
            <span>{{ index + 1 }}. {{ elementName(el) }}</span>
          </button>
          <p v-if="!template.elementos.length" class="hint">Añade un elemento con los botones superiores.</p>
        </div>
        <template v-if="selected">
          <div class="selection-heading">
            <h4>Propiedades</h4>
            <div>
              <Button icon="pi pi-copy" text size="small" aria-label="Duplicar elemento" title="Duplicar elemento" @click="duplicate" />
              <Button icon="pi pi-trash" text size="small" severity="danger" aria-label="Eliminar elemento" title="Eliminar elemento" @click="remove" />
            </div>
          </div>
          <div class="property-grid">
            <label>X (mm)<InputNumber v-model="selected.xMm" :min="0" :max="maxX" :step="0.5" :maxFractionDigits="2" locale="es-ES" fluid size="small" /></label>
            <label>Y (mm)<InputNumber v-model="selected.yMm" :min="0" :max="maxY" :step="0.5" :maxFractionDigits="2" locale="es-ES" fluid size="small" /></label>
            <label v-if="selected.tipo === 'texto'" class="full">Texto fijo<InputText v-model="selected.texto" fluid size="small" /></label>
            <label v-if="['campo', 'barcode', 'qr'].includes(selected.tipo)" class="full">Campo<Select v-model="selected.campo" :options="LABEL_FIELDS" optionLabel="label" optionValue="code" fluid size="small" /></label>
            <template v-if="selected.tipo === 'barcode'">
              <label class="full">
                Tipo de código
                <Select v-model="selected.barcodeType" :options="barcodeTypes" optionLabel="label" optionValue="value" fluid size="small" />
              </label>
              <label class="full">
                Ancho de barra mínima (puntos)
                <InputNumber :modelValue="selected.barcodeModuleDots ?? 2" @update:modelValue="selected.barcodeModuleDots = $event ?? 2" :min="1" :max="10" :maxFractionDigits="0" showButtons fluid size="small" />
              </label>
              <p class="hint full">
                {{ (((selected.barcodeModuleDots ?? 2) * 25.4) / template.dpi).toLocaleString('es-ES', { maximumFractionDigits: 3 }) }} mm por barra mínima.
                El ancho total depende del tipo y del contenido; la vista es orientativa.
              </p>
              <label class="full">
                Texto legible del código
                <Select :modelValue="selected.barcodeTextPosition ?? 'below'" @update:modelValue="selected.barcodeTextPosition = $event" :options="barcodeTextPositions" optionLabel="label" optionValue="value" fluid size="small" />
              </label>
              <label class="full">
                Imprimir código de barras
                <Select :modelValue="selected.barcodePrint !== false" @update:modelValue="selected.barcodePrint = $event" :options="printOptions" optionLabel="label" optionValue="value" fluid size="small" />
              </label>
              <p class="hint full">{{ barcodeHelp[selected.barcodeType ?? 'CODE128'] }}</p>
            </template>
            <label v-if="['texto', 'campo'].includes(selected.tipo)" class="full">Fuente (mm)<InputNumber v-model="selected.fontMm" :min="2" :max="20" :step="0.5" :maxFractionDigits="1" locale="es-ES" fluid size="small" /></label>
            <label v-if="['barcode', 'rect'].includes(selected.tipo)">Alto (mm)<InputNumber v-model="selected.hMm" :min="1" :max="250" :maxFractionDigits="1" locale="es-ES" fluid size="small" /></label>
            <label v-if="['rect', 'linea'].includes(selected.tipo)">Ancho (mm)<InputNumber v-model="selected.wMm" :min="1" :max="250" :maxFractionDigits="1" locale="es-ES" fluid size="small" /></label>
          </div>
        </template>
        <p v-else class="hint">Selecciona un elemento en la etiqueta o en esta lista para editarlo.</p>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { LABEL_FIELDS, LABEL_SAMPLE, newElementId, resolveValue, type LabelElement, type LabelElementType, type LabelTemplate } from '../../../libs/labels/labelTemplate';

const props = defineProps<{ modelValue: LabelTemplate }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: LabelTemplate): void }>();
const template = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) });
const selectedId = ref('');
const selected = computed(() => template.value.elementos.find((el) => el.id === selectedId.value));
const viewport = ref<HTMLElement>();
const PX_PER_MM = 96 / 25.4;
const RULER_SIZE = 28;
const zoom = ref(150);
const scale = computed(() => zoom.value / 100);
const zoomOptions = computed(() => [...new Set([50, 75, 100, 125, 150, 200, 250, 300, 400, zoom.value])].sort((a, b) => a - b));
const paperWidth = computed(() => template.value.anchoMm * PX_PER_MM);
const paperHeight = computed(() => template.value.altoMm * PX_PER_MM);
// Usar la misma escala que el papel conserva la alineación al ampliar y desplazar.
const horizontalTicks = computed(() => Array.from({ length: Math.floor(template.value.anchoMm) + 1 }, (_, mm) => mm));
const verticalTicks = computed(() => Array.from({ length: Math.floor(template.value.altoMm) + 1 }, (_, mm) => mm));
const rulerLabelStep = computed(() => zoom.value < 100 ? 20 : 10);
const maxX = computed(() => Math.max(0, template.value.anchoMm - 2 * template.value.margenMm));
const maxY = computed(() => Math.max(0, template.value.altoMm - 2 * template.value.margenMm));
const barcodeTypes = [
  { label: 'Code 128', value: 'CODE128' },
  { label: 'Code 39', value: 'CODE39' },
  { label: 'EAN-13', value: 'EAN13' },
  { label: 'EAN-8', value: 'EAN8' },
  { label: 'UPC-A', value: 'UPCA' },
];
const barcodeTextPositions = [
  { label: 'Debajo de las barras', value: 'below' },
  { label: 'Encima de las barras', value: 'above' },
  { label: 'No mostrar texto', value: 'none' },
];
const printOptions = [
  { label: 'Sí', value: true },
  { label: 'No (conservar en el diseño)', value: false },
];
const barcodeHelp = {
  CODE128: 'Admite números y caracteres ASCII. Usa este tipo para referencias alfanuméricas.',
  CODE39: 'Usa mayúsculas, números, espacios y los símbolos - . $ / + %. Sin dígito de control opcional.',
  EAN13: 'Usa 12 dígitos más el dígito de control, o 12 dígitos para que la impresora lo calcule.',
  EAN8: 'Usa 7 dígitos más el dígito de control, o 7 dígitos para que la impresora lo calcule.',
  UPCA: 'Usa 11 dígitos más el dígito de control, o 11 dígitos para que la impresora lo calcule.',
};
const elementTools: { type: LabelElementType; label: string; icon: string }[] = [
  { type: 'texto', label: 'Texto', icon: 'pi pi-font' },
  { type: 'campo', label: 'Campo', icon: 'pi pi-braces' },
  { type: 'barcode', label: 'Barras', icon: 'pi pi-barcode' },
  { type: 'qr', label: 'QR', icon: 'pi pi-qrcode' },
  { type: 'rect', label: 'Rectángulo', icon: 'pi pi-stop' },
  { type: 'linea', label: 'Línea', icon: 'pi pi-minus' },
];

function setZoom(value: number): void {
  zoom.value = Math.max(50, Math.min(400, value));
}
function fit(): void {
  if (!viewport.value) return;
  setZoom(Math.floor(Math.min((viewport.value.clientWidth - 64 - RULER_SIZE) / paperWidth.value, (viewport.value.clientHeight - 64 - RULER_SIZE) / paperHeight.value) * 100));
}
function previewText(el: LabelElement): string {
  return resolveValue(el, LABEL_SAMPLE);
}
function elementName(el: LabelElement): string {
  const name = elementTools.find((tool) => tool.type === el.tipo)?.label ?? el.tipo;
  return ['rect', 'linea'].includes(el.tipo) ? name : `${name}: ${el.texto || el.campo || ''}`;
}
function barcodeBarsStyle(el: LabelElement): Record<string, string> {
  const unit = ((el.barcodeModuleDots ?? 2) * 96) / template.value.dpi;
  return {
    height: `${(el.hMm ?? 12) * PX_PER_MM}px`,
    background: `repeating-linear-gradient(90deg, #000 0 ${unit}px, #fff ${unit}px ${unit * 2}px, #000 ${unit * 2}px ${unit * 4}px, #fff ${unit * 4}px ${unit * 5}px)`,
  };
}
function styleOf(el: LabelElement): Record<string, string> {
  // El margen forma parte de la posición impresa; el zoom sólo escala la vista.
  const style: Record<string, string> = {
    left: `${(el.xMm + template.value.margenMm) * PX_PER_MM}px`,
    top: `${(el.yMm + template.value.margenMm) * PX_PER_MM}px`,
    fontSize: `${(el.fontMm ?? 3.5) * PX_PER_MM}px`,
  };
  // Representación orientativa: el ancho impreso lo determina la simbología en ZPL.
  if (el.tipo === 'barcode') style.width = `${(el.wMm ?? 45) * PX_PER_MM * ((el.barcodeModuleDots ?? 2) / 2)}px`;
  if (el.tipo === 'qr') {
    style.width = '48px';
    style.height = '48px';
  }
  if (el.tipo === 'rect' || el.tipo === 'linea') {
    style.width = `${(el.wMm ?? 40) * PX_PER_MM}px`;
    style.height = el.tipo === 'linea' ? '1px' : `${(el.hMm ?? 10) * PX_PER_MM}px`;
  }
  return style;
}
function add(tipo: LabelElementType): void {
  const el: LabelElement = {
    id: newElementId(), tipo, xMm: Math.min(2, maxX.value), yMm: Math.min(2, maxY.value), fontMm: 3.5,
    wMm: Math.min(40, Math.max(1, maxX.value - 2)), hMm: Math.min(12, Math.max(1, maxY.value - 2)),
    texto: tipo === 'texto' ? 'Texto' : undefined,
    campo: tipo === 'barcode' ? '{{producto.codigoBarras}}' : tipo === 'campo' || tipo === 'qr' ? '{{producto.descripcion}}' : undefined,
    barcodeType: 'CODE128',
  };
  template.value = { ...template.value, elementos: [...template.value.elementos, el] };
  selectedId.value = el.id;
}
function remove(): void {
  template.value = { ...template.value, elementos: template.value.elementos.filter((el) => el.id !== selectedId.value) };
  selectedId.value = '';
}
function duplicate(): void {
  if (!selected.value) return;
  const el = { ...selected.value, id: newElementId(), xMm: Math.min(maxX.value, selected.value.xMm + 2), yMm: Math.min(maxY.value, selected.value.yMm + 2) };
  template.value = { ...template.value, elementos: [...template.value.elementos, el] };
  selectedId.value = el.id;
}
function position(el: LabelElement, x: number, y: number): void {
  el.xMm = Math.min(maxX.value, Math.max(0, Math.round(x * 2) / 2));
  el.yMm = Math.min(maxY.value, Math.max(0, Math.round(y * 2) / 2));
  template.value = { ...template.value };
}
function moveWithKeyboard(event: KeyboardEvent, el: LabelElement): void {
  const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const delta = moves[event.key];
  if (!delta) return;
  event.preventDefault();
  const step = event.shiftKey ? 5 : 0.5;
  position(el, el.xMm + delta[0] * step, el.yMm + delta[1] * step);
}
let stopDrag: (() => void) | undefined;
function startDrag(event: PointerEvent, el: LabelElement): void {
  if (event.button !== 0) return;
  stopDrag?.();
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  target.focus({ preventScroll: true });
  selectedId.value = el.id;
  const startX = event.clientX, startY = event.clientY, x = el.xMm, y = el.yMm;
  const pixelsPerMm = PX_PER_MM * scale.value;
  const move = (next: PointerEvent) => {
    if (next.pointerId === event.pointerId) position(el, x + (next.clientX - startX) / pixelsPerMm, y + (next.clientY - startY) / pixelsPerMm);
  };
  const end = (next: PointerEvent) => { if (next.pointerId === event.pointerId) stopDrag?.(); };
  stopDrag = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    stopDrag = undefined;
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}
onBeforeUnmount(() => stopDrag?.());
</script>

<style scoped>
.designer { display: flex; flex-direction: column; gap: 12px; }
.toolbar, .zoom-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
.workspace { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 16px; }
.editor { min-width: 0; }
.view-controls { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px 8px 0 0; font-size: .8rem; }
.zoom-controls select { border: 1px solid #9ca3af; border-radius: 5px; background: #fff; color: #111; padding: 6px; }
.viewport { height: 420px; overflow: auto; padding: 32px; background: #e5e7eb; border: 1px solid #d1d5db; border-top: 0; }
.paper-space { position: relative; margin: auto; flex-shrink: 0; }
.paper {
  position: absolute;
  left: 28px;
  top: 28px;
  transform-origin: top left;
  background-color: #fff;
  background-image: radial-gradient(circle at 0.4px 0.4px, #dfe3e8 0.4px, transparent 0.6px);
  background-size: var(--grid-step) var(--grid-step);
  color: #000;
  box-shadow: 0 2px 8px #0003;
  overflow: hidden;
  isolation: isolate;
}
.ruler, .ruler-corner { position: absolute; background: #f8fafc; color: #667085; user-select: none; pointer-events: none; }
.ruler-corner { top: 0; left: 0; width: 28px; height: 28px; display: grid; place-items: center; font-size: 9px; }
.ruler-horizontal { left: 28px; right: 0; top: 0; height: 28px; border-bottom: 1px solid #cbd0d8; }
.ruler-vertical { top: 28px; bottom: 0; left: 0; width: 28px; border-right: 1px solid #cbd0d8; }
.ruler-tick { position: absolute; }
.ruler-horizontal .ruler-tick { bottom: 0; height: 4px; border-left: 1px solid #cbd0d8; }
.ruler-horizontal .ruler-tick.middle { height: 7px; }
.ruler-horizontal .ruler-tick.major { height: 10px; border-color: #98a2b3; }
.ruler-vertical .ruler-tick { right: 0; width: 4px; border-top: 1px solid #cbd0d8; }
.ruler-vertical .ruler-tick.middle { width: 7px; }
.ruler-vertical .ruler-tick.major { width: 10px; border-color: #98a2b3; }
.ruler-number { position: absolute; font: 9px/1 Arial, sans-serif; }
.ruler-horizontal .ruler-number { bottom: 12px; transform: translateX(-50%); }
.ruler-vertical .ruler-number { right: 12px; transform: translateY(-50%); }
.margin-guide { position: absolute; border: 1px dashed #b8b8b8; pointer-events: none; }
.element { position: absolute; color: #000 !important; background: transparent; cursor: grab; user-select: none; touch-action: none; font-family: Arial, sans-serif; line-height: 1; outline: none; }
/* La zona de selección crece sin alterar las dimensiones ni el fondo impreso. */
.element::after { content: ''; position: absolute; inset: -4px; min-height: 12px; border: 1px solid transparent; }
.element:hover::after { border-color: #888; }
.element.selected::after { border: 1px dashed #333; }
.element:active { cursor: grabbing; }
.label-text { white-space: pre; color: #000 !important; font-weight: normal; }
.barcode-bars { background: repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 4px, #000 4px 5px, #fff 5px 8px); }
.barcode-caption { display: block; text-align: center; font-size: 10px; line-height: 1.25; color: #000 !important; }
.barcode-disabled { display: block; padding: 6px; border: 1px dashed #777; font-size: 10px; }
.paper .qr-symbol { display: block; font-size: 48px; color: #000 !important; }
.printed-rectangle { width: 100%; height: 100%; border: 1px solid #000; box-sizing: border-box; }
.printed-line { width: 100%; height: 100%; background: #000; }
.properties { min-width: 0; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; }
.properties h4 { margin: 0; font-size: .9rem; }
.properties h4 span { color: #6b7280; font-weight: normal; }
/* Aprovechar la altura de pantalla sin comprimir las filas de selección. */
.element-list { display: flex; flex-direction: column; gap: 4px; max-height: clamp(240px, 35dvh, 420px); overflow: auto; margin: 10px 0 16px; }
.element-list button { flex-shrink: 0; padding: 9px; border: 1px solid #d1d5db; border-radius: 5px; background: #fff; color: #111; text-align: left; cursor: pointer; overflow-wrap: anywhere; font-size: .78rem; }
.element-list button.active { border-color: #111; box-shadow: inset 3px 0 #111; }
.selection-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.property-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.property-grid label { display: flex; flex-direction: column; gap: 5px; min-width: 0; font-size: .75rem; font-weight: 600; color: #4b5563; }
.property-grid :deep(input) { min-width: 0; width: 100%; }
.full { grid-column: 1 / -1; }
.hint { margin: 8px 0 0; font-size: .75rem; line-height: 1.5; color: #667085; }
@media (max-width: 760px) { .workspace { grid-template-columns: minmax(0, 1fr); } .viewport { height: 330px; } }
</style>
