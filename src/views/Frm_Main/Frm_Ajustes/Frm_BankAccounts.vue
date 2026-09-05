<template>
  <main class="maintenance-page">
    <header class="page-header"><div class="page-heading"><div class="page-icon"><i class="pi pi-building-columns" /></div><div><span class="breadcrumb">Configuración / Datos maestros</span><h1>Cuentas bancarias</h1><p>Cuentas compartidas para las operaciones de compra y venta.</p></div></div><nav class="header-actions"><Button label="Ajustes" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({name:'Frm_Ajustes',query:{tab:'3'}})" /><Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({name:'Dashboard'})" /></nav></header>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <section class="list-card">
      <Toolbar class="list-toolbar"><template #start><div class="workspace-heading"><span>Catálogo de cuentas bancarias</span><small>Consulta y gestiona las cuentas disponibles.</small></div></template><template #end><Button label="Nueva cuenta" icon="pi pi-plus" size="small" @click="edit()" /></template></Toolbar>
      <GenericDataTable ref="table" class="maintenance-table" endpoint="WebBankAccounts" :requestConfig="auth.portalRequestConfig" :showPaginator="true" :filterable="true" :showActions="true" @load-error="error=message($event)" @data-loaded="error=''">
        <template #headerActions><Button icon="pi pi-refresh" text rounded aria-label="Actualizar cuentas" @click="table?.refresh()" /></template>
        <Column field="description" header="Descripción" sortable />
        <Column field="sucursal" header="Sucursal" sortable />
        <Column field="ibam" header="IBAN" sortable><template #body="{data}"><span class="iban">{{ formatIban(data.ibam) }}</span></template></Column>
        <Column header="Acciones"><template #body="{data}"><Button icon="pi pi-ellipsis-v" text rounded :aria-label="'Acciones de '+data.description" aria-haspopup="menu" @click="openMenu($event,data)" /></template></Column>
      </GenericDataTable>
      <Menu ref="menu" :model="actions" popup />
    </section>
    <Dialog v-model:visible="visible" modal :header="form.id ? 'Editar cuenta bancaria' : 'Nueva cuenta bancaria'" class="kiwik-dialog" :style="{width:'min(650px,95vw)'}" :closable="!saving" :closeOnEscape="!saving">
      <Message v-if="formError" severity="error" :closable="false">{{ formError }}</Message>
      <div class="bank-fields">
        <label for="bank-description">Descripción (obligatoria)<InputText id="bank-description" v-model="form.description" maxlength="200" :disabled="saving" :invalid="attempted && !form.description.trim()" fluid /></label>
        <label for="bank-branch">Sucursal<InputText id="bank-branch" v-model="form.sucursal" maxlength="200" :disabled="saving" fluid /><small>Opcional.</small></label>
        <label for="bank-iban">IBAN (obligatorio)<InputText id="bank-iban" v-model="form.ibam" maxlength="50" :disabled="saving" :invalid="!!form.ibam && !validIban || attempted && !form.ibam" aria-describedby="bank-validation" class="iban" fluid @blur="form.ibam=normalizedIban" /></label>
        <Message v-if="form.ibam" id="bank-validation" :severity="validIban?'success':'warn'" :closable="false">{{ validIban ? 'Formato y dígitos de control correctos.' : 'Revisa el IBAN: el formato o los dígitos de control no son correctos.' }}</Message>
        <p class="bank-help">La comprobación es local: no confirma la existencia de la cuenta, su titular ni su disponibilidad. Para España se comprueban también los 24 caracteres del IBAN.</p>
      </div>
      <template #footer><div class="w-full"><div class="kiwik-separator" /><div class="bank-actions"><Button label="Cancelar" text severity="secondary" :disabled="saving" @click="visible=false" /><Button label="Guardar" icon="pi pi-save" :loading="saving" @click="save" /></div></div></template>
    </Dialog>
    <Dialog v-model:visible="deleteVisible" header="Eliminar cuenta bancaria" modal class="kiwik-dialog" :style="{width:'min(520px,95vw)'}" :closable="!deleting" :closeOnEscape="!deleting">
      <p>¿Eliminar la cuenta <strong>{{ selected?.description }}</strong>?</p><p>Solo se puede eliminar si no está vinculada a otros registros.</p>
      <Message v-if="deleteError" severity="error" :closable="false">{{ deleteError }}</Message>
      <template #footer><div class="w-full"><div class="kiwik-separator" /><div class="bank-actions"><Button label="Cancelar" text severity="secondary" :disabled="deleting" @click="deleteVisible=false" /><Button label="Eliminar" icon="pi pi-trash" severity="danger" :loading="deleting" @click="remove" /></div></div></template>
    </Dialog>
  </main>
