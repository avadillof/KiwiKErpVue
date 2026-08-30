<template>
    <Dialog v-model:visible="visible" modal maximizable :header="quote.pkid ? `${documentLabel} ${quote.code}` : `Nuevo ${documentLabel.toLowerCase()}`"
        :style="{ width: '95vw', maxWidth: '95vw', height: '95dvh' }" class="kiwik-dialog" :closable="!loadingQuote" :dismissableMask="!loadingQuote" :pt="{ content: { class: 'overflow-y-auto overflow-x-hidden' } }">
        <div class="quote-content flex flex-column gap-4">
            <div v-if="loadingQuote" class="quote-loading-overlay">
                <ProgressSpinner strokeWidth="4" />
                <span>Cargando {{ documentLabel.toLowerCase() }}...</span>
            </div>
            <Message severity="info" variant="simple" icon="pi pi-info-circle">
                {{ quote.pkid ? `Estado: ${quote.state}${quote.state === 'Enviado / Sended' ? ' · Al guardar cambios volverá a borrador y deberá reenviarse.' : isEditable ? '' : ` · ${documentLabel} bloqueado, solo consulta.`}` : 'Se creará como borrador.' }}
            </Message>
            <div v-if="isOrder" class="order-progress" aria-label="Seguimiento operativo del pedido">
                <template v-if="quote.state === 'Para Aprobar / To Approved Sale'"><i class="pi pi-file-edit"></i><span><b>Pedido en borrador.</b> Confírmalo cuando las líneas estén revisadas para iniciar el circuito de entrega o facturación.</span></template>
                <template v-else>
                    <div class="order-progress-title"><i class="pi pi-chart-bar"></i><div><b>Seguimiento operativo</b><small>Estado real según las líneas del pedido</small></div></div>
                    <div class="order-progress-items">
                        <div class="order-progress-item delivery"><i class="pi pi-truck"></i><div><b>{{ orderProgress.deliveryLines }}</b><span>Pendientes de albarán</span><small>{{ orderProgress.deliveryQuantity }} uds. por entregar</small></div></div>
                        <div class="order-progress-item invoice"><i class="pi pi-receipt"></i><div><b>{{ orderProgress.invoiceLines }}</b><span>Facturación directa</span><small>Servicios o transporte</small></div></div>
                        <div class="order-progress-item complete"><i class="pi pi-check-circle"></i><div><b>{{ orderProgress.completedLines }}</b><span>Líneas completadas</span><small>Entregadas o facturadas</small></div></div>
                    </div>
                </template>
            </div>

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
                    <div class="col-12 md:col-2"><FloatLabel variant="on"><InputText id="quote-code" v-model="quote.code" readonly class="w-full" /><label for="quote-code">Código</label></FloatLabel></div>
                    <div class="col-12 md:col-2"><FloatLabel variant="on"><DatePicker id="quote-date" v-model="createDate" dateFormat="dd/mm/yy" showIcon :disabled="!isEditable" class="w-full" /><label for="quote-date">Fecha</label></FloatLabel><InlineMessage v-if="errors.createDate" severity="error">{{ errors.createDate }}</InlineMessage></div>
                    <div v-if="!isOrder" class="col-12 md:col-2"><FloatLabel variant="on"><DatePicker id="quote-validity" v-model="validityDate" :minDate="createDate ?? undefined" dateFormat="dd/mm/yy" showIcon :disabled="!isEditable" class="w-full" /><label for="quote-validity">Válido hasta</label></FloatLabel><InlineMessage v-if="errors.validityDate" severity="error">{{ errors.validityDate }}</InlineMessage></div>
                    <div class="col-12" :class="isOrder ? 'md:col-8' : 'md:col-6'"><FloatLabel variant="on"><CustomerLookup v-if="isEditable" id="quote-customer" v-model="quote.entityId" :label="customerLabel" @selected="selectCustomer" /><InputText v-else :modelValue="customerLabel" disabled class="w-full" /><label for="quote-customer">Cliente</label></FloatLabel><InlineMessage v-if="errors.recipient" severity="error">{{ errors.recipient }}</InlineMessage></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><Select id="quote-rate" v-model="quote.salesTarifaId" :options="rates" optionLabel="description" optionValue="pkid" filter showClear :disabled="!isEditable" class="w-full" /><label for="quote-rate">Tarifa</label></FloatLabel><small class="currency-hint"><i class="pi pi-dollar"></i> Moneda: {{ currencyLabel }}</small><InlineMessage v-if="errors.salesTarifaId" severity="error">{{ errors.salesTarifaId }}</InlineMessage></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><Select id="quote-term" v-model="quote.salesTermId" :options="terms" optionLabel="description" optionValue="pkid" filter showClear :disabled="!isEditable" class="w-full" /><label for="quote-term">Forma de pago</label></FloatLabel><InlineMessage v-if="errors.salesTermId" severity="error">{{ errors.salesTermId }}</InlineMessage></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><Select id="quote-fiscal-position" v-model="quote.retentionId" :options="fiscalPositions" optionLabel="description" optionValue="pkid" filter showClear :disabled="!isEditable" class="w-full" /><label for="quote-fiscal-position">Posición fiscal</label></FloatLabel><InlineMessage v-if="errors.retentionId" severity="error">{{ errors.retentionId }}</InlineMessage></div>
                    <div class="col-12 md:col-3"><FloatLabel variant="on"><InputText id="quote-reference" v-model="quote.reference" :disabled="!isEditable" class="w-full" /><label for="quote-reference">Referencia</label></FloatLabel></div>
                    <div class="col-12 md:col-12"><FloatLabel variant="on"><InputText id="quote-contact" v-model="quote.contact" :disabled="!isEditable" class="w-full" /><label for="quote-contact">Persona de contacto</label></FloatLabel><InlineMessage v-if="errors.recipient" severity="error">{{ errors.recipient }}</InlineMessage></div>
                </div>
            </Panel>

            <Panel class="product-lines-panel">
                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle panel-icon"><i class="pi pi-list text-primary"></i></div>
                        <span class="font-bold">Líneas del {{ documentLabel }}.</span>
                    </div>
                </template>
                <template #icons><Button label="Añadir línea" icon="pi pi-plus" size="small" :disabled="!canAddLine || !isEditable" @click="addLine" /></template>
                <DataTable ref="quoteLinesTable" :value="quote.lines" size="small" scrollable scrollHeight="300px" stripedRows class="quote-lines">
                    <Column header="Producto" style="min-width: 245px"><template #body="{ data }"><ProductLookup v-if="isEditable" v-model="data.productId" :label="data.productId ? productLabel(data.productId) : ''" @selected="selectProduct(data, $event)" @cleared="clearProduct(data)" /><InputText v-else :modelValue="productLabel(data.productId)" disabled class="w-full" /></template></Column>
                    <Column header="Descripción" style="min-width: 250px"><template #body="{ data }"><InputText v-model="data.nameProduct" :disabled="!isEditable" class="w-full" /></template></Column>
                    <Column header="Cant." style="min-width: 78px"><template #body="{ data }"><InputNumber v-model="data.quantity" locale="de-DE" :min="0" :minFractionDigits="0" :maxFractionDigits="3" :disabled="!isEditable" class="w-full" /></template></Column>
                    <Column v-if="isOrder" style="min-width: 78px"><template #header><span class="line-header delivery"><i class="pi pi-truck"></i> Entregada</span></template><template #body="{ data }"><span class="line-progress-value">{{ formatQuantity(data.quantityDelivered) }}</span></template></Column>
                    <Column v-if="isOrder" style="min-width: 78px"><template #header><span class="line-header invoiced"><i class="pi pi-receipt"></i> Facturada</span></template><template #body="{ data }"><span class="line-progress-value">{{ formatQuantity(data.quantityInvoiced) }}</span></template></Column>
                    <Column v-if="isOrder" style="min-width: 78px"><template #header><span class="line-header cancelled"><i class="pi pi-times-circle"></i> Cancelada</span></template><template #body="{ data }"><span class="line-progress-value">{{ formatQuantity(data.quantityCanceled) }}</span></template></Column>
                    <Column v-if="isOrder" style="min-width: 82px"><template #header><span class="line-header pending"><i class="pi pi-clock"></i> Pendiente</span></template><template #body="{ data }"><span class="line-pending-value">{{ formatQuantity(linePending(data)) }}</span></template></Column>
                    <Column header="UOM" style="min-width: 105px"><template #body="{ data }"><Select v-if="isEditable" v-model="data.uomId" :options="compatibleUoms(data)" optionLabel="description" optionValue="pkid" :disabled="!data.productId" class="w-full" @update:modelValue="selectUom(data, $event)" /><InputText v-else :modelValue="data.uomDescription" disabled class="w-full" /></template></Column>
                    <Column header="Precio" style="min-width: 100px"><template #body="{ data }"><InputNumber v-model="data.priceUnit" mode="currency" :currency="currencyCode" locale="de-DE" :min="0" :disabled="!isEditable" class="w-full" /></template></Column>
                    <Column header="Dto. %" style="min-width: 72px"><template #body="{ data }"><InputNumber v-model="data.discountPercent" suffix=" %" :min="0" :max="100" :minFractionDigits="0" :maxFractionDigits="2" :disabled="!isEditable" class="w-full" /></template></Column>
                    <Column header="IVA %" style="min-width: 72px"><template #body="{ data }"><InputNumber v-model="data.tax" suffix=" %" :min="0" :max="100" :disabled="hasFiscalPosition || !isEditable" class="w-full" /></template></Column>
                    <Column header="Importe" style="min-width: 125px"><template #body="{ data }"><span class="font-semibold">{{ formatCurrency(lineTotal(data)) }}</span></template></Column>
                    <Column style="width: 55px"><template #body="{ index }"><Button icon="pi pi-trash" severity="danger" text rounded :disabled="!isEditable" @click="quote.lines.splice(index, 1)" /></template></Column>
                </DataTable>
                <div class="quote-summary mt-4"><div class="conditions-card"><label for="quote-terms">Condiciones</label><Textarea id="quote-terms" v-model="quote.terms" rows="10" :disabled="!isEditable" class="w-full" /></div><div class="totals-card"><div v-if="totals.discount" class="total-row discount-row"><span><i class="pi pi-tag"></i> Descuento</span><b>- {{ formatCurrency(totals.discount) }}</b></div><div class="total-row"><span><i class="pi pi-wallet"></i> Base imponible</span><b>{{ formatCurrency(totals.net) }}</b></div><div class="total-row"><span><i class="pi pi-percentage"></i> IVA</span><b>{{ formatCurrency(totals.tax) }}</b></div><div v-if="totals.retention" class="total-row retention-row"><span><i class="pi pi-minus-circle"></i> Retención</span><b style="color: #B1D70E">- {{ formatCurrency(totals.retention) }}</b></div><div class="total-divider" style="height: 2px; background: #B1D70E; opacity: .65"></div><div class="total-row grand-total"><span><i class="pi pi-calculator"></i> Total</span><b>{{ formatCurrency(totals.total) }}</b></div></div></div>
            </Panel>

        </div>
        <template #footer><div class="quote-footer"><div class="kiwik-separator quote-footer-separator"></div><div class="quote-footer-actions"><Button label="Cancelar" severity="secondary" text :disabled="loadingQuote" @click="visible = false" /><Button :label="isOrder ? 'Guardar pedido' : 'Guardar borrador'" icon="pi pi-save" :loading="saving" :disabled="loadingQuote || !isEditable" @click="save" /></div></div></template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import axios from 'axios';
