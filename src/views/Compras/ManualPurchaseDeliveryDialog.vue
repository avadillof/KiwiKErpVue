<template>
  <Dialog v-model:visible="visible" modal maximizable header="Nuevo albarán de compra" :style="{ width: 'min(1450px, 98vw)', height: '92vh' }" :contentStyle="{ height: 'calc(92vh - 130px)', overflow: 'hidden' }" class="kiwik-dialog" :closable="!saving">
    <div class="manual-form-content">
    <Message severity="info" :closable="false" class="mb-4">Registra el albarán que envía el proveedor con sus líneas de mercancía. Se guardará como borrador con código ALP-AAAA/NNNN.</Message>
    <div class="p-fluid manual-header">
      <div class="fh-supplier"><FloatLabel variant="on"><SupplierLookup :disabled="saving" id="manual-supplier" v-model="form.entityId" :label="supplierLabel" @selected="selectSupplier" @cleared="selectedSupplier=null" /><label for="manual-supplier">Proveedor *</label></FloatLabel><InlineMessage v-if="errors.supplier" severity="error">{{ errors.supplier }}</InlineMessage></div>
      <div class="fh-date"><FloatLabel variant="on"><DatePicker id="manual-date" v-model="form.date" dateFormat="dd/mm/yy" showIcon iconDisplay="input" class="w-full" /><label for="manual-date">Fecha *</label></FloatLabel></div>
      <div class="fh-code"><FloatLabel variant="on"><InputText id="manual-supplier-code" v-model="form.supplierCode" maxlength="100" :invalid="!!errors.supplierCode" /><label for="manual-supplier-code">Nº albarán del proveedor *</label></FloatLabel><InlineMessage v-if="errors.supplierCode" severity="error">{{ errors.supplierCode }}</InlineMessage></div>
      <div class="fh-ref"><FloatLabel variant="on"><InputText id="manual-reference" v-model="form.reference" maxlength="145" /><label for="manual-reference">Referencia interna</label></FloatLabel></div>
    </div>

    <div class="lines-heading"><div><b>Líneas del albarán</b><small>Productos recibidos según el documento del proveedor. El precio es el coste.</small></div><Button label="Añadir línea" icon="pi pi-plus" size="small" @click="addLine" /></div>
    <InlineMessage v-if="errors.lines" severity="error" class="mb-2">{{ errors.lines }}</InlineMessage>
    <DataTable ref="manualLinesTable" :value="form.lines" size="small" stripedRows scrollable scrollHeight="flex" class="manual-lines">
      <Column header="Producto" style="min-width:220px"><template #body="{ data }"><ProductLookup :disabled="saving" mode="purchase" v-model="data.productId" :label="data.productLabel" @selected="selectProduct(data, $event)" @cleared="clearProduct(data)" /></template></Column>
      <Column header="Descripción" style="min-width:250px"><template #body="{ data }"><InputText v-model="data.description" class="w-full" /></template></Column>
      <Column header="Cantidad" style="width:130px" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-model="data.quantity" :disabled="saving" :min="0.001" :maxFractionDigits="3" locale="de-DE" fluid inputClass="text-right" /></template></Column>
      <Column header="Coste" style="width:135px" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-model="data.priceUnit" :disabled="saving" :min="0" :minFractionDigits="2" :maxFractionDigits="4" mode="currency" currency="EUR" locale="de-DE" fluid inputClass="text-right" /></template></Column>
      <Column header="Impuesto %" style="width:120px" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-model="data.tax" :min="0" :max="100" :maxFractionDigits="2" suffix=" %" fluid inputClass="text-right" /></template></Column>
      <Column header="Importe" style="width:130px;text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><b>{{ amount(lineNet(data) * (1 + Number(data.tax || 0) / 100)) }}</b></template></Column>
      <Column style="width:54px"><template #body="{ index }"><Button icon="pi pi-trash" severity="danger" text rounded title="Eliminar línea" @click="removeLine(index)" /></template></Column>
      <template #empty><div class="empty-lines">Añada al menos una línea al albarán.</div></template>
    </DataTable>

    <div class="manual-totals"><span>Unidades <b>{{ quantity(totals.units) }}</b></span><span>Total Neto <b>{{ amount(totals.net) }}</b></span><span>Impuestos <b>{{ amount(totals.tax) }}</b></span><span>Total <b>{{ amount(totals.total) }} EUR</b></span></div>

    <div class="manual-notes">
      <FloatLabel variant="on"><Textarea id="manual-notes" v-model="form.notes" rows="3" maxlength="500" :autoResize="false" class="w-full fixed-observations" style="height:82px;min-height:82px;max-height:82px;resize:none;overflow-y:auto" /><label for="manual-notes">Observaciones</label></FloatLabel>
    </div>
    </div>

    <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-actions"><Button label="Cancelar" severity="secondary" text :disabled="saving" @click="visible=false" /><Button v-if="securityStore.hasPermission(PERM.PURCHASE_DELIV_EDIT)" label="Guardar borrador" icon="pi pi-save" :loading="saving" @click="save" /></div></div></template>
  </Dialog>
