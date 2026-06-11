<template>
  <ConnectionMonitor />
  
  <Toast /> <router-view />

</template>

<script setup>
  import Toast from 'primevue/toast';
  import { useConnectionMonitor } from './services/composables/useConnectionMonitor.ts';
  import ConnectionMonitor from './components/ConnectionMonitor.vue';
  const { isOnline } = useConnectionMonitor();

</script>


