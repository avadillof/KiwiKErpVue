<template>

    <Dialog v-model:visible="visible" modal
        :header="product.pkid ? 'Editar Producto / Servicio' : 'Nuevo Producto / Servicio'"
        :style="{ width: '95%', height: '95%' }" class="kiwik-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">

        <div style="max-height:80vh; overflow-y:auto">

            <!-- ========================================= -->
            <!-- DATOS GENERALES                          -->
            <!-- ========================================= -->

            <Panel>

                <template #header>
                    <div class="flex align-items-center gap-2">

                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-box text-primary"></i>
                        </div>

                        <span class="font-bold">
                            Datos Generales.
                        </span>

                    </div>
                </template>


                <div class="grid p-fluid mb-4">

                    <!-- CÓDIGO -->
                    <div class="col-12 md:col-2">

                        <FloatLabel variant="on" class="w-full">

                            <InputText id="code" v-model="product.code" maxlength="45" class="w-full"
                                :disabled="!!product.pkid" />

                            <label for="code">
                                Código
                            </label>

                        </FloatLabel>

                        <InlineMessage v-if="errors.code" severity="error">
                            {{ errors.code }}
                        </InlineMessage>

                    </div>


                    <!-- DESCRIPCIÓN -->
                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on" class="w-full">

                            <InputText id="description" v-model="product.description" maxlength="255" class="w-full" />

                            <label for="description">
                                Descripción
                            </label>

                        </FloatLabel>

                        <InlineMessage v-if="errors.description" severity="error">
                            {{ errors.description }}
                        </InlineMessage>

                    </div>


                     <!-- DESCRIPCIÓN -->
                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on" class="w-full">

                            <InputText id="description" v-model="product.description" maxlength="255" class="w-full" />

                            <label for="description">
                                Descripción
                            </label>

                        </FloatLabel>

                        <InlineMessage v-if="errors.description" severity="error">
                            {{ errors.description }}
                        </InlineMessage>

                    </div>

                    <!-- ACTIVO -->
                    <div class="col-12 md:col-2">

                        <div class="flex align-items-center gap-2 mt-3">

                            <Checkbox id="active" v-model="product.active" binary />

                            <label for="active">
                                ¿ Activo ?
                            </label>

                        </div>

                    </div>



                    <div class="grid p-fluid mb-4">

                        
                    </div>



                    <div class="col-12 md:col-2">

                        <FloatLabel variant="on" class="w-full">

                            <DatePicker id="dateUp" v-model="product.dateUp" class="w-full" showIcon iconDisplay="input"
                                dateFormat="dd/mm/yy" />

                            <label for="dateUp">
                                Fecha de Alta
                            </label>

                        </FloatLabel>

                        <InlineMessage v-if="errors.dateUp" severity="error">
                            {{ errors.dateUp }}
                        </InlineMessage>

                    </div>

                </div>


                <!-- CATEGORIA / FAMILIA / U.M. -->

                <div class="grid p-fluid mt-3">

                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <Select id="category" v-model="product.categoryId" :options="categories"
                                optionLabel="description" optionValue="pkid" class="w-full" filter />

                            <label for="category">
                                Categoría
                            </label>

                        </FloatLabel>

                    </div>


                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <Select id="family" v-model="product.familyId" :options="families" optionLabel="description"
                                optionValue="pkid" class="w-full" filter />

                            <label for="family">
                                Familia
                            </label>

                        </FloatLabel>

                    </div>


                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <Select id="uom" v-model="product.uomId" :options="units" optionLabel="description"
                                optionValue="pkid" class="w-full" filter />

                            <label for="uom">
                                Unidad de medida
                            </label>

                        </FloatLabel>

                    </div>

                </div>

            </Panel>


            <!-- ========================================= -->
            <!-- CONFIGURACIÓN COMERCIAL                   -->
            <!-- ========================================= -->

            <Panel style="margin-top: 20px; margin-bottom: 20px;">

                <template #header>

                    <div class="flex align-items-center gap-2">

                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-shopping-cart text-primary"></i>
                        </div>

                        <span class="font-bold">
                            Configuración Comercial.
                        </span>

                    </div>

                </template>


                <div class="grid p-fluid">

                    <div class="col-12 md:col-3">

                        <div class="flex align-items-center gap-2">

                            <Checkbox id="sale" v-model="product.sale" binary />

                            <label for="sale">
                                ¿ Para vender ?
                            </label>

                        </div>

                    </div>


                    <div class="col-12 md:col-3">

                        <div class="flex align-items-center gap-2">

                            <Checkbox id="purchase" v-model="product.purchase" binary />

                            <label for="purchase">
                                ¿ Para comprar ?
                            </label>

                        </div>

                    </div>

                </div>

            </Panel>


            <!-- ========================================= -->
            <!-- TABS                                      -->
            <!-- ========================================= -->

            <Tabs v-if="product.sale || product.purchase" v-model:value="activeTab" style="min-height: 400px;">

                <TabList>

                    <Tab v-if="product.sale" value="0">
                        <div class="flex align-items-center">

                            <i class="pi pi-shopping-cart text-primary mr-2" style="font-size: 1.3rem" />

                            <h4 class="m-0 text-primary font-semibold">
                                Parámetros de Ventas.
                            </h4>

                        </div>
                    </Tab>


                    <Tab v-if="product.purchase" value="1">
                        <div class="flex align-items-center">

                            <i class="pi pi-briefcase text-primary mr-2" style="font-size: 1.3rem" />

                            <h4 class="m-0 text-primary font-semibold">
                                Parámetros de Compras.
                            </h4>

                        </div>
                    </Tab>

                </TabList>


                <TabPanels>

                    <!-- VENTAS -->

                    <TabPanel v-if="product.sale" value="0">

                        <Panel>

                            <!-- Aquí pondremos los parámetros de venta -->

                            <div class="grid">

                                <div class="col-12 md:col-4">

                                    <FloatLabel variant="on">

                                        <InputText v-model="product.salesDescription" class="w-full" />

                                        <label>
                                            Descripción para ventas
                                        </label>

                                    </FloatLabel>

                                </div>

                            </div>

                        </Panel>

                    </TabPanel>


                    <!-- COMPRAS -->

                    <TabPanel v-if="product.purchase" value="1">

                        <Panel>

                            <!-- Aquí pondremos los parámetros de compra -->

                            <div class="grid">

                                <div class="col-12 md:col-4">

                                    <FloatLabel variant="on">

                                        <InputText v-model="product.purchasesDescription" class="w-full" />

                                        <label>
                                            Descripción para compras
                                        </label>

                                    </FloatLabel>

                                </div>

                            </div>

                        </Panel>

                    </TabPanel>

                </TabPanels>

            </Tabs>

        </div>


        <template #footer>

            <Button v-if="securityStore.hasPermission('PROSER_GEN_0002')" label="Guardar" icon="pi pi-check"
                @click="save" />

        </template>

        <div class="kiwik-separator" style="margin-top: 10px;"></div>

    </Dialog>

