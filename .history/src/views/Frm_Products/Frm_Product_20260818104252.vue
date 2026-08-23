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


                <div class="grid p-fluid">


                    <!-- ========================================= -->
                    <!-- IMAGEN                                    -->
                    <!-- ========================================= -->

                    <div class="col-12 md:col-2">

                        <div class="flex flex-column align-items-center">

                            <div class="border-1 surface-border border-round-lg flex align-items-center justify-content-center"
                                style="
                        width: 150px;
                        height: 150px;
                        background: var(--surface-ground);
                        overflow: hidden;
                    ">

                                <i v-if="!product.image" class="pi pi-image text-400" style="font-size: 3rem;"></i>

                                <img v-else :src="product.image" alt="Imagen del producto" style="
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                        " />

                            </div>

                            <Button label="Seleccionar imagen" icon="pi pi-upload" severity="secondary" size="small"
                                class="mt-2" />

                        </div>

                    </div>


                    <!-- ========================================= -->
                    <!-- DATOS DEL PRODUCTO                       -->
                    <!-- ========================================= -->

                    <div class="col-12 md:col-10">

                        <!-- ===================================== -->
                        <!-- CÓDIGO / DESCRIPCIONES                -->
                        <!-- ===================================== -->

                        <div class="grid">

                            <!-- CÓDIGO -->
                            <div class="col-12 md:col-12">

                                <InputGroup>

                                    <FloatLabel variant="on" class="w-2">

                                        <InputText id="code" v-model="product.code" maxlength="45" class="w-full"
                                            :disabled="!!product.pkid" />

                                        <label for="code">
                                            Código
                                        </label>

                                    </FloatLabel>

                                    <Button icon="pi pi-id-card" @click="generateCode" :disabled="!!product.pkid"
                                        severity="secondary" />

                                    <div class="flex align-items-center gap-2 ml-3">

                                        <Checkbox id="active" v-model="product.active" binary />

                                        <label for="active">
                                            ¿ Activo ?
                                        </label>

                                    </div>

                                </InputGroup>

                                <InlineMessage v-if="errors.code" severity="error">
                                    {{ errors.code }}
                                </InlineMessage>


                                <!-- ACTIVO -->

                            </div>


                            <!-- DESCRIPCIÓN -->
                            <div class="col-12 md:col-12">

                                <FloatLabel variant="on" class="w-8">

                                    <InputText id="description" v-model="product.description" maxlength="145"
                                        class="w-full" />

                                    <label for="description">
                                        Descripción
                                    </label>

                                </FloatLabel>

                                <InlineMessage v-if="errors.description" severity="error">
                                    {{ errors.description }}
                                </InlineMessage>

                            </div>


                            <!-- DESCRIPCIÓN OTRO IDIOMA -->
                            <div class="col-12 md:col-12">

                                <FloatLabel variant="on" class="w-8">

                                    <InputText id="descriptionEn" v-model="product.descriptionEn" maxlength="145"
                                        class="w-full" />

                                    <label for="descriptionEn">
                                        Descripción (Otro Idioma)
                                    </label>

                                </FloatLabel>

                                <InlineMessage v-if="errors.descriptionEn" severity="error">
                                    {{ errors.descriptionEn }}
                                </InlineMessage>

                            </div>

                        </div>


                        <!-- ===================================== -->
                        <!-- ACTIVO / FECHA / CÓDIGO BARRAS        -->
                        <!-- ===================================== -->

                        <div class="grid mt-1">




                            <!-- FECHA DE ALTA -->
                            <div class="col-12 md:col-3">

                                <FloatLabel variant="on" class="w-full">

                                    <DatePicker id="dateUp" v-model="product.dateUp" class="w-full" showIcon
                                        iconDisplay="input" dateFormat="dd/mm/yy" />

                                    <label for="dateUp">
                                        Fecha de Alta
                                    </label>

                                </FloatLabel>

                                <InlineMessage v-if="errors.dateUp" severity="error">
                                    {{ errors.dateUp }}
                                </InlineMessage>

                            </div>


                            <!-- CÓDIGO DE BARRAS -->
                            <div class="col-12 md:col-4">

                                <FloatLabel variant="on" class="w-full">

                                    <InputText id="barcode" v-model="product.barcode" maxlength="25" class="w-full" />

                                    <label for="barcode">
                                        Código de Barras
                                    </label>

                                </FloatLabel>

                                <InlineMessage v-if="errors.barcode" severity="error">
                                    {{ errors.barcode }}
                                </InlineMessage>

                            </div>

                        </div>


                        <!-- ===================================== -->
                        <!-- Tipo/ CATEGORÍA / FAMILIA                   -->
                        <!-- ===================================== -->

                        <div class="grid mt-1">



                            <!-- TIPO DE PRODUCTO -->
                            <div class="col-12 md:col-3">

                                <FloatLabel variant="on">

                                    <Select id="productCategory" v-model="product.productCategoryId"
                                        :options="productCategories" optionLabel="description" optionValue="pkid"
                                        class="w-full" filter />

                                    <label for="productCategory">
                                        Tipo de Producto
                                    </label>

                                </FloatLabel>

                                <InlineMessage v-if="errors.productCategoryId" severity="error">
                                    {{ errors.productCategoryId }}
                                </InlineMessage>
                            </div>




                            <!-- CATEGORÍA -->
                            <div class="col-12 md:col-3">

                                <FloatLabel variant="on">

                                    <Select id="category" v-model="product.categoryId"
                                        :options="filteredProductCategoryTypes" optionLabel="description"
                                        optionValue="pkid" class="w-full" filter />

                                    <label for="category">
                                        Categoría
                                    </label>

                                </FloatLabel>

                                <InlineMessage v-if="errors.categoryId" severity="error">
                                    {{ errors.categoryId }}
                                </InlineMessage>


                            </div>

                            <!-- FAMILIA -->
                            <div class="col-12 md:col-4">

                                <InputGroup>

                                    <FloatLabel variant="on" class="w-full">

                                        <Select id="family" v-model="product.familyId" :options="families"
                                            optionLabel="description" optionValue="pkid" class="w-full" filter />

                                        <label for="family">
                                            Familia
                                        </label>

                                    </FloatLabel>

                                    <Button
                                        v-if="securityStore.hasPermission('PROSER_GEN_0006') && securityStore.hasPermission('PROSER_GEN_0005')"
                                        icon="pi pi-plus" severity="secondary" @click="openNewFamily" />

                                </InputGroup>

                            </div>


                        </div>

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

                            <div class="grid">

                                <!-- UNIDAD DE MEDIDA -->
                                <div class="col-12 md:col-3">

                                    <FloatLabel variant="on">

                                        <Select id="uomSales" v-model="product.uomId" :options="units"
                                            optionLabel="description" optionValue="pkid" class="w-full" filter />

                                        <label for="uomSales">
                                            Unidad de medida
                                        </label>

                                    </FloatLabel>

                                    <InlineMessage v-if="errors.uomId" severity="error">
                                        {{ errors.categoryId }}
                                    </InlineMessage>

                                </div>


                                <!-- PRECIO DE VENTA -->
                                <div class="col-12 md:col-3">

                                    <FloatLabel variant="on">

                                        <InputNumber id="salesPrice" v-model="product.salePrice" class="w-full"
                                            mode="decimal" :minFractionDigits="2" :maxFractionDigits="6" :min="0" />

                                        <label for="salePrice">
                                            Precio de Venta
                                        </label>

                                    </FloatLabel>

                                </div>


                                <!-- IMPUESTO DE VENTAS -->
                                <div class="col-12 md:col-4">

                                    <InputGroup>

                                        <FloatLabel variant="on" class="w-full">

                                            <Select id="salesTax" v-model="product.saleTaxId" :options="salesTaxes"
                                                optionLabel="description" optionValue="pkid" class="w-full" filter />

                                            <label for="salesTax">
                                                Impuesto de Ventas
                                            </label>

                                        </FloatLabel>

                                        <Button v-if="securityStore.hasPermission('PROSER_GEN_0078')" icon="pi pi-plus" severity="secondary" @click="openNewSalesTax" />

                                    </InputGroup>

                                </div>

                            </div>

                        </Panel>

                    </TabPanel>


                    <!-- COMPRAS -->

                    <TabPanel v-if="product.purchase" value="1">



                        <Panel>

                            <div class="grid">

                                <!-- UNIDAD DE MEDIDA -->
                                <div class="col-12 md:col-3">

                                    <FloatLabel variant="on">

                                        <Select id="uomPurchases" v-model="product.uomId" :options="units"
                                            optionLabel="description" optionValue="pkid" class="w-full" filter />

                                        <label for="uomSales">
                                            Unidad de medida
                                        </label>

                                    </FloatLabel>

                                </div>


                                <!-- PRECIO DE COMPRA -->
                                <div class="col-12 md:col-3">

                                    <FloatLabel variant="on">

                                        <InputNumber id="purchasePrice" v-model="product.purchasePrice" class="w-full"
                                            mode="decimal" :minFractionDigits="2" :maxFractionDigits="6" :min="0" />

                                        <label for="purchasePrice">
                                            Precio de Compra
                                        </label>

                                    </FloatLabel>

                                </div>



                                <!-- IMPUESTO DE COMPRAS -->
                                <div class="col-12 md:col-4">

                                    <InputGroup>

                                        <FloatLabel variant="on" class="w-full">

                                            <Select id="purchaseTax" v-model="product.purchaseTaxId"
                                                :options="salesTaxes" optionLabel="description" optionValue="pkid"
                                                class="w-full" filter />

                                            <label for="purchaseTax">
                                                Impuesto de Compras
                                            </label>

                                        </FloatLabel>

                                        <Button v-if="securityStore.hasPermission('PROSER_GEN_0078')" icon="pi pi-plus" severity="secondary" @click="openNewPurchaseTax" />

                                    </InputGroup>

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



    <Frm_FamiliaProductos ref="familiaProductosRef" @saved="handleFamilySaved" />
    <Frm_SalexTaxForm ref="salesTaxFormRef" @saved="handleSalesTaxSaved" />



