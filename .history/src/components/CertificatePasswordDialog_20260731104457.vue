<template>


    <Dialog v-model:visible="visible" :modal="true" :closable="false" :draggable="false" :style="{ width: '430px' }">

        <div class="flex flex-column align-items-center">


            <div class="max-w-sm mx-auto" style="margin-top: 10px;margin-bottom: 10px;">

                <Message severity="warn">
                    <template #icon>
                        <Sparkles />
                    </template>
                    Certificado Protegido. {{ props.message }}
                </Message>
            </div>







            <div class="w-full">

                <label class="font-semibold block mb-2">
                    Contraseña
                </label>

                <Password v-model="password" fluid toggleMask :feedback="false" placeholder="Introduzca la contraseña"
                    @keyup.enter="accept" />

            </div>

        </div>

        <div class="kiwik-separator" style="margin-top: 10px;"></div>
        <template #footer>


            <Button label="Cancelar" icon="pi pi-times" text @click="cancel" />

            <Button label="Aceptar" icon="pi pi-lock-open" @click="accept" />

        </template>

    </Dialog>

</template>


<style scoped></style>


<script setup>

import { ref } from 'vue';
import Sparkles from '@primeicons/vue/sparkles';

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