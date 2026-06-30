<template>
    <Dialog v-model:visible="visible" modal :header="entity.pkid > 0 ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '95%', height: '95%' }" class="kiwik-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">




        <div style="max-height:80vh; overflow-y:auto">

            <Panel>

                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-info text-primary"></i>
                        </div>
                        <span class="font-bold">Datos Generales.</span>
                    </div>
                </template>
                <div class="grid p-fluid mb-12">

                    <div class="col-12 md:col-2">
                        <InputGroup>
                            <FloatLabel variant="on" class="w-full">
                                <InputText maxlength="45" id="dsCode" v-model="entity.code" class="w-full"
                                    :disabled="!!entity.pkid" />
                                <label for="dsCode">Código de Entidad</label>
                            </FloatLabel>                            
                            <Button icon="pi pi-id-card" @click="generateCode" :disabled="!!entity.pkid"
                                severity="secondary" />
                        </InputGroup>
                        <InlineMessage v-if="errors.code" severity="error">
                                {{ errors.code }}
                        </InlineMessage>
                    </div>

                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on" class="w-full">
                            <InputText maxlength="120" id="dsName" v-model="entity.name" class="w-full" required />
                            <label for="dsName">Nombre / Razón Social</label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.name" severity="error" >
                            {{ errors.name }}
                        </InlineMessage>
                    </div>


                    <div class="col-12 md:col-2">
                        <FloatLabel variant="on" class="w-full">
                            <InputText maxlength="38" id="dsCif" v-model="entity.cif" class="w-full" />
                            <label for="dsCif">CIF / NIf</label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.cif" severity="error" >
                                {{ errors.cif }}
                        </InlineMessage>
                    </div>


                    <div class="col-12 md:col-2">
                        <Checkbox id="isActive" v-model="entity.active" binary />
                        <label for="isActive"> ¿ Activo ? </label>
                    </div>
                </div>


                <div class="grid p-fluid mb-12 mt-3">
                    <div class="col-12 md:col-2">
                        <Checkbox id="bolClient" v-model="entity.isclient" binary />
                        <label for="bolClient"> ¿ Es Cliente ? </label>
                    </div>
                    <div class="col-12 md:col-2">
                        <Checkbox id="bolSupplier" v-model="entity.isprove" binary />
                        <label for="bolSupplier"> ¿ Es Proveedor ? </label>
                    </div>
                </div>

                <div class="grid p-fluid mb-12 mt-3">
                    <div class="col-12 md:col-2">
                        <FloatLabel variant="on" class="w-full">
                            <DatePicker id="dateUp" v-model="entity.dateUp" class="w-full" showIcon iconDisplay="input"
                                dateFormat="dd/mm/yy" />
                            <label for="dateUp">Fecha de Alta</label>
                        </FloatLabel>
                    </div>
                </div>

            </Panel>




            <Panel style="margin-top: 20px;">

                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-home text-primary"></i>
                        </div>
                        <span class="font-bold">Dirección Principal.</span>
                    </div>
                </template>

                <div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border mb-4">
                    <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                        <i class="pi pi-map-marker"></i> Dirección Fiscal
                    </h5>

                    <div class="grid">
                        <div class="col-12 md:col-6 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.address" id="address" maxlength="145" class="w-full"
                                    size="small" />
                                <label for="address">Calle / Avenida</label>
                            </FloatLabel>
                        </div>
                    </div>
                    <div class="grid">

                        <div class="col-12 md:col-6 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.address2" id="address2" maxlength="145" class="w-full"
                                    size="small" />
                                <label for="address2">Otra Dirección</label>
                            </FloatLabel>
                        </div>
                    </div>

                    <div class="grid">

                        <div class="col-12 md:col-3 mb-2">
                            <FloatLabel variant="in">
                                <Select v-model="entity.province" id="province" :options="provincias" maxlength="200"
                                    optionLabel="nombre" optionValue="nombre" class="w-full" size="small" filter
                                    :pt="{ root: { style: 'padding-top: 1.25rem' } }" />
                                <label for="province">Provincia</label>
                            </FloatLabel>
                        </div>
                        <div class="col-12 md:col-1 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.zipcode" id="zipCode" maxlength="20" class="w-full"
                                    size="small" /><label for="zipCode">CP</label>
                            </FloatLabel>
                        </div>

                        <div class="col-12 md:col-4 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.city" id="city" maxlength="200" class="w-full"
                                    size="small" /><label for="city">Localidad</label>
                            </FloatLabel>
                        </div>

                        <div class="col-12 md:col-2 mb-2">
                            <FloatLabel variant="in">
                                <Select v-model="entity.country" id="country" :options="countries" maxlength="120"
                                    optionLabel="nombre" optionValue="nombre" class="w-full" size="small" filter
                                    :pt="{ root: { style: 'padding-top: 1.25rem' } }" />
                                <label for="country">Pais</label>
                            </FloatLabel>
                        </div>


                        <div class="col-12 md:col-2 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.phone" id="phone" maxlength="75" class="w-full"
                                    size="small" /><label for="phone">Teléfono</label>
                            </FloatLabel>
                        </div>
                    </div>


                    <div class="grid">
                        <div class="col-12 md:col-4 mb-2">
                            <InputGroup>
                                <FloatLabel variant="on" class="w-full">
                                    <InputText id="web" v-model="entity.web" class="w-full" />
                                    <label for="web">Sitio Web</label>
                                </FloatLabel>
                                <Button icon="pi pi-external-link" severity="secondary" @click="openLink"
                                    :disabled="!entity.web" />
                            </InputGroup>
                             <InlineMessage v-if="errors.web" severity="error" >
                                {{ errors.web }}
                             </InlineMessage>
                        </div>


                        <div class="col-12 md:col-4 mb-2">
                            <InputGroup>
                                <FloatLabel variant="on" class="w-full">
                                    <InputText id="email" v-model="entity.email" class="w-full" />
                                    <label for="web">EMail</label>
                                </FloatLabel>
                                <Button icon="pi pi-envelope" severity="secondary" @click="openEmail"
                                    :disabled="!entity.email" />
                            </InputGroup>
                            <InlineMessage v-if="errors.mail" severity="error" >
                                {{ errors.mail }}
                             </InlineMessage>
                        </div>

                    </div>


                </div>

            </Panel>



            <Tabs v-model:value="activeTab" style="min-height: 400px;">
                <TabList>
                    <Tab value="0" :vi="!entity.isclient">
                        <div class="grid p-fluid">
                            <div class="col-12 mb-2 flex align-items-center">
                                <i class="pi pi-shopping-cart text-primary mr-2" style="font-size: 1.3rem"></i>
                                <h4 class="m-0 text-primary font-semibold">
                                    Parámetros de Ventas.
                                </h4>
                            </div>
                        </div>
                    </Tab>
                    <Tab value="1" :disabled="!entity.isprove">
                        <div class="grid p-fluid">
                            <div class="col-12 mb-2 flex align-items-center">
                                <i class="pi pi-briefcase text-primary mr-2" style="font-size: 1.3rem"></i>
                                <h4 class="m-0 text-primary font-semibold">
                                    Parámetros de Compras.
                                </h4>
                            </div>
                        </div>
                    </Tab>
                </TabList>
                <TabPanels style="height: auto;">
                    <TabPanel value="0">

                        <Panel style="height: auto;">

                        </Panel>

                    </TabPanel>

                    <TabPanel value="1">
                        <Panel style="height: auto;">

                        </Panel>
                    </TabPanel>
                </TabPanels>
            </Tabs>


        </div>



        <template #footer>
            <Button label="Guardar" icon="pi pi-check" @click="save" />
        </template>


        <div class="kiwik-separator"></div>
    </Dialog>




