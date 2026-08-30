<template>
    <Dialog v-model:visible="visible" modal maximizable header="Preparar albarán" :style="{ width: '88vw', maxWidth: '1100px' }" class="kiwik-dialog" :closable="!busy" :dismissableMask="!busy">
        <div class="delivery-dialog-content">
        <div v-if="loading" class="flex justify-content-center align-items-center py-6 gap-3"><i class="pi pi-spin pi-spinner text-primary text-2xl"></i><span>Cargando líneas pendientes...</span></div>
        <template v-else>
            <Message severity="info" variant="simple" icon="pi pi-truck" class="mb-3">Pedido <b>{{ data.orderCode }}</b> · {{ data.entityName }}. Selecciona la cantidad que se entrega ahora; el resto permanecerá pendiente para otro albarán.</Message>
            <Message v-if="!lines.length" severity="warn" :closable="false">Este pedido no tiene líneas físicas pendientes de albarán.</Message>
            <Message v-else-if="invalidLines.length" severity="error" :closable="false" class="mb-3">La cantidad a entregar no puede superar la cantidad pendiente. Corrige las líneas marcadas antes de generar el albarán.</Message>
            <div v-else class="flex justify-content-between align-items-center mb-3"><small>{{ selectedOrderIds.length }} pedido(s) agrupado(s)</small><Button v-if="availableCompatibleOrders.length" label="Añadir pedidos compatibles" icon="pi pi-plus" size="small" outlined @click="compatibleVisible=true" /></div>
            <DataTable v-if="lines.length" :value="lines" size="small" stripedRows scrollable scrollHeight="360px">
                <Column field="orderCode" header="Pedido" style="width: 14%" />
                <Column field="productCode" header="Producto" style="width: 16%" />
                <Column field="description" header="Descripción" style="min-width: 270px" />
                <Column field="orderedQuantity" header="Pedida" style="width: 11%" />
                <Column field="deliveredQuantity" header="Entregada" style="width: 11%" />
                <Column field="pendingQuantity" header="Pendiente" style="width: 11%"><template #body="{ data: line }"><b>{{ line.pendingQuantity }}</b> {{ line.uomDescription }}</template></Column>
                <Column header="A entregar" style="width: 16%"><template #body="{ data: line }"><div><InputNumber v-model="line.quantityToDeliver" :disabled="generating" :min="0" :maxFractionDigits="3" locale="de-DE" class="w-full" :invalid="exceedsPending(line)" @input="validateDeliveryInput(line, $event.value)" /><small v-if="exceedsPending(line)" class="quantity-error">La cantidad supera el pendiente. Máximo: {{ line.pendingQuantity }} {{ line.uomDescription }}</small></div></template></Column>
            </DataTable>
            <Dialog v-model:visible="compatibleVisible" modal maximizable header="Añadir pedidos compatibles" :style="{ width: '42rem' }" class="kiwik-dialog"><DataTable :value="availableCompatibleOrders" v-model:selection="compatibleSelection" dataKey="pkid" selectionMode="multiple" scrollable scrollHeight="260px"><Column selectionMode="multiple" style="width:3rem" /><Column field="code" header="Pedido" /><Column field="entityName" header="Cliente" /><Column field="totalTotal" header="Total" /></DataTable><template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-footer-actions"><Button label="Cancelar" severity="secondary" text @click="compatibleVisible=false" /><Button label="Añadir seleccionados" icon="pi pi-plus" :disabled="!compatibleSelection.length" @click="addCompatible" /></div></div></template></Dialog>
        </template>
        </div>
        <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-footer-actions"><Button label="Cancelar" severity="secondary" text :disabled="busy" @click="visible = false" /><Button v-if="lines.length" label="Generar albarán" icon="pi pi-truck" :loading="generating" :disabled="busy || !hasQuantities" @click="generateDelivery" /></div></div></template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'; import axios from 'axios';
