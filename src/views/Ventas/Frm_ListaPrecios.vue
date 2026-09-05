<template>
  <main class="prices-page">
    <header class="page-header">
      <div class="page-heading"><div class="page-icon"><i class="pi pi-tags"/></div><div><span class="breadcrumb">Ventas / Datos maestros</span><h1>Lista de precios</h1><p>Tarifas y reglas de precios para productos, servicios y clientes.</p></div></div>
      <nav class="header-actions" aria-label="Navegación"><Button label="Ventas" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({name:'Ventas'})"/><Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({name:'Dashboard'})"/></nav>
    </header>
    <Message v-if="error" severity="error">{{error}}</Message>
    <section class="list-card">
      <Toolbar class="list-toolbar">
        <template #start><div class="workspace-heading"><span>Listado de tarifas</span><small>Consulta y gestiona las condiciones de precios de tus clientes.</small></div></template>
        <template #end><Button class="new-document" label="Nueva tarifa" icon="pi pi-plus" size="small" :disabled="loading || !catalog" @click="create"/></template>
      </Toolbar>
    <GenericDataTable ref="ratesTable" class="rates-table" dataKey="id" selectionMode="single" v-model:selection="selectedRate" endpoint="WebSalesPriceLists" :requestConfig="auth.portalRequestConfig" :showPaginator="true" :filterable="true" :showActions="true" @load-error="error=pricingErrorMessage($event)">
      <template #panelOptions><span class="rule-count">{{ruleCount}} reglas guardadas</span></template>
      <template #headerActions><Button icon="pi pi-refresh" text rounded title="Refrescar" @click="refresh"/></template>
      <Column field="code" sortable header="Código"/><Column field="description" sortable header="Tarifa"/><Column field="currencyCode" sortable header="Moneda"/><Column field="ruleCount" sortable header="Reglas"/>
      <Column header="Uso"><template #body="{data}"><div class="flex flex-column align-items-start gap-1"><Tag v-if="data.id===settings.defaultTarifaId" value="Predeterminada" severity="success"/><Tag v-if="isOtherCurrency(data.currencyId)" value="Otra moneda: requiere precios fijos" icon="pi pi-exclamation-triangle" severity="warn"/><small v-if="isOtherCurrency(data.currencyId) && Number(data.ruleCount)===0" class="text-600">Sin precios definidos en {{data.currencyCode}}.</small></div></template></Column>
      <Column header="Acciones" style="width:4rem"><template #body="{data}"><Button icon="pi pi-ellipsis-v" :aria-label="'Acciones de la tarifa '+data.code" aria-haspopup="menu" aria-controls="price-list-row-menu" text rounded @click.stop="openRowMenu($event,data)"/></template></Column>
    </GenericDataTable>
      <Menu id="price-list-row-menu" ref="rowMenu" :model="rowMenuItems" popup />
    </section>
    <section v-if="catalog" class="config-card">
      <div class="config-heading"><div><h2><i class="pi pi-cog"/> Configuración de precios</h2><small>Moneda base y tarifa predeterminada para las ventas.</small></div><Button :icon="configExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" text rounded aria-label="Mostrar u ocultar configuración" :aria-expanded="configExpanded" @click="configExpanded=!configExpanded"/></div>
      <div v-show="configExpanded" class="config-body">
      
      <p>El Precio de venta del producto es la referencia, sin impuestos. No se convierte entre monedas.</p>
      <div class="flex align-items-end gap-3 flex-wrap">
        <label>Moneda de los precios actuales<Select v-model="settings.baseCurrencyId" :options="catalog.currencies" optionLabel="label" optionValue="id" :disabled="baseConfigured || savingSettings" placeholder="Seleccionar moneda"/></label>
        <label>Tarifa predeterminada<Select v-model="settings.defaultTarifaId" :options="catalog.rates.filter((r:any)=>r.currencyId===settings.baseCurrencyId)" optionLabel="description" optionValue="id" :disabled="savingSettings" placeholder="Seleccionar tarifa"/></label>
        <Button label="Guardar configuración" icon="pi pi-save" :loading="savingSettings" @click="saveSettings"/>
      </div>
      <small v-if="!baseConfigured">Confirma la moneda en la que están expresados los precios de tus productos. Una vez guardada, no se podrá cambiar desde esta pantalla.</small>
      <small>La tarifa predeterminada debe usar la moneda base. Las tarifas en otras monedas pueden asignarse al cliente o al documento, pero requieren precios fijos para los productos vendidos; no se convierten divisas automáticamente.</small>
      </div>
    </section>

    <Dialog v-model:visible="dialog" :header="form.id ? 'Editar tarifa' : 'Nueva tarifa'" modal maximizable class="kiwik-dialog" :style="{width:'85vw',height:'85vh'}" :closable="!saving" :closeOnEscape="!saving">
      <div class="editor">
        <Message v-if="editError" severity="error">{{editError}}</Message>
        <div class="fields"><label>Código<InputText v-model="form.code" maxlength="45" :disabled="saving"/></label><label>Descripción<InputText v-model="form.description" maxlength="80" :disabled="saving"/></label><label>Moneda<Select v-model="form.currencyId" :options="catalog?.currencies" optionLabel="label" optionValue="id" :disabled="saving || !!form.id"/><small v-if="form.id" class="currency-help">La moneda de una tarifa guardada no se cambia: sus precios no se convierten automáticamente. Crea otra tarifa para trabajar en una moneda distinta.</small></label></div>
        <Message v-if="isOtherCurrency(form.currencyId)" severity="warn" :closable="false">Tarifa en otra moneda: requiere precios fijos en la moneda seleccionada para cada producto y cantidad que vendas. No se aplican descuentos sobre el precio base ni se convierten divisas automáticamente. <span v-if="!form.rules.length">Esta tarifa todavía no tiene precios definidos.</span></Message>
        <Message severity="info">Una regla por destino y cantidad mínima. Se elige el tramo más alto alcanzado, después de priorizar producto, familia y general. La cantidad mínima se expresa en la unidad de venta habitual del producto; 0 significa sin mínimo. El precio fijo se expresa por la unidad de venta habitual del producto. Los descuentos se calculan sobre su Precio de venta; las reglas no se acumulan. Familia se refiere a la familia exacta del producto, sin herencia de subfamilias.</Message>
        <div class="flex align-items-center justify-content-between"><h2>Reglas de precios</h2><Button label="Añadir regla" icon="pi pi-plus" :disabled="saving || form.rules.length>=1000" @click="addRule"/></div>
        <DataTable ref="rulesTable" :value="form.rules" scrollable scrollHeight="flex" class="rules-table">
          <template #empty>Sin reglas: se utilizará el precio base si la moneda coincide.</template>
          <Column header="Aplicar a" style="min-width:170px"><template #body="{data}"><Select v-model="data.scope" :options="scopes" optionLabel="label" optionValue="value" :disabled="saving" @update:modelValue="data.productId=null;data.familyId=null;data.productLabel=''" fluid/></template></Column>
          <Column header="Producto o familia" style="min-width:290px"><template #body="{data}"><ProductLookup v-if="data.scope==='PRODUCT'" v-model="data.productId" :label="data.productLabel" :disabled="saving" @selected="data.productLabel=$event.code+' — '+$event.description"/><Select v-else-if="data.scope==='FAMILY'" v-model="data.familyId" :options="catalog?.families" optionLabel="label" optionValue="id" filter :disabled="saving" fluid/><span v-else>Todos los productos y servicios</span></template></Column>
          <Column header="Cantidad mínima" style="min-width:155px"><template #body="{data}"><InputNumber v-model="data.minQuantity" :min="0" :max="1000000000" :maxFractionDigits="6" locale="de-DE" :useGrouping="true" :disabled="saving" aria-label="Cantidad mínima" fluid/></template></Column>
          <Column header="Cálculo" style="min-width:170px"><template #body="{data}"><Select v-model="data.calculation" :options="calculations" optionLabel="label" optionValue="value" :disabled="saving" fluid/></template></Column>
          <Column header="Valor" style="min-width:140px"><template #body="{data}"><InputNumber v-model="data.value" locale="de-DE" :useGrouping="true" :min="0" :max="data.calculation==='DISCOUNT'?100:1000000000" :maxFractionDigits="6" :suffix="data.calculation==='DISCOUNT'?' %':''" :disabled="saving" fluid/></template></Column>
          <Column><template #body="{index}"><Button icon="pi pi-trash" aria-label="Quitar regla" text severity="danger" :disabled="saving" @click="form.rules.splice(index,1)"/></template></Column>
        </DataTable>
        <div class="preview"><h3>Simular precio con las reglas del formulario</h3><div class="flex gap-2 align-items-center"><ProductLookup v-model="previewProductId" :label="previewLabel" @selected="previewLabel=$event.code+' — '+$event.description;previewResult=null" @cleared="previewResult=null"/><InputNumber v-model="previewQuantity" :min="0.000001" :max="1000000000" :maxFractionDigits="6" locale="de-DE" :useGrouping="true" aria-label="Cantidad a consultar" placeholder="Cantidad" @input="previewQuantity=Number($event.value||0);previewResult=null" @update:modelValue="previewResult=null"/><Button label="Consultar" icon="pi pi-calculator" :loading="previewBusy" :disabled="!previewProductId || !previewQuantity || saving" @click="preview"/></div><small>La simulación utiliza las reglas del formulario, incluidos los cambios sin guardar. No modifica la tarifa. El resultado es el precio por unidad, no el total.</small><Tag v-if="hasUnsavedChanges" value="Cambios sin guardar" severity="warn" class="mt-2"/><p v-if="previewResult">Para {{new Intl.NumberFormat('de-DE',{maximumFractionDigits:6}).format(previewResult.quantityRequested)}} unidades: <b>{{new Intl.NumberFormat('de-DE',{minimumFractionDigits:2,maximumFractionDigits:6}).format(previewResult.priceUnit)}} {{previewResult.currencyCode}}</b> · {{previewResult.source}}</p></div>
      </div>
      <template #footer><div class="w-full"><div class="kiwik-separator mb-3"/><div class="flex justify-content-end gap-2"><Button label="Cerrar" text severity="secondary" :disabled="saving" @click="dialog=false"/><Button label="Guardar tarifa" icon="pi pi-save" :loading="saving" @click="save"/></div></div></template>
    </Dialog>
  </main>
