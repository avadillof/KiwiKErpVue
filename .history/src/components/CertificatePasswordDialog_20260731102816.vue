<template>

    <Dialog
        v-model:visible="visible"
        header="Contraseña del certificado"
        :modal="true"
        :closable="false"
        :style="{ width: '420px' }">

        <div class="flex flex-column gap-4">

            <Message severity="info" :closable="false">
                Introduzca la contraseña del certificado digital.
            </Message>

            <div>

                <label class="font-semibold mb-2 block">
                    Contraseña
                </label>

                <Password
                    v-model="password"
                    fluid
                    toggleMask
                    :feedback="false"
                    @keyup.enter="accept" />

            </div>

        </div>

        <template #footer>

            <Button
                label="Cancelar"
                icon="pi pi-times"
                text
                @click="cancel" />

            <Button
                label="Aceptar"
                icon="pi pi-check"
                @click="accept" />

        </template>

    </Dialog>

</template>

<script setup>

import { ref } from 'vue';

const visible = ref(false);
const password = ref('');

const props = defineProps({

    message: {
        type: String,
        default: 'Introduzca la contraseña del certificado digital.'
    }

});

let resolver = null;

const open = () => {

    password.value = '';
    visible.value = true;

    return new Promise((resolve) => {
        resolver = resolve;
    });

};

const accept = () => {

    visible.value = false;

    if (resolver) {
        resolver(password.value);
    }

};

const cancel = () => {

    visible.value = false;

    if (resolver) {
        resolver(null);
    }

};

defineExpose({
    open
});

</script>