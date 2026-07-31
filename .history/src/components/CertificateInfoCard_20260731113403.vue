<template>

    

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