import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import DatePicker from 'primevue/datepicker'; import Dialog from 'primevue/dialog'; import FloatLabel from 'primevue/floatlabel'; import InlineMessage from 'primevue/inlinemessage'; import InputNumber from 'primevue/inputnumber'; import InputText from 'primevue/inputtext'; import Message from 'primevue/message'; import Panel from 'primevue/panel'; import ProgressSpinner from 'primevue/progressspinner'; import Select from 'primevue/select'; import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useCompanyStore } from '@/stores/companyStore';
import { useAuthStore } from '@/stores/authStore';
import ProductLookup from '@/components/shared/ProductLookup.vue';
import CustomerLookup from '@/components/shared/CustomerLookup.vue';
import type { SalesQuoteDTO, SalesQuoteLineDTO } from '@/models/SalesQuoteDTO';

const props = withDefaults(defineProps<{ documentType?: 'quote' | 'order' }>(), { documentType: 'quote' });
const isOrder = computed(() => props.documentType === 'order');
const documentLabel = computed(() => isOrder.value ? 'Pedido de venta' : 'Presupuesto');
const detailEndpoint = computed(() => isOrder.value ? 'WebGetSalesOrder' : 'WebGetSalesQuote');
const saveEndpoint = computed(() => isOrder.value ? 'WebSaveSalesOrder' : 'WebSaveSalesQuote');