import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import Dialog from 'primevue/dialog'; import InputNumber from 'primevue/inputnumber'; import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast'; import { useAuthStore } from '@/stores/authStore';
const props = defineProps<{ orderId: number | null }>(); const emit = defineEmits<{ generated: [delivery: any] }>();
const toast = useToast(); const authStore = useAuthStore();
const visible = ref(false); const loading = ref(false); const generating = ref(false); const lines = ref<any[]>([]); const data = ref<any>({}); const selectedOrderIds = ref<number[]>([]); const compatibleVisible = ref(false); const compatibleOrders = ref<any[]>([]); const compatibleSelection = ref<any[]>([]);
const busy = computed(() => loading.value || generating.value);
const availableCompatibleOrders = computed(() => compatibleOrders.value.filter(order => !selectedOrderIds.value.includes(order.pkid)));
const selectedLines = computed(() => lines.value.filter(line => Number(line.quantityToDeliver) > 0)); const hasQuantities = computed(() => selectedLines.value.length > 0);
const exceedsPending = (line: any) => Number(line.quantityToDeliver) > Number(line.pendingQuantity) + 0.0001;
const invalidLines = computed(() => lines.value.filter(exceedsPending));
const validateDeliveryInput = (line: any, value: string | number | undefined) => {
    line.quantityToDeliver = value === undefined || value === '' ? null : Number(value);
};
const addOrderLines = async (orderId: number) => { if (selectedOrderIds.value.includes(orderId)) return; const result = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesOrderDeliveryLines/${orderId}`); if (!data.value.orderCode) data.value = result.data; selectedOrderIds.value.push(orderId); lines.value.push(...(result.data.lines ?? []).map((line: any) => ({ ...line, quantityToDeliver: Number(line.quantityToDeliver ?? 0) }))); };
const open = async (orderId: number) => { visible.value = true; loading.value = true; lines.value = []; selectedOrderIds.value = []; data.value = {}; compatibleOrders.value = []; compatibleSelection.value = []; try { await addOrderLines(orderId); const result = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetCompatibleSalesOrders/${orderId}`); compatibleOrders.value = result.data ?? []; } finally { loading.value = false; } };
const addCompatible = async () => { loading.value=true; try { for (const order of compatibleSelection.value) await addOrderLines(order.pkid); compatibleVisible.value=false; } finally { loading.value=false; } };
const generateDelivery = async () => {
    if (!hasQuantities.value || generating.value) return;
    if (invalidLines.value.length) {
        const line = invalidLines.value[0];
        toast.add({ severity: 'error', summary: 'Cantidad superior a la pendiente', detail: `${line.description}: el máximo que puedes entregar es ${line.pendingQuantity} ${line.uomDescription || ''}. No se ha generado ningún albarán.`, life: 5500 });
        return;
    }
    generating.value = true;
    try {
        const result = await axios.post(`${import.meta.env.VITE_API_URL}/WebCreateSalesDelivery`, {
            userId: authStore.user?.pkid ?? null,
            lines: selectedLines.value.map(line => ({ lineId: line.lineId, quantity: Number(line.quantityToDeliver) }))
        });
        toast.add({ severity: 'success', summary: 'Albarán generado', detail: `Se ha creado ${result.data.code} con ${result.data.lineCount} línea(s) de ${result.data.orderCount} pedido(s).`, life: 4500 });
        visible.value = false; emit('generated', result.data);
    } catch (error: any) {
        const detail = typeof error.response?.data === 'string' ? error.response.data : 'No se pudo generar el albarán. Revisa las cantidades e inténtalo de nuevo.';
        toast.add({ severity: 'error', summary: 'No se pudo generar el albarán', detail, life: 5000 });
    } finally { generating.value = false; }
};
watch(() => props.orderId, value => { if (value && visible.value) open(value); }); defineExpose({ open });
</script>

<style scoped>
.delivery-dialog-content { min-height: 250px; }
.quantity-error { display:block; margin-top:.25rem; color:var(--p-red-600,#dc2626); font-size:.72rem; font-weight:600; }
.dialog-footer { width: 100%; }.dialog-footer-separator { width: 100%; min-height: 1px; margin: 0 0 .75rem; border-top: 1px solid var(--surface-300); }.dialog-footer-actions { display: flex; justify-content: flex-end; gap: .5rem; }
</style>
