<template>
    <Dialog v-model:visible="visible" modal :header="entity.pkid ? 'Editar Entidad' : 'Nueva Entidad'"
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
                                <InputText :ref="(el) => setRef('code', el)" maxlength="45" id="dsCode"
                                    v-model="entity.code" class="w-full" :disabled="!!entity.pkid" />
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
                            <InputText :ref="(el) => setRef('name', el)" maxlength="120" id="dsName"
                                v-model="entity.name" class="w-full" required />
                            <label for="dsName">Nombre / Razón Social</label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.name" severity="error">
                            {{ errors.name }}
                        </InlineMessage>
                    </div>


                    <div class="col-12 md:col-2">
                        <FloatLabel variant="on" class="w-full">
                            <InputText :ref="(el) => setRef('cif', el)" maxlength="38" id="dsCif" v-model="entity.cif"
                                class="w-full" />
                            <label for="dsCif">CIF / NIf</label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.cif" severity="error">
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
                            <DatePicker :ref="(el) => setRef('fechaalta', el)" id="dateUp" v-model="entity.dateUp"
                                class="w-full" showIcon iconDisplay="input" dateFormat="dd/mm/yy" />
                            <label for="dateUp">Fecha de Alta</label>
                        </FloatLabel>
                        <InlineMessage v-if="errors.fechaalta" severity="error">
                            {{ errors.fechaalta }}
                        </InlineMessage>
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
                            <InlineMessage v-if="errors.web" severity="error">
                                {{ errors.web }}
                            </InlineMessage>
                        </div>


                        <div class="col-12 md:col-4 mb-2">
                            <InputGroup>
                                <FloatLabel variant="on" class="w-full">
                                    <InputText :ref="(el) => setRef('mail', el)" id="email" v-model="entity.email"
                                        class="w-full" />
                                    <label for="web">EMail</label>
                                </FloatLabel>
                                <Button icon="pi pi-envelope" severity="secondary" @click="openEmail"
                                    :disabled="!entity.email" />
                            </InputGroup>
                            <InlineMessage v-if="errors.mail" severity="error">
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

                        <Panel>

                            <div class="grid">

                                <!-- CONDICIONES DE PAGO -->
                                <div class="col-12 md:col-4 mb-3">

                                    <FloatLabel>

                                        <KiwiLookup id="terminoventas" v-model="entity.salesAttributes.salesTermId"
                                            title="Seleccionar la Condición de Pago" placeholder="Condición de pago..."
                                            dataKey="id" :items="terms" displayField="descriptionEs"
                                            :columns="termsColumns" :ref="(el) => setRef('terminoventas', el)">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    Vencimiento a {{ item.value }} días
                                                </div>
                                            </template>
                                        </KiwiLookup>
                                        <InlineMessage v-if="errors.terminoventas" severity="error">
                                            {{ errors.terminoventas }}
                                        </InlineMessage>

                                    </FloatLabel>
                                </div>

                                <!-- TARIFA -->
                                <div class="col-12 md:col-4">
                                    <FloatLabel>

                                        <KiwiLookup v-model="entity.salesAttributes.salesTarifaId"
                                            :ref="(el) => setRef('tarifasventas', el)" title="Seleccionar tarifa"
                                            placeholder="Seleccione una tarifa..." dataKey="salesTarifasPkId"
                                            :items="tarifas" displayField="salesTarifasDsCode" :columns="tarifaColumns">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    {{ item.coin?.code }} -
                                                    {{ item.salesTarifasDsDescriptionEs }}
                                                </div>
                                            </template>
                                        </KiwiLookup>
                                        <InlineMessage v-if="errors.tarifasventas" severity="error">
                                            {{ errors.tarifasventas }}
                                        </InlineMessage>

                                    </FloatLabel>
                                </div>

                                <!-- BANCO -->
                                <div class="col-12 md:col-4">
                                    <FloatLabel>


                                        <KiwiLookup v-model="entity.salesAttributes.bankId"
                                            title="Seleccionar Cuenta Bancaria" placeholder="Seleccione una Cuenta..."
                                            dataKey="bankId" :items="banks" displayField="ibam" :columns="banksColumns">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    {{ item.description }} - {{ item.sucursal }}
                                                </div>
                                            </template>
                                        </KiwiLookup>




                                    </FloatLabel>
                                </div>

                            </div>


                            <div class="grid">
                                <!-- RETENCIÓN -->
                                <div class="col-12 md:col-4">
                                    <FloatLabel>
                                        <KiwiLookup v-model="entity.salesAttributes.retentionId"
                                            title="Retención a Aplicar" placeholder="Retención a Aplicar..."
                                            dataKey="id" :items="retentions" displayField="description"
                                            :columns="retentionsColumns">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    Retención a cuenta de {{ item.value }} %
                                                </div>
                                            </template>

                                        </KiwiLookup>



                                    </FloatLabel>
                                </div>

                            </div>

                            <div class="grid mt-4">

                                <!-- DÍAS DE PAGO -->
                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.salesAttributes.dayPago1" class="w-full" />
                                        <label>Día pago 1</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.salesAttributes.dayPago2" class="w-full" />
                                        <label>Día pago 2</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.salesAttributes.dayPago3" class="w-full" />
                                        <label>Día pago 3</label>
                                    </FloatLabel>
                                </div>


                            </div>
                            <div class="grid mt-4 mt-2">
                                <!-- SEPA -->
                                <div class="col-12 md:col-6">
                                    <FloatLabel>
                                        <InputText v-model="entity.salesAttributes.sepa" class="w-full"
                                            :ref="(el) => setRef('sepa', el)" />
                                        <label>SEPA (BIC/SWIFT) Cuenta Principal</label>
                                    </FloatLabel>
                                    <InlineMessage v-if="errors.sepa" severity="error">
                                        {{ errors.sepa }}
                                    </InlineMessage>

                                </div>

                                <div class="col-12 md:col-6">
                                    <FloatLabel>
                                        <InputText v-model="entity.salesAttributes.sepa1" class="w-full" :ref="(el) => setRef('sepa2', el)" />
                                        <label>SEPA (BIC/SWIFT) Cuenta Secundaria</label>
                                    </FloatLabel>
                                    <InlineMessage v-if="errors.sepa2" severity="error">
                                        {{ errors.sepa2 }}
                                    </InlineMessage>
                                </div>

                            </div>

                        </Panel>

                    </TabPanel>





                    <TabPanel value="1">
                        <Panel>

                            <div class="grid">

                                <!-- CONDICIONES DE COBRO -->
                                <div class="col-12 md:col-4 mb-3">

                                    <FloatLabel>

                                        <KiwiLookup id="terminoventas" v-model="entity.purchasesAttributes.purchasesTermId"
                                            title="Seleccionar la Condición de Cobro" placeholder="Condición de cobro..."
                                            dataKey="id" :items="terms" displayField="descriptionEs"
                                            :columns="termsColumns" :ref="(el) => setRef('terminocompras', el)">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    Vencimiento a {{ item.value }} días
                                                </div>
                                            </template>
                                        </KiwiLookup>
                                        <InlineMessage v-if="errors.terminocompras" severity="error">
                                            {{ errors.terminocompras }}
                                        </InlineMessage>

                                    </FloatLabel>
                                </div>

                                <!-- TARIFA -->
                                <div class="col-12 md:col-4">
                                    <FloatLabel>

                                        <KiwiLookup v-model="entity.purchasesAttributes.purchasesTarifaId"
                                            :ref="(el) => setRef('tarifascompras', el)" title="Seleccionar tarifa"
                                            placeholder="Seleccione una tarifa..." dataKey="purchasesTarifasPkId"
                                            :items="tarifas" displayField="purchasesTarifasDsCode" :columns="tarifaColumns">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    {{ item.coin?.code }} -
                                                    {{ item.salesTarifasDsDescriptionEs }}
                                                </div>
                                            </template>
                                        </KiwiLookup>
                                        <InlineMessage v-if="errors.tarifascompras" severity="error">
                                            {{ errors.tarifascompras }}
                                        </InlineMessage>

                                    </FloatLabel>
                                </div>

                                <!-- BANCO -->
                                <div class="col-12 md:col-4">
                                    <FloatLabel>
                                        <KiwiLookup v-model="entity.purchasesAttributes.bankId"
                                            title="Seleccionar Cuenta Bancaria" placeholder="Seleccione una Cuenta..."
                                            dataKey="bankId" :items="banks" displayField="ibam" :columns="banksColumns">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    {{ item.description }} - {{ item.sucursal }}
                                                </div>
                                            </template>
                                        </KiwiLookup>
                                    </FloatLabel>
                                </div>

                            </div>


                            <div class="grid">
                                <!-- RETENCIÓN -->
                                <div class="col-12 md:col-4">
                                    <FloatLabel>
                                        <KiwiLookup v-model="entity.purchasesAttributes.retentionId"
                                            title="Retención a Aplicar" placeholder="Retención a Aplicar..."
                                            dataKey="id" :items="retentions" displayField="description"
                                            :columns="retentionsColumns">
                                            <template #secondary="{ item }">
                                                <div v-if="item" class="text-500 text-sm">
                                                    Retención a cuenta de {{ item.value }} %
                                                </div>
                                            </template>
                                        </KiwiLookup>
                                    </FloatLabel>
                                </div>

                            </div>

                            <div class="grid mt-4">

                                <!-- DÍAS DE PAGO -->
                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.purchasesAttributes.dayPago1" class="w-full" />
                                        <label>Día pago 1</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.purchasesAttributes.dayPago2" class="w-full" />
                                        <label>Día pago 2</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.purchasesAttributes.dayPago3" class="w-full" />
                                        <label>Día pago 3</label>
                                    </FloatLabel>
                                </div>


                            </div>
                            <div class="grid mt-4 mt-2">
                                <!-- SEPA -->
                                <div class="col-12 md:col-6">
                                    <FloatLabel>
                                        <InputText v-model="entity.purchasesAttributes.sepa" class="w-full"
                                            :ref="(el) => setRef('sepapruchases', el)" />
                                        <label>SEPA (BIC/SWIFT) Cuenta Principal</label>
                                    </FloatLabel>
                                    <InlineMessage v-if="errors.sepapurchases" severity="error">
                                        {{ errors.sepapurchases }}
                                    </InlineMessage>

                                </div>

                                <div class="col-12 md:col-6">
                                    <FloatLabel>
                                        <InputText v-model="entity.purchasesAttributes.sepa1" class="w-full" />
                                        <label>SEPA (BIC/SWIFT) Cuenta Secundaria</label>
                                    </FloatLabel>
                                    <InlineMessage v-if="errors.sepapurchases2" severity="error">
                                        {{ errors.sepapurchases2 }}
                                    </InlineMessage>
                                    
                                </div>
                            </div>

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
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import { useFormValidator } from '../../../libs/HelperView';
import { HelperDates } from '../../../libs/HelperDates';
import { HelperString } from '@/libs/HelperString';
import { provincias } from '@/data/provinces';
import { countries } from '@/data/paises';
import { useCompanyStore } from '../../../stores/companyStore';
import type { KiwiLookupColumn } from '../../../components/shared/KiwiLookup/KiwiLookupColumn';

