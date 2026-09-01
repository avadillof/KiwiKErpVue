import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/authStore';

// 1. Importaciones tradicionales

import Frm_Login from './views/Frm_Login/Frm_Login.vue';
import Frm_Main from './views/Frm_Main/Frm_Main.vue';
import Pn_DashBoard from './views/Frm_Main/Dashboard/Pn_DashBoard.vue';
import Pn_VentasHub from './views/Ventas/Pn_VentasHub.vue'
import Frm_Clientes from './views/Ventas/Frm_Clientes/Frm_Clientes.vue';
import Frm_Presupuestos from './views/Ventas/Frm_Presupuestos/Frm_Presupuestos.vue';
import Frm_Pedidos from './views/Ventas/Frm_Pedidos/Frm_Pedidos.vue';
import Frm_Albaranes from './views/Ventas/Frm_Albaranes/Frm_Albaranes.vue';
import Frm_Products from './views/Frm_Products/Frm_Products.vue';
import Frm_SalesTax from './views/Frm_SalexTax/Frm_SalesTax.vue';
import Frm_Certificates from './views/security/Frm_Certificates/Frm_Certificates.vue';

import Frm_FamiliasProductos from './views/Frm_Products/Frm_FamiliasProductos/Frm_FamiliasProductos.vue';

// 2. Definición de rutas con jerarquía (Layout Persistente)
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
    component: Frm_Main, // Este componente contiene ahora el <router-view />
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // Ruta por defecto dentro de Frm_Main
        name: 'Dashboard',
        component: Pn_DashBoard
      },
      {
        path: 'Frm_Ajustes', // URL: /Frm_Main/ajustes
        name: 'Frm_Ajustes',
        component: () => import('./views/Frm_Main/Frm_Ajustes/Frm_Ajustes.vue')
      },
      {
        path: '/manual',
        name: 'ManualUsuario',
        component: () => import('./views/Help/Frm_UserManual.vue')
      },
      {
        path: '/ventas',
        name: 'Ventas', // Este nombre debe coincidir con el 'ruta' en tu lista
        component: Pn_VentasHub
      },
      {
        path: '/ventas/clientes',
        name: 'Clientes', // <--- Este nombre debe coincidir EXACTAMENTE con la 'ruta' en tu lista
        component: Frm_Clientes
      },
      {
        path: '/ventas/presupuestos',
        name: 'Presupuestos',
        component: Frm_Presupuestos
      },
      {
        path: '/ventas/pedidos',
        name: 'Pedidos',
        component: Frm_Pedidos
      },
      {
        path: '/ventas/albaranes',
        name: 'Albaranes',
        component: Frm_Albaranes
      },
      {
        path: '/ventas/facturas',
        name: 'Facturas',
        component: () => import('./views/Ventas/Frm_Facturas/Frm_Facturas.vue')
      },
      {
        path: '/ventas/lista-precios',
        name: 'ListaPrecios',
        component: () => import('./views/Ventas/Frm_ListaPrecios.vue')
      },
      {
        path: '/ventas/ajustes',
        name: 'AjustesVentas',
        component: () => import('./views/Ventas/Frm_AjustesVentas/Frm_AjustesVentas.vue')
      },
      {
        path: '/security',
        name: 'security',
        component: () => import('@/views/security/Frm_Security.vue')
      },
      {
        path: '/Frm_Products',
        name: 'Productos', // <--- Este nombre debe coincidir EXACTAMENTE con la 'ruta' en tu lista
        component: Frm_Products
      },
      {
        path: '/Frm_SalexTax',
        name: 'Taxas', // <--- Este nombre debe coincidir EXACTAMENTE con la 'ruta' en tu lista
        component: Frm_SalesTax
      },
      {
        path: '/security/Frm_Certificates',
        name: 'Certificates', // <--- Este nombre debe coincidir EXACTAMENTE con la 'ruta' en tu lista
        component: Frm_Certificates
      },
      {
        path: '/Frm_Products/Frm_FamiliasProductos',
        name: 'FamiliasProductos',
        component: Frm_FamiliasProductos
      },


    ]
  }

];

// 3. Inicialización del Enrutador
export const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

// 4. El Guardián de seguridad
router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  // Verificamos si la ruta requiere autenticación
  const requiereAutenticacion = to.matched.some((record) => record.meta.requiresAuth);

  // Si requiere autenticación y no estamos logueados, redirigimos al Login
  if (requiereAutenticacion && !authStore.isAuthenticated) {
    return { name: 'Login' }; // Redirección moderna
  }

  // Si todo está bien o no requiere autenticación, retornamos true para permitir el acceso
  return true;
});
