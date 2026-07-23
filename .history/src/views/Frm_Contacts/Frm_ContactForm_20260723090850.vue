<template>

    <Dialog
        v-model:visible="visible"
        modal
        :header="title"
        :style="{
            width: '70rem',
            minHeight: '45rem'
        }"
        :closable="true"
        :draggable="false"
        :resizable="false"
        :dismissableMask="true"
        :pt="{
            root: {
                class: 'kiwik-dialog'
            },
            header: {
                class: 'kiwik-dialog-header'
            },
            content: {
                class: 'kiwik-dialog-content'
            }
        }"
    >

        <!-- Aquí irá el formulario -->

    </Dialog>

</template>

<script setup lang="ts">

import { ref, computed } from 'vue';

const props = defineProps({

    entitieId: {
        type: Number,
        required: true
    }

});

const visible = ref(false);

const contactPkid = ref<number | null>(null);

const title = computed(() =>
    contactPkid.value == null
        ? 'Nuevo contacto'
        : 'Editar contacto'
);

const open = (pkid: number | null = null) => {

    contactPkid.value = pkid;

    visible.value = true;

};

const close = () => {

    visible.value = false;

};

defineExpose({

    open,
    close

});

</script>