/* =========================
   HELPERS
========================= */
const toast = useToast();
const { setRef, scrollToError } = useFormValidator();
const companyStore = useCompanyStore();

/* =========================
   UI STATE
========================= */
const visible = ref(false);
const activeTab = ref('0');



/* =========================
   FOREING DATA
========================= */

const terms = ref([]);
const banks = ref([]);
const retentions = ref([]);



interface Tarifa {
    salesTarifasPkId: number;
    salesTarifasDsCode: string;
    salesTarifasDsDescriptionEs: string;
    salesTarifasDsDescriptionUk: string;
}


const tarifas = ref<Tarifa[]>([]);




const tarifaColumns: KiwiLookupColumn[] = [
    {
        field: 'salesTarifasDsCode',
        header: 'Código',
        width: '180px'
    },
    {
        field: 'salesTarifasDsDescriptionEs',
        header: 'Descripción'
    },
    {
        field: 'coin.code',
        header: 'Moneda'
    }
];



const termsColumns: KiwiLookupColumn[] = [
    {
        field: 'descriptionEs',
        header: 'Código',
        width: '180px'
    }
];

const retentionsColumns: KiwiLookupColumn[] = [
    {
        field: 'description',
        header: 'Código',
        width: '180px'
    },
    {
        field: 'value',
        header: '%',
        width: '80px'
    }
];




