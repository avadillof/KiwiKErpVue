<template>
    <div class="card">

        <h2 class="mb-4">
            {{ isNew ? 'Nuevo Impuesto' : 'Modificar Impuesto' }}
        </h2>

        <div class="formgrid grid">

            <div class="field col-12">
                <label>Descripción *</label>

                <InputText
                    v-model="tax.description"
                    class="w-full" />
            </div>

            <div class="field col-12">
                <label>Descripción Inglés *</label>

                <InputText
                    v-model="tax.descriptionEn"
                    class="w-full" />
            </div>

            <div class="field col-12 md:col-4">
                <label>Valor (%) *</label>

                <InputNumber
                    v-model="tax.value"
                    mode="decimal"
                    :minFractionDigits="2"
                    :maxFractionDigits="2"
                    class="w-full" />
            </div>

            <div class="field col-12 md:col-4 flex align-items-end">
                <div class="flex align-items-center">

                    <Checkbox
                        v-model="tax.active"
                        binary />

                    <label class="ml-2">
                        Activo
                    </label>

                </div>
            </div>

        </div>

        <Divider />

        <div class="flex justify-content-end gap-2">

            <Button
                label="Cancelar"
                severity="secondary" />

            <Button
                label="Guardar"
                icon="pi pi-save" />

        </div>

    </div>
</template>

<script setup>

import { reactive, computed } from 'vue'

const tax = reactive({

    pkid: null,

    description: '',

    descriptionEn: '',

    value: 0,

    active: true

})

const isNew = computed(() => tax.pkid == null)

</script>