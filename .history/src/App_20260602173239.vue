<template>
  
  
  <ConnectionMonitor />
  
  <Toast /> <router-view />

</template>

<script setup>
  import Toast from 'primevue/toast';
  import { useConnectionMonitor } from './services/composables/useConnectionMonitor.ts';
  const { isOnline } = useConnectionMonitor();

</script>


