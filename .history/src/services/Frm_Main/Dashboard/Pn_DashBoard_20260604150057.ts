import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';

export function DashboardController() {
    const router = useRouter();
    const authStore = useAuthStore();

    const listaModulos = [
        { id: 'ventas', nombre: 'Ventas', descripcion: 'Facturación, presupuestos y control de cobros.', icono: 'pi pi-briefcase', ruta: 'Ventas', colorIcono: '#3b82f6', bgIcono: '#eff6ff' },
        { id: 'compras', nombre: 'Compras', descripcion: 'Albaranes, proveedores y gestión de gastos.', icono: 'pi pi-shopping-cart', ruta: 'Compras', colorIcono: '#ef4444', bgIcono: '#fef2f2' },
        { id: 'informes', nombre: 'Informes', descripcion: 'Estadísticas, balances y analítica del negocio.', icono: 'pi pi-chart-bar', ruta: 'Informes', colorIcono: '#22c55e', bgIcono: '#f0fdf4' },
        { id: 'contactos', nombre: 'Contactos', descripcion: 'Directorio de clientes, proveedores y leads.', icono: 'pi pi-users', ruta: 'Contactos', colorIcono: '#ec4899', bgIcono: '#fdf2f8' },
        { id: 'ajustes', nombre: 'Ajustes', descripcion: 'Configuración del sistema,parámetros y gestión de usuarios para KiwiKERP.', icono: 'pi pi-cog', ruta: 'Frm_Ajustes', colorIcono: '#6b7280', bgIcono: '#f9fafb' }
    ];

    const modulosVisibles = computed(function() {
        return listaModulos.filter(function(modulo) {
            // Regla de Ajustes: solo admin
            if (modulo.id === 'ajustes') {
                return authStore.user?.admin === true;
            }
            // Regla general: todos los demás visibles si está autenticado
            return false;
        });
    });

    function navegarA(nombreRuta: string): void {
        router.push({ name: nombreRuta });
    }

    return {
        modulosVisibles,
        navegarA
    };
}