import { computed, defineComponent, ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';

export interface ModuloItem {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    ruta: string;
    colorIcono: string;
    bgIcono: string;
}

export default defineComponent({
    name: 'Frm_MainController',
    setup() {
        const authStore = useAuthStore();
        const router = useRouter();

        // Contador de mensajes nuevos del sistema (reactivo tradicional)
        const mensajesNuevos = ref(3);

        // Nombre de usuario reactivo desde Pinia
        const userName = computed(function() {
            if (authStore.user) {
                return authStore.user.name;
            }
            return 'Usuario';
        });

        // Iniciales del usuario para el Badge del perfil
        const userInitials = computed(function() {
            if (authStore.user && authStore.user.name) {
                const nombre = authStore.user.name.trim();
                if (nombre.length > 0) {
                    return nombre.substring(0, 2).toUpperCase();
                }
            }
            return 'US';
        });

        // Obtener la fecha de hoy formateada en español
        const fechaActual = computed(function() {
            const hoy = new Date();
            const opciones: Intl.DateTimeFormatOptions = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            const fechaFormateada = hoy.toLocaleDateString('es-ES', opciones);
            
            if (fechaFormateada.length > 0) {
                return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
            }
            return fechaFormateada;
        });

        // Catálogo oficial de módulos de KiwiKERP
        const listaModulos: ModuloItem[] = [
            { id: 'ventas', nombre: 'Ventas', descripcion: 'Facturación, presupuestos y control de cobros.', icono: 'pi pi-briefcase', ruta: '/ventas', colorIcono: '#3b82f6', bgIcono: '#eff6ff' },
            { id: 'compras', nombre: 'Compras', descripcion: 'Albaranes, proveedores y gestión de gastos.', icono: 'pi pi-shopping-cart', ruta: '/compras', colorIcono: '#ef4444', bgIcono: '#fef2f2' },
            { id: 'informes', nombre: 'Informes', descripcion: 'Estadísticas, balances y analítica del negocio.', icono: 'pi pi-chart-bar', ruta: '/informes', colorIcono: '#22c55e', bgIcono: '#f0fdf4' },
            { id: 'contactos', nombre: 'Contactos', descripcion: 'Directorio de clientes, proveedores y leads.', icono: 'pi pi-users', ruta: '/contactos', colorIcono: '#ec4899', bgIcono: '#fdf2f8' },
            { id: 'ajustes', nombre: 'Ajustes', descripcion: 'Configuración del sistema y gestión de usuarios.', icono: 'pi pi-cog', ruta: '/ajustes', colorIcono: '#6b7280', bgIcono: '#f9fafb' }
        ];

        const modulosVisibles = computed(function() {
            return listaModulos;
        });

        function navegarA(ruta: string): void {
            router.push(ruta);
        }

        // Lógica futura para abrir la bandeja de mensajes al pulsar la campana
        function verMensajes(): void {
            console.log("Abriendo bandeja de mensajes del sistema. Mensajes pendientes:", mensajesNuevos.value);
        }

        function verPerfilUsuario(): void {
            console.log("Abriendo detalles del usuario:", authStore.user);
        }

        return {
            mensajesNuevos,
            userName,
            userInitials,
            fechaActual,
            modulosVisibles,
            navegarA,
            verMensajes,
            verPerfilUsuario
        };
    }
});