</template>


<script setup lang="ts">

import { ref, watch } from 'vue';
import axios from 'axios';

import Dialog from 'primevue/dialog';
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { useFormValidator } from '../../libs/HelperView';
import { useToast } from 'primevue/usetoast';
import { useCompanyStore } from '@/stores/companyStore';
import { useSecurityStore } from '@/stores/securityStore';

import type { ProductsDTO } from '../../models/ProductsDTO';


const toast = useToast();
const companyStore = useCompanyStore();
const securityStore = useSecurityStore();


const visible = ref(false);

const activeTab = ref('0');


const categories = ref<any[]>([]);
const families = ref<any[]>([]);
const units = ref<any[]>([]);


type Product = {

    pkid: number | null;

    code: string;

    description: string;

    categoryId: number | null;

    familyId: number | null;

    uomId: number | null;

    sale: boolean;

    purchase: boolean;

    active: boolean;

    salesDescription: string;

    purchasesDescription: string;

    dateUp: Date | null;
};


const createProduct = (): Product => ({

    pkid: null,

    code: '',

    description: '',

    categoryId: null,

    familyId: null,

    uomId: null,

    sale: true,

    purchase: false,

    active: true,

    salesDescription: '',

    purchasesDescription: '',

    dateUp: null

});


const product = ref<Product>(createProduct());


type ErrorKey =
    | 'code'
    | 'description'
    | 'dateUp'


type FormErrors = Record<ErrorKey, string>;


const errors = ref<FormErrors>({
    code: '',
    description: '',
    dateUp: ''
    
    
});


const clearErrors = () => {

    errors.value = {
        code: '',
        description: '',
        dateUp: ''
    };

};


const validate = (): boolean => {

    clearErrors();

    let valid = true;


    if (!product.value.code?.trim()) {

        errors.value.code = 'Obligatorio';

        valid = false;

    }


    if (!product.value.description?.trim()) {

        errors.value.description = 'Obligatorio';

        valid = false;

    }


    return valid;

};


const open = async (pkid?: number) => {

    clearErrors();

    product.value = createProduct();

    activeTab.value = '0';

    visible.value = true;


    if (pkid) {

        await loadProduct(pkid);

    }

};


const loadProduct = async (pkid: number) => {

    try {

        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/WebGetProduct`,
            {
                params: {
                    pkid
                }
            }
        );


        const data = response.data;


        product.value = {

            ...createProduct(),

            ...data,

            categoryId:
                data.categoryId ??
                data.category?.pkid ??
                null,

            familyId:
                data.familyId ??
                data.family?.pkid ??
                null,

            uomId:
                data.uomId ??
                data.unitOfMeasure?.pkid ??
                null

        };


    } catch (error) {

        console.error(error);

        toast.add({

            severity: 'error',

            summary: 'Error',

            detail: 'No se pudo cargar el Producto/Servicio',

            life:
                companyStore.companyInfo.toastDuration ?? 3000

        });

    }

};


const loadCatalogs = async () => {

    try {

        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/loadProductCatalog`
        );


        const data = response.data || {};


        categories.value = data.categories || [];

        families.value = data.families || [];

        units.value = data.units || [];


    } catch (error) {

        console.error(error);

    }

};


const save = async () => {

    if (!validate()) {
        return;
    }


    try {

        await axios.post(

            `${import.meta.env.VITE_API_URL}/WebSaveProduct`,

            product.value

        );


        toast.add({

            severity: 'success',

            summary: 'Guardado correctamente',

            life:
                companyStore.companyInfo.toastDuration ?? 3000

        });


        visible.value = false;

        emit('saved');

    } catch (error: any) {

        toast.add({

            severity: 'error',

            summary: 'Error',

            detail:
                error.response?.data?.message ??
                'Error inesperado',

            life:
                companyStore.companyInfo.toastDuration ?? 3000

        });

    }

};


watch(
    () => [product.value.sale, product.value.purchase],

    ([sale, purchase]) => {

        if (sale) {

            activeTab.value = '0';

        } else if (purchase) {

            activeTab.value = '1';

        } else {

            activeTab.value = '';

        }

    },

    {
        immediate: true
    }
);


const emit = defineEmits<{
    saved: [];
}>();


defineExpose({
    open
});

</script>