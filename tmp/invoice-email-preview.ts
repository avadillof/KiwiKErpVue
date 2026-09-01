import {createApp,h,ref} from 'vue';
import {createPinia} from 'pinia';
import PrimeVue from 'primevue/config';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import InvoiceEmailDialog from '../src/views/Ventas/Frm_Facturas/InvoiceEmailDialog.vue';
import {useAuthStore} from '../src/stores/authStore';
import axios from 'axios';
import '../src/assets/styles/global.css';
import 'primeicons/primeicons.css';
const contacts=[{pkid:1,name:'Contacto principal',email:'principal@example.test',defaultContact:true},{pkid:2,name:'Administración',email:'admin@example.test',defaultContact:false}];
const history:any[]=[];let loseResponse=false,simulatedSends=0;
// Every request intercepted. No HTTP request, SMTP connection, database or fiscal submission.
axios.defaults.adapter=async config=>{
 let data:any;
 if(config.method==='get'&&config.url?.includes('/WebGetSalesInvoiceEmail/'))data={page:0,hasMore:false,hasInProgress:false,contacts,history:[...history].reverse(),canSend:true,pdfAvailable:true,pdfFilename:'FACTURA_VERIFACTU_42.pdf',subject:'Factura FC-TEST-42',message:'Adjuntamos la factura en formato PDF.\n\nGracias por su confianza.',customerName:'Cliente ficticio · prueba sin correos reales',lastSentAt:history.length?'2026-08-30T17:00:00Z':null};
 else if(config.method==='post'&&config.url?.includes('/WebSendSalesInvoiceEmail/')){
  const request=JSON.parse(config.data);data=history.find(row=>row.operationKey===request.operationKey);
  if(!data){simulatedSends++;data={...request,id:history.length+1,invoiceId:42,actor:'OPERADOR-PRUEBA',status:'SENT',createdAt:'2026-08-30T17:00:00.000',completedAt:'2026-08-30T17:00:01.000',operation:history.length?'RESEND':'SEND',recipientsJson:JSON.stringify(contacts.filter(c=>request.contactIds.includes(c.pkid)))};history.push(data);}
  document.getElementById('count')!.textContent=`Envíos simulados: ${simulatedSends}`;
  if(loseResponse){loseResponse=false;throw Error('Simulated lost response after acceptance');}
 }else throw Error('Request forbidden by isolated fixture');
 return {config,status:200,statusText:'OK',headers:{},data};
};
const pinia=createPinia();
const app=createApp({setup(){const dialog=ref<any>();return()=>h('main',{style:'padding:24px'},[h('h1','Correo de factura — prueba aislada'),h('p',{id:'count'},'Envíos simulados: 0'),h('button',{onClick:()=>dialog.value.open({pkid:42,code:'FC-TEST-42'})},'Abrir correo de prueba'),h('button',{onClick:()=>{loseResponse=true;dialog.value.open({pkid:42,code:'FC-TEST-42'});}},'Probar respuesta perdida'),h(InvoiceEmailDialog,{ref:dialog})]);}});
app.use(pinia);useAuthStore(pinia).setUser({pkid:1,name:'Prueba local',admin:true,userDsCode:'TEST'},'fixture-session-only');
app.use(PrimeVue,{theme:{preset:KiwiKTheme}}).mount('#app');
