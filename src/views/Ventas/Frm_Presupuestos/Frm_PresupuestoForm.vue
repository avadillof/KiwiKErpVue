<template>
    <Dialog v-model:visible="visible" modal maximizable :header="quote.pkid ? `Presupuesto ${quote.code}` : 'Nuevo presupuesto'"
        :style="{ width: '95%', height: '95%' }" class="kiwik-dialog" :closable="!loadingQuote" :dismissableMask="!loadingQuote" :pt="{ content: { class: 'overflow-y-auto' } }">
        <div class="quote-content flex flex-column gap-4">
            <div v-if="loadingQuote" class="quote-loading-overlay">
                <ProgressSpinner strokeWidth="4" />
                <span>Cargando presupuesto...</span>
            </div>
            <Message severity="info" variant="simple" icon="pi pi-info-circle">
                {{ quote.pkid ? `Estado: ${quote.state}` : 'Se creará como borrador. El código oficial se asignará al confirmar el cliente.' }}
            </Message>

            <Panel>
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle panel-icon">
                            <i class="pi pi-info text-primary"></i>
                        </div>
                        <span class="font-bold">Datos Generales.</span>
                    </div>
                </template>
                <div class="grid p-fluid mb-2">
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><InputText id="quote-code" v-model="quote.code" readonly class="w-full" /><label for="quote-code">Código</label></FloatLabel></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><DatePicker id="quote-date" v-model="createDate" dateFormat="dd/mm/yy" class="w-full" /><label for="quote-date">Fecha</label></FloatLabel></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><DatePicker id="quote-validity" v-model="validityDate" dateFormat="dd/mm/yy" showIcon class="w-full" /><label for="quote-validity">Válido hasta</label></FloatLabel></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><Select id="quote-state" v-model="quote.state" :options="states" class="w-full" /><label for="quote-state">Estado</label></FloatLabel></div>
                    <div class="col-12 md:col-6"><FloatLabel variant="on"><Select id="quote-customer" v-model="quote.entityId" :options="customers" optionLabel="name" optionValue="pkid" filter class="w-full"><template #option="{ option }">{{ option.code ? `${option.code} — ` : '' }}{{ option.name }}</template></Select><label for="quote-customer">Cliente</label></FloatLabel></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><Select id="quote-rate" v-model="quote.salesTarifaId" :options="rates" optionLabel="description" optionValue="pkid" filter showClear class="w-full" /><label for="quote-rate">Tarifa</label></FloatLabel></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><Select id="quote-term" v-model="quote.salesTermId" :options="terms" optionLabel="description" optionValue="pkid" filter showClear class="w-full" /><label for="quote-term">Forma de pago</label></FloatLabel></div>
                    <div class="col-12 md:col-4"><FloatLabel variant="on"><InputText id="quote-reference" v-model="quote.reference" class="w-full" /><label for="quote-reference">Referencia</label></FloatLabel></div>
                    <div class="col-12 md:col-4"><FloatLabel variant="on"><InputText id="quote-contact" v-model="quote.contact" class="w-full" /><label for="quote-contact">Persona de contacto</label></FloatLabel></div>
                    <div class="col-12 md:col-4"><FloatLabel variant="on"><Select id="quote-shipping" v-model="quote.shippingMethodId" :options="shippingMethods" optionLabel="description" optionValue="pkid" filter showClear class="w-full" /><label for="quote-shipping">Método de envío</label></FloatLabel></div>
                </div>
            </Panel>

            <Panel>
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle panel-icon"><i class="pi pi-list text-primary"></i></div>
                        <span class="font-bold">Líneas del Presupuesto.</span>
                    </div>
                </template>
                <template #icons><Button label="Añadir línea" icon="pi pi-plus" size="small" @click="addLine" /></template>
                <DataTable :value="quote.lines" size="small" scrollable scrollHeight="700px" stripedRows class="quote-lines">
                    <Column header="Producto" style="min-width: 245px"><template #body="{ data }"><Select v-model="data.productId" :options="products" optionValue="pkid" filter class="w-full" @update:modelValue="selectProduct(data, $event)"><template #value="{ value }">{{ productLabel(value) || 'Seleccionar producto...' }}</template><template #option="{ option }">{{ option.code }} — {{ option.description }}</template></Select></template></Column>
                    <Column header="Descripción" style="min-width: 250px"><template #body="{ data }"><InputText v-model="data.nameProduct" class="w-full" /></template></Column>
                    <Column header="Cant." style="min-width: 100px"><template #body="{ data }"><InputNumber v-model="data.quantity" :min="0" :minFractionDigits="0" :maxFractionDigits="3" class="w-full" /></template></Column>
                    <Column header="Precio" style="min-width: 120px"><template #body="{ data }"><InputNumber v-model="data.priceUnit" mode="currency" currency="EUR" locale="es-ES" :min="0" class="w-full" /></template></Column>
                    <Column header="Dto. %" style="min-width: 95px"><template #body="{ data }"><InputNumber v-model="data.discountPercent" suffix=" %" :min="0" :max="100" class="w-full" /></template></Column>
                    <Column header="IVA %" style="min-width: 95px"><template #body="{ data }"><InputNumber v-model="data.tax" suffix=" %" :min="0" :max="100" class="w-full" /></template></Column>
                    <Column header="Importe" style="min-width: 125px"><template #body="{ data }"><span class="font-semibold">{{ formatCurrency(lineTotal(data)) }}</span></template></Column>
                    <Column style="width: 55px"><template #body="{ index }"><Button icon="pi pi-trash" severity="danger" text rounded @click="quote.lines.splice(index, 1)" /></template></Column>
                </DataTable>
                <div class="flex justify-content-end mt-3"><div class="totals-grid"><span>Base imponible</span><b>{{ formatCurrency(totals.net) }}</b><span>IVA</span><b>{{ formatCurrency(totals.tax) }}</b><span class="text-primary font-bold">Total</span><b class="text-primary">{{ formatCurrency(totals.total) }}</b></div></div>
            </Panel>

            <Panel>
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle panel-icon"><i class="pi pi-comments text-primary"></i></div>
                        <span class="font-bold">Condiciones y observaciones.</span>
                    </div>
                </template>
                <div class="grid p-fluid"><div class="col-12 md:col-6"><FloatLabel variant="on"><Textarea id="quote-terms" v-model="quote.terms" rows="5" class="w-full" /><label for="quote-terms">Condiciones</label></FloatLabel></div><div class="col-12 md:col-6"><FloatLabel variant="on"><Textarea id="quote-notes" v-model="quote.notes" rows="5" class="w-full" /><label for="quote-notes">Notas internas</label></FloatLabel></div></div>
            </Panel>

            <div class="kiwik-separator" style="margin-top: 10px;"></div>
        </div>
        <template #footer><Button label="Cancelar" severity="secondary" text :disabled="loadingQuote" @click="visible = false" /><Button label="Guardar borrador" icon="pi pi-save" :loading="saving" :disabled="loadingQuote" @click="save" /></template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import DatePicker from 'primevue/datepicker'; import Dialog from 'primevue/dialog'; import FloatLabel from 'primevue/floatlabel'; import InputNumber from 'primevue/inputnumber'; import InputText from 'primevue/inputtext'; import Message from 'primevue/message'; import Panel from 'primevue/panel'; import ProgressSpinner from 'primevue/progressspinner'; import Select from 'primevue/select'; import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useCompanyStore } from '@/stores/companyStore';
