<template>

    <Dialog v-model:visible="visible" modal :header="contact.pkid ? `Datos del Contacto: ${contact.name}` : 'Nuevo Contacto'"
        :style="{ width: '60rem' }" class="kiwik-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">


        <div style="max-height:80vh;overflow-y:auto">


            <Panel>


                <template #header>

                    <div class="flex align-items-center gap-2">

                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">

                            <i class="pi pi-user text-primary"></i>

                        </div>


                        <span class="font-bold">
                            Datos del Contacto
                        </span>


                    </div>

                </template>



                <div class="grid p-fluid">


                    <!-- NOMBRE -->

                    <div class="col-12 md:col-6">

                        <FloatLabel variant="on" class="w-full">

                            <InputText id="name" v-model="contact.name" maxlength="150" class="w-full" />

                            <label for="name">
                                Nombre
                            </label>

                        </FloatLabel>


                    </div>




                    <!-- CARGO -->

                    <div class="col-12 md:col-6">

                        <FloatLabel variant="on" class="w-full">


                            <Select id="cargo" v-model="contact.cargoPkid" :options="cargos" optionLabel="name"
                                optionValue="id" class="w-full" />


                            <label for="cargo">
                                Cargo
                            </label>


                        </FloatLabel>


                    </div>




                    <!-- EMAIL -->

                    <div class="col-12 md:col-6">


                        <FloatLabel variant="on" class="w-full">


                            <InputText id="email" v-model="contact.email" maxlength="125" class="w-full" />


                            <label for="email">
                                Email
                            </label>


                        </FloatLabel>


                    </div>




                    <!-- TELEFONO -->

                    <div class="col-12 md:col-6">


                        <FloatLabel variant="on" class="w-full">


                            <InputText id="phone" v-model="contact.phone" maxlength="45" class="w-full" />


                            <label for="phone">
                                Teléfono
                            </label>


                        </FloatLabel>


                    </div>




                    <!-- NIF -->

                    <div class="col-12 md:col-4">


                        <FloatLabel variant="on" class="w-full">


                            <InputText id="nif" v-model="contact.nif" maxlength="45" class="w-full" />


                            <label for="nif">
                                NIF
                            </label>


                        </FloatLabel>


                    </div>



                    <!-- FECHA NACIMIENTO -->


                    <div class="col-12 md:col-4">


                        <FloatLabel variant="on" class="w-full">


                            <DatePicker id="born" v-model="contact.born" class="w-full" showIcon
                                dateFormat="dd/mm/yy" />


                            <label for="born">
                                Fecha nacimiento
                            </label>


                        </FloatLabel>


                    </div>



                </div>


            </Panel>





            <Panel style="margin-top:20px; margin-bottom: 20px;">


                <template #header>

                    <div class="flex align-items-center gap-2 ">


                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">

                            <i class="pi pi-cog text-primary"></i>


                        </div>


                        <span class="font-bold">
                            Parámetros del Contacto
                        </span>


                    </div>


                </template>



                <div class="grid p-fluid">


                    <div class="col-12 md:col-3">

                        <Checkbox id="active" v-model="contact.active" binary />

                        <label for="active">
                            ¿ Activo ?
                        </label>


                    </div>



                    <div class="col-12 md:col-3">

                        <Checkbox id="default" v-model="contact.defaultContact" binary />

                        <label for="default">
                            ¿ Contacto Principal ?
                        </label>


                    </div>


                </div>


            </Panel>


        </div>


        <div class="kiwik-separator"></div>

        <template #footer>


            <Button label="Guardar" icon="pi pi-check" @click="save" />


        </template>



    </Dialog>


</template>

<script setup lang="ts">

import { ref } from 'vue';
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from '../../stores/companyStore';
import axios from 'axios';

const toast = useToast();
const companyStore = useCompanyStore();

const props = defineProps({

    entitieId: {
        type: Number,
        required: true
    },

    entitieName: {
        type: String,
        default: ''
    }

});


const emit = defineEmits([
    'saved'
]);


const visible = ref(false);


const contactId = ref<number | null>(null);



const contact = ref({
    pkid: null as number | null,
    entitiePkid: props.entitieId,
    name: '',
    email: '',
    phone: '',
    nif: '',
    born: null,
    cargoPkid: null,
    memo: '',
    active: true,
    defaultContact: false
});


const cargos = ref([]);



function clearForm() {

    contact.value = {
        pkid: null,
        entitiePkid: props.entitieId,
        name: '',
        email: '',
        phone: '',
        nif: '',
        born: null,
        cargoPkid: null,
        memo: '',
        active: true,
        defaultContact: false
    };

}



async function open(id: number | null = null, name:string ) {

    if (id) {

        contact.value.pkid = id;
        contact.value.name = name;

        await loadContact(id);

    }
    else {

        clearForm();

    }

    visible.value = true;

}



defineExpose({
    open
});



async function loadContact(id: number) {

    console.log("Cargar contacto", id);

}



/* =========================
   SAVE
========================= */
const save = async () => {

    if (!(await validate())) return;


    const payload = {
        ...contact.value
    };


    try {

        await axios.post(
            `${import.meta.env.VITE_API_URL}/WebSaveContact`,
            payload
        );


        toast.add({
            severity: 'success',
            summary: 'Contacto guardado correctamente',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });


        emit('saved');

        visible.value = false;


    } catch (error: any) {


        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message ?? 'Error inesperado',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });


    }



    
};

</script>