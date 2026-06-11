<template>
  </template>

<script lang="ts">
import { defineComponent } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import { DashboardController } from '@/services/Frm_Main/Dashboard/Pn_DashBoard'; 

export default defineComponent({
  name: 'Pn_DashBoard',
  components: { Card, Button, Divider },
  setup() {
    // Aquí simplemente llamamos a nuestro "controlador"
    const { modulosVisibles, navegarA } = DashboardController();

    return { modulosVisibles, navegarA };
  }
});
</script>