<template>

    <Dialog
        v-model:visible="visible"
        modal
        :style="{ width: '42rem' }"
        :closable="false"
        :draggable="false">

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



        <!-- Aquí irán los controles -->



        <template #footer>

            <Button
                label="Cancelar"
                severity="secondary"
                outlined />

            <Button
                label="Guardar"
                icon="pi pi-save" />

        </template>

    </Dialog>

</template>

<script setup>

import { computed } from 'vue'

const visible = defineModel('visible', { default: false })


const props = defineProps({
    taxId: Number
})

function open(pkid = null) {

    visible.value = true;

}

const isNew = computed(() => props.taxId == null)

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