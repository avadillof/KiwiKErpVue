<template>
  <Dialog v-model:visible="visible" modal header="Imprimir etiqueta" class="kiwik-dialog" :style="{ width: 'min(560px, 94vw)' }">
    <div class="grid">
      <div class="col-12"><label>Plantilla</label>
        <Select :loading="loading" :disabled="loading" v-model="templateId" :options="templates" optionLabel="nombre" optionValue="id" class="w-full" size="small" />
      </div>
      <div class="col-12"><label>Copias</label><InputNumber v-model="copies" :min="1" :max="999" class="w-full" size="small" /></div>
    </div>
    <PnLabelPrinters :zpl="zpl" />
    <pre v-if="zpl" class="zpl">{{ zpl }}</pre>
    <small v-if="msg" class="msg" role="status">{{ msg }}</small>
    <Button v-if="msg" label="Recargar plantillas" text :disabled="loading" @click="refreshTemplates" />
    <template #footer>
      <div class="print-footer">
        <div class="kiwik-separator" />
        <div class="print-footer-actions">
          <Button label="Cerrar" text severity="secondary" @click="visible = false" />
          <Button label="Descargar .zpl" icon="pi pi-download" size="small" severity="secondary" @click="download" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import PnLabelPrinters from './Pn_LabelPrinters.vue';
import Button from 'primevue/button';
import Select from 'primevue/select';
import InputNumber from 'primevue/inputnumber';
import { LABEL_SAMPLE, type LabelTemplate } from '../../../libs/labels/labelTemplate';
import { buildZpl, downloadZpl } from '../../../libs/labels/zplGenerator';
import { loadTemplates, templateError } from '../../../services/Labels/labelTemplateService';

const props = defineProps<{ product?: any }>();
const visible = defineModel<boolean>('visible', { default: false });
const templates = ref<LabelTemplate[]>([]);
const loading = ref(false);
const templateId = ref('');
const copies = ref(1);
const msg = ref('');

let loadId = 0;
watch(visible, (open) => { if (open) void refreshTemplates(); else loadId++; });
async function refreshTemplates(): Promise<void> {
  const request = ++loadId;
  loading.value = true; msg.value = ''; templates.value = [];
  try {
    const rows = await loadTemplates();
    if (request !== loadId) return;
    templates.value = rows;
    if (!rows.some(t => t.id === templateId.value)) templateId.value = rows[0]?.id ?? '';
    if (!rows.length) msg.value = 'No hay plantillas en base de datos. Crea o importa una desde Configuración / Etiquetas.';
  } catch (e) { if (request === loadId) msg.value = templateError(e); }
  finally { if (request === loadId) loading.value = false; }
}

const sample = computed(() => ({
  ...LABEL_SAMPLE,
  '{{producto.codigo}}': String(props.product?.code ?? LABEL_SAMPLE['{{producto.codigo}}']),
  '{{producto.descripcion}}': String(props.product?.description ?? LABEL_SAMPLE['{{producto.descripcion}}']),
  '{{producto.codigoBarras}}': String(props.product?.barcode ?? props.product?.code ?? LABEL_SAMPLE['{{producto.codigoBarras}}']),
  // Plantillas antiguas con {{cantidad}}: valor fijo para no imprimir basura.
  '{{cantidad}}': '1',
}));
const tpl = computed(() => templates.value.find((t: LabelTemplate) => t.id === templateId.value));
const zpl = computed(() => {
  if (!tpl.value) return '';
  const one = buildZpl(tpl.value, sample.value);
  return Array.from({ length: Math.min(copies.value || 1, 20) }, () => one).join('\n');
});

function download(): void {
  if (!tpl.value) return;
  downloadZpl(tpl.value.nombre || 'etiqueta', zpl.value);
}
</script>

<style scoped>
.print-footer { width: 100%; }
.print-footer-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
label { font-size: .72rem; font-weight: 700; color: #6b7280; display: block; margin-bottom: 3px; }
.zpl { background: #111827; color: #d1fae5; border-radius: 8px; padding: 10px; max-height: 240px; overflow: auto; font-size: .72rem; margin-top: 10px; }
.msg { color: #6b7280; font-size: .75rem; }
</style>