const visible = ref(false); const saving = ref(false); const loadingQuote = ref(false); const toast = useToast(); const companyStore = useCompanyStore(); const authStore = useAuthStore();
const quoteLinesTable = ref<any>();
const customers = ref<any[]>([]); const products = ref<any[]>([]); const rates = ref<any[]>([]); const terms = ref<any[]>([]); const fiscalPositions = ref<any[]>([]); const uoms = ref<any[]>([]);
const createQuote = (): SalesQuoteDTO => ({ pkid: null, type: isOrder.value ? 'S' : 'P', code: '', state: isOrder.value ? 'Para Aprobar / To Approved Sale' : 'Para Aprobar / To Approved Estimation', createDate: new Date().toISOString(), validityDate: null, entityId: null, salesTermId: null, salesTarifaId: null, shippingAddressId: null, billingAddressId: null, retentionId: null, reference: '', contact: '', terms: '', notes: '', lines: [] });
const quote = ref<SalesQuoteDTO>(createQuote());
const isEditable = computed(() => isOrder.value ? !quote.value.pkid || quote.value.state !== 'Realizado / Done' : (!quote.value.pkid || ['Para Aprobar / To Approved Estimation', 'Enviado / Sended'].includes(quote.value.state)));
const errors = ref({ createDate: '', validityDate: '', recipient: '', salesTarifaId: '', salesTermId: '', retentionId: '', lines: '' });
const canAddLine = computed(() => { const lastLine = quote.value.lines[quote.value.lines.length - 1]; return !lastLine || Boolean(lastLine.productId && lastLine.nameProduct?.trim() && lastLine.uomId); });
const toPickerDate = (value: string | null): Date | null => { if (!value) return null; const parsed = new Date(value); if (!Number.isNaN(parsed.getTime())) return parsed; const european = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/.exec(value); if (european) return new Date(Number(european[3]), Number(european[2]) - 1, Number(european[1]), Number(european[4] ?? 0), Number(european[5] ?? 0), Number(european[6] ?? 0)); const sql = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/.exec(value); if (sql) return new Date(Number(sql[1]), Number(sql[2]) - 1, Number(sql[3]), Number(sql[4] ?? 0), Number(sql[5] ?? 0), Number(sql[6] ?? 0)); const localized = value.replace(/\u00a0/g, ' ').match(/^([a-záéíóú]+)\.?\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+([ap])\.\s*m\.$/i); if (!localized) return null; const months: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sept: 8, oct: 9, nov: 10, dic: 11 }; const month = months[localized[1].toLowerCase()]; if (month === undefined) return null; let hour = Number(localized[4]); if (localized[7].toLowerCase() === 'p' && hour < 12) hour += 12; if (localized[7].toLowerCase() === 'a' && hour === 12) hour = 0; return new Date(Number(localized[3]), month, Number(localized[2]), hour, Number(localized[5]), Number(localized[6])); };
const createDate = ref<Date | null>(new Date());
const validityDate = ref<Date | null>(null);
const addLine = async () => { quote.value.lines.push({ pkid: null, productId: null, nameProduct: '', uomId: null, uomDescription: '', uomFactor: 1, basePriceUnit: 0, quantity: 1, priceUnit: 0, tax: 0, productTax: 0, discountPercent: 0, incrementPercent: 0 }); await nextTick(); requestAnimationFrame(() => { const containers = quoteLinesTable.value?.$el?.querySelectorAll('.p-datatable-table-container, .p-datatable-wrapper, .p-datatable-scrollable-body') as NodeListOf<HTMLElement> | undefined; containers?.forEach(container => { container.scrollTop = container.scrollHeight; }); }); };
const clearProduct = (line: SalesQuoteLineDTO) => { line.nameProduct = ''; line.uomId = null; line.uomDescription = ''; line.uomFactor = 1; line.basePriceUnit = 0; line.priceUnit = 0; line.productTax = 0; line.tax = 0; };
const customerLabel = computed(() => { const customer = customers.value.find(item => item.pkid === quote.value.entityId); return customer ? `${customer.code ? `${customer.code} — ` : ''}${customer.name}` : ''; });
const selectCustomer = (customer: any) => { if (!customer) return; const index = customers.value.findIndex(item => item.pkid === customer.pkid); if (index < 0) customers.value.push(customer); else customers.value[index] = customer; quote.value.salesTermId = customer.salesTermId ?? null; quote.value.salesTarifaId = customer.salesTarifaId ?? quote.value.salesTarifaId; quote.value.retentionId = customer.retentionId ?? null; applyFiscalPosition(); };
const compatibleUoms = (line: SalesQuoteLineDTO) => { const product = products.value.find(item => item.pkid === line.productId); return product?.uomCategoryId == null ? uoms.value : uoms.value.filter(uom => uom.categoryId === product.uomCategoryId); };
const selectUom = (line: SalesQuoteLineDTO, uomId: number) => { const uom = uoms.value.find(item => item.pkid === uomId); if (!uom) return; line.uomDescription = uom.description; line.uomFactor = Number(uom.factor ?? 1); line.priceUnit = Number(line.basePriceUnit ?? 0) / (line.uomFactor || 1); };
const selectProduct = (line: SalesQuoteLineDTO, product: any) => { if (!product) return; const index = products.value.findIndex(item => item.pkid === product.pkid); if (index < 0) products.value.push(product); else products.value[index] = product; line.nameProduct = product.description || ''; line.uomId = product.uomId ?? null; line.uomDescription = product.uomDescription ?? ''; line.uomFactor = Number(product.uomFactor ?? 1); line.basePriceUnit = Number(product.salePrice ?? 0) * (line.uomFactor || 1); line.priceUnit = line.basePriceUnit / (line.uomFactor || 1); line.productTax = Number(product.taxValue ?? 0); line.tax = line.productTax; applyFiscalPosition(); };
const productLabel = (productId: number | null) => {
    const product = products.value.find(item => item.pkid === productId);
    return product?.code ?? '';
};
// Criterio contable: se redondean base e impuesto de cada línea antes de
// acumular la cabecera. Debe coincidir con el cálculo persistido en el API.
const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const lineNet = (line: SalesQuoteLineDTO) => roundMoney(Number(line.quantity || 0) * Number(line.priceUnit || 0) * (1 - Number(line.discountPercent || 0) / 100) * (1 + Number(line.incrementPercent || 0) / 100));
const lineTax = (line: SalesQuoteLineDTO) => roundMoney(lineNet(line) * Number(line.tax || 0) / 100);
const lineTotal = (line: SalesQuoteLineDTO) => lineNet(line) + lineTax(line);
const linePending = (line: SalesQuoteLineDTO) => Math.max(0, Number(line.quantity ?? 0) - Number(line.quantityCanceled ?? 0) - (line.requireDelivery ? Number(line.quantityDelivered ?? 0) : Number(line.quantityInvoiced ?? 0)));
const formatQuantity = (value?: number | null) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 }).format(Number(value) || 0);
const fiscalPosition = computed(() => fiscalPositions.value.find(position => position.pkid === quote.value.retentionId) ?? null);
const selectedRate = computed(() => rates.value.find(rate => rate.pkid === quote.value.salesTarifaId) ?? null);
const currencyCode = computed(() => selectedRate.value?.currencyCode || quote.value.currencyCode || 'EUR');
const currencyLabel = computed(() => {
    const symbol = selectedRate.value?.currencySymbol || quote.value.currencySymbol || '€';
    const code = currencyCode.value;
    const description = selectedRate.value?.currencyDescription || quote.value.currencyDescription || 'Euro';
    return `${symbol} · ${code} — ${description}`;
});
const hasFiscalPosition = computed(() => fiscalPosition.value !== null);
const fiscalMode = computed(() => {
    const id = fiscalPosition.value?.pkid;
    if ([1, 2, 3].includes(id)) return 'retention';
    if (id === 4) return 'no-tax';
    if ([6, 7, 8].includes(id)) return 'fixed-tax';
    return 'national';
});
const applyFiscalPosition = () => {
    quote.value.lines.forEach(line => {
        if (fiscalMode.value === 'no-tax') line.tax = 0;
        else if (fiscalMode.value === 'fixed-tax') line.tax = Number(fiscalPosition.value?.value ?? 0);
        else line.tax = Number(line.productTax ?? line.tax ?? 0);
    });
};
const totals = computed(() => {
    const net = quote.value.lines.reduce((sum, line) => sum + lineNet(line), 0);
    const discount = quote.value.lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.priceUnit || 0) * Number(line.discountPercent || 0) / 100, 0);
    const tax = quote.value.lines.reduce((sum, line) => sum + lineTax(line), 0);
    const totalWithTax = net + tax;
    const retention = fiscalMode.value === 'retention' ? roundMoney(net * Number(fiscalPosition.value?.value ?? 0) / 100) : 0;
    return { net, discount, tax, retention, total: totalWithTax - retention };
});
const orderProgress = computed(() => {
    let deliveryLines = 0; let invoiceLines = 0; let completedLines = 0; let deliveryQuantity = 0;
    quote.value.lines.forEach(line => {
        const quantity = Number(line.quantity ?? 0); const canceled = Number(line.quantityCanceled ?? 0);
        const delivered = Number(line.quantityDelivered ?? 0); const invoiced = Number(line.quantityInvoiced ?? 0);
        const requiresDelivery = Boolean(line.requireDelivery);
        const pending = Math.max(0, quantity - canceled - (requiresDelivery ? delivered : invoiced));
        if (pending <= 0.0001) { completedLines++; return; }
        if (requiresDelivery) { deliveryLines++; deliveryQuantity += pending; } else invoiceLines++;
    });
    return { deliveryLines, invoiceLines, completedLines, deliveryQuantity: Math.round((deliveryQuantity + Number.EPSILON) * 1000) / 1000 };
});
watch(() => quote.value.retentionId, applyFiscalPosition);
// El formato es español (punto de miles y coma decimal). Intl con es-ES no
// agrupa importes de cuatro cifras (p. ej. 1200,00 €), por ello se fuerza
// el patrón de agrupación que se muestra en el resto de la aplicación.
const formatCurrency = (value: number) => new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currencyCode.value,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(Number(value) || 0);
const loadCatalogs = async () => { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebLoadSalesQuoteCatalog`); rates.value = data.rates ?? []; terms.value = data.terms ?? []; fiscalPositions.value = data.fiscalPositions ?? []; uoms.value = data.uoms ?? []; return data; };
const open = async (pkid: number | null) => { quote.value = createQuote(); createDate.value = new Date(); validityDate.value = null; loadingQuote.value = true; visible.value = true; try { const catalog = await loadCatalogs(); if (pkid) { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/${detailEndpoint.value}/${pkid}`); quote.value = { ...createQuote(), ...data, type: isOrder.value ? 'S' : 'P', lines: (data.lines ?? []).map((line: SalesQuoteLineDTO) => { const uom = uoms.value.find(item => item.pkid === line.uomId); return { ...line, productTax: line.productTax ?? line.tax, uomDescription: line.uomDescription ?? uom?.description ?? '', uomFactor: Number(uom?.factor ?? 1), basePriceUnit: Number(line.priceUnit ?? 0) * Number(uom?.factor ?? 1) }; }) }; if (data.entityId && data.entityName && !customers.value.some(item => item.pkid === data.entityId)) customers.value.push({ pkid: data.entityId, name: data.entityName }); quote.value.lines.forEach(line => { if (line.productId && line.productCode && !products.value.some(item => item.pkid === line.productId)) products.value.push({ pkid: line.productId, code: line.productCode }); }); await nextTick(); createDate.value = toPickerDate(data.createDate); validityDate.value = toPickerDate(data.validityDate); applyFiscalPosition(); } else { quote.value.terms = catalog.defaultTerms ?? ''; } } catch (error) { console.error(error); toast.add({ severity: 'error', summary: 'Error', detail: `No se pudo cargar el ${documentLabel.value.toLowerCase()} o sus datos auxiliares.`, life: companyStore.companyInfo.toastDuration ?? 3000 }); } finally { loadingQuote.value = false; } };
const emit = defineEmits<{ saved: [] }>();
const validate = () => { errors.value = { createDate: '', validityDate: '', recipient: '', salesTarifaId: '', salesTermId: '', retentionId: '', lines: '' }; if (!createDate.value) errors.value.createDate = 'Obligatorio'; if (!isOrder.value && !validityDate.value) errors.value.validityDate = 'Obligatorio'; if (!quote.value.entityId && !quote.value.contact?.trim()) errors.value.recipient = 'Indica un cliente o una persona de contacto.'; if (!quote.value.salesTarifaId) errors.value.salesTarifaId = 'Obligatorio'; if (!quote.value.salesTermId) errors.value.salesTermId = 'Obligatorio'; if (!quote.value.retentionId) errors.value.retentionId = 'Obligatorio'; if (!quote.value.lines.length || quote.value.lines.some(line => !line.productId || !line.nameProduct?.trim() || !line.uomId || Number(line.quantity) <= 0)) errors.value.lines = 'Añade al menos una línea completa.'; if (errors.value.lines) toast.add({ severity: 'warn', summary: `Líneas del ${documentLabel.value.toLowerCase()}`, detail: errors.value.lines, life: companyStore.companyInfo.toastDuration ?? 3000 }); return !Object.values(errors.value).some(Boolean); };
const save = async () => { if (!validate()) return; saving.value = true; try { await axios.post(`${import.meta.env.VITE_API_URL}/${saveEndpoint.value}`, { ...quote.value, createDate: createDate.value?.toISOString() ?? null, validityDate: validityDate.value?.toISOString() ?? null, userId: authStore.user?.pkid ?? null }); toast.add({ severity: 'success', summary: 'Guardado correctamente', life: companyStore.companyInfo.toastDuration ?? 3000 }); visible.value = false; emit('saved'); } catch (error: any) { toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data ?? `No se pudo guardar el ${documentLabel.value.toLowerCase()}.`, life: companyStore.companyInfo.toastDuration ?? 3000 }); } finally { saving.value = false; } };
defineExpose({ open });
</script>

