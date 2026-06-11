<template>

<div class="grid" style="background-color: aquamarine;">

  <div class="col">
    Columna 1
  </div>
  <div class="col">
    Columna 2
  </div>
  <div class="col">Columna 3
    Columna 3
  </div>
  <div class="col">
    Columna 4
  </div>
  <div class="col">Columna 5

  </div>

</div>


</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import Checkbox from 'primevue/checkbox';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();
const { formData, loading, saveData, provincias } = Frm_Ajustes();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>