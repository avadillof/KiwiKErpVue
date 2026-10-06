<template>
  <main class="settings-page">
    <header class="page-header">
      <div class="title-wrap"><span class="icon"><i class="pi pi-sliders-h" /></span><div><small>KiwiKERP / Compras</small><h1>Ajustes de Compras</h1></div></div>
      <div class="actions"><Button label="Volver" icon="pi pi-arrow-left" text severity="secondary" @click="router.push({name:'Compras'})"/><Button v-if="securityStore.hasPermission(PERM.PURCHASE_SETTINGS)" label="Guardar cambios" icon="pi pi-save" :loading="saving" :disabled="loading || !loaded" @click="save"/></div>
    </header>

    <div v-if="loading" class="loading"><i class="pi pi-spin pi-spinner"/> Cargando ajustes…</div>
    <div v-else>
      <section class="settings-card settings-card--first">
        <div class="section-heading"><span><i class="pi pi-hashtag"/></span><div><h2>Numeración de documentos</h2><p>Series utilizadas al crear cada documento. Vacío = serie clásica (FP- / ALP-). Solo afecta a los documentos creados después de guardar.</p></div></div>
        <div class="series-row"><label class="field"><span>Prefijo de serie · Facturas (opcional)</span><InputText v-model="form.invoiceSeriesPrefix" maxlength="10" @update:modelValue="(v) => normalizeSeriesField('invoiceSeriesPrefix', v)" fluid/></label><div class="series-preview"><small>Ejemplo del número resultante</small><strong>FP-{{ seriesInfix(form.invoiceSeriesPrefix) }}{{ currentYear }}/0001</strong></div></div>
        <div class="series-row"><label class="field"><span>Prefijo de serie · Albaranes (opcional)</span><InputText v-model="form.deliverySeriesPrefix" maxlength="10" @update:modelValue="(v) => normalizeSeriesField('deliverySeriesPrefix', v)" fluid/></label><div class="series-preview"><small>Ejemplo del número resultante</small><strong>ALP-{{ seriesInfix(form.deliverySeriesPrefix) }}{{ currentYear }}/0001</strong></div></div>
        <Message severity="warn" :closable="false" class="series-warning">Cambiar la serie solo afecta a los documentos que se creen después de guardar. Los ya creados conservan su número.</Message>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { backendUrl } from '@/services/backendUrl';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';

const router = useRouter();
const toast = useToast();
const securityStore = useSecurityStore();
const currentYear = new Date().getFullYear();
const loading = ref(true);
const loaded = ref(false);
const saving = ref(false);
const form = reactive<any>({ invoiceSeriesPrefix: '', deliverySeriesPrefix: '' });
const normalizeSeriesField = (field: 'invoiceSeriesPrefix' | 'deliverySeriesPrefix', value: string | undefined) => { form[field] = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10); };
const seriesInfix = (value: string | undefined) => { const clean = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10); return clean ? `${clean}-` : ''; };
const load = async () => {
  loading.value = true; loaded.value = false;
  try {
    Object.assign(form, (await axios.get(backendUrl(`/WebGetPurchasesSettings`))).data);
    loaded.value = true;
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudieron cargar los ajustes', detail: e.response?.data || 'Comprueba que la migración de base de datos está aplicada.', life: 5000 });
  } finally { loading.value = false; }
};
const save = async () => {
  if (saving.value || loading.value || !loaded.value) return;
  saving.value = true;
  try {
    Object.assign(form, (await axios.post(backendUrl(`/WebSavePurchasesSettings`), form)).data);
    toast.add({ severity: 'success', summary: 'Ajustes guardados', detail: 'La configuración de Compras ya está actualizada.', life: 3500 });
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudieron guardar', detail: e.response?.data || 'Revisa los valores introducidos.', life: 5000 });
  } finally { saving.value = false; }
};
onMounted(load);
</script>

<style scoped>
.settings-page{width:100%;padding:18px 16px 90px;color:#273244}.page-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:14px;padding:15px 18px;border:1px solid #f0ddc8;border-radius:14px;background:#fff;box-shadow:0 5px 16px rgba(31,41,55,.05)}.title-wrap{display:flex;align-items:center;gap:12px}.title-wrap .icon{display:grid;width:45px;height:45px;place-items:center;border-radius:11px;color:#fff;background:linear-gradient(135deg,#e8a25c,#c96a1e)}.title-wrap small{color:#8b95a4}.title-wrap h1{margin:2px 0 0;font-size:1.35rem}.actions{display:flex;gap:6px}.loading{display:flex;align-items:center;justify-content:center;gap:.6rem;min-height:200px;color:#687386}.settings-card{margin-top:14px;padding:20px;border:1px solid #e1e6eb;border-radius:13px;background:#fff;box-shadow:0 3px 11px rgba(30,41,59,.04)}.settings-card--first{margin-top:0}.section-heading{display:flex;align-items:center;gap:11px;margin-bottom:20px}.section-heading>span{display:grid;width:37px;height:37px;place-items:center;border-radius:9px;color:#9a5a12;background:#fdf0e3}.section-heading h2{margin:0;font-size:1rem}.section-heading p{margin:3px 0 0;color:#7c8796;font-size:.82rem}.series-row{display:grid;grid-template-columns:minmax(220px,.55fr) 1fr;gap:24px;align-items:end}.series-row+.series-row{margin-top:14px}.series-preview{display:flex;min-height:67px;flex-direction:column;justify-content:center;padding:10px 14px;border:1px solid #f0ddc8;border-radius:9px;background:#fffaf5}.series-preview small{color:#7a8594}.series-preview strong{margin-top:4px;color:#9a5a12;font-size:1.08rem}.series-warning{margin-top:14px}.field{display:flex;min-width:0;flex-direction:column;gap:.3rem}.field>span{font-size:.82rem;color:#55604d}
</style>
