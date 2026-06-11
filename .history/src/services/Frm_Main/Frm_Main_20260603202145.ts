import { computed, defineComponent } from 'vue';
import { useAuthStore } from '../stores/authStore'; // Ajusta la ruta según tu proyecto
import { useRouter } from 'vue-router';

// Definición de la estructura de un módulo para el tipado estricto
export interface ModuloItem {
    id: string;
    nombre: string;
    descripcion: string;
    icono: string;
    ruta: string;
    colorBg: string;
    colorTexto: string;
}

export default defineComponent({
    name: 'Frm_MainController',
    setup() {
        const authStore = useAuthStore();
        const router = useRouter();

        // Obtenemos el nombre del usuario conectado desde Pinia de manera reactiva
        const userName = computed(function() {
            if (authStore.user) {
                return authStore.user.name;
            }
            return 'Usuario';
        });

        // Catálogo tradicional de los módulos integrados del ERP
        const listaModulos: ModuloItem[] = [
            { id: 'ventas', nombre: 'Ventas', descripcion: 'Facturación, presupuestos y control de cobros.', icono: '💼', ruta: '/ventas', colorBg: '#eff6ff', colorTexto: '#3b82f6' },
            { id: 'compras', nombre: 'Compras', descripcion: 'Albaranes, proveedores y gestión de gastos.', icono: '🛒', ruta: '/compras', colorBg: '#fef2f2', colorTexto: '#ef4444' },
            { id: 'informes', nombre: 'Informes', descripcion: 'Estadísticas, balances y analítica del negocio.', icono: '📊', ruta: '/informes', colorBg: '#f0fdf4', colorTexto: '#22c55e' },
            { id: 'contactos', nombre: 'Contactos', descripcion: 'Directorio de clientes, proveedores y leads.', icono: '👥', ruta: '/contactos', colorBg: '#fdf2f8', colorTexto: '#ec4899' },
            { id: 'ajustes', nombre: 'Ajustes', descripcion: 'Configuración del sistema y gestión de usuarios.', icono: '⚙️', ruta: '/ajustes', colorBg: '#f9fafb', colorTexto: '#6b7280' }
        ];

        // De momento todos los módulos son visibles (aquí se aplicará la securización futura)
        const modulosVisibles = computed(function() {
            return listaModulos;
        });

        // Método tradicional para realizar la navegación entre módulos
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