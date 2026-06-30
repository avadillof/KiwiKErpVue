<template>
     <Dialog v-model:visible="visible" modal :header="entity.pkid > 0 ? 'Editar Entidad' : 'Nueva Entidad'"
        :style="{ width: '95%',height: '95%' }" class="kiwik-dialog" :dismissableMask="true">
        
       


        <div class="kiwik-form-container">
            <div class="grid p-fluid mb-4">
                <div class="col-12 md:col-2">
                    <InputGroup>
                        <FloatLabel variant="on" class="w-full">
                            <InputText id="dsCode" v-model="entity.dsCode" class="w-full" :disabled="!!entity.pkid" />
                            <label for="dsCode">Código de Entidad</label>
                        </FloatLabel>
                        <Button icon="pi pi-id-card" @click="generateCode" :disabled="!!entity.pkid" severity="secondary" />
                    </InputGroup>
                </div>

                <div class="col-12 md:col-5">
                    <FloatLabel variant="on">
                        <InputText id="dsName" v-model="entity.dsName" />
                        <label for="dsName">Nombre / Razón Social</label>
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
                    <p>Configuración de Ventas (Tarifas, Pagos...)</p>
                </TabPanel>
                <TabPanel value="1">
                    <p>Configuración de Compras (Retenciones, Plazos...)</p>
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

