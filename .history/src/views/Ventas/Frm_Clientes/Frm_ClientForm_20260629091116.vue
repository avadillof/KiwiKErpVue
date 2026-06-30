<template>
    <Dialog v-model:visible="visible" modal :header="entity.pkid > 0 ? 'Editar Entidad' : 'Nueva Entidad'"
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
                            <i class="pi pi-user text-primary"></i>
                        </div>
                        <span class="font-bold">Datos Generales.</span>
                    </div>
                </template>
                <div class="grid p-fluid mb-12">

                    <div class="col-12 md:col-2">
                        <InputGroup>
                            <FloatLabel variant="on" class="w-full">
                                <InputText maxlength="2" id="dsCode" v-model="entity.code" class="w-full"
                                    :disabled="!!entity.pkid" />
                                <label for="dsCode">Código de Entidad</label>
                            </FloatLabel>
                            <Button icon="pi pi-id-card" @click="generateCode" :disabled="!!entity.pkid"
                                severity="secondary" />
                        </InputGroup>
                    </div>

                    <div class="col-12 md:col-6">
                        <FloatLabel variant="on" class="w-full">
                            <InputText maxlength="2" id="dsName" v-model="entity.name" class="w-full" />
                            <label for="dsName">Nombre / Razón Social</label>
                        </FloatLabel>
                    </div>


                    <div class="col-12 md:col-2">
                        <FloatLabel variant="on" class="w-full">
                            <InputText maxlength="2" id="dsCif" v-model="entity.cif" class="w-full" />
                            <label for="dsName">CIF / NIf</label>
                        </FloatLabel>
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
                            <DatePicker id="dateUp" v-model="entity.dateUp" class="w-full" showIcon iconDisplay="input"
                                dateFormat="dd/mm/yy" :disabled="entity.dateUp > 0" />
                            <label for="dateUp">Fecha de Alta</label>
                        </FloatLabel>
                    </div>
                </div>

            </Panel>




            <Panel style="margin-top: 20px;">

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
                                <Button icon="pi pi-external-link" severity="secondary"
                                    @click="openLink" :disabled="!entity.web" />
                            </InputGroup>
                        </div>


                        <div class="col-12 md:col-4 mb-2">
                            <InputGroup>
                                <FloatLabel variant="on" class="w-full">
                                    <InputText id="email" v-model="entity.email" class="w-full" />
                                    <label for="web">EMail</label>
                                </FloatLabel>
                                <Button icon="pi pi pi-envelope" severity="secondary"
                                    @click="openLinkEmail" :disabled="!entity.email" />
                            </InputGroup>
                        </div>

                    </div>


                </div>

            </Panel>



            <Tabs v-model:value="activeTab" style="min-height: 400px;">
                <TabList>
                    <Tab value="0" :disabled="!entity.isclient">Ventas</Tab>
                    <Tab value="1" :disabled="!entity.isprove">Compras</Tab>
                </TabList>
                <TabPanels style="height: auto;">
                    <TabPanel value="0" >

                        <div class="grid p-fluid">
                            <div class="col-12 mb-2">
                                <h4 class="m-0 text-primary"><i class="pi pi-shopping-cart mr-2"></i>Parámetros de
                                    Ventas si
                                    es Cliente.
                                </h4>
                            </div>
                        </div>
                        <Panel style="height: auto;">

                        </Panel>

                    </TabPanel>

                    <TabPanel value="1">
                        <div class="grid p-fluid">
                            <div class="col-12 mb-2">
                                <h4 class="m-0 text-primary"><i class="pi pi-briefcase mr-2"></i>Parametros de Compras
                                    si es
                                    Proveedor.
                                </h4>
                            </div>
                        </div>
                        <Panel>

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