</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast'; // Importa el hook de Toast

import { ref } from 'vue';
import { watch } from 'vue';
import Dialog from 'primevue/dialog';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import axios, { AxiosError } from 'axios';
import Divider from 'primevue/divider';
import { useCompanyStore } from '../../../stores/companyStore';
import { provincias } from '../../../data/provinces.ts';
import { countries } from '../../../data/paises.ts';
import { HelperDates } from '../../../libs/HelperDates.ts';
import { HelperString } from '@/libs/HelperString.ts';

const emit = defineEmits(['saved']);
const countriselect = ref('');
const activeTab = ref('0');
const toast = useToast();
const companyStore = useCompanyStore();
const visible = ref(false);
const entity = ref<any>({
    pkid: null,
    phone: '',
    name: '',
    code: '',
    cif: '',
    web: '',
    isclient: false,
    isprove: false,
    active: true,
    email: '',
    dateUp: null,

    salesAttributes:
    {
        salesTarifasPkId: null
    },

    purchasesAttributes: {
        purchasesTermPkId: null
    }
});


type FormErrors = {
    code: string;
    name: string;
    cif: string;
    web: string;
    mail:string;
    fechaalta:string
};

const errors = ref<FormErrors>({
    code: '',
    name: '',
    cif: '',
    web: '',
    mail: '',
    fechaalta:
});


