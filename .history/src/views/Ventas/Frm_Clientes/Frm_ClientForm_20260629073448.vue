<template>
    <Dialog v-model:visible="visible" modal :header="entity.pkid > 0 ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '95%', height: '95%' }" class="kiwik-dialog" :dismissableMask="true">




        <div class="kiwik-form-container">

            <Panel>

                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-user text-primary"></i>
                        </div>
                        <span class="font-bold">Datos Generales.</span>
                    </div>
                </template>
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

            </Panel>




            <Panel style="margin-top: 50px;">

                <template #header>
                    <div class="flex align-items-center gap-2">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 32px; height: 32px;">
                            <i class="pi pi-user text-primary"></i>
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
                        <div class="col-12 md:col-2 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.address2" id="address2" maxlength="145" class="w-full"
                                    size="small" />
                                <label for="address2">Calle / Avenida</label>
                            </FloatLabel>
                        </div>
                        <div class="col-12 md:col-4 mb-2">
                            <FloatLabel variant="in">
                                <Select v-model="entity.province" id="province" :options="provincias" maxlength="200"
                                    optionLabel="nombre" optionValue="nombre" class="w-full" size="small" filter
                                    :pt="{ root: { style: 'padding-top: 1.25rem' } }" />
                                <label for="province">Provincia</label>
                            </FloatLabel>
                        </div>
                        <div class="col-12 md:col-2 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.zipCode" id="zipCode" maxlength="20" class="w-full"
                                    size="small" /><label for="zipCode">CP</label>
                            </FloatLabel>
                        </div>
                        <div class="col-12 md:col-4 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.city" id="city" maxlength="200" class="w-full"
                                    size="small" /><label for="city">Localidad</label>
                            </FloatLabel>
                        </div>

                        <div class="col-12 md:col-4 mb-2">
                            <FloatLabel variant="in">
                                <InputText v-model="entity.phone" id="phone" maxlength="75" class="w-full"
                                    size="small" /><label for="phone">Teléfono</label>
                            </FloatLabel>
                        </div>



                    </div>
                </div>

            </Panel>

        </div>







        <Tabs v-model:value="activeTab">
            <TabList>
                <Tab value="0" :disabled="!entity.bolClient">Ventas</Tab>
                <Tab value="1" :disabled="!entity.bolSupplier">Compras</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">

                    <div class="grid p-fluid">
                        <div class="col-12 mb-2">
                            <h4 class="m-0 text-primary"><i class="pi pi-shopping-cart mr-2"></i>Parámetros de Ventas si
                                es Cliente.
                            </h4>
                        </div>
                    </div>
                    <Panel>

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
                    <Panel>

                    </Panel>
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
import { watch } from 'vue';
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
import Divider from 'primevue/divider';
import { useCompanyStore } from '../../../stores/companyStore';




const activeTab = ref('0');
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


const provincias = [
    { nombre: 'Álava' }, { nombre: 'Albacete' }, { nombre: 'Alicante' }, { nombre: 'Almería' },
    { nombre: 'Ávila' }, { nombre: 'Badajoz' }, { nombre: 'Baleares' }, { nombre: 'Barcelona' },
    { nombre: 'Burgos' }, { nombre: 'Cáceres' }, { nombre: 'Cádiz' }, { nombre: 'Castellón' },
    { nombre: 'Ciudad Real' }, { nombre: 'Córdoba' }, { nombre: 'A Coruña' }, { nombre: 'Cuenca' },
    { nombre: 'Girona' }, { nombre: 'Granada' }, { nombre: 'Guadalajara' }, { nombre: 'Gipuzkoa' },
    { nombre: 'Huelva' }, { nombre: 'Huesca' }, { nombre: 'Jaén' }, { nombre: 'León' },
    { nombre: 'Lleida' }, { nombre: 'La Rioja' }, { nombre: 'Lugo' }, { nombre: 'Madrid' },
    { nombre: 'Málaga' }, { nombre: 'Murcia' }, { nombre: 'Navarra' }, { nombre: 'Ourense' },
    { nombre: 'Asturias' }, { nombre: 'Palencia' }, { nombre: 'Las Palmas' }, { nombre: 'Pontevedra' },
    { nombre: 'Salamanca' }, { nombre: 'Santa Cruz de Tenerife' }, { nombre: 'Cantabria' },
    { nombre: 'Segovia' }, { nombre: 'Sevilla' }, { nombre: 'Soria' }, { nombre: 'Tarragona' },
    { nombre: 'Teruel' }, { nombre: 'Toledo' }, { nombre: 'Valencia' }, { nombre: 'Valladolid' },
    { nombre: 'Bizkaia' }, { nombre: 'Zamora' }, { nombre: 'Zaragoza' }
];


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


// Si el usuario activa "Es Cliente", saltamos a la pestaña 0
watch(() => entity.value.bolClient, (newValue) => {
    if (newValue) {
        activeTab.value = '0';
    }
});

// Si el usuario desactiva la opción y estaba en esa pestaña, movemos a la otra
watch(() => entity.value.bolSupplier, (newValue) => {
    if (newValue) {
        activeTab.value = '1';
    }
});

defineExpose({ open });
</script>
