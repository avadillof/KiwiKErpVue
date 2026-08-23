<template>

    <Dialog
        v-model:visible="visible"
        modal
        :header="productFamily.pkid ? 'Editar Familia de Producto' : 'Nueva Familia de Producto'"
        :style="{ width: '70%', height: 'auto' }"
        class="kiwik-dialog"
        :dismissableMask="true"
        :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }"
    >

        <div style="max-height: 80vh; overflow-y: auto">

            <!-- ========================================= -->
            <!-- DATOS GENERALES                          -->
            <!-- ========================================= -->

            <Panel>

                <template #header>

                    <div class="flex align-items-center gap-2">

                        <div
                            class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;"
                        >
                            <i class="pi pi-box text-primary"></i>
                        </div>

                        <span class="font-bold">
                            Datos Generales.
                        </span>

                    </div>

                </template>


                <div class="grid p-fluid mb-12">

                    <!-- ===================================== -->
                    <!-- ALIAS / CÓDIGO                       -->
                    <!-- ===================================== -->

                    <div class="col-12 md:col-3">

                        <InputGroup>

                            <FloatLabel variant="on" class="w-full">

                                <InputText
                                    :ref="(el) => setRef('code', el)"
                                    id="code"
                                    v-model="productFamily.code"
                                    maxlength="45"
                                    class="w-full"
                                    :disabled="!!productFamily.pkid"
                                />

                                <label for="code">
                                    Alias / Código
                                </label>

                            </FloatLabel>


                            <Button
                                icon="pi pi-id-card"
                                @click="generateCode"
                                :disabled="!!productFamily.pkid"
                                severity="secondary"
                            />

                        </InputGroup>


                        <InlineMessage
                            v-if="errors.code"
                            severity="error"
                        >
                            {{ errors.code }}
                        </InlineMessage>

                    </div>


                    <!-- ===================================== -->
                    <!-- DESCRIPCIÓN                          -->
                    <!-- ===================================== -->

                    <div class="col-12 md:col-6">

                        <FloatLabel variant="on" class="w-full">

                            <InputText
                                :ref="(el) => setRef('description', el)"
                                id="description"
                                v-model="productFamily.description"
                                maxlength="145"
                                class="w-full"
                            />

                            <label for="description">
                                Descripción
                            </label>

                        </FloatLabel>


                        <InlineMessage
                            v-if="errors.description"
                            severity="error"
                        >
                            {{ errors.description }}
                        </InlineMessage>

                    </div>


                    <!-- ===================================== -->
                    <!-- ACTIVO                                -->
                    <!-- ===================================== -->

                    <div class="col-12 md:col-3">

                        <div class="flex align-items-center gap-2 mt-2">

                            <Checkbox
                                id="active"
                                v-model="productFamily.active"
                                binary
                            />

                            <label for="active">
                                ¿ Activo ?
                            </label>

                        </div>

                    </div>


                    <!-- ===================================== -->
                    <!-- DESCRIPCIÓN OTRO IDIOMA              -->
                    <!-- ===================================== -->

                    <div class="col-12 md:col-9 mt-2">

                        <FloatLabel variant="on" class="w-full">

                            <InputText
                                :ref="(el) => setRef('descriptionEn', el)"
                                id="descriptionEn"
                                v-model="productFamily.descriptionEn"
                                maxlength="145"
                                class="w-full"
                            />

                            <label for="descriptionEn">
                                Descripción (Otro Idioma)
                            </label>

                        </FloatLabel>


                        <InlineMessage
                            v-if="errors.descriptionEn"
                            severity="error"
                        >
                            {{ errors.descriptionEn }}
                        </InlineMessage>

                    </div>

                </div>

            </Panel>

        </div>


        <!-- ========================================= -->
        <!-- FOOTER                                    -->
        <!-- ========================================= -->

        <template #footer>

            <Button
                v-if="securityStore.hasPermission('PROFAM_GEN_0002')"
                label="Guardar"
                icon="pi pi-check"
                @click="save"
            />

        </template>


        <div
            class="kiwik-separator"
            style="margin-top: 10px;"
        ></div>

    </Dialog>

</template>


<script setup lang="ts">

import { ref } from 'vue';

import axios from 'axios';

import Dialog from 'primevue/dialog';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import FloatLabel from 'primevue/floatlabel';
import InputGroup from 'primevue/inputgroup';
import InlineMessage from 'primevue/inlinemessage';

import { useToast } from 'primevue/usetoast';

import { useFormValidator } from '../../../libs/HelperView';

import { useCompanyStore } from '../../../stores/companyStore';
import { useSecurityStore } from '../../../stores/securityStore';


/* =========================================================
   HELPERS
========================================================= */

const toast = useToast();

const companyStore = useCompanyStore();

const securityStore = useSecurityStore();

const {
    setRef,
    scrollToError
} = useFormValidator();


