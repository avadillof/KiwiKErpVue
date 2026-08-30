import {createApp,h,ref} from 'vue';import {createPinia} from 'pinia';import PrimeVue from 'primevue/config';
import KiwiKTheme from '../src/theme/KiwiKTheme';import ManualInvoiceDialog from '../src/views/Ventas/Frm_Facturas/ManualInvoiceDialog.vue';
import {useAuthStore} from '../src/stores/authStore';import axios from 'axios';import '../src/assets/styles/global.css';import 'primeicons/primeicons.css';
const attempts=ref(0),same=ref(true),saved=ref('');let original='';
// Explicit isolated fixtures. Every HTTP request is intercepted here, never sent to a server.
axios.defaults.adapter=async config=>{
  let data:any;const url=config.url||'';
  if(url.includes('WebLoadSalesQuoteCatalog'))data={rates:[{pkid:1,description:'General',currencyCode:'EUR'},{pkid:2,description:'Profesional',currencyCode:'EUR'}],terms:[{pkid:1,description:'30 días',days:30,active:true},{pkid:2,description:'60 días',days:60,active:true}]};
  else if(url.includes('WebGetSalesQuoteCustomers'))data={content:[{pkid:1,code:'TEST-CLIENT',name:'Cliente de prueba',salesTarifaId:1,salesTermId:'2'}],totalElements:1};
  else if(url.includes('WebGetManualSalesInvoiceCustomer'))data={entityId:1,salesTarifaId:1,terms:'Condiciones generales de prueba',customerTerms:'Condiciones particulares de prueba',paymentTermDescription:'60 días',retentionRate:15,fixedTax:null,currencyCode:'EUR'};
  else if(url.includes('WebGetSalesQuoteProducts'))data={content:[{pkid:2,code:'TEST-SERVICE',description:'Servicio de prueba',salePrice:1234.56,taxValue:21}],totalElements:1};
  else if(url.includes('WebCreateManualSalesInvoice')){attempts.value++;if(attempts.value===1){original=config.data;throw new Error('Respuesta perdida simulada (sin backend real).')}same.value=original===config.data;data={pkid:900,code:'DRAFT_TEST_MANUAL'};}
  else throw new Error('Endpoint no permitido en esta prueba aislada: '+url);
  return{data,status:200,statusText:'OK',headers:{},config};
};
const pinia=createPinia();const app=createApp({setup(){const dialog=ref<any>();const auth=useAuthStore();auth.setUser({pkid:1,name:'Prueba local',admin:false,userDsCode:'test-local'});return()=>h('main',{style:'padding:2rem'},[h('h1','Vista de prueba — datos ficticios, sin backend'),h('button',{onClick:()=>dialog.value.open()},'Abrir factura manual de prueba'),h('p',`Intentos: ${attempts.value} · Misma solicitud: ${same.value} · Resultado: ${saved.value}`),h(ManualInvoiceDialog,{ref:dialog,onSaved:(invoice:any)=>saved.value=invoice.code})])}});
app.use(pinia);app.use(PrimeVue,{theme:{preset:KiwiKTheme},size:'small'});app.mount('#app');
