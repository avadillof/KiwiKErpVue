<template>
  <Dialog v-model:visible="visible" modal maximizable header="Nuevo albarán manual" :style="{ width: 'min(1450px, 98vw)', height: '92vh' }" :contentStyle="{ height: 'calc(92vh - 130px)', overflow: 'hidden' }" class="kiwik-dialog" :closable="!saving">
    <div class="manual-form-content">
    <Message severity="info" :closable="false" class="mb-4">Este albarán no estará vinculado a un pedido. Las cantidades se contabilizarán como salida únicamente cuando se confirme.</Message>
    <div class="grid p-fluid manual-header">
      <div class="col-12 md:col-6"><FloatLabel variant="on"><CustomerLookup id="manual-customer" v-model="form.entityId" :label="customerLabel" @selected="selectCustomer" /><label for="manual-customer">Cliente *</label></FloatLabel></div>
      <div class="col-12 md:col-3"><FloatLabel variant="on"><DatePicker id="manual-date" v-model="form.date" dateFormat="dd/mm/yy" showIcon iconDisplay="input" showTime hourFormat="24" class="w-full" /><label for="manual-date">Fecha *</label></FloatLabel></div>
      <div class="col-12 md:col-3"><FloatLabel variant="on"><InputText id="manual-reference" v-model="form.reference" maxlength="145" /><label for="manual-reference">Referencia</label></FloatLabel></div>
      <div class="col-12 md:col-4"><FloatLabel variant="on"><Select id="manual-reason" v-model="form.reason" :options="reasons" class="w-full" /><label for="manual-reason">Motivo *</label></FloatLabel></div>
    </div>

    <div class="lines-heading"><div><b>Líneas del albarán</b><small>Seleccione los productos entregados sin pedido previo.</small></div><Button label="Añadir línea" icon="pi pi-plus" size="small" @click="addLine" /></div>
    <DataTable ref="manualLinesTable" :value="form.lines" size="small" stripedRows scrollable scrollHeight="flex" class="manual-lines">
      <Column header="Producto" style="min-width:220px"><template #body="{ data }"><ProductLookup v-model="data.productId" :label="data.productLabel" @selected="selectProduct(data, $event)" @cleared="clearProduct(data)" /></template></Column>
      <Column header="Descripción" style="min-width:250px"><template #body="{ data }"><InputText v-model="data.description" class="w-full" /></template></Column>
      <Column header="Cantidad" style="width:130px"><template #body="{ data }"><InputNumber v-model="data.quantity" :min="0.001" :maxFractionDigits="3" locale="de-DE" fluid /></template></Column>
      <Column header="Precio" style="width:135px"><template #body="{ data }"><InputNumber v-model="data.priceUnit" :min="0" :minFractionDigits="2" :maxFractionDigits="4" mode="currency" currency="EUR" locale="de-DE" fluid /></template></Column>
      <Column header="Impuesto %" style="width:120px"><template #body="{ data }"><InputNumber v-model="data.tax" :min="0" :max="100" :maxFractionDigits="2" suffix=" %" fluid /></template></Column>
      <Column style="width:54px"><template #body="{ index }"><Button icon="pi pi-trash" severity="danger" text rounded title="Eliminar línea" @click="removeLine(index)" /></template></Column>
      <template #empty><div class="empty-lines">Añada al menos una línea al albarán.</div></template>
    </DataTable>

    <div class="manual-notes">
      <FloatLabel variant="on"><Textarea id="manual-notes" v-model="form.notes" rows="3" maxlength="500" :autoResize="false" class="w-full fixed-observations" style="height:82px;min-height:82px;max-height:82px;resize:none;overflow-y:auto" /><label for="manual-notes">Observaciones</label></FloatLabel>
    </div>
    </div>

    <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-actions"><Button label="Cancelar" severity="secondary" text :disabled="saving" @click="visible=false" /><Button label="Guardar borrador" icon="pi pi-save" :loading="saving" @click="save" /></div></div></template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import DatePicker from 'primevue/datepicker'; import Dialog from 'primevue/dialog'; import FloatLabel from 'primevue/floatlabel'; import InputNumber from 'primevue/inputnumber'; import InputText from 'primevue/inputtext'; import Message from 'primevue/message'; import Select from 'primevue/select'; import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/authStore';
import CustomerLookup from '@/components/shared/CustomerLookup.vue';
import ProductLookup from '@/components/shared/ProductLookup.vue';

