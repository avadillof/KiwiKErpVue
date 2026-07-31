<template>

    <Dialog v-model:visible="visible" modal :style="{ width: '42rem' }" :closable="false" :draggable="false">

    <Dialog v-model:visible="visible" modal :header="entity.pkid ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '' }" class="kiwik-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">




        <template #header>

            <div class="flex align-items-center gap-3">

                <div class="tax-dialog-icon">
                    <i class="pi pi-percentage"></i>
                </div>

                <div>

                    <div class="text-xl font-semibold">
                        {{ isNew ? 'Nuevo Impuesto' : 'Modificar Impuesto' }}
                    </div>

                    <small class="text-color-secondary">
                        Gestión del impuesto
                    </small>

                </div>

            </div>

        </template>



        <div class="formgrid grid mt-2">

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



        <template #footer>

            <Button label="Cancelar" severity="secondary" outlined />

            <Button label="Guardar" icon="pi pi-save" />

        </template>

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

    visible.value = true;

}

const isNew = computed(() => props.taxId == null)

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