const countriselect = ref('');
const activeTab = ref('0');
const toast = useToast();
const companyStore = useCompanyStore();
const visible = ref(false);
const entity = ref<any>({
    pkid: null,
    phone: '',
    name: '',
    code: '',
    cif: '',
    web: '',
    isclient: false,
    isprove: false,
    active: true,
    email: '',
    dateUp: null,
    
    salesAttributes: 
    { 
         salesTarifasPkId: null 
    },
    
    purchasesAttributes: { 
        purchasesTermPkId: null 
    }
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


const countries = [
    { nombre: 'Afganistán' },
    { nombre: 'Albania' },
    { nombre: 'Alemania' },
    { nombre: 'Andorra' },
    { nombre: 'Angola' },
    { nombre: 'Antigua y Barbuda' },
    { nombre: 'Arabia Saudita' },
    { nombre: 'Argelia' },
    { nombre: 'Argentina' },
    { nombre: 'Armenia' },
    { nombre: 'Australia' },
    { nombre: 'Austria' },
    { nombre: 'Azerbaiyán' },
    { nombre: 'Bahamas' },
    { nombre: 'Bangladés' },
    { nombre: 'Barbados' },
    { nombre: 'Baréin' },
    { nombre: 'Bélgica' },
    { nombre: 'Belice' },
    { nombre: 'Benín' },
    { nombre: 'Bielorrusia' },
    { nombre: 'Birmania' },
    { nombre: 'Bolivia' },
    { nombre: 'Bosnia y Herzegovina' },
    { nombre: 'Botsuana' },
    { nombre: 'Brasil' },
    { nombre: 'Brunéi' },
    { nombre: 'Bulgaria' },
    { nombre: 'Burkina Faso' },
    { nombre: 'Burundi' },
    { nombre: 'Bután' },
    { nombre: 'Cabo Verde' },
    { nombre: 'Camboya' },
    { nombre: 'Camerún' },
    { nombre: 'Canadá' },
    { nombre: 'Catar' },
    { nombre: 'Chad' },
    { nombre: 'Chile' },
    { nombre: 'China' },
    { nombre: 'Chipre' },
    { nombre: 'Colombia' },
    { nombre: 'Comoras' },
    { nombre: 'Corea del Norte' },
    { nombre: 'Corea del Sur' },
    { nombre: 'Costa de Marfil' },
    { nombre: 'Costa Rica' },
    { nombre: 'Croacia' },
    { nombre: 'Cuba' },
    { nombre: 'Dinamarca' },
    { nombre: 'Dominica' },
    { nombre: 'Ecuador' },
    { nombre: 'Egipto' },
    { nombre: 'El Salvador' },
    { nombre: 'Emiratos Árabes Unidos' },
    { nombre: 'Eritrea' },
    { nombre: 'Eslovaquia' },
    { nombre: 'Eslovenia' },
    { nombre: 'España' },
    { nombre: 'Estados Unidos' },
    { nombre: 'Estonia' },
    { nombre: 'Esuatini' },
    { nombre: 'Etiopía' },
    { nombre: 'Filipinas' },
    { nombre: 'Finlandia' },
    { nombre: 'Fiyi' },
    { nombre: 'Francia' },
    { nombre: 'Gabón' },
    { nombre: 'Gambia' },
    { nombre: 'Georgia' },
    { nombre: 'Ghana' },
    { nombre: 'Granada' },
    { nombre: 'Grecia' },
    { nombre: 'Guatemala' },
    { nombre: 'Guinea' },
    { nombre: 'Guinea-Bisáu' },
    { nombre: 'Guinea Ecuatorial' },
    { nombre: 'Guyana' },
    { nombre: 'Haití' },
    { nombre: 'Honduras' },
    { nombre: 'Hungría' },
    { nombre: 'India' },
    { nombre: 'Indonesia' },
    { nombre: 'Irak' },
    { nombre: 'Irán' },
    { nombre: 'Irlanda' },
    { nombre: 'Islandia' },
    { nombre: 'Islas Marshall' },
    { nombre: 'Islas Salomón' },
    { nombre: 'Israel' },
    { nombre: 'Italia' },
    { nombre: 'Jamaica' },
    { nombre: 'Japón' },
    { nombre: 'Jordania' },
    { nombre: 'Kazajistán' },
    { nombre: 'Kenia' },
    { nombre: 'Kirguistán' },
    { nombre: 'Kiribati' },
    { nombre: 'Kuwait' },
    { nombre: 'Laos' },
    { nombre: 'Lesoto' },
    { nombre: 'Letonia' },
    { nombre: 'Líbano' },
    { nombre: 'Liberia' },
    { nombre: 'Libia' },
    { nombre: 'Liechtenstein' },
    { nombre: 'Lituania' },
    { nombre: 'Luxemburgo' },
    { nombre: 'Madagascar' },
    { nombre: 'Malasia' },
    { nombre: 'Malaui' },
    { nombre: 'Maldivas' },
    { nombre: 'Malí' },
    { nombre: 'Malta' },
    { nombre: 'Marruecos' },
    { nombre: 'Mauricio' },
    { nombre: 'Mauritania' },
    { nombre: 'México' },
    { nombre: 'Micronesia' },
    { nombre: 'Moldavia' },
    { nombre: 'Mónaco' },
    { nombre: 'Mongolia' },
    { nombre: 'Montenegro' },
    { nombre: 'Mozambique' },
    { nombre: 'Namibia' },
    { nombre: 'Nauru' },
    { nombre: 'Nepal' },
    { nombre: 'Nicaragua' },
    { nombre: 'Níger' },
    { nombre: 'Nigeria' },
    { nombre: 'Noruega' },
    { nombre: 'Nueva Zelanda' },
    { nombre: 'Omán' },
    { nombre: 'Países Bajos' },
    { nombre: 'Pakistán' },
    { nombre: 'Palaos' },
    { nombre: 'Panamá' },
    { nombre: 'Papúa Nueva Guinea' },
    { nombre: 'Paraguay' },
    { nombre: 'Perú' },
    { nombre: 'Polonia' },
    { nombre: 'Portugal' },
    { nombre: 'Reino Unido' },
    { nombre: 'República Centroafricana' },
    { nombre: 'República Checa' },
    { nombre: 'República del Congo' },
    { nombre: 'República Democrática del Congo' },
    { nombre: 'República Dominicana' },
    { nombre: 'Ruanda' },
    { nombre: 'Rumanía' },
    { nombre: 'Rusia' },
    { nombre: 'Samoa' },
    { nombre: 'San Cristóbal y Nieves' },
    { nombre: 'San Marino' },
    { nombre: 'San Vicente y las Granadinas' },
    { nombre: 'Santa Lucía' },
    { nombre: 'Santo Tomé y Príncipe' },
    { nombre: 'Senegal' },
    { nombre: 'Serbia' },
    { nombre: 'Seychelles' },
    { nombre: 'Sierra Leona' },
    { nombre: 'Singapur' },
    { nombre: 'Siria' },
    { nombre: 'Somalia' },
    { nombre: 'Sri Lanka' },
    { nombre: 'Sudáfrica' },
    { nombre: 'Sudán' },
    { nombre: 'Sudán del Sur' },
    { nombre: 'Suecia' },
    { nombre: 'Suiza' },
    { nombre: 'Surinam' },
    { nombre: 'Tailandia' },
    { nombre: 'Tanzania' },
    { nombre: 'Tayikistán' },
    { nombre: 'Timor Oriental' },
    { nombre: 'Togo' },
    { nombre: 'Tonga' },
    { nombre: 'Trinidad y Tobago' },
    { nombre: 'Túnez' },
    { nombre: 'Turkmenistán' },
    { nombre: 'Turquía' },
    { nombre: 'Tuvalu' },
    { nombre: 'Ucrania' },
    { nombre: 'Uganda' },
    { nombre: 'Uruguay' },
    { nombre: 'Uzbekistán' },
    { nombre: 'Vanuatu' },
    { nombre: 'Vaticano' },
    { nombre: 'Venezuela' },
    { nombre: 'Vietnam' },
    { nombre: 'Yemen' },
    { nombre: 'Yibuti' },
    { nombre: 'Zambia' },
    { nombre: 'Zimbabue' }
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
watch(() => entity.value.isclient, (newValue) => {
    if (newValue) {
        activeTab.value = '0';
    }
});

// Si el usuario desactiva la opción y estaba en esa pestaña, movemos a la otra
watch(() => entity.value.isprove, (newValue) => {
    if (newValue) {
        activeTab.value = '1';
    }
});


const openLink = () => {
  if (entity.value.web) {
    // Si estás usando TypeScript puro, a veces basta con esto:
    window.open(entity.value.web, '_blank');
  }
}

defineExpose({ open });
</script>
