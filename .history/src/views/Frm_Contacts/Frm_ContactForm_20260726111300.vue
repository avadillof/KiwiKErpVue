<template>

    <Dialog v-model:visible="visible" modal
        :header="contact.pkid ? `Datos del Contacto: ${contact.name}` : `Nuevo Contacto para ${props.entitieName}`"
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
                        <InlineMessage v-if="errors.name" severity="error">
                            {{ errors.name }}
                        </InlineMessage>


                    </div>




                    <!-- CARGO -->

                    <div class="col-12 md:col-6">

                        <FloatLabel variant="on" class="w-full">


                            <Select id="cargo" v-model="contact.cargoPkid" :options="cargos" optionLabel="descriptionSp"
                                optionValue="pkid" class="w-full" />


                            <label for="cargo">
                                Cargo
                            </label>


                        </FloatLabel>
                        <InlineMessage v-if="errors.cargo" severity="error">
                            {{ errors.cargo }}
                        </InlineMessage>

                    </div>




                    <!-- EMAIL -->

                    <div class="col-12 md:col-6">


                        <FloatLabel variant="on" class="w-full">


                            <InputText id="email" v-model="contact.email" maxlength="125" class="w-full" />


                            <label for="email">
                                Email
                            </label>

                            <InlineMessage v-if="errors.nif" severity="error">
                                {{ errors.email }}
                            </InlineMessage>

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

                            <InlineMessage v-if="errors.nif" severity="error">
                                {{ errors.nif }}
                            </InlineMessage>

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




            <Panel style="margin-top:20px">

                <template #header>

                    <div class="flex align-items-center gap-2">

                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width:32px;height:32px">

                            <i class="pi pi-map-marker text-primary"></i>

                        </div>

                        <span class="font-bold">
                            Dirección del Contacto
                        </span>

                    </div>

                </template>

                <div class="grid p-fluid">

                    <!-- TIPO -->

                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <Select id="addressType" v-model="contact.address.type" :options="addressTypes"
                                optionLabel="label" optionValue="value" class="w-full" />

                            <label for="addressType">
                                Tipo de dirección
                            </label>

                        </FloatLabel>

                    </div>

                    <!-- DIRECCION -->

                    <div class="col-12">

                        <FloatLabel variant="on">

                            <InputText id="address1" v-model="contact.address.address1" maxlength="145" />

                            <label for="address1">
                                Dirección
                            </label>

                        </FloatLabel>

                    </div>

                    <!-- DIRECCION 2 -->

                    <div class="col-12  md:col-3">

                        <FloatLabel variant="on">

                            <InputText id="address2" v-model="contact.address.address2" maxlength="145" />

                            <label for="address2">
                                Dirección 2
                            </label>

                        </FloatLabel>

                    </div>

                    <!-- CODIGO POSTAL -->

                    <div class="col-12 md:col-3">

                        <FloatLabel variant="on">

                            <InputText id="postal" v-model="contact.address.postal" maxlength="10" />

                            <label for="postal">
                                Código Postal
                            </label>

                        </FloatLabel>

                    </div>

                    <!-- MUNICIPIO -->

                    <div class="col-12 md:col-5">

                        <FloatLabel variant="on">

                            <InputText id="city" v-model="contact.address.city" maxlength="220" />

                            <label for="city">
                                Municipio
                            </label>

                        </FloatLabel>

                    </div>

                    <!-- PROVINCIA -->

                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <InputText id="province" v-model="contact.address.province" maxlength="220" />

                            <label for="province">
                                Provincia
                            </label>

                        </FloatLabel>

                    </div>

                    <!-- PAIS -->

                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <InputText id="country" v-model="contact.address.country" maxlength="120" />

                            <label for="country">
                                País
                            </label>

                        </FloatLabel>

                    </div>

                </div>

            </Panel>




            <Panel style="margin-top:20px">

                <template #header>

                    <div class="flex align-items-center gap-2">

                        <i class="pi pi-sitemap text-primary"></i>

                        <span class="font-bold">
                            Departamentos a los que Pertenece
                        </span>

                    </div>

                </template>


                <DataTable :value="contact.departamentos" size="small" stripedRows>


                    <Column header="Pertenece" style="width:120px">

                        <template #body="slotProps">

                            <div class="flex justify-content-center">

                                <Checkbox v-model="slotProps.data.selected" binary
                                    @change="onDepartamentoChange(slotProps.data)" />

                            </div>

                        </template>

                    </Column>


                    <Column field="description" header="Departamento" />


                    <Column header="Copia email" style="width:120px">

                        <template #body="slotProps">

                            <div class="flex justify-content-center">

                                <Checkbox v-model="slotProps.data.mailCopy" binary
                                    :disabled="!slotProps.data.selected" />

                            </div>

                        </template>

                    </Column>


                </DataTable>


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
import { useFormValidator } from '../../libs/HelperView';
import { HelperDates } from '../../libs/HelperDates';
import { HelperString } from '@/libs/HelperString';

