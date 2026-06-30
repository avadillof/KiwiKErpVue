




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