</template>
<script setup lang="ts">
import {computed,reactive,ref,watch} from 'vue';
import {useRouter} from 'vue-router';
import {useToast} from 'primevue/usetoast';
import axios from 'axios';
import Button from 'primevue/button';import Column from 'primevue/column';import Dialog from 'primevue/dialog';import InputText from 'primevue/inputtext';import Menu from 'primevue/menu';import Message from 'primevue/message';import Toolbar from 'primevue/toolbar';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';
import {useAuthStore} from '@/stores/authStore';
import {HelperString} from '@/libs/HelperString';
type Account={id:number|null;description:string;sucursal:string;ibam:string};
const router=useRouter(),auth=useAuthStore(),toast=useToast(),table=ref<InstanceType<typeof GenericDataTable>>(),menu=ref<InstanceType<typeof Menu>>();
const error=ref(''),formError=ref(''),deleteError=ref(''),visible=ref(false),saving=ref(false),attempted=ref(false),deleteVisible=ref(false),deleting=ref(false),selected=ref<Account|null>(null);
const blank=():Account=>({id:null,description:'',sucursal:'',ibam:''});
const form=reactive(blank());
watch(()=>[form.description,form.sucursal,form.ibam],()=>{formError.value='';});
const normalizedIban=computed(()=>form.ibam.replace(/[\s\u00a0\u202f]+/g,'').toUpperCase());
const validIban=computed(()=>HelperString.isValidIban(normalizedIban.value) && (!normalizedIban.value.startsWith('ES') || /^ES[0-9]{22}$/.test(normalizedIban.value)));
const formatIban=(value:string)=>value?.replace(/\s/g,'').replace(/(.{4})/g,'$1 ').trim()||'';
const message=(e:any)=>typeof e.response?.data==='string'?e.response.data:e.response?.data?.message||'No se pudo completar la operación. Comprueba la conexión y tu sesión.';
const actions=[{label:'Editar',icon:'pi pi-pencil',command:()=>{if(selected.value)edit(selected.value);}},{label:'Eliminar',icon:'pi pi-trash',command:()=>{deleteError.value='';deleteVisible.value=true;}}];
function openMenu(event:Event,account:Account){selected.value=account;menu.value?.toggle(event);}
function edit(account?:Account){Object.assign(form,account?{...account,sucursal:account.sucursal||'',ibam:account.ibam||''}:blank());attempted.value=false;formError.value='';visible.value=true;}
async function save(){
 if(saving.value)return;attempted.value=true;formError.value='';
 if(!form.description.trim()){formError.value='Descripción: obligatoria.';return;}
 if(!validIban.value){formError.value='IBAN: introduce una cuenta con formato y dígitos de control correctos.';return;}
 saving.value=true;
 try{await axios.post(import.meta.env.VITE_API_URL+'/WebBankAccounts',{...form,description:form.description.trim(),sucursal:form.sucursal.trim(),ibam:normalizedIban.value},auth.portalRequestConfig());visible.value=false;toast.add({severity:'success',summary:'Cuenta bancaria guardada',life:3000});await table.value?.refresh();}
 catch(e){formError.value=message(e);}finally{saving.value=false;}
}
async function remove(){
 if(deleting.value||!selected.value?.id)return;deleting.value=true;deleteError.value='';
 try{await axios.delete(import.meta.env.VITE_API_URL+'/WebBankAccounts/'+selected.value.id,auth.portalRequestConfig());deleteVisible.value=false;toast.add({severity:'success',summary:'Cuenta eliminada',life:3000});await table.value?.refresh();}
 catch(e){deleteError.value=message(e);}finally{deleting.value=false;}
}
</script>
<style scoped>
.maintenance-page { --kiwi:#9cc10a; --kiwi-dark:#648506; width:100%; min-height:calc(100dvh - 66px); padding:18px 16px 72px; box-sizing:border-box; background:#f7f8fa; }
.page-header { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:18px; padding:15px 20px; border:1px solid #e3e8d2; border-radius:15px; background:#fff; box-shadow:0 6px 18px rgba(31,41,55,.055); }.page-header::after{content:"";position:absolute;z-index:0;width:300px;height:300px;right:20px;top:50%;transform:translateY(-50%);background:url('/logos/logo512.png') center/contain no-repeat;filter:grayscale(1);opacity:.075;pointer-events:none}.page-header>*{position:relative;z-index:1}.page-heading { display:flex; align-items:center; gap:14px; }.page-icon { display:grid; width:50px; height:50px; flex:0 0 auto; place-items:center; border-radius:13px; color:#fff; background:linear-gradient(135deg,#f3ae48,#dc7c22); box-shadow:0 7px 15px rgba(220,124,34,.22); }.page-icon i{font-size:1.3rem}.breadcrumb{color:#8791a0;font-size:.8rem;font-weight:700}.page-heading h1{margin:3px 0 2px;color:#202939;font-size:1.38rem}.page-heading p{margin:0;color:#7a8494;font-size:.92rem}.header-actions{display:flex;align-items:center;gap:3px}
.list-card { height:clamp(520px,calc(100dvh - 270px),760px); min-height:0; display:flex; flex-direction:column; overflow:hidden; padding:0; border:1px solid #dfe4ea; border-radius:14px; background:#fff; box-shadow:0 5px 18px rgba(30,41,59,.055); }.list-toolbar{padding:13px 17px;border:0;border-bottom:1px solid #e8ecf0;border-radius:0;background:#fff}.workspace-heading{display:flex;flex-direction:column;gap:3px}.workspace-heading span{color:#344054;font-size:1rem;font-weight:800}.workspace-heading small{color:#8a93a2;font-size:.82rem}.list-toolbar :deep(.p-button){border-color:var(--kiwi-dark);background:var(--kiwi-dark)}.maintenance-table{flex:1 1 auto;min-height:0}.list-card :deep(.table-container){border:0;border-radius:0}@media(max-width:700px){.maintenance-page{padding:12px 10px 66px}.page-header{padding:12px;align-items:flex-start}.page-heading p,.workspace-heading small,.header-actions :deep(.p-button-label){display:none}.list-card{height:560px}}
</style>
<style scoped>.bank-fields{display:flex;flex-direction:column;gap:18px;padding:14px 0}.bank-fields label{display:flex;flex-direction:column;gap:7px;font-size:.9rem;font-weight:600}.bank-fields small,.bank-help{font-size:.82rem;color:#687587;font-weight:400;line-height:1.5}.bank-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:14px}.iban{font-variant-numeric:tabular-nums;letter-spacing:.04em}.page-icon{background:linear-gradient(135deg,#a6cb19,#648506)}</style>