<template>

    <Dialog
        v-model:visible="visible"
        modal
        :header="product.pkid ? 'Editar Producto / Servicio' : 'Nuevo Producto / Servicio'"
        :style="{ width: '95%', height: '95%' }"
        class="kiwik-dialog"
        :dismissableMask="true"
        :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }"
    >

        <div style="max-height:80vh; overflow-y:auto">

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


                <div class="grid p-fluid mb-4">

                    <!-- CÓDIGO -->
                    <div class="col-12 md:col-2">

                        <FloatLabel variant="on" class="w-full">

                            <InputText
                                id="code"
                                v-model="product.code"
                                maxlength="45"
                                class="w-full"
                                :disabled="!!product.pkid"
                            />

                            <label for="code">
                                Código
                            </label>

                        </FloatLabel>

                        <InlineMessage
                            v-if="errors.code"
                            severity="error"
                        >
                            {{ errors.code }}
                        </InlineMessage>

                    </div>


                    <!-- DESCRIPCIÓN -->
                    <div class="col-12 md:col-6">

                        <FloatLabel variant="on" class="w-full">

                            <InputText
                                id="description"
                                v-model="product.description"
                                maxlength="255"
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


                    <!-- ACTIVO -->
                    <div class="col-12 md:col-2">

                        <div class="flex align-items-center gap-2 mt-3">

                            <Checkbox
                                id="active"
                                v-model="product.active"
                                binary
                            />

                            <label for="active">
                                ¿ Activo ?
                            </label>

                        </div>

                    </div>

                </div>


                <!-- CATEGORIA / FAMILIA / U.M. -->

                <div class="grid p-fluid mt-3">

                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <Select
                                id="category"
                                v-model="product.categoryId"
                                :options="categories"
                                optionLabel="description"
                                optionValue="pkid"
                                class="w-full"
                                filter
                            />

                            <label for="category">
                                Categoría
                            </label>

                        </FloatLabel>

                    </div>


                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <Select
                                id="family"
                                v-model="product.familyId"
                                :options="families"
                                optionLabel="description"
                                optionValue="pkid"
                                class="w-full"
                                filter
                            />

                            <label for="family">
                                Familia
                            </label>

                        </FloatLabel>

                    </div>


                    <div class="col-12 md:col-4">

                        <FloatLabel variant="on">

                            <Select
                                id="uom"
                                v-model="product.uomId"
                                :options="units"
                                optionLabel="description"
                                optionValue="pkid"
                                class="w-full"
                                filter
                            />

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

            <Panel
                style="margin-top: 20px; margin-bottom: 20px;"
            >

                <template #header>

                    <div class="flex align-items-center gap-2">

                        <div
                            class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;"
                        >
                            <i class="pi pi-shopping-cart text-primary"></i>
                        </div>

                        <span class="font-bold">
                            Configuración Comercial.
                        </span>

                    </div>

                </template>


                <div class="grid p-fluid">

                    <div class="col-12 md:col-3">

                        <div
                            class="flex align-items-center gap-2"
                        >

                            <Checkbox
                                id="sale"
                                v-model="product.sale"
                                binary
                            />

                            <label for="sale">
                                ¿ Para vender ?
                            </label>

                        </div>

                    </div>


                    <div class="col-12 md:col-3">

                        <div
                            class="flex align-items-center gap-2"
                        >

                            <Checkbox
                                id="purchase"
                                v-model="product.purchase"
                                binary
                            />

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

            <Tabs
                v-if="product.sale || product.purchase"
                v-model:value="activeTab"
                style="min-height: 400px;"
            >

                <TabList>

                    <Tab
                        v-if="product.sale"
                        value="0"
                    >
                        <div class="flex align-items-center">

                            <i
                                class="pi pi-shopping-cart text-primary mr-2"
                                style="font-size: 1.3rem"
                            />

                            <h4 class="m-0 text-primary font-semibold">
                                Parámetros de Ventas.
                            </h4>

                        </div>
                    </Tab>


                    <Tab
                        v-if="product.purchase"
                        value="1"
                    >
                        <div class="flex align-items-center">

                            <i
                                class="pi pi-briefcase text-primary mr-2"
                                style="font-size: 1.3rem"
                            />

                            <h4 class="m-0 text-primary font-semibold">
                                Parámetros de Compras.
                            </h4>

                        </div>
                    </Tab>

                </TabList>


                <TabPanels>

                    <!-- VENTAS -->

                    <TabPanel
                        v-if="product.sale"
                        value="0"
                    >

                        <Panel>

                            <!-- Aquí pondremos los parámetros de venta -->

                            <div class="grid">

                                <div class="col-12 md:col-4">

                                    <FloatLabel variant="on">

                                        <InputText
                                            v-model="product.salesDescription"
                                            class="w-full"
                                        />

                                        <label>
                                            Descripción para ventas
                                        </label>

                                    </FloatLabel>

                                </div>

                            </div>

                        </Panel>

                    </TabPanel>


                    <!-- COMPRAS -->

                    <TabPanel
                        v-if="product.purchase"
                        value="1"
                    >

                        <Panel>

                            <!-- Aquí pondremos los parámetros de compra -->

                            <div class="grid">

                                <div class="col-12 md:col-4">

                                    <FloatLabel variant="on">

                                        <InputText
                                            v-model="product.purchasesDescription"
                                            class="w-full"
                                        />

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

            <Button
                v-if="securityStore.hasPermission('PROSER_GEN_0002')"
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