/* =========================================================
   UI STATE
========================================================= */

const visible = ref(false);


/* =========================================================
   MODELO DE DATOS
========================================================= */

type ProductFamily = {

    pkid: number | null;

    code: string;

    description: string;

    descriptionEn: string;

    active: boolean;

};


/* =========================================================
   INIT PRODUCT FAMILY
========================================================= */

const createProductFamily = (): ProductFamily => ({

    pkid: null,

    code: '',

    description: '',

    descriptionEn: '',

    active: true

});


const productFamily = ref<ProductFamily>(
    createProductFamily()
);


/* =========================================================
   ERRORS
========================================================= */

type ErrorKey =

    | 'code'
    | 'description'
    | 'descriptionEn';


type FormErrors = Record<ErrorKey, string>;


const errors = ref<FormErrors>({

    code: '',

    description: '',

    descriptionEn: ''

});


const clearErrors = () => {

    errors.value = {

        code: '',

        description: '',

        descriptionEn: ''

    };

};


/* =========================================================
   VALIDATION
========================================================= */

const validate = async (): Promise<boolean> => {

    clearErrors();

    let valid = true;

    let firstError: ErrorKey | '' = '';


    const setError = (
        field: ErrorKey,
        message: string
    ) => {

        errors.value[field] = message;

        if (!firstError) {

            firstError = field;

        }

        valid = false;

    };


    /* =========================================
       CÓDIGO
    ========================================= */

    if (!productFamily.value.code?.trim()) {

        setError(
            'code',
            'Obligatorio'
        );

    }


    /* =========================================
       DESCRIPCIÓN
    ========================================= */

    if (!productFamily.value.description?.trim()) {

        setError(
            'description',
            'Obligatorio'
        );

    }


    await scrollToError(firstError);

    return valid;

};


/* =========================================================
   OPEN
========================================================= */

const open = async (pkid?: number) => {

    clearErrors();

    productFamily.value = createProductFamily();

    visible.value = true;


    /*
     * DE MOMENTO NO CARGAMOS NADA DEL BACKEND.
     *
     * Cuando tengamos implementado el endpoint:
     *
     * WebGetProductFamily
     *
     * podremos añadir:
     *
     * if (pkid) {
     *     await loadProductFamily(pkid);
     * }
     */

    if (pkid) {

        /*
         * Pendiente de implementar.
         */

    }

};


/* =========================================================
   LOAD
========================================================= */

/*
 * Pendiente de implementar cuando tengamos
 * el endpoint WebGetProductFamily.
 *
 * const loadProductFamily = async (pkid: number) => {
 *
 *     try {
 *
 *         const response = await axios.get(
 *             `${import.meta.env.VITE_API_URL}/WebGetProductFamily`,
 *             {
 *                 params: {
 *                     pkid
 *                 }
 *             }
 *         );
 *
 *         const data = response.data;
 *
 *         productFamily.value = {
 *
 *             ...createProductFamily(),
 *
 *             ...data
 *
 *         };
 *
 *     } catch (error) {
 *
 *         console.error(error);
 *
 *         toast.add({
 *
 *             severity: 'error',
 *             summary: 'Error',
 *             detail: 'No se pudo cargar la Familia de Producto.',
 *             life:
 *                 companyStore.companyInfo.toastDuration ?? 3000
 *
 *         });
 *
 *     }
 *
 * };
 */


/* =========================================================
   SAVE
========================================================= */

const save = async () => {

    if (!(await validate())) {

        return;

    }


    /*
     * DE MOMENTO NO GUARDAMOS EN EL BACKEND.
     *
     * Cuando tengamos implementado:
     *
     * WebSaveProductFamily
     *
     * sustituiremos esta parte por la llamada axios.
     */


    toast.add({

        severity: 'success',

        summary: 'Formulario correcto',

        detail: 'El mantenimiento todavía no está conectado al servidor.',

        life:
            companyStore.companyInfo.toastDuration ?? 3000

    });

};


/* =========================================================
   GENERATE CODE
========================================================= */

const generateCode = async () => {

    /*
     * DE MOMENTO NO LLAMAMOS AL BACKEND.
     *
     * Cuando implementemos el endpoint:
     *
     * WebGenerateProductFamilyCode
     *
     * utilizaremos:
     *
     * const baseUrl = import.meta.env.VITE_API_URL;
     *
     * const res = await axios.get(
     *     `${baseUrl}/WebGenerateProductFamilyCode`
     * );
     *
     * productFamily.value.code = res.data;
     */


    toast.add({

        severity: 'info',

        summary: 'Pendiente',

        detail: 'La generación automática del código se conectará al servidor posteriormente.',

        life:
            companyStore.companyInfo.toastDuration ?? 3000

    });

};


/* =========================================================
   EXPOSE
========================================================= */

defineExpose({

    open

});

</script>