</template>


<script setup lang="ts">

import { ref, watch, computed } from 'vue';
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
import Frm_FamiliaProductos from '../Frm_Products/Frm_FamiliasProductos/Frm_FamiliaProductos.vue';
import Frm_SalexTaxForm from '../Frm_SalexTax/Frm_SalesTaxForm.vue';

import type { ProductsDTO } from '../../models/ProductsDTO';

const CATEGORY_TYPE_FAMILY = 4;
const toast = useToast();
const companyStore = useCompanyStore();
const securityStore = useSecurityStore();
const salesTaxes = ref<any[]>([]);
const familiaProductosRef = ref();
const visible = ref(false);
const salesTaxFormRef = ref();
const activeTab = ref('0');


const categories = ref<any[]>([]);
const families = ref<any[]>([]);
const units = ref<any[]>([]);
const productCategories = ref<any[]>([]);
const productCategoryTypes = ref<any[]>([]);
const salesTaxFormMode = ref<'sale' | 'purchase' | null>(null);


type Product = {

    pkid: number | null;

    code: string;

    barcode: string;

    description: string;

    descriptionEn: string;

    categoryId: number | null;

    familyId: number | null;

    uomId: number | null;

    sale: boolean;

    purchase: boolean;

    active: boolean;

    image: string | null;

    salesDescription: string;

    purchasesDescription: string;

    dateUp: Date | null;

    salePrice: number | null;

    saleTaxId: number | null;

    purchasePrice: number | null;

    purchaseTaxId: number | null;

    productCategoryId: number | null;



};


