<template>
  <DataTable :value="rows" scrollable scrollHeight="300px" size="small">
    <template #empty>No hay vencimientos.</template>
    <Column field="position" header="Plazo"/>
    <Column header="Fecha"><template #body="{data}">{{date(data.dueDate)}}</template></Column>
    <Column header="Importe" headerStyle="text-align:right" bodyStyle="text-align:right" :pt="amountColumnPt"><template #body="{data}">{{money(data.amount)}}</template></Column>
    <Column v-if="!preview" header="Cobrado" headerStyle="text-align:right" bodyStyle="text-align:right" :pt="amountColumnPt"><template #body="{data}">{{money(data.collectedAmount)}}</template></Column>
    <Column v-if="!preview" header="Pendiente" headerStyle="text-align:right" bodyStyle="text-align:right" :pt="amountColumnPt"><template #body="{data}">{{money(data.pendingAmount)}}</template></Column>
    <Column v-if="!preview" header="Cobro"><template #body="{data}">{{({PAID:'Cobrado',PARTIAL:'Parcial',PENDING:'Pendiente'} as any)[data.paymentStatus]}}</template></Column>
    <Column v-if="!preview" header="Situación"><template #body="{data}"><Tag :value="labels[data.timing]||data.timing" :severity="data.timing==='OVERDUE'?'danger':['TODAY','UPCOMING'].includes(data.timing)?'warn':data.timing==='PAID'?'success':'secondary'"/></template></Column>
  </DataTable>
</template>
<script setup lang="ts">
import DataTable from 'primevue/datatable';import Column from 'primevue/column';import Tag from 'primevue/tag';
const props=withDefaults(defineProps<{rows:any[],currency?:string,preview?:boolean}>(),{currency:'EUR',preview:false});
const amountColumnPt={columnHeaderContent:{style:{justifyContent:'flex-end'}}};
const money=(v:any)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:props.currency}).format(Number(v)||0);
const date=(v:any)=>v?String(v).slice(0,10).split('-').reverse().join('/'):'Sin fecha';
const labels:Record<string,string>={DRAFT:'Borrador',CANCELLED:'No aplica',PAID:'Cobrado',OVERDUE:'Vencido',TODAY:'Vence hoy',UPCOMING:'Próximo (7 días)',PENDING:'Pendiente',UNKNOWN:'Sin fecha'};
</script>
