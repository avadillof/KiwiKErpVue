<template>



    <Dialog v-model:visible="visible" modal :header="tax.pkid ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '42rem' }" class="kiwik-dialog" :dismissableMask="true" :pt="{
            content: {
                class: 'overflow-y-auto'
            }
        }">




        <template #header>
            <div class="flex align-items-center gap-2">
                <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                    style="width: 32px; height: 32px;">
                    <i class="pi pi-info text-primary"></i>
                </div>
                <span class="font-bold">Datos Generales.</span>
            </div>
        </template>

        <div style="max-height:80vh; overflow-y:auto">

            <Panel style="margin-top: 20px;margin-bottom: 20px; ">

                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-home text-primary"></i>
                        </div>
                        <span class="font-bold">Dirección Principal.</span>
                    </div>
                </template>

                <div class="formgrid grid mt-2">

                    <div class="field col-12">
                        <FloatLabel variant="on">
                            <InputText id="description" v-model="tax.description" class="w-full" />
                            <label for="description">Descripción *</label>
                        </FloatLabel>
                    </div>

                    <div class="field col-12">
                        <FloatLabel variant="on">
                            <InputText id="descriptionEn" v-model="tax.descriptionEn" class="w-full" />
                            <label for="descriptionEn">Descripción Inglés *</label>
                        </FloatLabel>
                    </div>

                    <div class="field col-12 md:col-6">
                        <FloatLabel variant="on">
                            <InputNumber id="value" v-model="tax.value" mode="decimal" :minFractionDigits="2"
                                :maxFractionDigits="2" class="w-full" />
                            <label for="value">Valor (%) *</label>
                        </FloatLabel>
                    </div>

                    <div class="field col-12 md:col-6 flex align-items-center">
                        <Checkbox id="active" v-model="tax.active" binary />
                        <label for="active" class="ml-2">
                            Activo
                        </label>
                    </div>

                </div>


            </Panel>


        </div>





        <template #footer>

            <Button label="Cancelar" severity="secondary" outlined />

            <Button label="Guardar" icon="pi pi-save" />

        </template>
        <div class="kiwik-separator"></div>
    </Dialog>

</template>





































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




            <Panel style="margin-top: 20px;margin-bottom: 20px; ">

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



            <Tabs v-if="entity.isclient || entity.isprove" v-model:value="activeTab" style="min-height: 400px;">
                <TabList>
                    <Tab v-if="entity.isclient" value="0">
                        <div class="grid p-fluid">
                            <div class="col-12 mb-2 flex align-items-center">
                                <i class="pi pi-shopping-cart text-primary mr-2" style="font-size: 1.3rem"></i>
                                <h4 class="m-0 text-primary font-semibold">
                                    Parámetros de Ventas.
                                </h4>
                            </div>
                        </div>
                    </Tab>

                    <Tab v-if="entity.isprove" value="1">
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




                    <TabPanel v-if="entity.isclient" value="0">

                        <Panel>

                            <div class="grid">

                                <!-- CONDICIONES DE PAGO -->
                                <div class="col-12 md:col-4 mb-3">

                                    <FloatLabel>

                                        <KiwiLookup id="terminoventas" v-model="entity.salesAttributes.salesTermId"
                                            title="Seleccionar la Condición de Cobro"
                                            placeholder="Condición de Cobro..." dataKey="id" :items="terms"
                                            displayField="descriptionEs" :columns="termsColumns"
                                            :ref="(el) => setRef('terminoventas', el)">
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


                                        <KiwiLookup v-model="entity.salesAttributes.bankId" v-if="entity.salesAttributes"
                                            title="Seleccionar Cuenta Bancaria" placeholder="Seleccione una Cuenta..."
                                            dataKey="id" :items="banks" displayField="ibam" :columns="banksColumns">
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
                                        <InputNumber v-model="entity.salesAttributes.dayPago1" class="w-full" :min="0"
                                            :max="31" />
                                        <label>Día pago 1</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.salesAttributes.dayPago2" class="w-full" :min="0"
                                            :max="31" />
                                        <label>Día pago 2</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.salesAttributes.dayPago3" class="w-full" :min="0"
                                            :max="31" />
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
                                        <InputText v-model="entity.salesAttributes.sepa1" class="w-full"
                                            :ref="(el) => setRef('sepa2', el)" />
                                        <label>SEPA (BIC/SWIFT) Cuenta Secundaria</label>
                                    </FloatLabel>
                                    <InlineMessage v-if="errors.sepa2" severity="error">
                                        {{ errors.sepa2 }}
                                    </InlineMessage>
                                </div>

                            </div>

                        </Panel>

                    </TabPanel>





                    <TabPanel v-if="entity.isprove" value="1">
                        <Panel>

                            <div class="grid">

                                <!-- CONDICIONES DE COBRO -->
                                <div class="col-12 md:col-4 mb-3">

                                    <FloatLabel>

                                        <KiwiLookup id="terminocompras"
                                            v-model="entity.purchasesAttributes.purchasesTermId"
                                            title="Seleccionar la Condición de Pago" placeholder="Condición de Pago..."
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
                                            placeholder="Seleccione una tarifa..." dataKey="salesTarifasPkId"
                                            :items="tarifas" displayField="salesTarifasDsCode" :columns="tarifaColumns">
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
                                            dataKey="id" :items="banks" displayField="ibam" :columns="banksColumns">
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
                                        <InputNumber v-model="entity.purchasesAttributes.dayPago1" class="w-full"
                                            :min="0" :max="31" />
                                        <label>Día pago 1</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.purchasesAttributes.dayPago2" class="w-full"
                                            :min="0" :max="31" />
                                        <label>Día pago 2</label>
                                    </FloatLabel>
                                </div>

                                <div class="col-12 md:col-2">
                                    <FloatLabel>
                                        <InputNumber v-model="entity.purchasesAttributes.dayPago3" class="w-full"
                                            :min="0" :max="31" />
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
            <Button v-if="securityStore.hasPermission('ENTI_GEN_0002')" label="Guardar" icon="pi pi-check" @click="save" />
        </template>


        <div class="kiwik-separator"></div>
    </Dialog>




</template>

















<script setup>

import { computed } from 'vue'
import { ref, reactive } from 'vue';

const visible = defineModel('visible', { default: false })
const tax = reactive({
    pkid: null,
    description: '',
    descriptionEn: '',
    value: null,
    active: true
});

const props = defineProps({
    taxId: Number
})

function open(pkid = null) {

    visible.value = true;

}

const isNew = computed(() => props.taxId == null)

defineExpose({
    open
});

</script>

<style scoped>
.tax-dialog-icon {

    width: 48px;
    height: 48px;

    border-radius: 12px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: var(--primary-color);

    color: white;

    font-size: 1.4rem;

}
</style>