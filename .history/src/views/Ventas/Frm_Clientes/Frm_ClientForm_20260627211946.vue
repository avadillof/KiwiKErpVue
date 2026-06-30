<template>
    <Dialog v-model:visible="visible" header="Entidad" modal class="kiwik-dialog"">
        <div class="grid p-fluid">
            <div class="col-6"><InputText v-model="entity.dsName" placeholder="Nombre" /></div>
            <div class="col-3"><InputText v-model="entity.dsCif" placeholder="NIF" /></div>
            <div class="col-3 flex gap-3 align-items-center">
                <Checkbox v-model="entity.bolClient" binary label="Cliente" />
                <Checkbox v-model="entity.bolSupplier" binary label="Proveedor" />
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

