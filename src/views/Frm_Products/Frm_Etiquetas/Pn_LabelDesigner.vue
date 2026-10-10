<template>
  <div class="designer" @keydown="historyShortcut">
    <div class="toolbar" aria-label="Añadir elementos">
      <Button v-for="tool in elementTools" :key="tool.type" :label="tool.label" :icon="tool.icon" size="small" severity="secondary" outlined @click="add(tool.type)" />
      <Button icon="pi pi-undo" aria-label="Deshacer" title="Deshacer (Ctrl+Z)" text size="small" :disabled="!canUndo" @click="undo" />
      <Button icon="pi pi-refresh" aria-label="Rehacer" title="Rehacer (Ctrl+Y)" text size="small" :disabled="!future.length" @click="redo" />
      <label class="snap-control">Cuadrícula
        <select v-model.number="snapStep" aria-label="Ajuste a cuadrícula">
          <option :value="0">Libre</option><option :value="0.5">0,5 mm</option><option :value="1">1 mm</option>
        </select>
      </label>
      <Button label="Ayuda" icon="pi pi-question-circle" class="designer-help-button" size="small" severity="secondary" text @click="helpVisible = true" />
    </div>

    <div class="workspace">
      <section class="editor">
        <div class="view-controls">
          <span>
            {{ template.anchoMm }} × {{ template.altoMm }} mm · {{ template.dpi }} dpi
            <span v-if="selected" class="position-readout"> · X: {{ formatMm(selected.xMm) }} · Y: {{ formatMm(selected.yMm) }} mm</span>
          </span>
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
            <div class="paper" :style="paperStyle" @click.self="selectedId = ''">
              <div class="margin-guide" :style="{ inset: template.margenMm * PX_PER_MM + 'px' }" aria-hidden="true"></div>
              <div v-for="el in template.elementos" :key="el.id" :data-element-id="el.id" class="element" :class="{ selected: selectionIds.includes(el.id) }" :style="styleOf(el)"
                tabindex="0" role="button" :aria-label="elementName(el)" :aria-pressed="el.id === selectedId"
                @pointerdown="startDrag($event, el)" @keydown="moveWithKeyboard($event, el)">
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
                <button v-if="selectedId === el.id && selectionIds.length === 1 && !el.locked" type="button" class="resize-handle"
                  aria-label="Cambiar tamaño arrastrando" title="Arrastra para cambiar el tamaño"
                  :style="{ width: 8 / scale + 'px', height: 8 / scale + 'px', borderWidth: 1 / scale + 'px' }"
                  @pointerdown.stop.prevent="startResize($event, el)" @keydown.stop></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="properties">
        <h4>Elementos <span>{{ template.elementos.length }}</span></h4>
        <div class="element-list">
          <button v-for="(el, index) in template.elementos" :key="el.id" type="button" :class="{ active: selectionIds.includes(el.id) }" @click="selectElement(el.id, $event)">
            <span><i v-if="el.locked" class="pi pi-lock" aria-label="Bloqueado"></i> {{ index + 1 }}. {{ elementName(el) }}</span>
          </button>
          <p v-if="!template.elementos.length" class="hint">Añade un elemento con los botones superiores.</p>
        </div>
        <template v-if="selected">
          <div class="alignment-tools">
            <span>{{ selectionIds.length > 1 ? 'Alinear selección' : 'Alinear con el margen' }}</span>
            <div>
              <Button v-for="action in alignmentActions" :key="action.value" :label="action.label" size="small" text @click="align(action.value)" />
              <Button label="Distribuir horizontal" size="small" text :disabled="selectionIds.length < 3" @click="align('distributeX')" />
              <Button label="Distribuir vertical" size="small" text :disabled="selectionIds.length < 3" @click="align('distributeY')" />
            </div>
            <small>Ctrl/clic o Mayús/clic para seleccionar varios. Medidas de la vista previa.</small>
          </div>
          <div class="selection-heading">
            <h4>Propiedades</h4>
            <div>
              <Button icon="pi pi-copy" text size="small" aria-label="Duplicar elemento" title="Duplicar elemento" @click="duplicate" />
              <Button icon="pi pi-trash" text size="small" severity="danger" :disabled="selected.locked" aria-label="Eliminar elemento" title="Eliminar elemento" @click="remove" />
            </div>
          </div>
          <Button :label="selected.locked ? 'Desbloquear elemento' : 'Bloquear elemento'" :icon="selected.locked ? 'pi pi-lock-open' : 'pi pi-lock'" size="small" severity="secondary" outlined class="lock-button" @click="toggleLock" />
          <p v-if="selected.locked" class="hint">Elemento bloqueado. Desbloquéalo para modificarlo o eliminarlo.</p>
          <div class="property-grid" :inert="selected.locked" :class="{ 'locked-properties': selected.locked }">
            <label>X (mm)<InputNumber v-model="selected.xMm" :min="0" :max="maxX" :step="snapStep || 0.5" :maxFractionDigits="2" locale="es-ES" fluid size="small" /></label>
            <label>Y (mm)<InputNumber v-model="selected.yMm" :min="0" :max="maxY" :step="snapStep || 0.5" :maxFractionDigits="2" locale="es-ES" fluid size="small" /></label>
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
            <label v-if="selected.tipo === 'linea'" class="full">
              Dirección de la línea
              <Select :modelValue="selected.lineDirection ?? 'horizontal'" @update:modelValue="selected.lineDirection = $event"
                :options="lineDirections" optionLabel="label" optionValue="value" fluid size="small" />
            </label>
            <label v-if="['rect', 'linea'].includes(selected.tipo)">{{ selected.tipo === 'linea' ? 'Longitud (mm)' : 'Ancho (mm)' }}<InputNumber v-model="selected.wMm" :min="1" :max="250" :maxFractionDigits="1" locale="es-ES" fluid size="small" /></label>
          </div>
        </template>
        <p v-else class="hint">Selecciona un elemento en la etiqueta o en esta lista para editarlo.</p>
      </aside>
    </div>
    <Dialog v-model:visible="helpVisible" modal class="kiwik-dialog" header="Ayuda del diseñador de etiquetas" :maximizable="false" :style="{ width: 'min(560px, 94vw)' }">
      <div class="designer-help-content">
        <p><strong>Mover elementos.</strong> Arrastra sobre la etiqueta o selecciona un elemento en la lista derecha para editar sus propiedades.</p>
        <p><strong>Bloquear elementos.</strong> Usa el candado de Propiedades para proteger un elemento. No se moverá, redimensionará, alineará ni eliminará hasta desbloquearlo. El bloqueo se guarda con la plantilla y no afecta a la impresión.</p>
        <p><strong>Cambiar tamaño.</strong> Selecciona un elemento y arrastra el tirador de su esquina inferior derecha. En textos cambia la fuente; en líneas, la longitud; en barras, la altura y el grosor mínimo. Los códigos QR y las barras cambian en pasos compatibles con la impresora.</p>
        <p><strong>Teclado.</strong> Las flechas desplazan el paso de cuadrícula elegido (0,5 mm en modo libre); Mayús + flechas desplazan 5 mm.</p>
        <p><strong>Deshacer y rehacer.</strong> Usa los botones o Ctrl+Z y Ctrl+Y (también Ctrl+Mayús+Z). Dentro de un campo de texto se conserva el deshacer habitual del navegador.</p>
        <p><strong>Cuadrícula y alineación.</strong> Elige movimiento libre o pasos de 0,5/1 mm. Selecciona varios elementos con Ctrl/clic o Mayús/clic para alinear sus bordes o centros; con uno solo se usa el área entre márgenes. La alineación usa el tamaño de la vista previa.</p>
        <p><strong>Zoom.</strong> Amplía la vista sin cambiar el tamaño de impresión. «Ajustar» encaja la etiqueta en el área disponible.</p>
        <p><strong>Intensidad.</strong> «Usar impresora» conserva su configuración actual. Un valor de 0 a 30 envía la intensidad con la etiqueta y puede mantenerse para trabajos posteriores. No se restaura automáticamente el valor anterior. Comprueba el resultado en la impresora real; el diseñador no simula el calor.</p>
        <p><strong>Reglas y puntos.</strong> Los puntos reflejan el paso elegido: 0,5 o 1 mm; en modo libre quedan como referencia cada 1 mm. Se alinean con el margen, desde donde se miden X e Y. Las reglas miden desde el borde de la etiqueta. Cambiar el paso afecta a los próximos movimientos, no recoloca los elementos existentes. Estas guías no se imprimen.</p>
        <p><strong>Códigos de barras y QR.</strong> La vista es orientativa y no escaneable. La impresión utiliza el ZPL generado. Para imprimir solo las barras, selecciona «No mostrar texto» en «Texto legible del código».</p>
      </div>
      <template #footer>
        <div class="designer-help-footer">
          <div class="kiwik-separator" />
          <div class="designer-help-actions"><Button label="Cerrar" severity="secondary" text @click="helpVisible = false" /></div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import { LABEL_FIELDS, LABEL_SAMPLE, newElementId, resolveValue, type LabelElement, type LabelElementType, type LabelTemplate } from '../../../libs/labels/labelTemplate';

