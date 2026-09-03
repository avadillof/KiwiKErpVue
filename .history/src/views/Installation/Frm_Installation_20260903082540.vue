<template>
  <main class="installation-page">
    <section class="installation-shell">
      <img :src="corporateLogo" alt="KiwiKERP · FreeLandSite" class="installation-corporate-logo" />

      <aside class="installation-brand">
        <div class="installation-orb installation-orb--one"></div>
        <div class="installation-orb installation-orb--two"></div>

        <div class="installation-brand-copy">
          <span class="installation-eyebrow">Asistente de puesta en marcha</span>
          <h1>Todo preparado para empezar.</h1>
          <p>Configuraremos una instalación limpia de KiwiKERP y los datos esenciales de tu empresa.</p>
        </div>

        <ol class="installation-progress" aria-label="Progreso de la instalación">
          <li v-for="(item, index) in steps" :key="item.title"
            :class="{ active: currentStep === index, completed: currentStep > index }">
            <span class="installation-step-number">
              <i v-if="currentStep > index" class="pi pi-check"></i>
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span><strong>{{ item.title }}</strong><small>{{ item.subtitle }}</small></span>
          </li>
        </ol>

        <footer>Desarrollado por <a href="https://www.freelandsite.es" target="_blank"
            rel="noopener noreferrer">FreeLandSite.es Version 2</a></footer>
      </aside>

      <section class="installation-content">
        <header class="installation-content-header">
          <div>
            <span>Paso {{ currentStep + 1 }} de {{ steps.length }}</span>
            <h2>{{ steps[currentStep].title }}</h2>
          </div>
          <span class="installation-secure"><i class="pi pi-shield"></i> Configuración segura</span>
        </header>

        <div class="installation-form-area">
          <section v-if="currentStep === 0" class="installation-welcome">
            <div class="installation-hero-icon"><i class="pi pi-box"></i></div>
            <h3>Nueva instalación de KiwiKERP</h3>
            <p>El servidor creará la estructura de datos y cargará únicamente los catálogos necesarios para comenzar.</p>
            <ul class="installation-check-list">
              <li v-for="check in preflightChecks" :key="check.key" :class="`check-${check.status}`">
                <i :class="checkIcon(check.status)"></i>
                <strong>{{ check.label }}</strong>
                <small>{{ check.message }}</small>
              </li>
            </ul>
            <Button v-if="preflightHasError" label="Reintentar comprobaciones" icon="pi pi-refresh"
              severity="secondary" outlined class="installation-retry" :loading="preflightRunning" @click="runPreflight" />
          </section>

          <form v-else-if="currentStep === 1" class="installation-form" @submit.prevent="nextStep">
            <div class="installation-logo-field">
              <div class="installation-logo-preview">
                <img v-if="logoPreview" :src="logoPreview" alt="Vista previa del logo" />
                <i v-else class="pi pi-building"></i>
              </div>
              <div><strong>Logotipo de la empresa</strong><span>PNG o JPG. Recomendado: fondo transparente.</span>
                <label class="installation-file-button" for="company-logo"><i class="pi pi-upload"></i> Seleccionar logo</label>
                <input id="company-logo" type="file" accept="image/png,image/jpeg" @change="selectLogo" />
              </div>
            </div>

            <div class="installation-grid">
              <label class="span-2">Razón social <InputText v-model.trim="company.legalName" required fluid /></label>
              <label>Nombre comercial <InputText v-model.trim="company.tradeName" fluid /></label>
              <label>NIF/CIF <InputText v-model.trim="company.taxId" required fluid /></label>
              <label>Correo electrónico <InputText v-model.trim="company.email" type="email" required fluid /></label>
              <label>Teléfono <InputText v-model.trim="company.phone" fluid /></label>
              <label class="span-2">Dirección <InputText v-model.trim="company.address" required fluid /></label>
              <label>Número <InputText v-model.trim="company.addressNumber" fluid /></label>
              <label>Código postal <InputText v-model.trim="company.postalCode" required fluid /></label>
              <label>Localidad <InputText v-model.trim="company.city" required fluid /></label>
              <label>Provincia <InputText v-model.trim="company.province" required fluid /></label>
              <label>País <InputText v-model.trim="company.country" required fluid /></label>
              <label class="span-2">Eslogan <InputText v-model.trim="company.slogan" fluid /></label>
            </div>
          </form>

          <form v-else-if="currentStep === 2" class="installation-form installation-admin" @submit.prevent="nextStep">
            <div class="installation-section-intro"><i class="pi pi-user-plus"></i><div><h3>Primer administrador</h3><p>Esta cuenta tendrá permisos para completar el resto de ajustes de KiwiKERP.</p></div></div>
            <div class="installation-grid">
              <label class="span-2">Nombre y apellidos <InputText v-model.trim="administrator.name" required fluid /></label>
              <label>Usuario <InputText v-model.trim="administrator.username" autocomplete="username" required fluid /></label>
              <label>Correo electrónico <InputText v-model.trim="administrator.email" type="email" required fluid /></label>
              <label>Contraseña <Password v-model="administrator.password" inputId="installation-password"
                  autocomplete="new-password" :feedback="true" toggleMask required fluid /></label>
              <label>Repetir contraseña <Password v-model="passwordConfirmation" inputId="installation-password-confirmation"
                  autocomplete="new-password" :feedback="false" toggleMask required fluid /></label>
            </div>
            <small v-if="passwordConfirmation && administrator.password !== passwordConfirmation" class="installation-error"><i class="pi pi-exclamation-circle"></i> Las contraseñas no coinciden.</small>
          </form>

          <section v-else class="installation-summary">
            <div class="installation-hero-icon installation-hero-icon--ready"><i class="pi pi-check"></i></div>
            <h3>Todo listo para instalar</h3>
            <p>Revisa los datos principales. El backend realizará las comprobaciones definitivas antes de activar la aplicación.</p>
            <div class="installation-summary-grid">
              <article><i class="pi pi-building"></i><div><span>Empresa</span><strong>{{ company.legalName }}</strong><small>{{ company.taxId }}</small></div></article>
              <article><i class="pi pi-user"></i><div><span>Administrador</span><strong>{{ administrator.name }}</strong><small>{{ administrator.username }}</small></div></article>
              <article><i class="pi pi-database"></i><div><span>Datos iniciales</span><strong>Catálogos del sistema</strong><small>Sin datos operativos</small></div></article>
              <article><i class="pi pi-lock"></i><div><span>Identidad</span><strong>Clave externa protegida</strong><small>Volumen persistente</small></div></article>
            </div>
          </section>
        </div>

        <div v-if="errorMessage" class="installation-api-error"><i class="pi pi-exclamation-triangle"></i>{{ errorMessage }}</div>

        <footer class="installation-actions">
          <Button v-if="currentStep > 0" label="Atrás" icon="pi pi-arrow-left" severity="secondary" outlined
            :disabled="isSubmitting" @click="previousStep" />
          <span v-else></span>
          <Button :label="currentStep === steps.length - 1 ? 'Finalizar instalación' : 'Continuar'"
            :icon="currentStep === steps.length - 1 ? 'pi pi-check' : 'pi pi-arrow-right'" iconPos="right"
            class="installation-primary" :loading="isSubmitting" :disabled="!canContinue" @click="nextStep" />
        </footer>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import corporateLogo from '../../assets/logos/corporate.png';
