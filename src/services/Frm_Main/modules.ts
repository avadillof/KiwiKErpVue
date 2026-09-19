import { useAuthStore } from '../../stores/authStore';
import { useSecurityStore } from '../../stores/securityStore';

export interface AppModule {
  id: string;
  nombre: string;
  descripcion: string;
  funcionalidades: string[];
  icono: string;
  ruta: string;
  colorIcono: string;
  bgIcono: string;
  disponible: boolean;
  /** Nivel de dashboard: se muestra como acceso principal y se registra en "Recientes". */
  dashboardLevel?: boolean;
  /** Oculto permanentemente hasta su publicación. */
  hidden?: boolean;
  /** Solo visible para administradores. */
  adminOnly?: boolean;
  /** Requiere permiso de módulo (no admin). */
  requiredPermission?: string;
}

export const APP_MODULES: AppModule[] = [
  {
    id: 'ventas',
    nombre: 'Ventas',
    descripcion: 'Gestiona el circuito completo desde el presupuesto hasta el cobro, con trazabilidad, documentación e indicadores en tiempo real.',
    funcionalidades: ['Entidades, artículos y tarifas', 'Presupuestos', 'Pedidos de venta', 'Albaranes', 'Facturas, vencimientos y cobros', 'Rectificación de Facturas', 'Lista de Precios', 'Widgets e indicadores'],
    icono: 'pi pi-briefcase',
    ruta: 'Ventas',
    colorIcono: '#2875b6',
    bgIcono: '#e9f4fc',
    disponible: true,
    dashboardLevel: true,
    requiredPermission: 'SALES'
  },
  {
    id: 'informes-ventas',
    nombre: 'Reportes',
    descripcion: 'Informes parametrizados del ERP, cada uno con su código único RPT.',
    funcionalidades: ['RPT-SAL-010 Lista de Artículos'],
    icono: 'pi pi-chart-bar',
    ruta: 'InformesVentas',
    colorIcono: '#16a085',
    bgIcono: '#e8f8f4',
    disponible: true,
    requiredPermission: 'SALES'
  },
  {
    id: 'compras',
    nombre: 'Compras',
    descripcion: 'Centralizará proveedores, pedidos de compra, recepciones de mercancía y el seguimiento de gastos.',
    funcionalidades: ['Proveedores', 'Pedidos', 'Recepciones'],
    icono: 'pi pi-shopping-cart',
    ruta: 'Compras',
    colorIcono: '#e06b35',
    bgIcono: '#fff2e8',
    disponible: false,
    hidden: true
  },
  {
    id: 'informes',
    nombre: 'Informes',
    descripcion: 'Reunirá los indicadores, comparativas y estadísticas clave para analizar la evolución del negocio.',
    funcionalidades: ['Indicadores', 'Comparativas', 'Estadísticas'],
    icono: 'pi pi-chart-bar',
    ruta: 'Informes',
    colorIcono: '#16a085',
    bgIcono: '#e8f8f4',
    disponible: false,
    hidden: true,
    dashboardLevel: true
  },
  {
    id: 'ajustes',
    nombre: 'Configuración',
    descripcion: 'Administra los datos de empresa, usuarios, seguridad y catálogos necesarios para adaptar KiwiKERP.',
    funcionalidades: ['Empresa', 'Usuarios', 'Seguridad', 'Impuestos', 'Familias'],
    icono: 'pi pi-cog',
    ruta: 'Frm_Ajustes',
    colorIcono: '#7c5cbf',
    bgIcono: '#f2edfc',
    disponible: true,
    dashboardLevel: true,
    adminOnly: true
  }
];

/** Módulos que el usuario autenticado puede ver (dashboard, sidebar y búsqueda). */
export function visibleAppModules(): AppModule[] {
  const authStore = useAuthStore();
  const securityStore = useSecurityStore();
  return APP_MODULES.filter((module) => {
    if (module.hidden) return false;
    if (module.adminOnly) return authStore.user?.admin === true;
    if (module.requiredPermission) {
      if (authStore.user?.admin === true) return true;
      return securityStore.hasModule(module.requiredPermission);
    }
    return true;
  });
}