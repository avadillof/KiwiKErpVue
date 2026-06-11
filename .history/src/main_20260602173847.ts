// src/main.ts
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import KiwiKTheme from './theme/KiwiKTheme.ts';
import App from './App.vue';
import { router } from './router';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

// 1. Importa el CSS base de Vueform primero


// 2. Importa TU tema personalizado después para que sobrescriba al base
import './assets/styles/global.css'; 
import './assets/styles/Frm_Login/frm_login.css';
import './assets/styles/ ConnectionMonitor.css';
import ToastService from 'primevue/toastservice';


const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: KiwiKTheme,
        options: {
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            }
        }
    },
    size: 'small'
});

app.use(ToastService);
app.use(router);
app.mount('#app');