const { scrollToError } = useFormValidator();
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
    defaultContact: false,
    departamentos: [] as any[],
    address: {
        pkid: null,
        type: 'other',
        address1: '',
        address2: '',
        postal: '',
        city: '',
        province: '',
        country: ''
    }
});


/* =========================
   ERRORS
========================= */

type ErrorKey =

    | 'name'
    | 'nif'
    | 'email'
    | 'dpto'
    | 'cargo'
    ;

type FormErrors = Record<ErrorKey, string>;


const errors = ref<FormErrors>({

    name: '',
    nif: '',
    email: '',
    dpto: '',
    cargo: ''

});

const clearErrors = () => {
    errors.value = {
        name: '', nif: '', email: '', dpto: '', cargo: ''
    };
};

/* =========================
   VALIDATION
========================= */
const validate = async (): Promise<boolean> => {
    clearErrors();

    let valid = true;
    let firstError: ErrorKey | '' = '';

    const setError = (field: ErrorKey, msg: string) => {
        errors.value[field] = msg;
        if (!firstError) firstError = field;
        valid = false;
    };

    if (!contact.value.name?.trim()) setError('name', 'Obligatorio');

    if (!(contact.value.nif ?? '').trim()) {

    } else if (!HelperString.isValidCifNif(contact.value.nif)) {
        setError('nif', 'Inválido');
    }
    if (contact.value.email && !HelperString.isValidEmail(contact.value.email)) {
        setError('email', 'Email inválido');
    }

    if (!contact.value.cargoPkid) {
        setError('cargo', 'Obligatorio');
    }




    await scrollToError(firstError);

    return valid;
};








const emit = defineEmits([
    'saved'
]);


const visible = ref(false);


const contactId = ref<number | null>(null);


const cargos = ref([]);
const departamentos = ref([]);

const addressTypes = [

    {
        label: 'Facturación',
        value: 'invoice'
    },

    {
        label: 'Almacén',
        value: 'warehouse'
    },

    {
        label: 'Otra',
        value: 'other'
    }

];

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
        defaultContact: false,
        departamentos: [],
        address: {
            pkid: null,
            type: 'other',
            address1: '',
            address2: '',
            postal: '',
            city: '',
            province: '',
            country: ''
        },
    };

}



async function open(id: number | null = null, name: string) {
    clearForm();


    await Promise.all([
        loadCargos(),
        loadAllDepartamentos()
    ]);


    if (id) {

        contact.value.pkid = id;
        contact.value.name = name;

        await loadContact(id);

    }

    visible.value = true;

}


defineExpose({
    open
});



async function loadContact(id: number) {

    try {

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebGetContact?pkid=${id}`
        );

        if (!response.ok) {
            throw new Error();
        }

        const data = await response.json();
        const todosDepartamentos = [...contact.value.departamentos];
        Object.assign(contact.value, data);

        if (!contact.value.address) {

            contact.value.address = {
                pkid: null,
                type: 'other',
                address1: '',
                address2: '',
                postal: '',
                city: '',
                province: '',
                country: ''
            };

        }

        contact.value.departamentos = todosDepartamentos;




        // Marcar los departamentos
        data.departamentos.forEach((d: any) => {

            const dep = contact.value.departamentos.find(
                (x: any) => x.departamentoPkid === d.departamentoPkid
            );

            if (dep) {

                dep.pkid = d.pkid;
                dep.selected = true;
                dep.mailCopy = d.mailCopy;

            }

        });

    } catch (e) {

    }

}

async function loadCargos() {

    try {

        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/WebGetCargos`
        );

        cargos.value = response.data;

    } catch (error) {

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los cargos',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

    }

}

function onDepartamentoChange(departamento: any) {

    if (!departamento.selected) {

        departamento.mailCopy = false;

    }

}




async function loadAllDepartamentos() {

    try {

        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/WebGetDepartamentos`
        );


        contact.value.departamentos = response.data.map((d: any) => ({

            pkid: 0,
            departamentoPkid: d.pkid,
            description: d.description,
            mailCopy: false,
            selected: false

        }));


    } catch (error) {

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los departamentos',
            life: 3000
        });

    }

}

/* =========================
   SAVE
========================= */
const save = async () => {

    if (!(await validate())) return;


    const payload = {
        pkid: contact.value.pkid,
        entitiePkid: contact.value.entitiePkid,
        name: contact.value.name,
        email: contact.value.email,
        phone: contact.value.phone,
        nif: contact.value.nif,
        born: contact.value.born,
        cargoPkid: contact.value.cargoPkid,
        active: contact.value.active,
        defaultContact: contact.value.defaultContact,
        departamentos: contact.value.departamentos
            .filter((d: any) => d.selected)
            .map((d: any) => ({
                pkid: d.pkid,
                departamentoPkid: d.departamentoPkid,
                mailCopy: d.mailCopy
            }))
    };
    console.log(contact.value.departamentos);


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