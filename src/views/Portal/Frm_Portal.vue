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

            <div v-if="adminSession" class="access-content">

                <div class="access-intro">

                    <h3>
                        Acceso de administrador
                    </h3>

                    <p>
                        Hola {{ adminSession.adminName }}. Elige un cliente
                        para abrir su Portal CRM.
                    </p>

                </div>

                <IconField>

                    <InputIcon class="pi pi-search" />

                    <InputText
                        v-model="adminQuery"
                        placeholder="Buscar cliente, contacto o correo"
                        autofocus
                        fluid
                    />

                </IconField>

                <p v-if="adminLoading" role="status">
                    <i class="pi pi-spin pi-spinner" /> Cargando clientes…
                </p>

                <p v-else-if="!adminFilteredClients.length" class="access-help">
                    Sin clientes que mostrar.
                </p>

                <div v-else class="admin-clients">

                    <div
                        v-for="client in adminFilteredClients"
                        :key="client.entitieId"
                        class="admin-client"
                    >

                        <strong>{{ client.entitieName }}</strong>

                        <div class="admin-client__contacts">

                            <Button
                                v-for="contact in client.contacts"
                                :key="contact.id"
                                :label="contact.name || contact.email"
                                icon="pi pi-user"
                                severity="secondary"
                                outlined
                                size="small"
                                :loading="impersonating === contact.id"
                                :disabled="impersonating !== null"
                                @click="openClientPortal(contact)"
                            />

                        </div>

                    </div>

                </div>

                <Message
                    v-if="adminError"
                    severity="error"
                    :closable="false"
                    style="margin-top:1rem"
                >
                    {{ adminError }}
                </Message>

                <p class="access-help">

                    <i class="pi pi-shield"></i>

                    Abrirás el portal como el contacto seleccionado.

                </p>

            </div>

            <div v-else class="access-content">

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
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Frm_Main from './Frm_Main.vue';
import { backendUrl } from '@/services/backendUrl';
import {
    portalAdminSession,
    portalAdminToken,
    portalImpersonate,
    portalSession,
    portalToken,
    requestPortalLink,
    setPortalAdminToken,
    setPortalToken,
    type PortalAdminContact,
    type PortalAdminSession,
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

const adminSession = ref<PortalAdminSession | null>(null);
const adminQuery = ref('');
const adminLoading = ref(false);
const adminError = ref('');
const impersonating = ref<number | null>(null);
const adminToken = ref<string | null>(portalAdminToken());

const adminFilteredClients = computed(() => {
    const clients = adminSession.value?.clients ?? [];
    const q = adminQuery.value.trim().toLocaleLowerCase('es');
    if (!q) return clients;
    return clients
        .map((client) => {
            const entityMatch = client.entitieName.toLocaleLowerCase('es').includes(q);
            const contacts = entityMatch
                ? client.contacts
                : client.contacts.filter((contact) =>
                    `${contact.name} ${contact.email}`.toLocaleLowerCase('es').includes(q),
                );
            return { ...client, contacts };
        })
        .filter((client) => client.contacts.length > 0);
});

async function loadAdmin(token: string) {
    adminLoading.value = true;
    adminError.value = '';
    try {
        adminSession.value = await portalAdminSession(token);
        adminToken.value = token;
        setPortalAdminToken(token);
    } catch (e: any) {
        adminSession.value = null;
        adminToken.value = null;
        setPortalAdminToken(null);
        if (e?.response?.status === 410) {
            loginOk.value = false;
            loginMsg.value = 'Enlace de administrador no válido o caducado. Solicita uno nuevo.';
        } else {
            adminError.value = 'No se pudo cargar el acceso de administrador.';
        }
    } finally {
        adminLoading.value = false;
    }
}

async function openClientPortal(contact: PortalAdminContact) {
    if (!adminToken.value || impersonating.value !== null) return;
    impersonating.value = contact.id;
    adminError.value = '';
    try {
        const token = await portalImpersonate(adminToken.value, contact.id);
        setPortalToken(token);
        await init(token);
        if (session.value) {
            await router.replace({ name: 'Portal', query: { token } });
        }
    } catch {
        adminError.value = 'No se pudo abrir el portal del cliente.';
    } finally {
        impersonating.value = null;
    }
}

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
    if (adminToken.value) {
        // El administrador vuelve al selector de clientes, no al login.
        if (!adminSession.value) void loadAdmin(adminToken.value);
        loginMsg.value = '';
        loginOk.value = false;
        await router.replace({ name: 'Portal' });
        return;
    }
    if (reason === 'expired') {
        loginOk.value = false;
        loginMsg.value = 'Tu sesión ha caducado. Solicita un nuevo enlace.';
    }
    router.replace({ name: 'Portal' });
}

onMounted(() => {
    void loadCompany();
    const adminQueryToken = route.query.adminToken;
    if (typeof adminQueryToken === 'string' && adminQueryToken) {
        void loadAdmin(adminQueryToken);
        return;
    }
    const q = route.query.token;
    const token = typeof q === 'string' && q ? q : portalToken();
    if (token) {
        void init(token);
        return;
    }
    if (adminToken.value) void loadAdmin(adminToken.value);
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


<style scoped>
.admin-clients {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: .75rem;
    max-height: 46vh;
    overflow-y: auto;
}
.admin-client {
    border: 1px solid #e2e7d1;
    border-radius: 8px;
    padding: .75rem .9rem;
}
.admin-client strong {
    display: block;
    margin-bottom: .5rem;
}
.admin-client__contacts {
    display: flex;
    flex-wrap: wrap;
    gap: .5rem;
}
</style>