const props = defineProps<{ modelValue: LabelTemplate }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: LabelTemplate): void }>();
const template = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) });
const selectedId = ref('');
const extraSelection = ref<string[]>([]);
const selectionIds = computed(() => selectedId.value ? [...new Set([selectedId.value, ...extraSelection.value])].filter(id => template.value.elementos.some(el => el.id === id)) : []);
const snapStep = ref(0.5);
const lineDirections = [
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' },
];
const past = ref<string[]>([]);
const future = ref<string[]>([]);
let baseline = JSON.stringify(props.modelValue);
let replaying = false;
let dragging = false;
let historyTimer: ReturnType<typeof setTimeout> | undefined;
const canUndo = computed(() => past.value.length > 0 || JSON.stringify(template.value) !== baseline);
function commitHistory(): void {
  clearTimeout(historyTimer);
  const current = JSON.stringify(template.value);
  if (current === baseline) return;
  past.value = [...past.value.slice(-99), baseline];
  baseline = current;
  future.value = [];
}
watch(() => JSON.stringify(props.modelValue), () => {
  if (replaying || dragging) return;
  clearTimeout(historyTimer);
  historyTimer = setTimeout(commitHistory, 400);
}, { flush: 'sync' });
watch(() => props.modelValue.id, () => {
  clearTimeout(historyTimer);
  baseline = JSON.stringify(props.modelValue);
  past.value = []; future.value = []; selectedId.value = ''; extraSelection.value = [];
});
function restore(snapshot: string): void {
  replaying = true;
  baseline = snapshot;
  template.value = JSON.parse(snapshot);
  replaying = false;
}
function undo(): void {
  commitHistory();
  const previous = past.value.pop();
  if (!previous) return;
  future.value.push(baseline);
  restore(previous);
}
function redo(): void {
  commitHistory();
  const next = future.value.pop();
  if (!next) return;
  past.value.push(baseline);
  restore(next);
}
function historyShortcut(event: KeyboardEvent): void {
  if (!(event.ctrlKey || event.metaKey) || helpVisible.value) return;
  if ((event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  if (key !== 'z' && key !== 'y') return;
  event.preventDefault();
  if (key === 'y' || event.shiftKey) redo(); else undo();
}
function selectElement(id: string, event: MouseEvent | PointerEvent): void {
  if (event.ctrlKey || event.metaKey || event.shiftKey) {
    const ids = selectionIds.value.includes(id) ? selectionIds.value.filter(item => item !== id) : [...selectionIds.value, id];
    selectedId.value = ids[0] ?? '';
    extraSelection.value = ids.slice(1);
  } else { selectedId.value = id; extraSelection.value = []; }
}
const alignmentActions = [
  { label: 'Izquierda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Derecha', value: 'right' },
  { label: 'Arriba', value: 'top' }, { label: 'Medio', value: 'middle' }, { label: 'Abajo', value: 'bottom' },
] as const;
function align(direction: string): void {
  const elements = template.value.elementos.filter(el => selectionIds.value.includes(el.id));
  if (elements.some(el => el.locked)) return;
  if (!elements.length) return;
  commitHistory();
  const boxes = elements.map(el => {
    const node = Array.from(viewport.value?.querySelectorAll<HTMLElement>('[data-element-id]') ?? []).find(node => node.dataset.elementId === el.id);
    return { el, width: (node?.offsetWidth ?? 0) / PX_PER_MM, height: (node?.offsetHeight ?? 0) / PX_PER_MM };
  });
  const left = boxes.length === 1 ? 0 : Math.min(...boxes.map(b => b.el.xMm));
  const top = boxes.length === 1 ? 0 : Math.min(...boxes.map(b => b.el.yMm));
  const right = boxes.length === 1 ? maxX.value : Math.max(...boxes.map(b => b.el.xMm + b.width));
  const bottom = boxes.length === 1 ? maxY.value : Math.max(...boxes.map(b => b.el.yMm + b.height));
  if ((direction === 'distributeX' || direction === 'distributeY') && boxes.length >= 3) {
    const horizontal = direction === 'distributeX';
    boxes.sort((a, b) => horizontal ? a.el.xMm - b.el.xMm : a.el.yMm - b.el.yMm);
    const total = boxes.reduce((sum, b) => sum + (horizontal ? b.width : b.height), 0);
    const gap = ((horizontal ? right - left : bottom - top) - total) / (boxes.length - 1);
    let cursor = horizontal ? left : top;
    for (const b of boxes) {
      if (horizontal) b.el.xMm = cursor; else b.el.yMm = cursor;
      cursor += (horizontal ? b.width : b.height) + gap;
    }
    commitHistory();
    return;
  }
  for (const b of boxes) {
    if (direction === 'left') b.el.xMm = left;
    if (direction === 'right') b.el.xMm = Math.max(0, right - b.width);
    if (direction === 'center') b.el.xMm = Math.max(0, (left + right - b.width) / 2);
    if (direction === 'top') b.el.yMm = top;
    if (direction === 'bottom') b.el.yMm = Math.max(0, bottom - b.height);
    if (direction === 'middle') b.el.yMm = Math.max(0, (top + bottom - b.height) / 2);
  }
  commitHistory();
}
const helpVisible = ref(false);
const selected = computed(() => template.value.elementos.find((el) => el.id === selectedId.value));
const viewport = ref<HTMLElement>();
const PX_PER_MM = 96 / 25.4;
const RULER_SIZE = 28;
const zoom = ref(150);
const scale = computed(() => zoom.value / 100);
const zoomOptions = computed(() => [...new Set([50, 75, 100, 125, 150, 200, 250, 300, 400, zoom.value])].sort((a, b) => a - b));
const paperWidth = computed(() => template.value.anchoMm * PX_PER_MM);
const paperHeight = computed(() => template.value.altoMm * PX_PER_MM);
// Las guías se escalan en mm; el contorno de selección conserva 1 px en pantalla.
const paperStyle = computed(() => ({
  width: `${paperWidth.value}px`,
  height: `${paperHeight.value}px`,
  transform: `scale(${scale.value})`,
  '--grid-step': `${(snapStep.value || 1) * PX_PER_MM}px`,
  '--grid-origin': `${template.value.margenMm * PX_PER_MM}px`,
  '--selection-stroke': `${1 / scale.value}px`,
  '--selection-inset': `${-2 / scale.value}px`,
  '--selection-hit': `${-4 / scale.value}px`,
}));
function formatMm(value: number): string {
  return value.toLocaleString('es-ES', { maximumFractionDigits: 2 });
}
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
    const base = template.value.dpi >= 300 ? 4 : 3;
    const size = 48 * (el.qrMagnification ?? base) / base;
    style.width = `${size}px`;
    style.height = `${size}px`;
    style.fontSize = `${size}px`;
  }
  if (el.tipo === 'rect') {
    style.width = `${(el.wMm ?? 40) * PX_PER_MM}px`;
    style.height = `${(el.hMm ?? 10) * PX_PER_MM}px`;
  }
  if (el.tipo === 'linea') {
    // La misma longitud y el mismo grosor (2 puntos) que se envían en ZPL.
    const length = `${(el.wMm ?? 40) * PX_PER_MM}px`;
    const thickness = `${2 * 96 / template.value.dpi}px`;
    style.width = el.lineDirection === 'vertical' ? thickness : length;
    style.height = el.lineDirection === 'vertical' ? length : thickness;
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
  if (selected.value?.locked) return;
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
  if (el.locked) return;
  const snap = (value: number) => snapStep.value ? Math.round(value / snapStep.value) * snapStep.value : Math.round(value * 100) / 100;
  el.xMm = Math.min(maxX.value, Math.max(0, snap(x)));
  el.yMm = Math.min(maxY.value, Math.max(0, snap(y)));
  template.value = { ...template.value };
}
function moveWithKeyboard(event: KeyboardEvent, el: LabelElement): void {
  const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const delta = moves[event.key];
  if (!delta) return;
  event.preventDefault();
  const step = event.shiftKey ? 5 : snapStep.value || 0.5;
  position(el, el.xMm + delta[0] * step, el.yMm + delta[1] * step);
}
let stopDrag: (() => void) | undefined;
function startResize(event: PointerEvent, el: LabelElement): void {
  if (el.locked) return;
  if (event.button !== 0) return;
  stopDrag?.();
  commitHistory();
  dragging = true;
  const node = (event.currentTarget as HTMLElement).parentElement!;
  const start = { ...el };
  const width = node.offsetWidth / PX_PER_MM;
  const height = node.offsetHeight / PX_PER_MM;
  const startX = event.clientX, startY = event.clientY;
  const pixelsPerMm = PX_PER_MM * scale.value;
  const round = (value: number, max: number) => {
    const step = snapStep.value || 0.1;
    return Math.min(max, Math.max(1, Math.round(value / step) * step));
  };
  const move = (next: PointerEvent) => {
    if (next.pointerId !== event.pointerId) return;
    const dx = (next.clientX - startX) / pixelsPerMm;
    const dy = (next.clientY - startY) / pixelsPerMm;
    if (el.tipo === 'rect') {
      el.wMm = round((start.wMm ?? 40) + dx, 250);
      el.hMm = round((start.hMm ?? 10) + dy, 250);
    } else if (el.tipo === 'linea') {
      el.wMm = round((start.wMm ?? 40) + (el.lineDirection === 'vertical' ? dy : dx), 250);
    } else if (el.tipo === 'barcode') {
      el.hMm = round((start.hMm ?? 12) + dy, 250);
      el.barcodeModuleDots = Math.max(1, Math.min(10, Math.round((start.barcodeModuleDots ?? 2) * (width + dx) / Math.max(width, 1))));
    } else {
      // Escalado proporcional: no deformar la fuente ni los módulos del QR.
      const factor = Math.max(0.1, 1 + (Math.abs(dx / Math.max(width, 1)) > Math.abs(dy / Math.max(height, 1)) ? dx / Math.max(width, 1) : dy / Math.max(height, 1)));
      if (el.tipo === 'qr') {
        const base = template.value.dpi >= 300 ? 4 : 3;
        el.qrMagnification = Math.max(1, Math.min(10, Math.round((start.qrMagnification ?? base) * factor)));
      } else {
        el.fontMm = Math.max(2, round((start.fontMm ?? 3.5) * factor, 20));
      }
    }
  };
  const end = (next: PointerEvent) => { if (next.pointerId === event.pointerId) stopDrag?.(); };
  stopDrag = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    stopDrag = undefined;
    dragging = false;
    commitHistory();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}
function startDrag(event: PointerEvent, el: LabelElement): void {
  if (event.button !== 0) return;
  stopDrag?.();
  if (el.locked) { selectElement(el.id, event); return; }
  if (event.ctrlKey || event.metaKey || event.shiftKey) { selectElement(el.id, event); return; }
  commitHistory();
  dragging = true;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  target.focus({ preventScroll: true });
  selectElement(el.id, event);
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
    dragging = false;
    commitHistory();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}
function toggleLock(): void {
  if (!selected.value) return;
  stopDrag?.();
  commitHistory();
  selected.value.locked = !selected.value.locked;
  commitHistory();
}
onBeforeUnmount(() => { stopDrag?.(); clearTimeout(historyTimer); });
</script>

<style scoped>
.designer { display: flex; flex-direction: column; flex: 1; min-height: 0; gap: 12px; }
.toolbar { flex-shrink: 0; }
.snap-control { display: flex; align-items: center; gap: 6px; font-size: .8rem; }
.snap-control select { padding: 5px; border: 1px solid #cbd0d8; border-radius: 5px; background: #fff; }
.alignment-tools { margin-bottom: 12px; font-size: .8rem; }
.alignment-tools > div { display: flex; flex-wrap: wrap; }
.alignment-tools small { color: #667085; }
.designer-help-button { margin-left: auto; }
.designer-help-content { min-height: 0; overflow-y: auto; line-height: 1.6; color: #475467; }
.designer-help-content p { margin: 0 0 14px; }
.designer-help-footer { width: 100%; }
.designer-help-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.toolbar, .zoom-controls { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; }
.workspace { display: grid; grid-template-columns: minmax(0, 1fr) 280px; flex: 1; min-height: 0; gap: 16px; }
.editor { min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.view-controls { flex-shrink: 0; }
.view-controls { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 8px 8px 0 0; font-size: .8rem; }
.zoom-controls select { border: 1px solid #9ca3af; border-radius: 5px; background: #fff; color: #111; padding: 6px; }
/* El lienzo recibe toda la altura restante del diálogo, también al maximizar. */
.viewport { flex: 1; min-height: 180px; overflow: auto; padding: 32px; background: #e5e7eb; border: 1px solid #d1d5db; border-top: 0; }
.paper-space { position: relative; margin: auto; flex-shrink: 0; }
.paper {
  position: absolute;
  left: 28px;
  top: 28px;
  transform-origin: top left;
  background-color: #fff;
  background-image: radial-gradient(circle at 0.4px 0.4px, #dfe3e8 0.4px, transparent 0.6px);
  background-size: var(--grid-step) var(--grid-step);
  background-position: var(--grid-origin) var(--grid-origin);
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
.element::before { content: ''; position: absolute; inset: var(--selection-hit); }
.element::after { content: ''; position: absolute; inset: var(--selection-inset); border: var(--selection-stroke) dashed transparent; pointer-events: none; }
.element:hover::after { border-color: #94a3b866; }
.element.selected::after { border-color: #64748bb3; }
.position-readout { color: #667085; font-variant-numeric: tabular-nums; }
.element:active { cursor: grabbing; }
.label-text { white-space: pre; color: #000 !important; font-weight: normal; }
.barcode-bars { background: repeating-linear-gradient(90deg, #000 0 2px, #fff 2px 4px, #000 4px 5px, #fff 5px 8px); }
.barcode-caption { display: block; text-align: center; font-size: 10px; line-height: 1.25; color: #000 !important; }
.barcode-disabled { display: block; padding: 6px; border: 1px dashed #777; font-size: 10px; }
.paper .qr-symbol { display: block; font-size: inherit; color: #000 !important; }
.resize-handle { position: absolute; right: 0; bottom: 0; transform: translate(50%, 50%); padding: 0; border-style: solid; border-color: #64748b; background: #fff; cursor: nwse-resize; touch-action: none; z-index: 2; border-radius: 0; }
.printed-rectangle { width: 100%; height: 100%; border: 1px solid #000; box-sizing: border-box; }
.printed-line { width: 100%; height: 100%; background: #000; }
.properties { min-width: 0; min-height: 0; overflow: auto; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; }
.properties h4 { margin: 0; font-size: .9rem; }
.properties h4 span { color: #6b7280; font-weight: normal; }
/* Aprovechar la altura de pantalla sin comprimir las filas de selección. */
.element-list { display: flex; flex-direction: column; gap: 4px; max-height: clamp(240px, 35dvh, 420px); overflow: auto; margin: 10px 0 16px; }
.element-list button { flex-shrink: 0; padding: 9px; border: 1px solid #d1d5db; border-radius: 5px; background: #fff; color: #111; text-align: left; cursor: pointer; overflow-wrap: anywhere; font-size: .78rem; }
.element-list button.active { border-color: #111; box-shadow: inset 3px 0 #111; }
.selection-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.property-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.locked-properties { opacity: .6; }
.lock-button { margin-bottom: 12px; }
.property-grid label { display: flex; flex-direction: column; gap: 5px; min-width: 0; font-size: .75rem; font-weight: 600; color: #4b5563; }
.property-grid :deep(input) { min-width: 0; width: 100%; }
.full { grid-column: 1 / -1; }
.hint { margin: 8px 0 0; font-size: .75rem; line-height: 1.5; color: #667085; }
@media (max-width: 760px) {
  .workspace { grid-template-columns: minmax(0, 1fr); overflow: auto; }
  .viewport { min-height: 330px; }
  .properties { overflow: visible; }
}
</style>