const createProduct = (): Product => ({

    pkid: null,
    image: null,

    code: '',

    barcode: '',

    description: '',

    descriptionEn: '',

    categoryId: null,

    familyId: null,

    uomId: null,

    sale: true,

    purchase: false,

    active: true,

    salesDescription: '',

    purchasesDescription: '',

    dateUp: null,

    salePrice: 0,
    saleTaxId: null,

    purchasePrice: 0,

    purchaseTaxId: null,

    productCategoryId: null

});


const product = ref<Product>(createProduct());


type ErrorKey =
    | 'code'
    | 'description'
    | 'descriptionEn'
    | 'dateUp'
    | 'barcode'
    | 'salePrice'
    | 'saleTaxId'
    | 'purchasePrice'
    | 'purchaseTaxId'
    | 'productCategoryId'
    | 'categoryId'


type FormErrors = Record<ErrorKey, string>;


const errors = ref<FormErrors>({
    code: '',
    description: '',
    descriptionEn: '',
    dateUp: '',
    barcode: '',
    salePrice: '',
    saleTaxId: '',
    purchasePrice: '',
    purchaseTaxId: '',
    productCategoryId: '',
    categoryId:''


});


const clearErrors = () => {

    errors.value = {
        code: '',
        description: '',
        descriptionEn: '',
        dateUp: '',
        barcode: '',
        salePrice: '',
        saleTaxId: '',
        purchasePrice: '',
        purchaseTaxId: '',
        productCategoryId: '',
        categoryId:''

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

    await loadCatalogs();
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
            `${import.meta.env.VITE_API_URL}/WebLoadProductCatalog`
        );

        const data = response.data || {};

        categories.value = data.categories || [];
        families.value = categories.value
            .filter(category => category.categoryTypeId === CATEGORY_TYPE_FAMILY)
            .map(category => ({
                pkid: category.pkid,
                description: category.description
            }));

        units.value = data.units || [];
        salesTaxes.value = data.salesTaxes || [];
        productCategories.value = data.productCategories || [];
        productCategoryTypes.value = data.productCategoryTypes || [];

    } catch (error) {

        console.error(error);

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos auxiliares del producto.',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

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






const generateCode = async () => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${baseUrl}/WebGenerateProductCode`);
        // Asignamos el código generado al modelo
        product.value.code = res.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo generar el código automático.',
            life: companyStore.companyInfo.toastDuration ?? 3000
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






const filteredProductCategoryTypes = computed(() => {

    if (!product.value.productCategoryId) {
        return [];
    }

    return productCategoryTypes.value.filter(
        type =>
            type.categoryId === product.value.productCategoryId
    );

});

defineExpose({
    open
});


const openNewFamily = () => {
    familiaProductosRef.value?.open(null);
};


const handleFamilySaved = (family: {
    pkid: number;
    description: string;
}) => {

    families.value.push({
        pkid: family.pkid,
        description: family.description
    });

    product.value.familyId = family.pkid;

};




const openNewSalesTax = () => {

    salesTaxFormMode.value = 'sale';

    salesTaxFormRef.value?.open(null);
};

const openNewPurchaseTax = () => {

    salesTaxFormMode.value = 'purchase';

    salesTaxFormRef.value?.open(null);
};


const handleSalesTaxSaved = (tax: {
    pkid: number;
    description: string;
    value?: number;
}) => {

    salesTaxes.value.push({
        ...tax
    });

    if (salesTaxFormMode.value === 'sale') {

        product.value.saleTaxId = tax.pkid;

    } else if (salesTaxFormMode.value === 'purchase') {

        product.value.purchaseTaxId = tax.pkid;

    }

    salesTaxFormMode.value = null;
};
</script>