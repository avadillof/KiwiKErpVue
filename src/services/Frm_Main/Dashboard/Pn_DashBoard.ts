import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import { useServerTime } from '../../../services/composables/UseServerTime';
import { useSecurityStore } from '../../../stores/securityStore.ts'

export function DashboardController() {
    const router = useRouter();
    const authStore = useAuthStore();
    const { startClock } = useServerTime();
    const securityStore = useSecurityStore();

    onMounted(() => {
        startClock();
    });

    const listaModulos = [
        { id: 'ventas', nombre: 'Ventas', descripcion: 'Gestiona el circuito completo desde el presupuesto hasta el cobro, con trazabilidad, documentación e indicadores en tiempo real.', funcionalidades: ['Entidades y artículos', 'Presupuestos', 'Pedidos de venta', 'Albaranes', 'Facturas, manuales y cobros', 'Widgets e indicadores'], icono: 'pi pi-briefcase', ruta: 'Ventas', colorIcono: '#2875b6', bgIcono: '#e9f4fc', disponible: true },
        { id: 'compras', nombre: 'Compras', descripcion: 'Centralizará proveedores, pedidos de compra, recepciones de mercancía y el seguimiento de gastos.', funcionalidades: ['Proveedores', 'Pedidos', 'Recepciones'], icono: 'pi pi-shopping-cart', ruta: 'Compras', colorIcono: '#e06b35', bgIcono: '#fff2e8', disponible: false },
        { id: 'informes', nombre: 'Informes', descripcion: 'Reunirá los indicadores, comparativas y estadísticas clave para analizar la evolución del negocio.', funcionalidades: ['Indicadores', 'Comparativas', 'Estadísticas'], icono: 'pi pi-chart-bar', ruta: 'Informes', colorIcono: '#16a085', bgIcono: '#e8f8f4', disponible: false },
        { id: 'ajustes', nombre: 'Configuración', descripcion: 'Administra los datos de empresa, usuarios, seguridad y catálogos necesarios para adaptar KiwiKERP.', funcionalidades: ['Empresa', 'Usuarios', 'Seguridad', 'Impuestos', 'Familias'], icono: 'pi pi-cog', ruta: 'Frm_Ajustes', colorIcono: '#7c5cbf', bgIcono: '#f2edfc', disponible: true }
    ];

    const modulosVisibles = computed(function() {
        return listaModulos.filter(function(modulo) {
            // Regla de Ajustes: solo admin
            if (modulo.id === 'ajustes') {
                return authStore.user?.admin === true;
            }
            
            if (modulo.id === 'ventas') {

                if(authStore.user?.admin==true ){
                    return true;
                }else{
                    return securityStore.hasModule('SALES');
                }
            }
            // Regla general: todos los demás visibles si está autenticado
            return true;
        });
    });

    function navegarA(nombreRuta: string, disponible = true): void {
        if (!disponible) return;

        router.push({ name: nombreRuta });
    }

    return {
        modulosVisibles,
        navegarA
    };

   
}