const banksColumns: KiwiLookupColumn[] = [
    {
        field: 'description',
        header: 'Descripción',
        width: '200px'
    },

    {
        field: 'ibam',
        header: 'IBAM',
        width: '180px'
    }

];



/* =========================
   MODELO DE DATOS
========================= */

type Entity = {
    pkid: number | null;

    code: string;
    name: string;
    cif: string;

    active: boolean;
    isclient: boolean;
    isprove: boolean;

    dateUp: Date | null;

    // dirección
    address: string;
    address2: string;
    province: string;
    zipcode: string;
    city: string;
    country: string;
    phone: string;

    // contacto
    web: string;
    email: string;

    salesAttributes: {
        salesTermId: number | null;
        salesTarifaId: number | null;
        retentionId: number | null;
        bankId: number | null;
        sepa: string;
        sepa1: string;
        dayPago1: number;
        dayPago2: number;
        dayPago3: number;
    };


    purchasesAttributes: {
        purchasesTermId: number | null;
        purchasesTarifaId: number | null;
        retentionId: number | null;
        bankId: number | null;
        sepa: string;
        sepa1: string;
        dayPago1: number;
        dayPago2: number;
        dayPago3: number;
    };

};


/* =========================
   INIT ENTITY (CORRECTO)
========================= */
const createEntity = (): Entity => ({
    pkid: null,
    code: '',
    name: '',
    cif: '',
    active: true,
    isclient: false,
    isprove: false,
    dateUp: null,
    address: '',
    address2: '',
    province: '',
    zipcode: '',
    city: '',
    country: '',
    phone: '',
    web: '',
    email: '',

   
    salesAttributes: {
        salesTermId: null,
        salesTarifaId: null,
        retentionId: null,
        bankId: null,
        sepa: '',
        sepa1: '',
        dayPago1: 0,
        dayPago2: 0,
        dayPago3: 0
    } ,

    purchasesAttributes: {
        purchasesTermId: null,
        purchasesTarifaId: null,
        retentionId: null,
        bankId: null,
        sepa: '',
        sepa1: '',
        dayPago1: 0,
        dayPago2: 0,
        dayPago3: 0
    }

});