import { ref, reactive, computed } from 'vue';

import Dialog from 'primevue/dialog';
import Panel from 'primevue/panel';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import Button from 'primevue/button';

import { useToast } from 'primevue/usetoast';

import { useCompanyStore } from '@/stores/companyStore';


/*
 * ============================================================
 * PROPS / EMITS
 * ============================================================
 */

const emit = defineEmits<{
    saved: [];
}>();


/*
 * ============================================================
 * ESTADO
 * ============================================================
 */

const visible = ref(false);
const saving = ref(false);

const editingId = ref<number | null>(null);

const toast = useToast();
const companyStore = useCompanyStore();


const isEdit = computed(() => editingId.value !== null);


/*
 * ============================================================
 * MODELO DEL FORMULARIO
 * ============================================================
 */

const createEmptyForm = () => ({
    code: '',
    description: '',
    descriptionEn: '',

    barcode: '',

    active: true,

    categoryId: null as number | null,
    familyId: null as number | null,

    uomId: null as number | null,
    uomPurchaseId: null as number | null,

    sale: false,
    purchase: false,
    fabricate: false,
    forRent: false,

    defaultSale: 0,
    defaultPurchase: 0,

    salesTaxId: null as number | null,
    purchaseTaxId: null as number | null,

    weight: 0,
    dimension: 0,

    notes: ''
});


const form = reactive(createEmptyForm());


/*
 * ============================================================
 * DATOS DE LOS COMBOS
 * ============================================================
 *
 * Temporalmente vacíos.
 * Los conectaremos posteriormente con sus endpoints reales.
 */

const categories = ref<any[]>([]);
const families = ref<any[]>([]);
const uoms = ref<any[]>([]);
const salesTaxes = ref<any[]>([]);


/*
 * ============================================================
 * ERRORES
 * ============================================================
 */

const errors = reactive<Record<string, string>>({});


const clearErrors = () => {

    Object.keys(errors).forEach(key => {
        delete errors[key];
    });

};


/*
 * ============================================================
 * ABRIR FORMULARIO
 * ============================================================
 *
 * null -> Nuevo
 * objeto -> Edición
 */