const emit = defineEmits<{ saved: [delivery: any] }>();
const toast = useToast(), authStore = useAuthStore();
const visible = ref(false), saving = ref(false), selectedCustomer = ref<any>(null), manualLinesTable = ref<any>(null);
const reasons = ['Entrega sin pedido previo', 'Regularización', 'Muestra', 'Sustitución', 'Cesión o entrega gratuita', 'Otro'];
const newLine = () => ({ productId: null as number|null, productLabel: '', description: '', quantity: 1, priceUnit: 0, tax: 0, uomId: null as number|null });
const form = reactive({ entityId: null as number|null, salesTarifaId: null as number|null, date: new Date(), reference: '', reason: '', notes: '', lines: [newLine()] });
const customerLabel = computed(() => selectedCustomer.value ? `${selectedCustomer.value.code ? `${selectedCustomer.value.code} — ` : ''}${selectedCustomer.value.name}` : '');
const reset = () => { selectedCustomer.value=null; form.entityId=null; form.salesTarifaId=null; form.date=new Date(); form.reference=''; form.reason=''; form.notes=''; form.lines=[newLine()]; };
const open = () => { reset(); visible.value=true; };
const selectCustomer = (customer:any) => { selectedCustomer.value=customer; form.salesTarifaId=customer.salesTarifaId ?? null; };
const addLine = async () => { form.lines.push(newLine()); await nextTick(); requestAnimationFrame(() => { const containers=manualLinesTable.value?.$el?.querySelectorAll('.p-datatable-table-container, .p-datatable-wrapper, .p-datatable-scrollable-body') as NodeListOf<HTMLElement>|undefined; containers?.forEach(container=>{container.scrollTop=container.scrollHeight;}); }); }; const removeLine = (index:number) => form.lines.splice(index,1);
const selectProduct = (line:any, product:any) => { line.productId=product.pkid; line.productLabel=`${product.code} — ${product.description}`; line.description=product.description || ''; line.priceUnit=Number(product.salePrice ?? 0); line.tax=Number(product.taxValue ?? 0); line.uomId=product.uomId ?? null; };
const clearProduct = (line:any) => Object.assign(line,newLine());
const save = async () => {
  if (!form.entityId || !form.salesTarifaId) { toast.add({severity:'error',summary:'Cliente incompleto',detail:'Selecciona un cliente con tarifa de venta configurada.',life:4000}); return; }
  if (!form.reason) { toast.add({severity:'error',summary:'Motivo obligatorio',detail:'Indica por qué se crea el albarán sin pedido.',life:4000}); return; }
  if (!form.lines.length || form.lines.some(line=>!line.productId || Number(line.quantity)<=0)) { toast.add({severity:'error',summary:'Líneas incompletas',detail:'Todas las líneas deben tener producto y una cantidad mayor que cero.',life:4000}); return; }
  saving.value=true;
  try { const {data}=await axios.post(`${import.meta.env.VITE_API_URL}/WebCreateManualSalesDelivery`,{userId:authStore.user?.pkid ?? null,entityId:form.entityId,salesTarifaId:form.salesTarifaId,dateCreate:form.date.toISOString(),reference:form.reference,reason:form.reason,notes:form.notes,lines:form.lines.map(({productId,description,quantity,priceUnit,tax,uomId})=>({productId,description,quantity:Number(quantity),priceUnit:Number(priceUnit),tax:Number(tax),uomId}))}); toast.add({severity:'success',summary:'Albarán manual creado',detail:`${data.code} se ha guardado como borrador.`,life:4000}); visible.value=false; emit('saved',data); }
  catch(error:any){toast.add({severity:'error',summary:'No se pudo crear el albarán',detail:error.response?.data ?? 'Revisa los datos introducidos.',life:5000});}
  finally{saving.value=false;}
};
defineExpose({open});
</script>

<style scoped>
.manual-form-content{height:100%;min-height:0;display:flex;flex-direction:column;overflow:hidden}.manual-header{flex:0 0 auto;margin-top:.25rem}.lines-heading{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;margin:1rem 0 .65rem}.lines-heading div{display:flex;flex-direction:column;gap:.2rem}.lines-heading small{color:#7b8492}.manual-lines{flex:1 1 auto;min-height:220px;overflow:hidden;border:1px solid #e5e7eb;border-radius:8px}.manual-notes{flex:0 0 auto;width:100%;margin-top:1.25rem}.fixed-observations{height:82px!important;min-height:82px!important;max-height:82px!important;resize:none!important;overflow-y:auto!important}.empty-lines{text-align:center;color:#8791a0;padding:2rem}.dialog-footer,.dialog-actions{width:100%}.dialog-footer-separator{width:100%;min-height:1px;margin:0 0 .75rem}.dialog-actions{display:flex;justify-content:flex-end;gap:.5rem}
</style>