</template>

<script setup lang="ts">
import { backendUrl } from '@/services/backendUrl';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';
const securityStore = useSecurityStore();
import { computed, nextTick, reactive, ref } from 'vue';
import axios from 'axios';

import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import DatePicker from 'primevue/datepicker'; import Dialog from 'primevue/dialog'; import FloatLabel from 'primevue/floatlabel'; import InlineMessage from 'primevue/inlinemessage'; import InputNumber from 'primevue/inputnumber'; import InputText from 'primevue/inputtext'; import Message from 'primevue/message'; import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/authStore';
import SupplierLookup from '@/components/shared/SupplierLookup.vue';
import ProductLookup from '@/components/shared/ProductLookup.vue';

const emit = defineEmits<{ saved: [delivery: any] }>();
const toast = useToast(), authStore = useAuthStore();
const visible = ref(false), saving = ref(false), selectedSupplier = ref<any>(null), manualLinesTable = ref<any>(null);
const newLine = () => ({ productId: null as number|null, productLabel: '', description: '', quantity: 1, priceUnit: 0, tax: 0, uomId: null as number|null });
const form = reactive({ entityId: null as number|null, salesTarifaId: null as number|null, date: new Date(), supplierCode: '', reference: '', notes: '', lines: [newLine()] });
const supplierLabel = computed(() => selectedSupplier.value ? `${selectedSupplier.value.code ? `${selectedSupplier.value.code} — ` : ''}${selectedSupplier.value.name}` : '');
const amount = (v: any) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(Number(v) || 0);
const quantity = (v: any) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 3, useGrouping: true }).format(Number(v) || 0);
const lineNet = (line: any) => Number(line.quantity || 0) * Number(line.priceUnit || 0);
const totals = computed(() => {
  const units = form.lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const net = form.lines.reduce((sum, line) => sum + lineNet(line), 0);
  const tax = form.lines.reduce((sum, line) => sum + (lineNet(line) * Number(line.tax || 0)) / 100, 0);
  return { units, net, tax, total: net + tax };
});
const reset = () => { selectedSupplier.value=null; form.entityId=null; form.salesTarifaId=null; form.date=new Date(); form.supplierCode=''; form.reference=''; form.notes=''; form.lines=[newLine()]; clearErrors(); };
const errors = reactive({ supplier: '', supplierCode: '', lines: '' });
const clearErrors = () => { errors.supplier=''; errors.supplierCode=''; errors.lines=''; };
const open = async () => { reset(); visible.value=true; try { const { data } = await axios.get(backendUrl('/WebLoadSalesQuoteCatalog')); form.salesTarifaId = data.defaultTarifaId ?? null; } catch { form.salesTarifaId = null; } };
const selectSupplier = (supplier:any) => { selectedSupplier.value=supplier; errors.supplier=''; };
const addLine = async () => { form.lines.push(newLine()); await nextTick(); requestAnimationFrame(() => { const containers=manualLinesTable.value?.$el?.querySelectorAll('.p-datatable-table-container, .p-datatable-wrapper, .p-datatable-scrollable-body') as NodeListOf<HTMLElement>|undefined; containers?.forEach(container=>{container.scrollTop=container.scrollHeight;}); }); }; const removeLine = (index:number) => form.lines.splice(index,1);
const selectProduct = (line:any, product:any) => { line.productId=product.pkid; line.productLabel=`${product.code} — ${product.description}`; line.description=product.description || ''; line.priceUnit=Number(product.costPrice ?? 0); line.tax=Number(product.purchaseTaxValue ?? product.taxValue ?? 0); line.uomId=product.uomId ?? null; };
const clearProduct = (line:any) => { Object.assign(line,newLine()); };
const save = async () => {
  if(saving.value)return;
  clearErrors();
  let valid = true;
  if (!form.entityId) { errors.supplier='Obligatorio'; valid=false; }
  if (!form.supplierCode.trim()) { errors.supplierCode='Obligatorio'; valid=false; }
  if (!form.lines.length || form.lines.some(line=>!line.productId || Number(line.quantity)<=0)) { errors.lines='Todas las líneas deben tener producto y una cantidad mayor que cero.'; valid=false; }
  if (!valid) return;
  if (!form.salesTarifaId) { toast.add({severity:'error',summary:'Sin tarifa por defecto',detail:'Configura una tarifa por defecto en Ventas → Lista de precios.',life:4000}); return; }
  saving.value=true;
  try { const {data}=await axios.post(backendUrl(`/WebCreateManualPurchasesDelivery`),{userId:authStore.user?.pkid ?? null,entityId:form.entityId,salesTarifaId:form.salesTarifaId,dateCreate:form.date.toISOString(),supplierCode:form.supplierCode.trim(),reference:form.reference,notes:form.notes,lines:form.lines.map(({productId,description,quantity,priceUnit,tax,uomId})=>({productId,description,quantity:Number(quantity),priceUnit:Number(priceUnit),tax:Number(tax),uomId}))}); toast.add({severity:'success',summary:'Albarán creado',detail:`${data.code} se ha guardado como borrador.`,life:4000}); visible.value=false; emit('saved',data); }
  catch(error:any){toast.add({severity:'error',summary:'No se pudo crear el albarán',detail:error.response?.data ?? 'Revisa los datos introducidos.',life:5000});}
  finally{saving.value=false;}
};
defineExpose({open});
</script>

