<template>



    <Dialog v-model:visible="visible" modal :header="tax.pkid ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '42rem' }" class="kiwik-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">




        <template #header>
            <div class="flex align-items-center gap-2">
                <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                    style="width: 32px; height: 32px;">
                    <i class="pi pi-info text-primary"></i>
                </div>
                <span class="font-bold">Datos Generales.</span>
            </div>
        </template>

        <div style="max-height:80vh; overflow-y:auto">

        <Panel style="margin-top: 20px;margin-bottom: 20px; ">
        
        
        </Panel>


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