function open(product: any = null) {

    clearErrors();

    Object.assign(form, createEmptyForm());

    if (product) {

        editingId.value = product.pkid;

        form.code = product.code ?? '';
        form.description = product.description ?? '';
        form.descriptionEn = product.descriptionEn ?? '';

        form.barcode = product.barcode ?? '';

        form.active = product.active ?? true;

        form.categoryId = product.categoryId ?? null;
        form.familyId = product.familyId ?? null;

        form.uomId = product.uomId ?? null;
        form.uomPurchaseId = product.uomPurchaseId ?? null;

        form.sale = product.sale ?? false;
        form.purchase = product.purchase ?? false;
        form.fabricate = product.fabricate ?? false;
        form.forRent = product.forRent ?? false;

        form.defaultSale = product.defaultSale ?? 0;
        form.defaultPurchase = product.defaultPurchase ?? 0;

        form.salesTaxId = product.salesTaxId ?? null;
        form.purchaseTaxId = product.purchaseTaxId ?? null;

        form.weight = product.weight ?? 0;
        form.dimension = product.dimension ?? 0;

        form.notes = product.notes ?? '';

    } else {

        editingId.value = null;

    }

    visible.value = true;
}


/*
 * ============================================================
 * CAMBIO DE CATEGORÍA
 * ============================================================
 */

function onCategoryChange() {

    form.familyId = null;

    /*
     * Posteriormente:
     *
     * WebGetProductCategoriesTypes
     *
     * enviando categoryId.
     */

}


/*
 * ============================================================
 * VALIDACIÓN
 * ============================================================
 */

function validate(): boolean {

    clearErrors();

    let valid = true;

    if (!form.code.trim()) {
        errors.code = 'El código es obligatorio';
        valid = false;
    }

    if (!form.description.trim()) {
        errors.description = 'La descripción es obligatoria';
        valid = false;
    }

    if (!form.categoryId) {
        errors.categoryId = 'La categoría es obligatoria';
        valid = false;
    }

    if (!form.familyId) {
        errors.familyId = 'La familia es obligatoria';
        valid = false;
    }

    if (!form.uomId) {
        errors.uomId = 'La unidad de medida es obligatoria';
        valid = false;
    }

    if (!form.uomPurchaseId) {
        errors.uomPurchaseId = 'La unidad de medida de compra es obligatoria';
        valid = false;
    }

    return valid;
}


/*
 * ============================================================
 * GUARDAR
 * ============================================================
 */

async function save() {

    if (!validate()) {
        return;
    }

    saving.value = true;

    try {

        const payload = {
            pkid: editingId.value,

            code: form.code.trim(),
            description: form.description.trim(),
            descriptionEn: form.descriptionEn.trim(),

            barcode: form.barcode?.trim() || null,

            active: form.active,

            categoryId: form.categoryId,
            familyId: form.familyId,

            uomId: form.uomId,
            uomPurchaseId: form.uomPurchaseId,

            sale: form.sale,
            purchase: form.purchase,
            fabricate: form.fabricate,
            forRent: form.forRent,

            defaultSale: form.defaultSale ?? 0,
            defaultPurchase: form.defaultPurchase ?? 0,

            salesTaxId: form.salesTaxId,
            purchaseTaxId: form.purchaseTaxId,

            weight: form.weight ?? 0,
            dimension: form.dimension ?? 0,

            notes: form.notes?.trim() || null
        };


        /*
         * Endpoint pendiente de conectar.
         *
         * const response = await fetch(
         *     `${import.meta.env.VITE_API_URL}/WebSaveProduct`,
         *     {
         *         method: 'POST',
         *         headers: {
         *             'Content-Type': 'application/json'
         *         },
         *         body: JSON.stringify(payload)
         *     }
         * );
         */


        console.log('Producto a guardar:', payload);


        toast.add({
            severity: 'success',
            summary: isEdit.value ? 'Producto actualizado' : 'Producto creado',
            detail: isEdit.value
                ? 'El producto se ha actualizado correctamente'
                : 'El producto se ha creado correctamente',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

        emit('saved');

        close();

    } catch (error) {

        console.error(error);

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar el Producto/Servicio',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

    } finally {

        saving.value = false;

    }
}


/*
 * ============================================================
 * CERRAR
 * ============================================================
 */

function close() {

    visible.value = false;

}


/*
 * ============================================================
 * API PÚBLICA DEL COMPONENTE
 * ============================================================
 */

defineExpose({
    open,
    close
});

</script>