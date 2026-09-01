import {createPinia} from 'pinia';
import {useAuthStore} from '../../src/stores/authStore';
import KiwiKTheme from "../../src/theme/KiwiKTheme";
import "../../src/assets/styles/global.css";
import {createApp,h} from 'vue';import {createRouter,createMemoryHistory} from 'vue-router';
import PrimeVue from 'primevue/config';import ToastService from 'primevue/toastservice';import axios from 'axios';
import Pricing from '../../src/views/Ventas/Frm_ListaPrecios.vue';
import 'primeicons/primeicons.css';import 'primeflex/primeflex.css';
const rates=[{id:1,version:0,code:'GENERAL',description:'General',currencyId:1,currencyCode:'EUR',ruleCount:0},{id:2,version:0,code:'PRO',description:'Profesional',currencyId:1,currencyCode:'EUR',ruleCount:3}];
const rules=[{minQuantity:0,scope:'ALL',calculation:'DISCOUNT',value:10,productId:null,familyId:null},{minQuantity:10,scope:'FAMILY',calculation:'DISCOUNT',value:15,productId:null,familyId:1},{minQuantity:50,scope:'PRODUCT',calculation:'FIXED',value:45,productId:10,productLabel:'INST — Instalación',familyId:null}];
axios.defaults.adapter=async config=>{const url=config.url||'';let data:any;
 if(url.endsWith('/WebSalesPricingCatalog'))data={settings:{version:0,baseCurrencyId:1,defaultTarifaId:1},rates,currencies:[{id:1,label:'EUR'},{id:2,label:'USD'}],families:[{id:1,label:'Accesorios'}]};
 else if(url.endsWith('/WebSalesPriceLists')){const query=decodeURIComponent(config.params?.query||'').toLowerCase();const filtered=rates.filter(r=>(r.code+' '+r.description).toLowerCase().includes(query));data={content:filtered,totalElements:filtered.length};}
 else if(url.includes('/WebSalesPriceList/'))data={...rates.find(r=>r.id===Number(url.split('/').pop())),rules};
 else if(url.endsWith('/WebGetSalesQuoteProducts'))data={content:[{pkid:10,code:'INST',description:'Instalación'}],totalElements:1};
 else if(url.endsWith('/WebResolveSalesPrice'))data={priceUnit:config.params?.quantity>=50?45:90,salesTarifaId:2,source:config.params?.quantity>=50?'Regla del producto · desde 50':'Regla general · desde 0',currencyCode:'EUR'};
 else if(config.method==='post'&&url.endsWith('/WebPreviewSalesPrice')){const input=JSON.parse(config.data);const priority:any={PRODUCT:3,FAMILY:2,ALL:1};const eligible=input.tarifa.rules.filter((r:any)=>r.minQuantity<=input.quantity&&(r.scope!=='PRODUCT'||r.productId===input.productId)).sort((a:any,b:any)=>priority[b.scope]-priority[a.scope]||b.minQuantity-a.minQuantity);const winner=eligible[0];data={priceUnit:winner?(winner.calculation==='FIXED'?winner.value:100*(1-winner.value/100)):100,currencyCode:'EUR',source:'Simulación aislada del formulario'};}
 else if(config.method==='post'&&url.endsWith('/WebSalesPriceList'))data=JSON.parse(config.data);
 else throw Error('Blocked fixture request '+url);
 return {data,status:200,statusText:'OK',headers:{},config};};
const router=createRouter({history:createMemoryHistory(),routes:[{path:'/',component:Pricing},{path:'/ventas',name:'Ventas',component:Pricing}]});
const pinia=createPinia();
useAuthStore(pinia).setUser({pkid:1,name:'Prueba aislada',admin:false,userDsCode:'test'},'fixture-only-not-a-real-session');
createApp({render:()=>h(Pricing)}).use(pinia).use(router).use(PrimeVue,{theme:{preset:KiwiKTheme,options:{darkModeSelector:false}}}).use(ToastService).mount('#app');
