import {createApp,h,ref} from 'vue';
import {createPinia} from 'pinia';
import PrimeVue from 'primevue/config';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import InvoiceAuditDialog from '../src/views/Ventas/Frm_Facturas/InvoiceAuditDialog.vue';
import {useAuthStore} from '../src/stores/authStore';
import axios from 'axios';
import '../src/assets/styles/global.css';
import 'primeicons/primeicons.css';
let fail=false;
// Every request intercepted: no real HTTP, database, session, certificate or fiscal operation.
axios.defaults.adapter=async config=>{
  if(!config.url?.includes('/WebGetSalesInvoiceAudit/')||config.method!=='get')throw Error('Request forbidden by isolated fixture');
  if(fail)throw Error('Simulated backend unavailable');
  const page=Number(config.params.page);
  return {config,status:200,statusText:'OK',headers:{},data:{page,hasMore:page===0,timezone:'UTC',currentVeriFactuStatus:'ACCEPTED',statusCheckedAt:'2026-08-30T17:15:00.000Z',items:page?[]:[
    {id:4,invoiceCode:'FC-TEST-2026/0042',createdAt:'2026-08-30T16:21:00.000',actor:'SYSTEM:VERIFACTU',certificateUser:'CERTIFICADO-TEST',operation:'VERIFACTU_RESULT',result:'ACCEPTED',httpStatus:200},
    {id:3,invoiceCode:'FC-TEST-2026/0042',createdAt:'2026-08-30T16:20:00.000',actor:'OPERADOR-TEST',certificateUser:'CERTIFICADO-TEST',operation:'ISSUE',result:'QUEUED',httpStatus:200},
    {id:2,invoiceCode:'FC-TEST-2026/0042',createdAt:'2026-08-30T15:00:00.000',actor:'OTRO-OPERADOR',certificateUser:'CERTIFICADO-TEST',operation:'RETRY',result:'FAILED',httpStatus:500},
    {id:1,invoiceCode:'DRAFT_FC_42',createdAt:'2026-08-30T14:00:00.000',actor:'OPERADOR-TEST',certificateUser:'CERTIFICADO-TEST',operation:'ISSUE',result:'REJECTED',httpStatus:409}
  ]}};
};
const pinia=createPinia();
const app=createApp({setup(){const dialog=ref<any>();return()=>h('main',{style:'padding:24px'},[h('h1','Prueba aislada — datos ficticios'),h('button',{onClick:()=>{fail=false;dialog.value.open({pkid:42,code:'FC-TEST-2026/0042'});}},'Abrir auditoría de prueba'),h('button',{onClick:()=>{fail=true;dialog.value.open({pkid:42,code:'FC-TEST-2026/0042'});}},'Probar error de consulta'),h(InvoiceAuditDialog,{ref:dialog})]);}});
app.use(pinia);useAuthStore(pinia).setUser({pkid:1,name:'Prueba local',admin:true,userDsCode:'TEST'},'fixture-session-only');
app.use(PrimeVue,{theme:{preset:KiwiKTheme}}).mount('#app');
