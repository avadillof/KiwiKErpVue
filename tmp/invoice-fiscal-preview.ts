import { createApp, h } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import Invoices from '../src/views/Ventas/Frm_Facturas/Frm_Facturas.vue';
import axios from 'axios';
import '../src/assets/styles/global.css';
import 'primeicons/primeicons.css';
const invoice={pkid:990042,code:'DRAFT_PRUEBA_FISCAL',state:'DRAFT',salesTarifaId:1,salesTermId:1,paymentTermDays:30,paymentTermDescription:'30 días',currencyCode:'EUR',manualInvoice:true,entityName:'Cliente ficticio — sin conexión',createDate:'2026-08-30T09:00:00Z',toPayDate:'2026-09-30',terms:'',customerTerms:'',totalNeto:100,totalTax:21,totalTotal:121,lines:[{pkid:1,manual:true,manualReason:'Prueba',description:'Servicio de prueba',quantity:1,priceUnit:100,discount:0,tax:21}],deliveries:[]};
// Every request is answered locally. No backend, credentials or real invoices are used.
axios.defaults.adapter=async config=>{
 const url=config.url||'';let data:any={content:[],totalElements:0};
 if(config.method==='post')throw Error('No se permite emitir ni enviar en esta vista de prueba.');
 if(url.includes('WebLoadSalesQuoteCatalog'))data={rates:[{pkid:1,description:'General',currencyCode:'EUR'},{pkid:2,description:'Profesional',currencyCode:'EUR'}],terms:[{pkid:1,description:'30 días',days:30,active:true},{pkid:2,description:'60 días',days:60,active:true}]};
 else if(url.includes('WebUpdateSalesInvoice')){Object.assign(invoice,JSON.parse(config.data));data={...invoice};}
 else if(/WebGetSalesInvoice\//.test(url))data={...invoice};
 else if(url.includes('WebValidateSalesInvoice'))data={valid:false,errors:[{field:'company.nif',message:'El NIF del emisor falta o no tiene un formato/control válido.',location:'Configuración → Datos de empresa'},{field:'customer.address',message:'Domicilio del cliente: dato obligatorio.',location:'Ventas → Entidades → ficha del cliente'},{field:'customer.country',message:'Seleccione un país reconocido para el domicilio del cliente; no se deduce del NIF.',location:'Ventas → Entidades → ficha del cliente'}]};
 else if(url.includes('WebGetSalesInvoiceStatistics'))data={topCustomers:[],monthly:Array(12).fill(0)};
 else if(url.includes('WebGetSalesInvoiceVeriFactuQueue'))data={pending:[],errors:[],accepted:[]};
 else if(url.includes('WebGetSalesInvoices'))data={content:[invoice],totalElements:1};
 return {data,status:200,statusText:'OK',headers:{},config};
};
const router=createRouter({history:createMemoryHistory(),routes:[{path:'/',component:Invoices}]});
await router.push('/?invoiceId=990042');
const app=createApp({render:()=>h(Invoices)});
app.use(createPinia()).use(router).use(PrimeVue,{theme:{preset:KiwiKTheme}}).use(ToastService).use(ConfirmationService).mount('#app');
