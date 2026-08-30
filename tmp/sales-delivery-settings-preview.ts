import {createApp,h,ref} from 'vue';
import {createRouter,createMemoryHistory} from 'vue-router';
import {createPinia} from 'pinia';
import PrimeVue from 'primevue/config';import ToastService from 'primevue/toastservice';import ConfirmationService from 'primevue/confirmationservice';
import KiwiKTheme from '../src/theme/KiwiKTheme';import Settings from '../src/views/Ventas/Frm_AjustesVentas/Frm_AjustesVentas.vue';import Orders from '../src/views/Ventas/Frm_Pedidos/Frm_Pedidos.vue';
import axios from 'axios';import '../src/assets/styles/global.css';import 'primeicons/primeicons.css';
let saved:any={invoiceSeriesPrefix:'KW',veriFactuSystemEntity:'Empresa ficticia',veriFactuSystemNif:'TEST',veriFactuSystemVersion:'1',deliveryReminderEnabled:true,deliveryReminderTime:'08:15',deliveryReminderDays:7,deliveryDeadlineShortDays:7,deliveryDeadlineLongDays:30};
const saves=ref(0);
// All requests intercepted: no backend, real settings, SMTP or fiscal submissions.
axios.defaults.adapter=async config=>{const url=config.url||'';let data:any;
 if(url.includes('WebSaveSalesSettings')){saved=JSON.parse(config.data);saves.value++;data={...saved};}
 else if(url.includes('WebGetSalesSettings')||url.includes('WebGetSalesDeliverySettings'))data={...saved};
 else if(url.includes('WebPreviewSalesDeliveryReminders')||url.includes('WebSendSalesDeliveryReminders'))data={preview:url.includes('Preview'),date:'2026-08-30',days:saved.deliveryReminderDays,sent:1,skipped:0,failed:0,recipients:[{name:'Responsable ficticio',email:'test@example.invalid',status:url.includes('Preview')?'READY':'SENT',orders:[{code:'PED-TEST-001',client:'Cliente de prueba',deliveryDate:'30/08/2026',status:'Vence hoy',pendingQuantity:'1.250'}]}]};
 else if(url.includes('WebGetSalesOrders'))data={content:[],totalElements:0};
 else if(url.includes('WebGetSalesOrderStatistics'))data={};
 else throw Error('Endpoint no permitido en la prueba: '+url);
 return{data,status:200,statusText:'OK',headers:{},config};};
const router=createRouter({history:createMemoryHistory(),routes:[{path:'/',component:Settings}]});await router.push('/');
const app=createApp({setup(){const orders=ref(false),revision=ref(0);return()=>h('main',[h('div',{style:'padding:12px;background:white'},[h('b','Prueba aislada — sin correos ni datos reales. '),h('span',`Guardados: ${saves.value} `),h('button',{onClick:()=>{orders.value=!orders.value}},orders.value?'Ver ajustes de prueba':'Ver pedidos de prueba'),h('button',{onClick:()=>revision.value++},'Recargar formulario de prueba')]),h(orders.value?Orders:Settings,{key:revision.value})]);}});
app.use(createPinia()).use(router).use(PrimeVue,{theme:{preset:KiwiKTheme}}).use(ToastService).use(ConfirmationService).mount('#app');
