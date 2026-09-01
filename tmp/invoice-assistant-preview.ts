import {createApp,h,ref} from 'vue';
import {createPinia} from 'pinia';
import PrimeVue from 'primevue/config';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import InvoiceAssistantDialog from '../src/views/Ventas/Frm_Facturas/InvoiceAssistantDialog.vue';
import {useAuthStore} from '../src/stores/authStore';
import axios from 'axios';
import '../src/assets/styles/global.css';
import 'primeicons/primeicons.css';
let available=false,fail=false;
// All requests are intercepted; these are explicitly fictional UI fixtures, never live ERP data.
axios.defaults.adapter=async config=>{
  const ok=(data:unknown)=>({config,status:200,statusText:'OK',headers:{},data});
  if(config.url?.endsWith('/WebInvoiceAssistant/status'))return ok({aiAvailable:available,readOnly:true});
  if(config.url?.endsWith('/WebInvoiceAssistant/interpret'))return ok({needsClarification:false,message:'Periodo propuesto de prueba.',criteria:{action:'BILLING',from:'2026-08-01',to:'2026-08-31',customer:null,invoiceCode:null,invoiceId:null}});
  if(config.url?.endsWith('/WebInvoiceAssistant/query')){
    if(fail)throw Error('Simulated backend failure');
    const criteria=JSON.parse(config.data);const totals={count:1,net:100,tax:21,retention:0,total:121,collectedAmount:50,pendingAmount:71,overdueAmount:71};
    return ok({criteria,checkedAt:'2026-08-31T10:00:00Z',answer:'Una factura ficticia para validar la interfaz.',definition:'Datos ficticios. Saldo actual y fecha de factura. No se ha consultado ninguna base de datos.',warnings:[],totals,customers:[{customer:'Cliente de prueba',...totals}],invoices:[{pkid:42,code:'FC-TEST-42',date:'2026-08-01',state:'ISSUED',customer:'Cliente de prueba',...totals}],legacyBalance:false,payments:[{id:1,date:'2026-08-10',method:'TRANSFER',amount:50,reversed:false},{id:2,date:'2026-08-11',method:'CASH',amount:10,reversed:true}],dues:[{position:1,dueDate:'2026-08-15',amount:121,pendingAmount:71,timing:'OVERDUE',termDescription:'Prueba a 15 días'}]});
  }
  throw Error('Unexpected request blocked by fixture');
};
const pinia=createPinia();
const app=createApp({setup(){const dialog=ref<any>();const opened=ref('');return()=>h('main',{style:'padding:24px'},[
  h('h1','Prueba aislada — datos ficticios'),
  h('button',{onClick:()=>{available=false;fail=false;dialog.value.open({pkid:42,code:'FC-TEST-42'});}},'Abrir sin IA'),
  h('button',{onClick:()=>{available=true;fail=false;dialog.value.open({pkid:42,code:'FC-TEST-42'});}},'Abrir IA simulada'),
  h('button',{onClick:()=>{available=false;fail=true;dialog.value.open();}},'Probar error'),
  h('p',opened.value),h(InvoiceAssistantDialog,{ref:dialog,onOpenInvoice:(i:any)=>opened.value='Documento abierto: '+i.code})
]);}});
app.use(pinia);useAuthStore(pinia).setUser({pkid:1,name:'Prueba',admin:true,userDsCode:'TEST'},'fixture-only');
app.use(PrimeVue,{theme:{preset:KiwiKTheme}}).mount('#app');