const entity = ref<Entity>(createEntity());

/* =========================
   ERRORS
========================= */

type ErrorKey =
    | 'code'
    | 'name'
    | 'cif'
    | 'web'
    | 'mail'
    | 'fechaalta'
    | 'terminoventas'
    | 'tarifasventas'
    | 'sepa'
    | 'sepa2'
    | 'sepapurchases'
    | 'sepapurchases2'
    | 'tarifascompras'
    | 'terminocompras'
    ;

type FormErrors = Record<ErrorKey, string>;


const errors = ref<FormErrors>({
    code: '',
    name: '',
    cif: '',
    web: '',
    mail: '',
    fechaalta: '',
    terminoventas: '',
    tarifasventas: '',
    sepa: '',
    sepa2: '',
    sepapurchases: '',
    sepapurchases2: '',
    tarifascompras: '',
    terminocompras: ''
});

const clearErrors = () => {
    errors.value = {
        code: '',
        name: '',
        cif: '',
        web: '',
        mail: '',
        fechaalta: '',
        terminoventas: '',
        tarifasventas: '',
        sepa: '',
        sepa2: '',
        sepapurchases: '',
        sepapurchases2: '',
        tarifascompras:'',
        terminocompras:''
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

    if (!entity.value.code?.trim()) setError('code', 'Obligatorio');
    if (!entity.value.name?.trim()) setError('name', 'Obligatorio');
    if (!entity.value.cif?.trim()) {
        setError('cif', 'Obligatorio');
    } else if (!HelperString.isValidCifNif(entity.value.cif)) {
        setError('cif', 'Inválido');
    }

    if (!entity.value.dateUp) setError('fechaalta', 'Obligatorio');

    if (entity.value.web && !HelperString.isValidUrl(entity.value.web)) {
        setError('web', 'URL inválida');
    }

    if (entity.value.email && !HelperString.isValidEmail(entity.value.email)) {
        setError('mail', 'Email inválido');
    }

    if (entity.value.isclient) {

        if (entity.value.salesAttributes.salesTermId == null) {
            setError('terminoventas', 'Obligatorio para Clientes');
        }

        if (entity.value.salesAttributes.salesTarifaId == null) {
            setError('tarifasventas', 'Obligatorio para Clientes');
        }
        if (!entity.value.salesAttributes.sepa?.trim()) {
            
        } else if (!HelperString.isValidBic(entity.value.salesAttributes.sepa)) {
            setError('sepa', 'Cuenta SEPA Principal no correcta');
        }
    }


    if (entity.value.isprove) {
        if (entity.value.purchasesAttributes.purchasesTermId == null) {
            setError('terminocompras', 'Obligatorio para Proveedores');
        }

        if (entity.value.salesAttributes.salesTarifaId == null) {
            setError('terminocompras', 'Obligatorio para Proveedores');
        }
        if (!entity.value.purchasesAttributes.sepa?.trim()) {            
        } else if (!HelperString.isValidBic(entity.value.purchasesAttributes.sepa)) {
            setError('sepa', 'Cuenta SEPA Principal no correcta');
        }

        if (!entity.value.purchasesAttributes.sepa?.trim()) {            
        } else if (!HelperString.isValidBic(entity.value.purchasesAttributes.sepa)) {
            setError('sepa', 'Cuenta SEPA Principal no correcta');
        }
    }


    if (!valid && firstError) {
        await scrollToError(firstError);
    }

    return valid;
};

/* =========================
   OPEN
========================= */
const open = async (pkid?: number) => {
    clearErrors();
    visible.value = true;

    await loadSalesCatalogs();

    if (!pkid) {
        entity.value = createEntity();
        return;
    }

    await loadEntity(pkid);
};

/* =========================
   LOAD
========================= */
const loadEntity = async (pkid: number) => {
    const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/WebGetClient`,
        { params: { pkid } }
    );

    const data = res.data;

    entity.value = {
        ...createEntity(),
        ...data,

        dateUp: data.dateUp ? new Date(data.dateUp) : null,

        // 🔥 CLAVE: asegurar estructura hija
        salesAttributes: {
            salesTermId: data.salesAttributes?.salesTermId ?? null,
            salesTarifaId: data.salesAttributes?.salesTarifaId ?? null,

            retentionId: data.salesAttributes?.retentionId ?? null,
            bankId: data.salesAttributes?.bankId ?? null,

            sepa: data.salesAttributes?.sepa ?? '',
            sepa1: data.salesAttributes?.sepa1 ?? '',

            dayPago1: data.salesAttributes?.dayPago1 ?? 0,
            dayPago2: data.salesAttributes?.dayPago2 ?? 0,
            dayPago3: data.salesAttributes?.dayPago3 ?? 0
        }
    };
};



const loadSalesCatalogs = async () => {
    const base = import.meta.env.VITE_API_URL;

    const res = await axios.get(`${base}/loadSalesCatalog`);
    const data = res.data || {};

    tarifas.value = data.tarifas || [];
    terms.value = data.terms || [];
    banks.value = data.banks || [];
    retentions.value = data.retentions || [];
};


/* =========================
   SAVE
========================= */
const save = async () => {
    if (!(await validate())) return;

    const payload = {
        ...entity.value,
        dateUp: HelperDates.formatDateObjectNoTime(entity.value.dateUp)
    };

    await axios.post(
        `${import.meta.env.VITE_API_URL}/WebSaveClient`,
        payload
    );

    toast.add({
        severity: 'success',
        summary: 'Guardado correctamente',
        life: 3000
    });

    visible.value = false;
};

/* =========================
   ACTIONS
========================= */
const openLink = () => {
    if (entity.value.web) window.open(entity.value.web, '_blank');
};

const openEmail = () => {
    if (entity.value.email)
        window.location.href = `mailto:${entity.value.email}`;
};

const generateCode = async () => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${baseUrl}/WebGenerateUserCode`);
        // Asignamos el código generado al modelo
        entity.value.code = res.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo generar el código automático.',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
    }
};

/* =========================
   WATCHERS
========================= */
watch(() => entity.value.isclient, (v) => {
    if (v) activeTab.value = '0';
});

watch(() => entity.value.isprove, (v) => {
    if (v) activeTab.value = '1';
});

/* =========================
   EXPOSE
========================= */
defineExpose({ open });
</script>