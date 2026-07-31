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



        <template #footer>

            <Button label="Cancelar" severity="secondary" outlined />

            <Button label="Guardar" icon="pi pi-save" />

        </template>

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