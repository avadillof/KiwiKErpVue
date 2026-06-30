<template>
    <Dialog v-model:visible="visible" modal :header="entity.pkid > 0 ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '95%', height: '95%' }" class="kiwik-dialog" :dismissableMask="true">




        <div class="kiwik-form-container">
            <div class="grid p-fluid mb-12">
                <div class="col-12 md:col-2">
                    <InputGroup>
                        <FloatLabel variant="on" class="w-full">
                            <InputText maxlength="2" id="dsCode" v-model="entity.dsCode" class="w-full"
                                :disabled="!!entity.pkid" />
                            <label for="dsCode">Código de Entidad</label>
                        </FloatLabel>
                        <Button icon="pi pi-id-card" @click="generateCode" :disabled="!!entity.pkid"
                            severity="secondary" />
                    </InputGroup>
                </div>

                <div class="col-12 md:col-6">
                    <FloatLabel variant="on" class="w-full">
                        <InputText maxlength="2" id="dsName" v-model="entity.dsName" class="w-full" />
                        <label for="dsName">Nombre / Razón Social</label>
                    </FloatLabel>
                </div>


                <div class="col-12 md:col-2">
                    <FloatLabel variant="on" class="w-full">
                        <InputText maxlength="2" id="dsCif" v-model="entity.dsCif" class="w-full" />
                        <label for="dsName">CIF / NIf</label>
                    </FloatLabel>
                </div>


                <div class="col-12 md:col-2">
                    <Checkbox id="isActive" v-model="entity.isActive" binary />
                    <label for="isActive"> ¿ Activo ? </label>
                </div>


            </div>


            <div class="grid p-fluid mb-12 mt-3">
                <div class="col-12 md:col-2">
                    <Checkbox id="bolClient" v-model="entity.bolClient" binary />
                    <label for="bolClient"> ¿ Es Cliente ? </label>
                </div>
                <div class="col-12 md:col-2">
                    <Checkbox id="bolSupplier" v-model="entity.bolSupplier" binary />
                    <label for="bolSupplier"> ¿ Es Proveedor ? </label>
                </div>
            </div>

            <div class="grid p-fluid mb-12 mt-3">
                <div class="col-12 md:col-2">
                    <FloatLabel variant="on" class="w-full">
                        <DatePicker id="dateUp" v-model="entity.dateUp" class="w-full" showIcon iconDisplay="input"
                            dateFormat="dd/mm/yy" :disabled="entity.dateUp > 0" />
                        <label for="dateUp">Fecha de Alta</label>
                    </FloatLabel>
                </div>

            </div>

        </div>







        <Tabs value="0">
            <TabList>
                <Tab value="0" :disabled="!entity.bolClient">Ventas</Tab>
                <Tab value="1" :disabled="!entity.bolSupplier">Compras</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                    <Panel header="Header">
                       <div class="grid p-fluid">
                        <div class="col-12 mb-2">
                            
                        </div>
                    </div>
                    </Panel>                    
                </TabPanel>

                <TabPanel value="1">
                    <div class="grid p-fluid">
                        <div class="col-12 mb-2">
                            <h4 class="m-0 text-primary"><i class="pi pi-briefcase mr-2"></i>Parametros de Compras si es
                                Proveedor.
                            </h4>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>


        <template #footer>
            <Button label="Guardar" icon="pi pi-check" @click="save" />
        </template>


        <div class="kiwik-separator"></div>
    </Dialog>




</template>


<script setup lang="ts">
import { useToast } from 'primevue/usetoast'; // Importa el hook de Toast
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
import axios from 'axios';
import { useCompanyStore } from '../../../stores/companyStore';

const toast = useToast();
const companyStore = useCompanyStore();
const visible = ref(false);
const entity = ref<any>({
    pkid: null,
    dsName: '',
    dsCode: '',
    dsCif: '',
    bolClient: false,
    bolSupplier: false,
    isActive: true,
    dateUp: null,
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

defineExpose({ open });
</script>