<style scoped>
.manual-form-content{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden}.manual-header{flex:0 0 auto;margin-top:.25rem;display:grid;grid-template-columns:5fr 2fr 5fr;gap:.8rem}.manual-header>div{min-width:0}.fh-ref{grid-column:1/-1}.lines-heading{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;margin:1rem 0 .65rem}.lines-heading div{display:flex;flex-direction:column;gap:.2rem}.lines-heading small{color:#7b8492}.manual-lines{flex:1 1 auto;min-height:220px;overflow:hidden;border:1px solid #e5e7eb;border-radius:8px}.manual-notes{flex:0 0 auto;width:100%;margin-top:1.25rem}.fixed-observations{height:82px!important;min-height:82px!important;max-height:82px!important;resize:none!important;overflow-y:auto!important}.empty-lines{text-align:center;color:#8791a0;padding:2rem}.manual-totals{display:flex;justify-content:flex-end;gap:1.4rem;flex-wrap:wrap;padding:.7rem;margin-top:1rem;background:#fdf6ee;border-radius:6px}.manual-totals b{margin-left:.5rem}:deep(th.text-right .p-datatable-column-header-content){justify-content:flex-end}.dialog-footer,.dialog-actions{width:100%}.dialog-footer-separator{width:100%;min-height:1px;margin:0 0 .75rem}.dialog-actions{display:flex;justify-content:flex-end;gap:.5rem}
</style>
