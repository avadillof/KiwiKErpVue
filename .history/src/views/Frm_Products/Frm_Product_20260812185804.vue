<template>
    <Dialog v-model:visible="visible" :modal="true" :closable="false" :draggable="false"
        :style="{ width: '900px' }" :header="isEdit ? 'Editar Producto / Servicio' : 'Nuevo Producto / Servicio'">

        <div class="formgrid grid">

            <!-- ====================================================== -->
            <!-- INFORMACIÓN BÁSICA -->
            <!-- ====================================================== -->

            <div class="col-12">
                <Panel header="Información básica" toggleable>
                    <div class="formgrid grid">

                        <!-- Código -->
                        <div class="field col-12 md:col-4">
                            <FloatLabel>
                                <InputText id="code" v-model="form.code" class="w-full"
                                    :class="{ 'p-invalid': errors.code }" />
                                <label for="code">Código *</label>
                            </FloatLabel>

                            <small v-if="errors.code" class="p-error">
                                {{ errors.code }}
                            </small>
                        </div>

                        <!-- Código de barras -->
                        <div class="field col-12 md:col-4">
                            <FloatLabel>
                                <InputText id="barcode" v-model="form.barcode" class="w-full" />
                                <label for="barcode">Código de barras</label>
                            </FloatLabel>
                        </div>

                        <!-- Activo -->
                        <div class="field col-12 md:col-4 flex align-items-center">
                            <div class="flex align-items-center gap-2">
                                <Checkbox id="active" v-model="form.active" :binary="true" />
                                <label for="active">Activo</label>
                            </div>
                        </div>

                        <!-- Descripción ES -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <InputText id="description" v-model="form.description" class="w-full"
                                    :class="{ 'p-invalid': errors.description }" />
                                <label for="description">Descripción *</label>
                            </FloatLabel>

                            <small v-if="errors.description" class="p-error">
                                {{ errors.description }}
                            </small>
                        </div>

                        <!-- Descripción EN -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <InputText id="descriptionEn" v-model="form.descriptionEn" class="w-full" />
                                <label for="descriptionEn">Descripción inglesa</label>
                            </FloatLabel>
                        </div>

                    </div>
                </Panel>
            </div>


            <!-- ====================================================== -->
            <!-- CLASIFICACIÓN -->
            <!-- ====================================================== -->

            <div class="col-12">
                <Panel header="Clasificación" toggleable>
                    <div class="formgrid grid">

                        <!-- Categoría -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <Select id="category" v-model="form.categoryId" :options="categories"
                                    optionLabel="description" optionValue="id" class="w-full"
                                    :class="{ 'p-invalid': errors.categoryId }"
                                    @change="onCategoryChange" />
                                <label for="category">Categoría *</label>
                            </FloatLabel>

                            <small v-if="errors.categoryId" class="p-error">
                                {{ errors.categoryId }}
                            </small>
                        </div>

                        <!-- Familia -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <Select id="family" v-model="form.familyId" :options="families"
                                    optionLabel="description" optionValue="id" class="w-full"
                                    :disabled="!form.categoryId"
                                    :class="{ 'p-invalid': errors.familyId }" />
                                <label for="family">Familia *</label>
                            </FloatLabel>

                            <small v-if="errors.familyId" class="p-error">
                                {{ errors.familyId }}
                            </small>
                        </div>

                    </div>
                </Panel>
            </div>


            <!-- ====================================================== -->
            <!-- UNIDADES DE MEDIDA -->
            <!-- ====================================================== -->

            <div class="col-12">
                <Panel header="Unidades de medida" toggleable>
                    <div class="formgrid grid">

                        <!-- U.M. venta -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <Select id="uom" v-model="form.uomId" :options="uoms"
                                    optionLabel="description" optionValue="id" class="w-full"
                                    :class="{ 'p-invalid': errors.uomId }" />
                                <label for="uom">U.M. de venta *</label>
                            </FloatLabel>

                            <small v-if="errors.uomId" class="p-error">
                                {{ errors.uomId }}
                            </small>
                        </div>

                        <!-- U.M. compra -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <Select id="uomPurchase" v-model="form.uomPurchaseId" :options="uoms"
                                    optionLabel="description" optionValue="id" class="w-full"
                                    :class="{ 'p-invalid': errors.uomPurchaseId }" />
                                <label for="uomPurchase">U.M. de compra *</label>
                            </FloatLabel>

                            <small v-if="errors.uomPurchaseId" class="p-error">
                                {{ errors.uomPurchaseId }}
                            </small>
                        </div>

                    </div>
                </Panel>
            </div>


            <!-- ====================================================== -->
            <!-- UTILIZACIÓN -->
            <!-- ====================================================== -->

            <div class="col-12">
                <Panel header="Utilización" toggleable>
                    <div class="flex flex-wrap gap-4">

                        <div class="flex align-items-center gap-2">
                            <Checkbox id="sale" v-model="form.sale" :binary="true" />
                            <label for="sale">Para vender</label>
                        </div>

                        <div class="flex align-items-center gap-2">
                            <Checkbox id="purchase" v-model="form.purchase" :binary="true" />
                            <label for="purchase">Para comprar</label>
                        </div>

                        <div class="flex align-items-center gap-2">
                            <Checkbox id="fabricate" v-model="form.fabricate" :binary="true" />
                            <label for="fabricate">Para fabricar</label>
                        </div>

                        <div class="flex align-items-center gap-2">
                            <Checkbox id="forRent" v-model="form.forRent" :binary="true" />
                            <label for="forRent">Para alquilar</label>
                        </div>

                    </div>
                </Panel>
            </div>


            <!-- ====================================================== -->
            <!-- PRECIOS E IMPUESTOS -->
            <!-- ====================================================== -->

            <div class="col-12">
                <Panel header="Precios e impuestos" toggleable>
                    <div class="formgrid grid">

                        <!-- Precio venta -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <InputNumber id="defaultSale" v-model="form.defaultSale"
                                    class="w-full" :minFractionDigits="2"
                                    :maxFractionDigits="4" />
                                <label for="defaultSale">Precio de venta por defecto</label>
                            </FloatLabel>
                        </div>

                        <!-- Impuesto venta -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <Select id="salesTax" v-model="form.salesTaxId" :options="salesTaxes"
                                    optionLabel="description" optionValue="id" class="w-full" />
                                <label for="salesTax">Impuesto de venta</label>
                            </FloatLabel>
                        </div>

                        <!-- Precio compra -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <InputNumber id="defaultPurchase" v-model="form.defaultPurchase"
                                    class="w-full" :minFractionDigits="2"
                                    :maxFractionDigits="4" />
                                <label for="defaultPurchase">Precio de compra por defecto</label>
                            </FloatLabel>
                        </div>

                        <!-- Impuesto compra -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <Select id="purchaseTax" v-model="form.purchaseTaxId" :options="salesTaxes"
                                    optionLabel="description" optionValue="id" class="w-full" />
                                <label for="purchaseTax">Impuesto de compra</label>
                            </FloatLabel>
                        </div>

                    </div>
                </Panel>
            </div>


            <!-- ====================================================== -->
            <!-- CARACTERÍSTICAS -->
            <!-- ====================================================== -->

            <div class="col-12">
                <Panel header="Características" toggleable>
                    <div class="formgrid grid">

                        <!-- Peso -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <InputNumber id="weight" v-model="form.weight"
                                    class="w-full" :minFractionDigits="0"
                                    :maxFractionDigits="4" />
                                <label for="weight">Peso</label>
                            </FloatLabel>
                        </div>

                        <!-- Dimensión -->
                        <div class="field col-12 md:col-6">
                            <FloatLabel>
                                <InputNumber id="dimension" v-model="form.dimension"
                                    class="w-full" :minFractionDigits="0"
                                    :maxFractionDigits="4" />
                                <label for="dimension">Dimensión</label>
                            </FloatLabel>
                        </div>

                    </div>
                </Panel>
            </div>


            <!-- ====================================================== -->
            <!-- NOTAS -->
            <!-- ====================================================== -->

            <div class="col-12">
                <Panel header="Notas" toggleable>
                    <Textarea v-model="form.notes" rows="4" class="w-full"
                        placeholder="Notas del producto o servicio..." />
                </Panel>
            </div>

        </div>


        <!-- ====================================================== -->
        <!-- FOOTER -->
        <!-- ====================================================== -->

        <template #footer>

            <Button label="Cancelar" icon="pi pi-times" severity="secondary"
                text @click="close" />

            <Button label="Guardar" icon="pi pi-check"
                :loading="saving" @click="save" />

        </template>

        <div class="kiwik-separator" style="margin-top: 10px;"></div>

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