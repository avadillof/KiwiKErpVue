<template>
  <PrinterControls language="ZPL" :zpl="zpl" />
</template>
<script setup lang="ts">
import PrinterControls from "../../../components/Printing/PrinterControls.vue";
defineProps<{ zpl?: string }>();
</script>
