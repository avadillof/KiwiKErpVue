import {createApp,h,ref} from 'vue';
import {createPinia} from 'pinia';
import PrimeVue from 'primevue/config';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import OrderInvoiceDialog from '../src/views/Ventas/Frm_Pedidos/OrderInvoiceDialog.vue';
import axios from 'axios';
import '../src/assets/styles/global.css';
import 'primeicons/primeicons.css';
// Isolated visual fixture. No request leaves this adapter and no authentication is persisted.
axios.defaults.adapter=async config=>({data:{code:'PRUEBA-MIXTO',lines:[{id:1,description:'Servicio de instalación',requireDelivery:false,direct:true,quantity:10,delivered:0,invoiced:2,reserved:4,available:6},{id:2,description:'Equipo con facturación por cantidades pedidas',requireDelivery:true,direct:true,quantity:10,delivered:0,invoiced:0,reserved:3,available:7},{id:3,description:'Material por cantidades entregadas',requireDelivery:true,direct:false,quantity:10,delivered:4,invoiced:2,reserved:2,available:0}]},status:200,statusText:'OK',headers:{},config});
const app=createApp({setup(){const dialog=ref<any>();return()=>h('main',{style:'padding:2rem'},[h('h1','Vista de prueba — datos ficticios, sin backend'),h('button',{onClick:()=>dialog.value.open(1)},'Abrir pedido mixto de prueba'),h(OrderInvoiceDialog,{ref:dialog})])}});
app.use(createPinia());app.use(PrimeVue,{theme:{preset:KiwiKTheme},size:'small'});app.mount('#app');
