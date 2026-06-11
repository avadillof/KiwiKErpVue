import { computed, defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'Frm_Main',
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

        function verMensajes(): void {
            console.log("Mensajes abiertos");
        }

        function verPerfilUsuario(): void {
            console.log("Perfil abierto");
        }

        // Devolvemos solo lo que el layout (Frm_Main.vue) necesita
        return {
            mensajesNuevos,
            userName,
            userInitials,
            fechaActual,
            empresaNombre,
            erpInfo,
            verMensajes,
            verPerfilUsuario,
            mensajesNuevos
        };
    }
});