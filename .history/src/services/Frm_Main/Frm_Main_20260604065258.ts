import { computed, defineComponent, ref, onMounted, onUnmounted } from 'vue';
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
        const mensajesNuevos = ref(0);

        // Control del margen nativo del navegador
        onMounted(function() {
            document.body.style.margin = '0';
            document.body.style.padding = '0';
        });

        onUnmounted(function() {
            document.body.style.margin = '';
            document.body.style.padding = '';
        });

        // Nombre de usuario reactivo
        const userName = computed(function() {
            if (authStore.user) {
                return authStore.user.name;
            }
            return 'Usuario';
        });

        // Iniciales para el Avatar
        const userInitials = computed(function() {
            if (authStore.user && authStore.user.name) {
                const nombre = authStore.user.name.trim();
                if (nombre.length > 0) {
                    return nombre.substring(0, 2).toUpperCase();
                }
            }
            return 'US';
        });

        // Fecha actual formateada en español
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

        // Datos corporativos expuestos
        const empresaNombre = computed(function() {
            return 'Freelandsite - Andrés Vadillo de la Fuente (Autónomo)';
        });

        const erpInfo = computed(function() {
            return {
                nombre: 'KiwiKERP',
                version: 'v2026.1.0',
                copyright: '2026'
            };
        });

        // Catálogo de módulos
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

        function verMensajes(): void {
            console.log("Mensajes abiertos");
        }

        function verPerfilUsuario(): void {
            console.log("Perfil abierto");
        }

        return {
            mensajesNuevos,
            userName,
            userInitials,
            fechaActual,
            empresaNombre,
            erpInfo,
            modulosVisibles,
            navegarA,
            verMensajes,
            verPerfilUsuario
        };
    }
});