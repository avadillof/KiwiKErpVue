
<template>
    <Dialog v-model:visible="visible" modal 
        :header="formData.pkid > 0 ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '900px' }" class="kiwik-dialog" :dismissableMask="true">

        <div class="kiwik-form-container grid-layout">
            
            <div class="col-left flex flex-column align-items-center pt-2">
                <div class="border-circle overflow-hidden border-3 shadow-2 flex align-items-center justify-content-center"
                    style="width: 120px; height: 120px; background: #f8f9fa; border-color: var(--primary-color);">
                    <i class="pi pi-building text-5xl text-gray-300"></i>
                </div>
                </div>

            <div class="col-right flex flex-column gap-4">
                
                <div class="grid p-fluid">
                    <div class="col-12 md:col-8">
                        <FloatLabel variant="on">
                            <InputText id="ds_name" v-model="formData.dsName" class="w-full" />
                            <label for="ds_name">Nombre / Razón Social</label>
                        </FloatLabel>
                    </div>
                    <div class="col-12 md:col-4">
                        <FloatLabel variant="on">
                            <InputText id="ds_cif" v-model="formData.dsCif" class="w-full" />
                            <label for="ds_cif">NIF / CIF</label>
                        </FloatLabel>
                    </div>
                </div>

                <div class="flex gap-4">
                    <div class="flex align-items-center">
                        <Checkbox v-model="formData.bolClient" binary inputId="check_client" />
                        <label for="check_client" class="ml-2">Es Cliente</label>
                    </div>
                    <div class="flex align-items-center">
                        <Checkbox v-model="formData.bolSupplier" binary inputId="check_supplier" />
                        <label for="check_supplier" class="ml-2">Es Proveedor</label>
                    </div>
                </div>

                <Tabs value="0">
                    <TabList>
                        <Tab value="0" :disabled="!formData.bolClient">Ventas</Tab>
                        <Tab value="1" :disabled="!formData.bolSupplier">Compras</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel value="0">
                            <div class="grid p-fluid">
                                <div class="col-6">
                                    <FloatLabel variant="on">
                                        <Select id="sales_tarifa" v-model="formData.salesAttributes.salesTarifasPkId" :options="tarifas" optionLabel="label" class="w-full" />
                                        <label for="sales_tarifa">Tarifa</label>
                                    </FloatLabel>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value="1">
                            <div class="grid p-fluid">
                                <div class="col-6">
                                    <FloatLabel variant="on">
                                        <Select id="purc_term" v-model="formData.purchasesAttributes.purchasesTermPkId" :options="terminos" optionLabel="label" class="w-full" />
                                        <label for="purc_term">Términos de Compra</label>
                                    </FloatLabel>
                                </div>
                            </div>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </div>

        <div class="kiwik-separator"></div>

        <div class="flex justify-content-end">
            <Button label="Guardar Entidad" icon="pi pi-check" @click="save" />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const formData = ref<any>({ pkid: 0, dsName: '', dsCif: '', bolClient: false, bolSupplier: false, salesAttributes: {}, purchasesAttributes: {} });

const tarifas = ref([]); // Cargar de API
const terminos = ref([]); // Cargar de API

const open = (data: any) => {
    formData.value = data ? { ...data } : { pkid: 0, dsName: '', dsCif: '', bolClient: false, bolSupplier: false, salesAttributes: {}, purchasesAttributes: {} };
    visible.value = true;
};

const save = () => { /* Lógica de guardado */ };

defineExpose({ open });
</script>

<style scoped>
.grid-layout { display: grid; grid-template-columns: 140px 1fr; gap: 2rem; align-items: start; }
.kiwik-separator { border-top: 2px solid var(--primary-color); margin: 1.5rem 0; }
</style>



<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const visible = ref(false);
const entity = ref({
    dsName: '',
    dsCif: '',
    bolClient: false,
    bolSupplier: false,
    salesAttributes: { salesTarifasPkId: null },
    purchasesAttributes: { purchasesTermPkId: null }
});

const open = (id?: number) => {
    // Si id existe, cargar datos del API
    visible.value = true;
};

const save = async () => {
    // Aquí llamarías a tu endpoint de guardado enviando 'entity'
    console.log('Guardando...', entity.value);
};

defineExpose({ open });
</script>

