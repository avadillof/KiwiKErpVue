import { computed, defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '../../stores/companyStore';
import { HelperString } from '../../libs/HelperString';
import { useServerTime } from '../composables/UseServerTime';
import Frm_UserForm from '../../views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue';
import { useSecurityStore } from '../../stores/securityStore.ts'


export default defineComponent({
    name: 'Frm_Main',

    setup() {
        const securityStore = useSecurityStore();
        const authStore = useAuthStore();
        const router = useRouter();
        const mensajesNuevos = ref(0);
        const companyStore = useCompanyStore();
        const useserverTime = useServerTime();
        const userPkid = computed(() => authStore.user?.pkid || 0);



        // Control del margen nativo del navegador
        onMounted(function () {
            document.body.style.margin = '0';
            document.body.style.padding = '0';
        });

        onUnmounted(function () {
            document.body.style.margin = '';
            document.body.style.padding = '';
        });

        onMounted(async () => {
            

            await securityStore.loadSecurity(
                authStore.user?.pkid
            )


        });

        const profilePhotoUrl = computed(() => {
            const pkid = authStore.user?.pkid;
            if (!pkid) return '';
            return `${import.meta.env.VITE_API_URL.replace('/api', '')}/gestdoc/users/${pkid}/photoPerfil.jpg?t=${authStore.photoTimestamp}`;
        });

        // Nombre de usuario reactivo
        const userName = computed(function () {
            if (authStore.user) {
                return authStore.user.name;
            }
            return 'Usuario';
        });

        // Iniciales para el Avatar
        const userInitials = computed(function () {

            if (authStore.user && authStore.user.name) {
                const nombre = authStore.user.name.trim();
                return HelperString.getInitialsFromString(nombre);

            }
            return 'US';
        });

        const { serverTime, formatHumanDate } = useServerTime();

        // Fecha actual formateada en español
        const fechaActual = computed(() => {
            return formatHumanDate(serverTime.value);
        });

        const empresaNombre = computed(function () {
            return companyStore.companyInfo.nameCompany;
        });

        const erpInfo = computed(function () {
            return {
                nombre: 'KiwiKERP',
                version: 'v2026.1.0',
                copyright: '2026'
            };
        });


        const getProfilePhotoUrl = computed(() => (pkid: number) => {
            if (!pkid || pkid === 0) return '';
            // Al usar authStore.photoTimestamp, Vue "se suscribe" a su valor
            return `${import.meta.env.VITE_API_URL.replace('/api', '')}/gestdoc/users/${pkid}/photoPerfil.jpg?t=${authStore.photoTimestamp}`;
        });

        function verMensajes(): void {
            console.log("Mensajes abiertos");
        }

        // En Frm_Main.ts
        // En Frm_Main.ts
        function verPerfilUsuario(openForm: any): void {
            if (typeof openForm !== 'function') {
                console.error("El formulario aún no está cargado o la referencia es nula.");
                return;
            }

            if (authStore.user && authStore.user.pkid) {
                openForm(authStore.user.pkid); // Ahora esto enviará el número, ej: 123
            } else {
                console.error("No hay un ID de usuario válido.");
            }
        }





        function desconectar(): void {
            authStore.logout();
            router.push({ name: 'Login' });
        }

        function getCompanyInfo() {
            return companyStore;
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
            desconectar,
            getCompanyInfo,
            companyStore,
            userPkid,
            getProfilePhotoUrl


        };
    }
});