</template>
<script setup lang="ts">
import {computed,nextTick,onMounted,reactive,ref,watch} from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';import Column from 'primevue/column';import DataTable from 'primevue/datatable';import Dialog from 'primevue/dialog';import InputNumber from 'primevue/inputnumber';import InputText from 'primevue/inputtext';import Message from 'primevue/message';import Select from 'primevue/select';import Tag from 'primevue/tag';
import {useToast} from 'primevue/usetoast';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';
import Menu from 'primevue/menu';
import ProductLookup from '@/components/shared/ProductLookup.vue';
import {useAuthStore} from '@/stores/authStore';
import {pricingErrorMessage} from '@/services/salesPricing';
const auth=useAuthStore();
const router=useRouter(),toast=useToast(),catalog=ref<any>(null),loading=ref(false),saving=ref(false),savingSettings=ref(false),dialog=ref(false),error=ref(''),editError=ref(''),baseConfigured=ref(false),rulesTable=ref<any>();
const configExpanded=ref(false),ratesTable=ref<any>(),selectedRate=ref<any>(null);
const rowMenu=ref<InstanceType<typeof Menu>>(),menuRate=ref<any>(null);
const rowMenuItems=computed(()=>[{label:'Editar tarifa',icon:'pi pi-pencil',disabled:loading.value||!menuRate.value,command:()=>{if(menuRate.value)void edit(menuRate.value.id);}}]);
function openRowMenu(event:Event,rate:any){selectedRate.value=rate;menuRate.value=rate;rowMenu.value?.toggle(event);}
async function refresh(){await Promise.all([load(),ratesTable.value?.refresh()]);}
const settings=reactive({version:0,baseCurrencyId:null as number|null,defaultTarifaId:null as number|null});
function isOtherCurrency(currencyId:number|null){const base=catalog.value?.settings?.baseCurrencyId;return base!=null && currencyId!=null && Number(currencyId)!==Number(base);}
const blank=()=>({id:null as number|null,version:0,code:'',description:'',currencyId:null as number|null,rules:[] as any[]});
const form=reactive(blank());
const savedForm=ref('');
const hasUnsavedChanges=computed(()=>!!form.id && JSON.stringify(form)!==savedForm.value);
const scopes=[{label:'Familia',value:'FAMILY'},{label:'Producto',value:'PRODUCT'},{label:'Todos',value:'ALL'}],calculations=[{label:'Precio fijo',value:'FIXED'},{label:'Descuento',value:'DISCOUNT'}];
const ruleCount=computed(()=>(catalog.value?.rates||[]).reduce((n:number,r:any)=>n+Number(r.ruleCount),0));
function accept(data:any){catalog.value=data;Object.assign(settings,data.settings);baseConfigured.value=data.settings.baseCurrencyId!=null;if(!baseConfigured.value)configExpanded.value=true;}
async function load(){loading.value=true;error.value='';try{const {data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebSalesPricingCatalog`,auth.portalRequestConfig());accept(data)}catch(e){error.value=pricingErrorMessage(e)}finally{loading.value=false}}
async function saveSettings(){savingSettings.value=true;error.value='';try{const{data}=await axios.post(`${import.meta.env.VITE_API_URL}/WebSalesPricingSettings`,settings,auth.portalRequestConfig());accept(data);toast.add({severity:'success',summary:'Configuración guardada',life:3000})}catch(e){error.value=pricingErrorMessage(e)}finally{savingSettings.value=false}}
function create(){Object.assign(form,blank(),{currencyId:settings.baseCurrencyId});savedForm.value=JSON.stringify(form);editError.value='';previewResult.value=null;dialog.value=true;}
async function edit(id:number){loading.value=true;error.value='';try{const{data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebSalesPriceList/${id}`,auth.portalRequestConfig());Object.assign(form,data);savedForm.value=JSON.stringify(form);editError.value='';previewProductId.value=null;previewLabel.value='';previewResult.value=null;dialog.value=true}catch(e){error.value=pricingErrorMessage(e)}finally{loading.value=false}}
async function addRule(){form.rules.push({scope:'PRODUCT',productId:null,familyId:null,productLabel:'',calculation:'FIXED',value:0,minQuantity:1});await nextTick();const rows=rulesTable.value?.$el?.querySelectorAll('tbody tr');const row=rows?.[rows.length-1];row?.scrollIntoView({block:'nearest'});row?.querySelector('input,[tabindex="0"]')?.focus();}
async function save(){saving.value=true;editError.value='';try{const{data}=await axios.post(`${import.meta.env.VITE_API_URL}/WebSalesPriceList`,form,auth.portalRequestConfig());Object.assign(form,data);savedForm.value=JSON.stringify(form);previewResult.value=null;toast.add({severity:'success',summary:'Tarifa guardada',detail:'Los documentos existentes conservan sus importes.',life:4000});await refresh()}catch(e){editError.value=pricingErrorMessage(e)}finally{saving.value=false}}
const previewQuantity=ref(1);
const previewProductId=ref<number|null>(null),previewLabel=ref(''),previewResult=ref<any>(null),previewBusy=ref(false);
let previewRevision=0;
watch([()=>JSON.stringify(form),previewProductId,previewQuantity],()=>{previewRevision++;previewResult.value=null;},{flush:'sync'});
async function preview(){
  if(saving.value || !previewProductId.value || !previewQuantity.value)return;
  const revision=++previewRevision;
  const quantity=previewQuantity.value;
  previewBusy.value=true;previewResult.value=null;editError.value='';
  try{const {data:result}=await axios.post(`${import.meta.env.VITE_API_URL}/WebPreviewSalesPrice`,{tarifa:JSON.parse(JSON.stringify(form)),productId:previewProductId.value,quantity},{...auth.portalRequestConfig(),timeout:15000});if(revision===previewRevision)previewResult.value={...result,quantityRequested:quantity};}
  catch(e){if(revision===previewRevision)editError.value=pricingErrorMessage(e);}
  finally{previewBusy.value=false;}
}
onMounted(load);
</script>
<style scoped>
.prices-page { --kiwi: #9cc10a; --kiwi-dark: #648506; display: flex; width: 100%; min-height: calc(100dvh - 66px); flex-direction: column; padding: 18px 16px 72px; color: #243044; background: #f7f8fa; }
.page-header { position:relative; isolation:isolate; overflow:hidden; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; padding: 15px 20px; border: 1px solid #e3e8d2; border-radius: 15px; background:#fff; box-shadow: 0 6px 18px rgba(31,41,55,.055); }
.page-header::after { content:""; position:absolute; z-index:0; width:300px; height:300px; right:20px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.page-header > * { position:relative; z-index:1; }
.page-heading { display: flex; align-items: center; gap: 14px; }
.page-icon { display: grid; width: 50px; height: 50px; flex: 0 0 auto; place-items: center; border-radius: 13px; color: #fff; background: linear-gradient(135deg,#38a4d8,#2875b6); box-shadow: 0 7px 15px rgba(40,117,182,.22); }
.page-icon i { font-size: 1.3rem; }
.breadcrumb { color: #8791a0; font-size: .8rem; font-weight: 700; }
.page-heading h1 { margin: 3px 0 2px; color: #202939; font-size: 1.38rem; }
.page-heading p { margin: 0; color: #7a8494; font-size: .92rem; }
.header-actions { display: flex; align-items: center; gap: 3px; }
.list-card { display: flex; height: clamp(500px,calc(100dvh - 300px),700px); min-height: 480px; flex-direction: column; overflow: hidden; border: 1px solid #dfe4ea; border-radius: 14px; background: #fff; box-shadow: 0 5px 18px rgba(30,41,59,.055); }
.list-toolbar { padding: 13px 17px; border: 0; border-bottom: 1px solid #e8ecf0; border-radius: 0; background: #fff; }
.workspace-heading { display: flex; flex-direction: column; gap: 3px; }
.workspace-heading span { color: #344054; font-size: 1rem; font-weight: 800; }
.workspace-heading small { color: #8a93a2; font-size: .82rem; }

.prices-page{box-sizing:border-box;min-width:0;max-width:100%}.list-card{min-width:0}.rates-table{flex:1;min-height:0}.rule-count{color:#7d8797;font-size:.82rem;white-space:nowrap}.list-toolbar :deep(.new-document){background:var(--kiwi);border-color:var(--kiwi);color:#253000}.list-toolbar :deep(.new-document:hover){background:#8bad09;border-color:#8bad09;color:#253000}.table-tools{display:flex;align-items:center;gap:.75rem;padding:10px 16px;background:#fafbfc;border-bottom:1px solid #e8ecf0}.table-tools input{width: min(360px,100%)}.table-tools span{margin-left:auto;color:#7d8797;font-size:.84rem}.list-card :deep(.p-datatable-thead>tr>th){padding-block:.78rem;color:#596579;background:#f5f7f9;font-size:1rem}.list-card :deep(.p-datatable-tbody>tr>td){padding-block:.9rem;border-color:#eef1f4;font-size:1.05rem}.list-card :deep(.p-datatable-tbody>tr:hover){background:#fbfdef}.list-card :deep(.p-tag){font-size:.88rem}.rates-table :deep(td small){font-size:.9rem}.rates-table :deep(.search-bar .p-inputtext){font-size:1rem}.currency-help{font-size:.82rem;font-weight:400;color:#707b8c;line-height:1.4}
.config-card{margin-top:14px;border:1px solid #dfe4ea;border-radius:14px;background:white;box-shadow:0 5px 18px rgba(30,41,59,.045)}.config-heading{display:flex;align-items:center;justify-content:space-between;padding:13px 16px}.config-heading h2{margin:0 0 .2rem;color:#344054;font-size:.98rem}.config-heading i{color:#7d9e0b;margin-right:.4rem}.config-heading small,.config-body small{color:#7d8797;font-size:.82rem}.config-body{padding:0 16px 18px;border-top:1px solid #e8ecf0}.config-body p{color:#707b8c;font-size:.9rem}.config-body label{display:flex;flex-direction:column;gap:.4rem;min-width:220px;font-size:.875rem}.config-body>small{display:block;margin-top:.75rem}
.editor{display:flex;flex-direction:column;gap:1rem;height:100%;min-height:0;overflow:auto;padding-right:.25rem}.editor>*{flex-shrink:0}.editor .rules-table{flex:0 0 260px;height:260px}.editor h2{font-size:1.05rem;margin:.25rem 0;color:#344054}.fields{display:grid;grid-template-columns:1fr 2fr 1fr;gap:1rem;padding:1rem;background:#f7faf7;border:1px solid #e3ead8;border-radius:10px}.fields label{display:flex;flex-direction:column;gap:.4rem;font-size:.875rem}.preview{border-top:1px solid #e5e7eb;padding-top:.5rem}.preview h3{font-size:1rem;margin:.4rem 0}.preview small{display:block;margin-top:.4rem;color:#7d8797}
@media(max-width:800px){.prices-page{padding:12px 10px 66px}.page-header{align-items:flex-start;gap:8px;padding:14px}.page-heading p{display:none}.header-actions :deep(.p-button-label){display:none}.workspace-heading small{display:none}.fields{grid-template-columns:1fr}.table-tools{flex-wrap:wrap}.table-tools input{flex:1;min-width:140px}.table-tools span{font-size:.75rem}.list-card{height:520px}.config-body label{min-width:0;width:100%}.preview>.flex{flex-wrap:wrap}}
</style>
