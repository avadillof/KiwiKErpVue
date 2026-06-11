import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/authStore';

// 1. Importaciones tradicionales de las vistas (Sin usar lambdas/funciones flecha)
import IndexView from './views/IndexView.vue';
import Frm_Login from './views/Frm_Login/Frm_Login.vue';
import Frm_Main from './views/Frm_Main/Frm_Main.vue';
import Frm_TestComponets from './views/Frm_TestComponets/Frm_TestComponets.vue';
import Frm_PanelsView from './views/Frm_TestComponets/Frm_Panels/Frm_PanelsView.vue';
import Frm_ButtonsView from './views/Frm_TestComponets/Frm_Buttons/Frm_ButtonsView.vue';
import Frm_TablesView from './views/Frm_TestComponets/Frm_Tables/Frm_TablesView.vue';

// 2. Definición única y limpia de los caminos del ERP
const routes = [
  { 
    path: '/', 
    redirect: '/Frm_Login' 
  },
  { 
    path: '/Frm_Login', 
    name: 'Login',
    component: Frm_Login 
  },
  { 
    path: '/Frm_Main', 
    name: 'MainPanel',
    component: Frm_Main,
    meta: { requiresAuth: true } // Protegido contra accesos anónimos
  },
  { 
    path: '/Index', 
    component: IndexView 
  },
  { 
    path: '/Frm_TestComponets', 
    component: Frm_TestComponets 
  },
  { 
    path: '/Frm_Panels', 
    component: Frm_PanelsView 
  },
  { 
    path: '/Frm_Buttons', 
    component: Frm_ButtonsView 
  },
  { 
    path: '/Frm_Tables', 
    component: Frm_TablesView 
  }
];

// 3. Inicialización del Enrutador pasando el array de rutas unificado
export const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

// 4. El Guardián de seguridad para bloquear el acceso a Frm_Main si no hay login
router.beforeEach(function (to, from, next) {
  const authStore = useAuthStore();

  // Comprobamos de manera tradicional si la ruta exige autenticación
  const requiereAutenticacion = to.matched.some(function (record) {
    return record.meta.requiresAuth;
  });

  if (requiereAutenticacion) {
    if (!authStore.isAuthenticated) {
      // Si intenta saltarse el login, redirigimos de vuelta a la pantalla de entrada
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});