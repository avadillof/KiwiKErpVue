import { computed, defineComponent } from 'vue';
import { useAuthStore } from '../../stores/authStore'; // Sube dos niveles hasta src/
import { useRouter } from 'vue-router';

// Estructura adaptada para los componentes y estilos de PrimeVue
public interface ModuloItem {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;       // Ahora almacenará la clase de PrimeIcons (ej: 'pi pi-shopping-cart')
    ruta: string;
    colorIcono: string;  // Color hexadecimal para el icono
    bgIcono: string;     // Fondo suave para el contenedor del icono
}

export default defineComponent({
    name: 'Frm_MainController',
    setup() {
        const authStore = useAuthStore();
        const router = useRouter();

        // Nombre de usuario reactivo desde Pinia
        const userName = computed(function() {
            if (authStore.user) {
                return authStore.user.name;
            }
            return 'Usuario';
        });

        // Catálogo oficial de módulos de KiwiKERP usando PrimeIcons
        const listaModulos: ModuloItem[] = [
            { id: 'ventas', nombre: 'Ventas', descripcion: 'Facturación, presupuestos y control de cobros.', icono: 'pi pi-briefcase', ruta: '/ventas', colorIcono: '#3b82f6', bgIcono: '#eff6ff' },
            { id: 'compras', nombre: 'Compras', descripcion: 'Albaranes, proveedores y gestión de gastos.', icono: 'pi pi-shopping-cart', ruta: '/compras', colorIcono: '#ef4444', bgIcono: '#fef2f2' },
            { id: 'informes', nombre: 'Informes', descripcion: 'Estadísticas, balances y analítica del negocio.', icono: 'pi pi-chart-bar', ruta: '/informes', colorIcono: '#22c55e', bgIcono: '#f0fdf4' },
            { id: 'contactos', nombre: 'Contactos', descripcion: 'Directorio de clientes, proveedores y leads.', icono: 'pi pi-users', ruta: '/contactos', colorIcono: '#ec4899', bgIcono: '#fdf2f8' },
            { id: 'ajustes', nombre: 'Ajustes', descripcion: 'Configuración del sistema y gestión de usuarios.', icono: 'pi pi-cog', ruta: '/ajustes', colorIcono: '#6b7280', bgIcono: '#f9fafb' }
        ];

        // De momento, todos los módulos son visibles
        const modulosVisibles = computed(function() {
            return listaModulos;
        });

        // Método tradicional para realizar la navegación
        function navegarA(ruta: string): void {
            router.push(ruta);
        }

        return {
            userName,
            modulosVisibles,
            navegarA
        };
    }
});