import {
  completeInstallation,
  checkInstallationDatabase,
  getInstallationState,
  initialiseDatabase,
  saveAdministrator,
  saveCompany,
  type AdministratorInstallationData,
  type CompanyInstallationData
} from '../../services/Installation/installationService';

const router = useRouter();
const currentStep = ref(0);
const isSubmitting = ref(false);
const errorMessage = ref('');
const passwordConfirmation = ref('');
const logoPreview = ref('');
type CheckStatus = 'idle' | 'checking' | 'success' | 'error';
const preflightRunning = ref(false);
const preflightChecks = reactive([
  { key: 'backend', label: 'Servidor backend disponible', status: 'idle' as CheckStatus, message: 'Pendiente de comprobar' },
  { key: 'database', label: 'Base de datos accesible', status: 'idle' as CheckStatus, message: 'Pendiente de comprobar' },
  { key: 'identity', label: 'Configuración inicial protegida', status: 'idle' as CheckStatus, message: 'Pendiente de comprobar' }
]);

const steps = [
  { title: 'Preparación', subtitle: 'Comprobar el entorno' },
  { title: 'Tu empresa', subtitle: 'Identidad corporativa' },
  { title: 'Administrador', subtitle: 'Primer acceso seguro' },
  { title: 'Confirmación', subtitle: 'Activar KiwiKERP' }
];

