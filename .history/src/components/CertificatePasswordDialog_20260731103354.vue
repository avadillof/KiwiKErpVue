<template>


    <Dialog v-model:visible="visible" header="Acceso al certificado digital" :modal="true" :closable="false"
        :draggable="false" :style="{ width: '430px' }">

        <div class="flex flex-column align-items-center">

            <div class="certificate-icon">
    <i class="pi pi-key"></i>
</div>

            <h3 class="m-0 mb-2">
                Certificado protegido
            </h3>

            <p class="text-center text-color-secondary mt-0 mb-4">
                {{ props.message }}
            </p>

            <div class="w-full">

                <label class="font-semibold block mb-2">
                    Contraseña
                </label>

                <Password v-model="password" fluid toggleMask :feedback="false" placeholder="Introduzca la contraseña"
                    @keyup.enter="accept" />

            </div>

        </div>

        <template #footer>

            <Button label="Cancelar" icon="pi pi-times" text @click="cancel" />

            <Button label="Aceptar" icon="pi pi-lock-open" @click="accept" />

        </template>

    </Dialog>

</template>


<style scoped>
.certificate-icon {

    width: 80px;
    height: 80px;

    border-radius: 50%;

    background: var(--primary-color);

    display: flex;
    align-items: center;
    justify-content: center;

    color: white;

    box-shadow: 0 6px 20px rgba(0, 0, 0, .12);
}

.certificate-icon i {
    font-size: 2.4rem;
}

</style>


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