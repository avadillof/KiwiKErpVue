<template>
  <InputGroup>
    <InputText :modelValue="selectedLabel" readonly placeholder="Sin gestor asignado" :disabled="disabled" class="w-full" @click="open" />
    <Button icon="pi pi-search" severity="secondary" :disabled="disabled" aria-label="Buscar contacto gestor" @click="open" />
    <Button icon="pi pi-times" severity="danger" text :disabled="disabled || !modelValue" aria-label="Quitar contacto gestor" @click="clear" />
  </InputGroup>
  <Dialog v-model:visible="visible" modal header="Seleccionar contacto gestor" :style="{ width: 'min(820px,94vw)', height: '62vh' }" class="kiwik-dialog advisor-lookup-dialog">
    <InputText v-model="search" autofocus placeholder="Buscar por contacto, empresa o correo..." class="w-full mb-3" @update:modelValue="searchContacts" />
    <DataTable :value="items" lazy paginator :rows="20" :totalRecords="total" :loading="loading" selectionMode="single" dataKey="pkid" @page="load($event.page)" @row-dblclick="select($event.data)" scrollable scrollHeight="38vh">
      <template #loading><CorporateLoader label="Cargando contactos…" /></template>
      <template #empty><div class="p-4 text-center text-gray-500">No hay contactos activos con correo.</div></template>
      <Column field="name" header="Contacto" style="min-width:180px" />
      <Column field="entityName" header="Empresa / entidad" style="min-width:220px"><template #body="{data}">{{ data.entityName || '—' }}</template></Column>
      <Column field="email" header="Correo" style="min-width:240px" />
      <Column header="" style="width:7rem"><template #body="{data}"><Button label="Elegir" size="small" text @click="select(data)" /></template></Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { backendUrl } from '@/services/backendUrl';
import CorporateLoader from './CorporateLoader.vue';
import axios from 'axios';
import { ref, watch } from 'vue';
import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import Dialog from 'primevue/dialog'; import InputGroup from 'primevue/inputgroup'; import InputText from 'primevue/inputtext';
const props=withDefaults(defineProps<{modelValue:number|null;disabled?:boolean}>(),{disabled:false});
const emit=defineEmits<{ 'update:modelValue':[value:number|null] }>();
const visible=ref(false),loading=ref(false),items=ref<any[]>([]),total=ref(0),search=ref(''),selectedLabel=ref('');let timer:ReturnType<typeof setTimeout>|undefined;let requestVersion=0;
const label=(item:any)=>item?`${item.name}${item.entityName?` · ${item.entityName}`:''} · ${item.email}`:'';
const loadSelected=async(id:number|null)=>{if(!id){selectedLabel.value='';return;}try{selectedLabel.value=label((await axios.get(backendUrl(`/WebGetSalesTaxAdvisorContact/${id}`))).data);}catch{selectedLabel.value=`Contacto #${id}`;}};
watch(()=>props.modelValue,(value)=>void loadSelected(value),{immediate:true});
const load=async(page=0)=>{const version=++requestVersion;loading.value=true;try{const{data}=await axios.get(backendUrl('/WebGetSalesTaxAdvisorContacts'),{params:{page,size:20,query:search.value,sort:'name,asc'}});if(version!==requestVersion)return;items.value=data?.content??[];total.value=data?.totalElements??0;}finally{if(version===requestVersion)loading.value=false;}};
const open=()=>{if(props.disabled)return;visible.value=true;void load(0);};
const clear=()=>{emit('update:modelValue',null);selectedLabel.value='';};
const select=(item:any)=>{emit('update:modelValue',item.pkid);selectedLabel.value=label(item);visible.value=false;};
const searchContacts=(value:string|undefined)=>{search.value=value??'';clearTimeout(timer);++requestVersion;loading.value=true;timer=setTimeout(()=>void load(0),300);};
</script>

<style scoped>:deep(.p-datatable-mask){background:rgba(255,255,255,.92);backdrop-filter:blur(2px)}</style>