const validate = () => {
    errors.value = {
        code: '',
        name: '',
        cif: '',
        web: '',
        mail:''
    };

    let valid = true;

    if (!entity.value.code?.trim()) {
        errors.value.code = 'El código es obligatorio';
        valid = false;
    }

    if (!entity.value.name?.trim()) {
        errors.value.name = 'El nombre es obligatorio';
        valid = false;
    }

    if (!entity.value.cif?.trim()) {
        errors.value.cif = 'El CIF es obligatorio';
        valid = false;
    }else{
        if(HelperString.isValidCifNif(entity.value.cif)==false){
            errors.value.cif = 'El CIF tiene un Formato no válido';
            valid = false;
        }
    }

    if (!entity.value.web?.trim()) {
        valid = true;
    }else{
        if(HelperString.isValidUrl(entity.value.web)==false){
            errors.value.web = 'El campo Web tiene un valor no válido';
            valid = false;
        }
    }

    if (!entity.value.email?.trim()) {
        valid = true;
    }else{
        if(HelperString.isValidEmail(entity.value.email)==false){
            errors.value.mail = 'El campo Mail tiene un valor no válido';
            valid = false;
        }
    }

    return valid;
};





const open = async (pkid?: number) => {

    visible.value = true;

    // Nuevo registro
    if (!pkid) {

        entity.value = {
            pkid: null,
            code: '',
            name: '',
            cif: '',
            active: true,
            isclient: false,
            isprove: false,
            address: '',
            address2: '',
            province: '',
            zipcode: '',
            city: '',
            country: '',
            phone: '',
            web: '',
            email: '',
            dateUp: null,
            salesAttributes: {
                salesTarifasPkId: null
            },
            purchasesAttributes: {
                purchasesTermPkId: null
            }
        };

        return;
    }

    await loadEntity(pkid);

};

const save = async () => {
    try {

        const baseUrl = import.meta.env.VITE_API_URL;

        // 1. Validación de campos obligatorios


        if (!validate()) {
            toast.add({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Completa los campos obligatorios',
                life: 3000
            });
            return;
        }




        const payload = {
            ...entity.value,
            dateUp: HelperDates.formatDateObjectNoTime(entity.value.dateUp)
        };


        const response = await axios.post(
            `${baseUrl}/WebSaveClient`,
            payload
        );

        entity.value = response.data;




        toast.add({
            severity: 'success',
            summary: 'Entidad',
            detail: 'Entidad guardada correctamente.',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

        visible.value = false;
        emit('saved');

    } catch (error: unknown) {

        if (!axios.isAxiosError(error)) {
            console.error("Error no Axios:", error);
            return;
        }
        const status = error.response?.status;
        const data = error.response?.data;

        let message = 'Error desconocido';

        if (status === 409) {

            if (data?.code === 'DUPLICATE_CODE') {
                message = 'El código de la entidad ya existe';
            }

            if (data?.code === 'DUPLICATE_NAME') {
                message = 'El nombre de la entidad ya existe';
            }
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: message,
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
};

const generateCode = async () => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${baseUrl}/WebGenerateUserCode`);
        // Asignamos el código generado al modelo
        entity.value.dsCode = res.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo generar el código automático.',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
};


// Si el usuario activa "Es Cliente", saltamos a la pestaña 0
watch(() => entity.value.isclient, (newValue) => {
    if (newValue) {
        activeTab.value = '0';
    }
});

// Si el usuario desactiva la opción y estaba en esa pestaña, movemos a la otra
watch(() => entity.value.isprove, (newValue) => {
    if (newValue) {
        activeTab.value = '1';
    }
});




const openLink = () => {
    if (entity.value.web) {
        // Si estás usando TypeScript puro, a veces basta con esto:
        window.open(entity.value.web, '_blank');
    }
}


const openEmail = () => {
    if (!entity.value.email) return;

    window.location.href = `mailto:${entity.value.email}`;
};



const loadEntity = async (pkid: number) => {

    try {

        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/WebGetClient`,
            {
                params: { pkid }
            }
        );

        entity.value = response.data;


        if (entity.value.dateUp) {
            entity.value.dateUp = new Date(entity.value.dateUp);
        }

        console.info(entity.value);

    } catch (err) {

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la entidad.',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

    }


}




defineExpose({ open });
</script>
