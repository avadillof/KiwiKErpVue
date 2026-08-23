<template>


    <Dialog v-model:visible="visible" modal :header="tax.pkid ? 'Editar Impuesto' : 'Nuevo Impuesto'"
        :style="{ width: '42rem' }" class="kiwik-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">

        <div style="max-height:80vh; overflow-y:auto">

            <Panel style="margin-top: 5px;margin-bottom: 20px; ">

                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-info text-primary"></i>
                        </div>
                        <span class="font-bold">Datos Generales.</span>
                    </div>
                </template>
                <div class="grid p-fluid mb-12">
                    <div class="field col-12">
                        <FloatLabel variant="on">
                            <InputText id="description" v-model="tax.description" class="w-full" />
                            <label for="description">Descripción</label>
                        </FloatLabel>

                        <InlineMessage v-if="errors.description" severity="error">
                            {{ errors.description }}
                        </InlineMessage>
                    </div>

                    <div class="field col-12">
                        <FloatLabel variant="on">
                            <InputText id="descriptionEn" v-model="tax.descriptionEn" class="w-full" maxlength="145" />
                            <label for="descriptionEn">Descripción Inglés</label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.descriptionEn" severity="error">
                            {{ errors.descriptionEn }}
                        </InlineMessage>
                    </div>

                    <div class="field col-12 md:col-6">
                        <FloatLabel variant="on">
                            <InputNumber id="value" v-model="tax.value" mode="decimal" :minFractionDigits="2"
                                :maxFractionDigits="2" class="w-full" />
                            <label for="value">Valor (%)</label>
                        </FloatLabel>

                        <InlineMessage v-if="errors.value" severity="error">
                            {{ errors.value }}
                        </InlineMessage>
                    </div>

                    <div class="field col-12 md:col-6 flex align-items-center">
                        <Checkbox id="active" v-model="tax.active" binary />
                        <label for="active" class="ml-2">
                            Activo
                        </label>
                    </div>
                </div>

            </Panel>
        </div>



        <template #footer>
            <Button label="Guardar" icon="pi pi-check" @click="save" />
        </template>


        <div class="kiwik-separator"></div>
    </Dialog>




</template>

















<script setup>

import { computed } from 'vue'
import { ref, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useSecurityStore } from '../../stores/securityStore.ts';
import { useCompanyStore } from '../../stores/companyStore';


const companyStore = useCompanyStore();
const securityStore = useSecurityStore();
const toast = useToast();
emit('saved', {
    pkid: tax.pkid,
    description: tax.description
});

const visible = defineModel('visible', { default: false })
const tax = reactive({
    pkid: null,
    description: '',
    descriptionEn: '',
    value: null,
    active: true
});

const props = defineProps({
    taxId: Number
});

const payload = {

    pkid: tax.pkid,
    description: tax.description,
    descriptionEn: tax.descriptionEn,
    value: tax.value,
    active: tax.active

};

const errors = ref({
    description: '',
    descriptionEn: '',
    value: ''
});


const clearErrors = () => {

    errors.value = {
        description: '',
        descriptionEn: '',
        value: ''
    };

};


const validate = async () => {

    clearErrors();

    let valid = true;

    if (!tax.description?.trim()) {
        errors.value.description = 'Obligatorio';
        valid = false;
    }

    if (!tax.descriptionEn?.trim()) {
        errors.value.descriptionEn = 'Obligatorio';
        valid = false;
    }

    if (tax.value == null || tax.value === '') {

        errors.value.value = 'Obligatorio';
        valid = false;

    } else if (tax.value < 0) {

        errors.value.value = 'El valor no puede ser negativo';
        valid = false;

    } else if (tax.value > 100) {

        errors.value.value = 'El valor no puede ser superior al 100%';
        valid = false;

    }

    return valid;

};

function open(pkid = null) {

    if (pkid == null) {
        clearForm();
    } else {
        loadTax(pkid);
    }
    visible.value = true;

}

function clearForm() {

    tax.pkid = null;
    tax.description = '';
    tax.descriptionEn = '';
    tax.value = null;
    tax.active = true;

}

async function loadTax(pkid) {

    try {

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebGetSalesTaxById?id=${pkid}`
        );

        if (!response.ok) {
            throw new Error("No se ha podido cargar el impuesto.");
        }

        const data = await response.json();

        tax.pkid = data.pkid;
        tax.description = data.description;
        tax.descriptionEn = data.descriptionEn;
        tax.value = data.value;
        tax.active = data.active;

    } catch (error) {

        console.error(error);

    }
}



const save = async () => {

    if (!(await validate()))
        return;

    try {

        const dto = {
            pkid: tax.pkid,
            description: tax.description,
            descriptionEn: tax.descriptionEn,
            value: tax.value,
            active: tax.active
        };

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebSaveSalesTax`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dto)
            }
        );

        if (!response.ok) {

            const message = await response.text();
            throw new Error(message);

        }

        const savedTax = await response.json();

        if (!response.ok) {

            const message = await response.text();
            throw new Error(message);

        }

        toast.add({
            severity: 'success',
            summary: 'Correcto',
            detail: 'Impuesto guardado correctamente.',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

       visible.value = false;

emit('saved', savedTax);

    } catch (error) {

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message,
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

    }

};

defineExpose({
    open
});

</script>

<style scoped>
.tax-dialog-icon {

    width: 48px;
    height: 48px;

    border-radius: 12px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: var(--primary-color);

    color: white;

    font-size: 1.4rem;

}
</style>