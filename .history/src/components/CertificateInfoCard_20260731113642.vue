<template>

    <Card class="h-full">

        <template #title>

            <div class="flex align-items-center gap-2">
                <i class="pi pi-shield text-primary text-2xl"></i>
                <span>Información del Certificado</span>
            </div>

        </template>

        <template #content>

            <!-- Sin selección -->
            <div v-if="!certificate" class="flex flex-column align-items-center justify-content-center text-center"
                style="min-height: 500px;">

                <i class="pi pi-shield text-6xl text-400 mb-4"></i>

                <h3 class="m-0 mb-2">
                    Ningún certificado seleccionado
                </h3>

                <p class="text-color-secondary m-0">
                    Seleccione un certificado de la tabla para visualizar toda su información.
                </p>

            </div>

            <!-- Con certificado -->
            <div v-else>

                <div class="mb-4">

                    <h2 class="m-0">
                        {{ certificate.description }}
                    </h2>

                    <Tag :value="certificate.type" severity="info" class="mt-2" />

                </div>

                <Divider />

                <div class="field-row">

                    <div class="field-title">
                        <i class="pi pi-user"></i>
                        Titular
                    </div>

                    <div class="field-value scroll-box" >
                        {{ certificate.subject }}
                    </div>

                </div>

                <Divider />

                <div class="field-row">

                    <div class="field-title">
                        <i class="pi pi-building"></i>
                        Emisor
                    </div>

                    <div class="field-value">
                        {{ certificate.issuer }}
                    </div>

                </div>

                <Divider />

                <div class="field-row">

                    <div class="field-title">
                        <i class="pi pi-hashtag"></i>
                        Número de Serie
                    </div>

                    <div class="field-value">
                        {{ certificate.serialNumber }}
                    </div>

                </div>

                <Divider />

                <div class="field-row">

                    <div class="field-title">
                        <i class="pi pi-calendar"></i>
                        Válido desde
                    </div>

                    <div class="field-value">
                        {{ formatDate(certificate.validFrom) }}
                    </div>

                </div>

                <Divider />

                <div class="field-row">

                    <div class="field-title">
                        <i class="pi pi-clock"></i>
                        Caduca
                    </div>

                    <div class="field-value">
                        {{ formatDate(certificate.validTo) }}
                    </div>

                </div>

                <Divider />

                <div v-if="!certificate.subject">

                    <Message severity="warn" icon="pi pi-lock" :closable="false">

                        La información del certificado está protegida.

                        <br><br>

                        Para visualizar el titular, emisor, fechas de validez y número de serie
                        es necesario introducir la contraseña del certificado.

                    </Message>

                    <div class="mt-4 text-center">

                        <Button label="Ver información" icon="pi pi-lock-open" @click="loadCertificateInfo" />

                    </div>

                </div>

                <div class="field-row">

                    <div class="field-title">
                        <i class="pi pi-check-circle"></i>
                        Estado
                    </div>

                    <Tag :value="certificate.status" :severity="certificate.severity" />

                </div>

            </div>

        </template>

    </Card>

    <CertificatePasswordDialog ref="passwordDialog"
        message="Introduzca la contraseña para visualizar la información del certificado." />
</template>

<script setup>

import { ref } from 'vue';
import CertificatePasswordDialog from './CertificatePasswordDialog.vue';
import { useToast } from 'primevue/usetoast'; // Importa el hook de Toast
import { useCompanyStore } from '../stores/companyStore.ts'

const passwordDialog = ref();
const toast = useToast(); // Inicializa el hook
const companyStore = useCompanyStore();

const props = defineProps({
    certificate: {
        type: Object,
        default: null
    }
});


const loadCertificateInfo = async () => {

    const password = await passwordDialog.value.open();

    if (!password)
        return;

    try {

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebGetCertificateInfo`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    certificateId: props.certificate.pkid,
                    password: password
                })
            }
        );

        if (!response.ok) {

            const errorMessage = await response.text();
            throw new Error(errorMessage);

        }

        const info = await response.json();

        Object.assign(props.certificate, info);

    } catch (error) {

        console.error(error);

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

    }

};

const formatDate = (date) => {

    if (!date)
        return '';

    return new Date(date).toLocaleDateString('es-ES');

};

</script>

<style scoped>
.field-row {
    margin: 1rem 0;
}

.field-title {
    display: flex;
    align-items: center;
    gap: .5rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    margin-bottom: .4rem;
}

.field-value {
    font-size: 1rem;
    font-weight: 500;
    word-break: break-word;
}

.scroll-box {
    max-height: 90px;
    overflow-y: auto;
    padding: .5rem;
    border: 1px solid var(--surface-border);
    border-radius: 6px;
    background: var(--surface-50);
    font-family: monospace;
    font-size: .9rem;
    line-height: 1.4;
    word-break: break-word;
}
</style>