<style scoped>
.quote-lines :deep(.p-inputnumber), .quote-lines :deep(.p-select) { min-width: 100%; }
.quote-content { position:relative; width:100%; max-width:100%; min-width:0; display:flex; flex-direction:column; align-items:stretch; height:calc(95dvh - 155px); min-height:0; overflow-y:auto; overflow-x:hidden; }.quote-content > * { box-sizing:border-box; min-width:0; max-width:100%; }.quote-content :deep(.p-panel), .quote-content :deep(.p-panel-header), .quote-content :deep(.p-panel-content) { box-sizing:border-box; width:100% !important; max-width:100% !important; min-width:0 !important; }.quote-content :deep(.p-panel-content) { overflow:hidden; }
.quote-loading-overlay { position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; background: rgba(255, 255, 255, .88); color: var(--primary-color); font-weight: 600; }
.order-progress { display:flex; align-items:stretch; gap:1rem; padding:1rem 1.1rem; background:linear-gradient(135deg,#f8fbf2,#fff); border:1px solid #dceab9; border-left:5px solid #84a800; border-radius:10px; color:#58664c; }.order-progress > i { color:#78a514; font-size:1.15rem; }.order-progress-title { width:150px; display:flex; align-items:center; gap:.55rem; color:#40582a; }.order-progress-title i { color:#78a514; font-size:1.3rem; }.order-progress-title b,.order-progress-title small { display:block; }.order-progress-title b { font-size:.96rem; }.order-progress-title small { margin-top:.18rem; color:#79846f; font-size:.72rem; line-height:1.2; }.order-progress-items { flex:1; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.65rem; }.order-progress-item { min-width:0; display:flex; align-items:center; gap:.65rem; padding:.65rem .75rem; border-radius:8px; background:#fff; border:1px solid #e1e8d5; }.order-progress-item > i { width:32px; height:32px; flex:0 0 32px; display:grid; place-items:center; border-radius:8px; font-size:1rem; }.order-progress-item div { min-width:0; }.order-progress-item b,.order-progress-item span,.order-progress-item small { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.order-progress-item b { color:#374431; font-size:1.25rem; line-height:1.05; }.order-progress-item span { margin-top:.12rem; color:#4d5947; font-size:.76rem; font-weight:700; }.order-progress-item small { margin-top:.1rem; color:#84907a; font-size:.68rem; }.order-progress-item.delivery > i { background:#e8f3ff; color:#3b82c4; }.order-progress-item.invoice > i { background:#f5ebfb; color:#a16cc0; }.order-progress-item.complete > i { background:#ebf8e5; color:#63a513; }
.panel-icon { width: 32px; height: 32px; }
.totals-card { padding: 1rem 1.25rem; border: 1px solid var(--primary-200); border-radius: 12px; background: linear-gradient(135deg, var(--surface-0), var(--primary-50)); box-shadow: 0 5px 14px rgba(0, 0, 0, .06); }
.quote-summary { box-sizing:border-box; width:100%; max-width:100%; min-width:0; overflow:hidden; display:grid; grid-template-columns:minmax(180px,calc(17% - .5rem)) minmax(0,calc(83% - .5rem)); align-items:stretch; gap:1rem; }.conditions-card,.totals-card { box-sizing:border-box; width:100%; min-width:0; max-width:100%; overflow:hidden; }.totals-card { order:1; }.conditions-card { order:2; padding:1rem 1.25rem; border:1px solid var(--surface-200); border-radius:12px; background:var(--surface-0); box-shadow:0 5px 14px rgba(0,0,0,.05); }.conditions-card label { display:block; margin-bottom:.55rem; color:var(--text-color-secondary); font-size:.9rem; font-weight:600; }.quote-footer { box-sizing:border-box; width:100%; }.quote-footer-separator { width:100%; min-height:1px; margin:0 0 .75rem; border-top:1px solid var(--surface-300); }.quote-footer-actions { display:flex; justify-content:flex-end; gap:.5rem; }
.product-lines-panel { flex:0 0 auto; align-self:stretch; box-sizing:border-box; width:100% !important; min-width:0; max-width:100% !important; overflow:hidden; display:flex; flex-direction:column; }.product-lines-panel :deep(.p-panel-content) { width:100% !important; max-width:100% !important; min-width:0; overflow:hidden; display:flex; flex-direction:column; }.quote-lines { width:100% !important; min-width:0; min-height:300px; max-height:300px; overflow:hidden; }.quote-lines :deep(.p-datatable-table-container), .quote-lines :deep(.p-datatable-wrapper), .quote-lines :deep(.p-datatable-scrollable-body) { width:100% !important; max-width:100% !important; height:300px !important; min-height:300px; max-height:300px; overflow:auto !important; }
@media (max-width: 900px) { .quote-content { height: auto; overflow-y: auto; }.product-lines-panel { min-height: 760px; }.quote-summary { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .order-progress { flex-direction:column; }.order-progress-title { width:auto; }.order-progress-items { width:100%; } }
@media (max-width: 700px) { .order-progress-items { grid-template-columns:1fr; }.order-progress-item b,.order-progress-item span,.order-progress-item small { white-space:normal; } }
.total-row { display: flex; align-items: center; justify-content: space-between; gap: .65rem; font-size: 1rem; line-height: 1.75; }.total-row span { min-width:0; display: inline-flex; align-items: center; gap: .45rem; }.total-row i { color: var(--primary-color); font-size:.9rem; }
.total-row span { flex:1 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color: var(--text-color-secondary); }.total-row b { flex:0 0 auto; white-space:nowrap; text-align:right; font-variant-numeric:tabular-nums; }
.retention-row b { color: var(--primary-color) !important; }.total-divider { height: 0; margin: .6rem 0; border-top: 2px solid var(--primary-color); opacity: .45; }
.discount-row b { color: var(--primary-color); }
.grand-total { color: var(--primary-color); font-size: 1.25rem; font-weight: 700; }.grand-total span { color: var(--primary-color); font-weight: 700; }.grand-total b { font-size: 1.45rem; }
.quote-content :deep(.p-inputtext:disabled), .quote-content :deep(.p-inputnumber-input:disabled), .quote-content :deep(textarea:disabled) { opacity: 1 !important; color: #4b5563 !important; background: #f8fafc !important; border-color: #e5e7eb !important; -webkit-text-fill-color: #4b5563; }
.quote-content :deep(.p-select.p-disabled), .quote-content :deep(.p-datepicker.p-disabled) { opacity: 1 !important; background: #f8fafc !important; border-color: #e5e7eb !important; }
.quote-content :deep(.p-select.p-disabled .p-select-label), .quote-content :deep(.p-select.p-disabled .p-select-dropdown), .quote-content :deep(.p-datepicker.p-disabled input) { opacity: 1 !important; color: #4b5563 !important; }
.currency-hint { display: block; margin-top: .35rem; color: var(--primary-color); font-size: .76rem; font-weight: 600; }
.line-progress-value { display:inline-flex; min-width:56px; justify-content:flex-end; padding:.48rem .35rem; border-radius:6px; background:#f8fafc; color:#6b7280; border:1px solid #e5e7eb; font-weight:600; }.line-pending-value { display:inline-flex; min-width:60px; justify-content:flex-end; padding:.48rem .35rem; border-radius:6px; background:#eef6da; color:#5f810e; border:1px solid #dceab9; font-weight:700; }
.line-header { display:inline-flex; align-items:center; gap:.3rem; white-space:nowrap; }.line-header.delivery i { color:#2875b6; }.line-header.invoiced i { color:#9253b5; }.line-header.cancelled i { color:#d13d3d; }.line-header.pending i { color:#65920e; }
.currency-hint i { margin-right: .25rem; }
</style>