const company = reactive<CompanyInstallationData>({
  legalName: '', tradeName: '', taxId: '', email: '', phone: '', address: '', addressNumber: '',
  postalCode: '', city: '', province: '', country: 'España', slogan: '', logo: null
});
const administrator = reactive<AdministratorInstallationData>({ name: '', username: '', email: '', password: '' });

const canContinue = computed(() => {
  if (currentStep.value === 0) return preflightChecks.every((check) => check.status === 'success') && !preflightRunning.value;
  if (currentStep.value === 1) {
    return Boolean(company.legalName && company.taxId && company.email && company.address && company.postalCode && company.city && company.province && company.country);
  }
  if (currentStep.value === 2) {
    return Boolean(administrator.name && administrator.username && administrator.email && administrator.password.length >= 8 && administrator.password === passwordConfirmation.value);
  }
  return true;
});

const preflightHasError = computed(() => preflightChecks.some((check) => check.status === 'error'));

function checkIcon(status: CheckStatus) {
  if (status === 'checking') return 'pi pi-spinner pi-spin';
  if (status === 'success') return 'pi pi-check-circle';
  if (status === 'error') return 'pi pi-times-circle';
  return 'pi pi-clock';
}

function setCheck(index: number, status: CheckStatus, message: string) {
  preflightChecks[index].status = status;
  preflightChecks[index].message = message;
}

async function runPreflight() {
  if (preflightRunning.value) return;
  preflightRunning.value = true;
  errorMessage.value = '';
  preflightChecks.forEach((check) => { check.status = 'idle'; check.message = 'Pendiente de comprobar'; });

  try {
    setCheck(0, 'checking', 'Comprobando comunicación con Spring Boot…');
    let installation = await getInstallationState();
    if (installation.status === 'ERROR') throw new Error(installation.message || 'El backend no está disponible.');
    setCheck(0, 'success', 'Spring Boot responde correctamente.');

    setCheck(1, 'checking', 'Comprobando conexión y permisos…');
    const database = await checkInstallationDatabase();
    if (!database.ok) throw new Error(database.message);
    setCheck(1, 'success', database.message);

    setCheck(2, 'checking', 'Protegiendo la configuración inicial…');
    if (installation.status === 'NEW') installation = await initialiseDatabase();
    if (installation.status !== 'IN_PROGRESS') throw new Error(installation.message || 'No se pudo validar la identidad de instalación.');
    setCheck(2, 'success', 'La configuración de esta instalación se ha guardado de forma segura.');
  } catch (error) {
    const activeIndex = preflightChecks.findIndex((check) => check.status === 'checking');
    const message = error instanceof Error ? error.message : 'La comprobación no se pudo completar.';
    if (activeIndex >= 0) setCheck(activeIndex, 'error', message);
    errorMessage.value = message;
  } finally {
    preflightRunning.value = false;
  }
}

function selectLogo(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] || null;
  if (!file) return;
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
  company.logo = file;
  logoPreview.value = URL.createObjectURL(file);
}

function previousStep() {
  errorMessage.value = '';
  currentStep.value--;
}

async function nextStep() {
  if (!canContinue.value || isSubmitting.value) return;
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    if (currentStep.value === 0 && !preflightChecks.every((check) => check.status === 'success')) return;
    if (currentStep.value === 1) await saveCompany(company);
    if (currentStep.value === 2) await saveAdministrator(administrator);
    if (currentStep.value === 3) {
      await completeInstallation();
      await router.replace({ name: 'Login' });
      return;
    }
    currentStep.value++;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se ha podido completar este paso.';
  } finally {
    isSubmitting.value = false;
  }
}

onBeforeUnmount(() => {
  if (logoPreview.value) URL.revokeObjectURL(logoPreview.value);
});

onMounted(runPreflight);
</script>

<style scoped src="../../assets/styles/Installation/installation.css"></style>
