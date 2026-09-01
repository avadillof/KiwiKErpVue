import {createApp,h} from 'vue';
import {createPinia} from 'pinia';
import PrimeVue from 'primevue/config';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import AiSettingsPanel from '../src/views/Frm_Main/Frm_Ajustes/AiSettingsPanel.vue';
import {useAuthStore} from '../src/stores/authStore';
import axios from 'axios';
import '../src/assets/styles/global.css';
import 'primeicons/primeicons.css';
let state={version:0,enabled:false,model:'gpt-4.1-mini',encryptionReady:true,storedKey:false,keyConfigured:false,ready:false,problem:''};
// All HTTP intercepted. No real key, provider call or database write.
axios.defaults.adapter=async config=>{
  if(!config.url?.includes('/WebAiSettings'))throw Error('Unexpected request blocked');
  if(config.method==='put'){const body=JSON.parse(config.data);const hasKey=body.removeKey?false:!!body.apiKey||state.storedKey;state={...state,enabled:body.enabled,model:body.model,version:state.version+1,storedKey:hasKey,keyConfigured:hasKey,ready:body.enabled&&hasKey};}
  return {config,status:200,statusText:'OK',headers:{},data:config.url.endsWith('/test')?{success:true,message:'Prueba simulada correcta. No se ha llamado a OpenAI.'}:{...state}};
};
const pinia=createPinia();const app=createApp({render:()=>h('main',[h('p',{style:'padding:12px;background:#fff5d8'},'Prueba aislada: datos ficticios, sin llamadas reales a OpenAI'),h(AiSettingsPanel)])});
app.use(pinia);useAuthStore(pinia).setUser({pkid:1,name:'Prueba',admin:true,userDsCode:'TEST'},'fixture-only');app.use(PrimeVue,{theme:{preset:KiwiKTheme}}).mount('#app');
