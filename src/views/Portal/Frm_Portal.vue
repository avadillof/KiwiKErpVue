<template>
   
<main v-if="!session" class="login-page">
    <section class="login-shell">

        <img
            src="../../assets/logos/corporate.png"
            alt="FreeLandSite"
            class="corporate-divider-logo"
        />

        <aside class="brand-panel">

            <div class="brand-glow brand-glow--top"></div>
            <div class="brand-glow brand-glow--bottom"></div>

            <div class="brand-copy">

                <span class="brand-eyebrow">
                    Portal CRM del Cliente
                </span>

                <h1>
                    Tu espacio,<br />
                    siempre conectado.
                </h1>

                <p>
                    Accede a tu espacio privado, consulta la información
                    de tu empresa y mantén una comunicación directa
                    con nuestro equipo.
                </p>

            </div>

            <div class="brand-features">

                <span>
                    <i class="pi pi-check-circle"></i>
                    Tu información, siempre disponible
                </span>

                <span>
                    <i class="pi pi-comments"></i>
                    Comunicación directa con nuestro equipo
                </span>

                <span>
                    <i class="pi pi-shield"></i>
                    Acceso privado y seguro
                </span>

            </div>

            <div class="brand-footer">

                <span>
                    Desarrollado por
                    <a
                        href="https://www.freelandsite.es"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        FreeLandSite.es
                    </a>
                </span>

            </div>

        </aside>

        <section class="access-panel">

            <div class="access-content">

                <header class="company-header">

                    <div class="client-logo-wrap">

                        <img
                            v-if="company.logo && !logoError"
                            :key="company.logo"
                            :src="company.logo"
                            alt="Logotipo de la empresa"
                            class="client-logo"
                            @error="logoError = true"
                        />

                        <i class="pi pi-building client-logo-fallback"></i>

                    </div>

                    <div>

                        <span class="access-eyebrow">
                            Bienvenido
                        </span>

                        <h2>
                            {{ company.name || 'Portal CRM del Cliente' }}
                        </h2>

                        <p v-if="company.cif">
                            NIF/CIF: {{ company.cif }}
                        </p>

                    </div>

                </header>

                <div class="access-intro">

                    <h3>
                        Accede a tu Portal CRM
                    </h3>

                    <p>
                        Introduce tu correo electrónico y te enviaremos
                        un enlace personal para acceder a tu espacio
                        privado de cliente.
                    </p>

                </div>

                <form
                    class="login-form"
                    @submit.prevent="sendLink"
                >

                    <div class="field-group">

                        <label for="portal-email">
                            Correo electrónico
                        </label>

                        <IconField>

                            <InputIcon class="pi pi-envelope" />

                            <InputText
                                id="portal-email"
                                v-model="email"
                                autocomplete="email"
                                placeholder="tu@empresa.com"
                                autofocus
                                fluid
                            />

                        </IconField>

                    </div>

                    <Button
                        type="submit"
                        label="Enviar enlace de acceso"
                        icon="pi pi-send"
                        iconPos="right"
                        :loading="sending"
                        :disabled="!email.trim()"
                        class="login-submit"
                    />

                </form>

                <Message
                    v-if="loginMsg"
                    :severity="loginOk ? 'success' : 'error'"
                    :closable="false"
                    style="margin-top:1rem"
                >
                    {{ loginMsg }}
                </Message>

                <Button v-if="retryToken" label="Reintentar acceso" icon="pi pi-refresh"
                    :loading="checkingSession" :disabled="checkingSession" class="login-submit"
                    @click="init(retryToken)" />

                <p class="access-help">

                    <i class="pi pi-lock"></i>

                    Tu enlace es personal y caduca en 24 horas.

                </p>

            </div>

            <footer class="access-footer">

                <span>KiwiKERP</span>

                <span class="footer-dot"></span>

                <span>Portal CRM del Cliente</span>

            </footer>

        </section>

    </section>
</main>

    <Frm_Main v-else :session="session" :company="company" @logout="logout" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Frm_Main from './Frm_Main.vue';
import { backendUrl } from '@/services/backendUrl';
import {
    portalSession,
    portalToken,
    requestPortalLink,
    setPortalToken,
    type PortalSession
} from '@/services/Tasks/portalService';

const route = useRoute();
const router = useRouter();

const session = ref<PortalSession | null>(null);
const company = ref({ name: '', cif: '', logo: '' });
const logoError = ref(false);
const email = ref('');
const sending = ref(false);
const loginMsg = ref('');
const loginOk = ref(false);
const retryToken = ref<string | null>(null);
const checkingSession = ref(false);

async function sendLink() {
    sending.value = true;
    loginMsg.value = '';
    try {
        await requestPortalLink(email.value.trim());
        loginOk.value = true;
        loginMsg.value = 'Si el correo existe, recibirás un enlace válido 24 horas.';
    } catch {
        loginOk.value = false;
        loginMsg.value = 'No se pudo solicitar el enlace.';
    } finally {
        sending.value = false;
    }
}

async function init(token: string) {
    if (checkingSession.value) return;
    checkingSession.value = true;
    loginMsg.value = '';
    try {
        session.value = await portalSession(token);
        setPortalToken(token);
        retryToken.value = null;
    } catch (e: any) {
        session.value = null;
        loginOk.value = false;
        // Solo la respuesta explícita del portal invalida el enlace; una caída conserva el acceso.
        if (e?.response?.status === 410 && e?.response?.data?.code === 'INVALID_TOKEN') {
            setPortalToken(null);
            retryToken.value = null;
            loginMsg.value = 'Enlace no válido o caducado. Solicita uno nuevo.';
            void router.replace({ name: 'Portal' });
        } else {
            setPortalToken(token);
            retryToken.value = token;
            loginMsg.value = 'No se pudo conectar con el portal. Conservamos tu enlace; reintenta cuando el servidor esté disponible.';
        }
    } finally {
        checkingSession.value = false;
    }
}

async function logout(reason?: string) {
    // Salida solo local: el token del servidor sigue válido hasta su caducidad
    // para que el mismo enlace del correo se pueda reutilizar.
    session.value = null;
    retryToken.value = null;
    setPortalToken(null);
    if (reason === 'expired') {
        loginOk.value = false;
        loginMsg.value = 'Tu sesión ha caducado. Solicita un nuevo enlace.';
    }
    router.replace({ name: 'Portal' });
}

onMounted(() => {
    void loadCompany();
    const q = route.query.token;
    const token = typeof q === 'string' && q ? q : portalToken();
    if (token) void init(token);
});

async function loadCompany() {
    try {
        const response = await fetch(backendUrl('/WebGetParameters'), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) return;
        const data = await response.json();
        const logoSource = data.urlLogoCompany || backendUrl('/base/logo.png');
        company.value = {
            name: data.nameCompany || '',
            cif: data.cifCompany || '',
            logo: `${logoSource}${logoSource.includes('?') ? '&' : '?'}t=${Date.now()}`
        };
    } catch {
        /* mantiene valores por defecto */
    }
}
</script>