import type { SalesQuoteDTO, SalesQuoteLineDTO } from '@/models/SalesQuoteDTO';

const visible = ref(false); const saving = ref(false); const loadingQuote = ref(false); const toast = useToast(); const companyStore = useCompanyStore();
const customers = ref<any[]>([]); const products = ref<any[]>([]); const rates = ref<any[]>([]); const terms = ref<any[]>([]); const shippingMethods = ref<any[]>([]);
const states = ['Borrador / Draft', 'Para Aprobar / To Approved Estimation', 'Aprobado / Approved', 'Enviado / Sended', 'Cancelado / Canceled'];
const createQuote = (): SalesQuoteDTO => ({ pkid: null, type: 'P', code: '', state: 'Borrador / Draft', createDate: new Date().toISOString(), validityDate: null, entityId: null, salesTermId: null, salesTarifaId: null, shippingAddressId: null, billingAddressId: null, shippingMethodId: null, reference: '', contact: '', terms: '', notes: '', lines: [] });
const quote = ref<SalesQuoteDTO>(createQuote());
const createDate = computed<Date | null>({
    get: () => quote.value.createDate ? new Date(quote.value.createDate) : null,
    set: value => { quote.value.createDate = value ? value.toISOString() : ''; }
});
const validityDate = computed<Date | null>({
    get: () => quote.value.validityDate ? new Date(quote.value.validityDate) : null,
    set: value => { quote.value.validityDate = value ? value.toISOString() : null; }
});
const addLine = () => quote.value.lines.push({ pkid: null, productId: null, nameProduct: '', uomId: null, quantity: 1, priceUnit: 0, tax: 0, discountPercent: 0, incrementPercent: 0 });
const selectProduct = (line: SalesQuoteLineDTO, productId: number) => { const product = products.value.find(item => item.pkid === productId); if (!product) return; line.nameProduct = product.salesDescription || product.description || ''; line.uomId = product.uomId ?? product.unitOfMeasure?.pkid ?? null; line.priceUnit = Number(product.salePrice ?? 0); line.tax = Number(product.taxValue ?? product.saleTax?.value ?? 0); };
const productLabel = (productId: number | null) => { const product = products.value.find(item => item.pkid === productId); return product ? `${product.code ?? ''} — ${product.description ?? ''}` : ''; };
const lineNet = (line: SalesQuoteLineDTO) => Number(line.quantity || 0) * Number(line.priceUnit || 0) * (1 - Number(line.discountPercent || 0) / 100) * (1 + Number(line.incrementPercent || 0) / 100);
const lineTotal = (line: SalesQuoteLineDTO) => lineNet(line) * (1 + Number(line.tax || 0) / 100);
const totals = computed(() => { const net = quote.value.lines.reduce((sum, line) => sum + lineNet(line), 0); const total = quote.value.lines.reduce((sum, line) => sum + lineTotal(line), 0); return { net, tax: total - net, total }; });
const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);
const loadCatalogs = async () => { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebLoadSalesQuoteCatalog`); customers.value = data.customers ?? []; products.value = data.products ?? []; rates.value = data.rates ?? []; terms.value = data.terms ?? []; shippingMethods.value = data.shippingMethods ?? []; };
const open = async (pkid: number | null) => { quote.value = createQuote(); loadingQuote.value = true; visible.value = true; try { await loadCatalogs(); if (pkid) { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesQuote/${pkid}`); quote.value = { ...createQuote(), ...data, type: 'P', lines: data.lines ?? [] }; } } catch (error) { console.error(error); toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el presupuesto o sus datos auxiliares.', life: companyStore.companyInfo.toastDuration ?? 3000 }); } finally { loadingQuote.value = false; } };
const emit = defineEmits<{ saved: [] }>();
const save = async () => { if (!quote.value.entityId) { toast.add({ severity: 'warn', summary: 'Cliente obligatorio', detail: 'Selecciona el cliente del presupuesto.', life: companyStore.companyInfo.toastDuration ?? 3000 }); return; } saving.value = true; try { await axios.post(`${import.meta.env.VITE_API_URL}/WebSaveSalesQuote`, quote.value); toast.add({ severity: 'success', summary: 'Guardado correctamente', life: companyStore.companyInfo.toastDuration ?? 3000 }); visible.value = false; emit('saved'); } catch (error: any) { toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data ?? 'No se pudo guardar el presupuesto.', life: companyStore.companyInfo.toastDuration ?? 3000 }); } finally { saving.value = false; } };
defineExpose({ open });
</script>

<style scoped>
.quote-lines :deep(.p-inputnumber), .quote-lines :deep(.p-select) { min-width: 100%; }
.quote-content { position: relative; max-height: 80vh; overflow-y: auto; }
.quote-loading-overlay { position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; background: rgba(255, 255, 255, .88); color: var(--primary-color); font-weight: 600; }
.panel-icon { width: 32px; height: 32px; }
.totals-grid { display: grid; grid-template-columns: 130px 120px; gap: .55rem 1.5rem; text-align: right; }
.totals-grid span { color: var(--text-color-secondary); }.totals-grid b { text-align: right; }
</style>
