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
                            <label for="description">Descripción *</label>
                        </FloatLabel>
                    </div>

                    <div class="field col-12">
                        <FloatLabel variant="on">
                            <InputText id="descriptionEn" v-model="tax.descriptionEn" class="w-full" />
                            <label for="descriptionEn">Descripción Inglés *</label>
                        </FloatLabel>
                    </div>

                    <div class="field col-12 md:col-6">
                        <FloatLabel variant="on">
                            <InputNumber id="value" v-model="tax.value" mode="decimal" :minFractionDigits="2"
                                :maxFractionDigits="2" class="w-full" />
                            <label for="value">Valor (%) *</label>
                        </FloatLabel>
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
})

function open(pkid = null) {

    tax.pkid = pkid;

    visible.value = true;

    if (pkid == null) {
        clearForm();
    } else {
        loadTax(pkid);
    }
}

function clearForm() {

    tax.pkid = null;
    tax.description = '';
    tax.descriptionEn = '';
    tax.value = null;
    tax.active = true;

}

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