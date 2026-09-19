import { backendUrl } from '@/services/backendUrl';
import { computed, defineComponent, onMounted, onUnmounted, onActivated } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import { useCompanyStore } from '../../stores/companyStore';
import { HelperString } from '../../libs/HelperString';
import { useServerTime } from '../composables/UseServerTime';
import Frm_UserForm from '../../views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue';
import { useSecurityStore } from '../../stores/securityStore.ts'
import { useMessagesStore } from '../../stores/messagesStore';


export default defineComponent({
    name: 'Frm_Main',

    setup() {
        const securityStore = useSecurityStore();
        const authStore = useAuthStore();
        const messagesStore = useMessagesStore();
        const router = useRouter();
        const mensajesNuevos = computed(() => messagesStore.unreadCount);
        const companyStore = useCompanyStore();
        const userPkid = computed(() => authStore.user?.pkid || 0);

        let messagesPollId: number | null = null;



        // Control del margen nativo del navegador
        onMounted(async function () {
            refreshSecurity();
            startClock();
            if (userPkid.value > 0) {
                messagesStore.loadMessages();
                messagesPollId = window.setInterval(() => messagesStore.loadMessages(true), 60000);
            }
        });


        onActivated(() => {
            refreshSecurity();
        });

        onUnmounted(function () {
            document.body.style.margin = '';
            document.body.style.padding = '';
            if (messagesPollId !== null) {
                window.clearInterval(messagesPollId);
                messagesPollId = null;
            }
        });



        const profilePhotoUrl = computed(() => {
            const pkid = authStore.user?.pkid;
            if (!pkid) return '';
            return backendUrl(`/gestdoc/users/${pkid}/photoPerfil.jpg?t=${authStore.photoTimestamp}`);
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

        const { serverTime, formatHumanDate, startClock } = useServerTime();

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
            return backendUrl(`/gestdoc/users/${pkid}/photoPerfil.jpg?t=${authStore.photoTimestamp}`);
        });

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


        async function refreshSecurity() {
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            if (userPkid.value > 0) {
                await securityStore.loadSecurity(userPkid.value);
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
            verPerfilUsuario,
            desconectar,
            getCompanyInfo,
            companyStore,
            userPkid,
            getProfilePhotoUrl,
            securityStore


        };
    }
});